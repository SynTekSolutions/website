import { createClerkClient } from "@clerk/nextjs/server";

const realClerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const isMockEnabled =
  process.env.E2E_MOCK_ENABLED === "true" &&
  (process.env.NODE_ENV !== "production" || process.env.PLAYWRIGHT_TEST_ENV === "true");

export const clerk = isMockEnabled
  ? new Proxy(realClerk, {
      get(target, prop, receiver) {
        if (prop === "users") {
          return {
            getUser: async (userId: string) => {
              if (userId.startsWith("mock_")) {
                const namePart = userId.replace("mock_", "").split("_")[0];
                const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
                return {
                  id: userId,
                  emailAddresses: [{ emailAddress: `${userId}@example.com` }],
                  firstName: capitalized || "Mock",
                  lastName: "User",
                  imageUrl: `https://images.clerk-mock.com/${userId}.png`,
                };
              }
              return realClerk.users.getUser(userId);
            },
          };
        }
        if (prop === "sessions") {
          return {
            revokeSession: async (sessionId: string) => {
              if (sessionId.startsWith("mock_") || sessionId === "mock-session-123") {
                return;
              }
              return realClerk.sessions.revokeSession(sessionId);
            },
          };
        }
        return Reflect.get(target, prop, receiver);
      },
    }) as unknown as typeof realClerk
  : realClerk;
