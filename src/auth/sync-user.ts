import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { DomainUser } from "./types";
import { clerk } from "./clerk";
import { ClerkUserNotFoundError } from "./errors";
import { syncLogger } from "./sync-logger";
import { metrics } from "./metrics";
import { toDomainUser } from "./domain-user";

const CLERK_API_TIMEOUT_MS = 5_000;

/**
 * Fetches a user profile from the Clerk API and upserts it into PostgreSQL.
 *
 * - Throws ClerkUserNotFoundError if Clerk returns 404.
 * - Throws Error on Clerk API timeout (> 5s).
 * - Idempotent: safe to call concurrently; uses DB-level upsert (ON CONFLICT).
 */
export async function syncUserFromClerk(clerkId: string): Promise<DomainUser> {
  const start = Date.now();

  let clerkUser;
  try {
    clerkUser = await Promise.race([
      clerk.users.getUser(clerkId),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => {
            metrics.increment("clerk_api_timeout_total", { trigger: "jit" });
            reject(new Error(`Clerk API timeout after ${CLERK_API_TIMEOUT_MS}ms`));
          },
          CLERK_API_TIMEOUT_MS,
        ),
      ),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isNotFound =
      message.toLowerCase().includes("not found") ||
      message.toLowerCase().includes("404") ||
      message.toLowerCase().includes("no user was found");

    if (isNotFound) {
      syncLogger.info({ trigger: "jit", outcome: "not_found", clerkId });
      throw new ClerkUserNotFoundError(clerkId);
    }

    syncLogger.error({
      trigger: "jit",
      outcome: "failure",
      clerkId,
      durationMs: Date.now() - start,
      error: message,
    });
    metrics.increment("sync_failures_total", { trigger: "jit" });
    throw error;
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) {
    throw new Error(`Clerk user ${clerkId} has no email address`);
  }

  const isMockEnabled =
    process.env.E2E_MOCK_ENABLED === "true" &&
    (process.env.NODE_ENV !== "production" || process.env.PLAYWRIGHT_TEST_ENV === "true");

  // Dynamically assign role and active state based on mock user ID prefix
  const mockRole = isMockEnabled && clerkId.includes("admin") ? "ADMIN"
                 : isMockEnabled && clerkId.includes("owner") ? "OWNER"
                 : isMockEnabled && clerkId.includes("staff") ? "STAFF"
                 : "VIEWER";
  const mockIsActive = !(isMockEnabled && clerkId.includes("inactive"));

  // Idempotent upsert — safe under concurrent calls (PostgreSQL ON CONFLICT DO UPDATE)
  const dbUser = await prisma.user.upsert({
    where: { clerkId },
    update: {
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      ...(isMockEnabled ? { role: mockRole, isActive: mockIsActive } : {}),
    },
    create: {
      clerkId,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      role: mockRole,
      isActive: mockIsActive,
    },
  });

  const durationMs = Date.now() - start;
  syncLogger.info({ trigger: "jit", outcome: "success", clerkId, durationMs });
  metrics.increment("jit_sync_total");

  return toDomainUser(dbUser);
}

/**
 * Soft-deletes a user in PostgreSQL: sets isActive=false and deletedAt=now().
 *
 * Idempotent: if the user record does not exist (P2025), logs and returns without error.
 */
export async function softDeleteUser(clerkId: string): Promise<void> {
  const start = Date.now();
  try {
    await prisma.user.update({
      where: { clerkId },
      data: { isActive: false, deletedAt: new Date() },
    });
    syncLogger.info({
      trigger: "webhook",
      outcome: "success",
      clerkId,
      eventType: "user.deleted",
      durationMs: Date.now() - start,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      syncLogger.info({
        trigger: "webhook",
        outcome: "skipped",
        clerkId,
        eventType: "user.deleted",
        durationMs: Date.now() - start,
      });
      return;
    }
    syncLogger.error({
      trigger: "webhook",
      outcome: "failure",
      clerkId,
      eventType: "user.deleted",
      durationMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    });
    metrics.increment("sync_failures_total", { trigger: "webhook", event: "user.deleted" });
    throw error;
  }
}
