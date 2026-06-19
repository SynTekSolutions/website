import { auth } from "@clerk/nextjs/server";
import { DomainSession } from "./types";

import { headers, cookies } from "next/headers";

/**
 * Retrieves the current session details.
 */
export async function getSession(): Promise<DomainSession | null> {
  const isMockEnabled =
    process.env.E2E_MOCK_ENABLED === "true" &&
    (process.env.NODE_ENV !== "production" || process.env.PLAYWRIGHT_TEST_ENV === "true");

  if (isMockEnabled) {
    const headersList = await headers();
    const cookiesList = await cookies();
    const userId = headersList.get("x-mock-user-id") || cookiesList.get("x-mock-user-id")?.value;
    const sessionId = headersList.get("x-mock-session-id") || cookiesList.get("x-mock-session-id")?.value || "mock-session-123";

    if (userId) {
      return {
        userId,
        clerkSessionId: sessionId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Simulated session expiry
      };
    }
    
    return null;
  }

  const { userId, sessionId } = await auth();
  if (!userId || !sessionId) {
    return null;
  }

  return {
    userId,
    clerkSessionId: sessionId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Simulated session expiry
  };
}
