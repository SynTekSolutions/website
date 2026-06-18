import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { DomainUser, DomainSession, AuthProvider } from "./types";
import { syncUserFromClerk } from "./sync-user";
import { getSession } from "./session";
import { clerk } from "./clerk";
import { ClerkUserNotFoundError, InactiveUserError } from "./errors";
import { syncLogger } from "./sync-logger";
import { metrics } from "./metrics";
import { toDomainUser } from "./domain-user";
import { headers, cookies } from "next/headers";

export class ClerkAuthProvider implements AuthProvider {
  async getCurrentUser(): Promise<DomainUser | null> {
    let userId: string | null = null;
    let sessionId: string | null = null;

    const isMockEnabled =
      process.env.E2E_MOCK_ENABLED === "true" &&
      (process.env.NODE_ENV !== "production" || process.env.PLAYWRIGHT_TEST_ENV === "true");

    if (isMockEnabled) {
      const headersList = await headers();
      const cookiesList = await cookies();
      userId = headersList.get("x-mock-user-id") || cookiesList.get("x-mock-user-id")?.value || null;
      sessionId = headersList.get("x-mock-session-id") || cookiesList.get("x-mock-session-id")?.value || "mock-session-123";
    }

    if (!userId) {
      const clerkAuth = await auth();
      userId = clerkAuth.userId;
      sessionId = clerkAuth.sessionId;
    }

    if (!userId) {
      return null;
    }

    // ── Step 1: Look up by clerkId in PostgreSQL ─────────────────────────────
    let dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });

    // ── Step 2: JIT fallback sync if the user isn't in our DB yet ────────────
    if (!dbUser) {
      try {
        await syncUserFromClerk(userId);
        dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
      } catch (error) {
        if (error instanceof ClerkUserNotFoundError) {
          await this.revokeSession(userId, sessionId);
          syncLogger.info({ trigger: "jit", outcome: "not_found", clerkId: userId });
          return null;
        }
        syncLogger.error({
          trigger: "jit",
          outcome: "failure",
          clerkId: userId,
          error: error instanceof Error ? error.message : String(error),
        });
        return null;
      }
    }

    if (!dbUser) {
      return null;
    }

    // ── Step 3: Enforce inactive user policy ──────────────────────────────────
    if (!dbUser.isActive) {
      metrics.increment("inactive_login_attempts", { clerkId: userId });
      syncLogger.info({
        trigger: "jit",
        outcome: "skipped",
        clerkId: userId,
        error: "User account is inactive",
      });
      await this.revokeSession(userId, sessionId);
      throw new InactiveUserError(userId);
    }

    return toDomainUser(dbUser);
  }

  /**
   * Revokes the Clerk session so the JWT becomes invalid immediately.
   * Never throws — a revocation failure must not block the caller.
   */
  private async revokeSession(
    clerkId: string,
    sessionId: string | null,
  ): Promise<void> {
    if (!sessionId) return;
    try {
      await clerk.sessions.revokeSession(sessionId);
      metrics.increment("session_revocation_total");
      syncLogger.info({ trigger: "jit", outcome: "success", clerkId, eventType: "session_revoked" });
    } catch (error) {
      metrics.increment("session_revocation_failures_total");
      syncLogger.error({
        trigger: "jit",
        outcome: "failure",
        clerkId,
        eventType: "session_revoke_failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async getSession(): Promise<DomainSession | null> {
    return getSession();
  }

  async syncUser(clerkId: string): Promise<DomainUser> {
    return syncUserFromClerk(clerkId);
  }

  async signOut(): Promise<void> {
    throw new Error("signOut must be called from the client side.");
  }
}

const clerkAuthProvider = new ClerkAuthProvider();

export async function getCurrentUser(): Promise<DomainUser | null> {
  return clerkAuthProvider.getCurrentUser();
}
