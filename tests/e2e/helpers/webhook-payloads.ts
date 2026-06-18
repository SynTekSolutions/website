export interface MockClerkUserWebhookPayload {
  type: "user.created" | "user.updated" | "user.deleted";
  data: {
    id: string;
    email_addresses?: { email_address: string }[];
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
    deleted?: boolean;
  };
}

/**
 * Factory to generate Clerk webhook payloads for E2E tests.
 */
export function createClerkWebhookPayload(
  type: "user.created" | "user.updated" | "user.deleted",
  clerkId: string,
  overrides?: Partial<{
    email: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  }>
): MockClerkUserWebhookPayload {
  if (type === "user.deleted") {
    return {
      type: "user.deleted",
      data: {
        id: clerkId,
        deleted: true,
      },
    };
  }

  const email = overrides?.email || `${clerkId}@example.com`;
  const firstName = overrides?.firstName !== undefined ? overrides.firstName : "Mock";
  const lastName = overrides?.lastName !== undefined ? overrides.lastName : "User";
  const imageUrl = overrides?.imageUrl !== undefined ? overrides.imageUrl : `https://images.clerk-mock.com/${clerkId}.png`;

  return {
    type,
    data: {
      id: clerkId,
      email_addresses: [
        {
          email_address: email,
        },
      ],
      first_name: firstName,
      last_name: lastName,
      image_url: imageUrl,
    },
  };
}
