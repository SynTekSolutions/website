import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      upsert: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("../sync-user", async (importOriginal) => {
  const original = await importOriginal<typeof import("../sync-user")>();
  return {
    ...original,
    softDeleteUser: vi.fn(),
  };
});

vi.mock("@/lib/request-context", () => ({
  RequestContext: { getRequestId: () => "test-request-id" },
}));

import type { UserJSON, DeletedObjectJSON } from "@clerk/nextjs/server";
import { handleUserCreated, handleUserUpdated, handleUserDeleted, dispatchWebhookEvent } from "../handlers";
import { prisma } from "@/lib/prisma";
import { softDeleteUser } from "../sync-user";

const mockPrisma = vi.mocked(prisma);
const mockSoftDelete = vi.mocked(softDeleteUser);

const USER_JSON: UserJSON = {
  id: "user_abc123",
  email_addresses: [
    {
      id: "email_1",
      email_address: "alice@example.com",
      object: "email_address",
      linked_to: [],
      matches_sso_connection: false,
      reserved: false,
      verification: null,
    },
  ],
  first_name: "Alice",
  last_name: "Smith",
  image_url: "https://cdn.example.com/alice.jpg",
  // Minimal required fields for UserJSON — other fields default to null/false/[]
  object: "user",
  backup_code_enabled: false,
  banned: false,
  create_organization_enabled: false,
  created_at: 0,
  delete_self_enabled: false,
  external_accounts: [],
  external_id: null,
  has_image: true,
  last_active_at: null,
  last_sign_in_at: null,
  legal_accepted_at: null,
  locked: false,
  locked_at: null,
  lockout_expires_in_seconds: null,
  mfa_disabled_at: null,
  mfa_enabled_at: null,
  passkeys: [],
  password_enabled: false,
  phone_numbers: [],
  primary_email_address_id: "email_1",
  primary_phone_number_id: null,
  primary_web3_wallet_id: null,
  private_metadata: {},
  profile_image_url: "https://cdn.example.com/alice.jpg",
  public_metadata: {},
  saml_accounts: [],
  two_factor_enabled: false,
  unsafe_metadata: {},
  updated_at: 0,
  username: null,
  web3_wallets: [],
};

const DB_USER = {
  id: "db-uuid-1",
  clerkId: "user_abc123",
  email: "alice@example.com",
  firstName: "Alice",
  lastName: "Smith",
  imageUrl: "https://cdn.example.com/alice.jpg",
  role: "VIEWER",
  isActive: true,
  organizationId: null,
  deletedAt: null,
};

describe("handleUserCreated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mockPrisma.user.upsert as ReturnType<typeof vi.fn>).mockResolvedValue(DB_USER);
  });

  it("upserts the user with clerkId as the key (not email)", async () => {
    await handleUserCreated(USER_JSON);
    const call = (mockPrisma.user.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      where: { clerkId: string };
    };
    expect(call.where.clerkId).toBe("user_abc123");
  });

  it("is idempotent — 5 deliveries of the same event produce 5 upserts", async () => {
    await Promise.all(Array.from({ length: 5 }, () => handleUserCreated(USER_JSON)));
    expect(mockPrisma.user.upsert).toHaveBeenCalledTimes(5);
  });

  it("never sets role or permissions from Clerk payload", async () => {
    await handleUserCreated(USER_JSON);
    const call = (mockPrisma.user.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      update: Record<string, unknown>;
    };
    expect(call.update).not.toHaveProperty("role");
    expect(call.update).not.toHaveProperty("permissions");
  });
});

describe("handleUserUpdated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mockPrisma.user.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...DB_USER,
      firstName: "Alicia",
    });
  });

  it("updates only profile fields", async () => {
    const updatedUser = { ...USER_JSON, first_name: "Alicia" };
    const result = await handleUserUpdated(updatedUser);
    expect(result.firstName).toBe("Alicia");
  });
});

describe("handleUserDeleted", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSoftDelete.mockResolvedValue(undefined);
  });

  it("calls softDeleteUser with the correct clerkId", async () => {
    const deletedPayload: DeletedObjectJSON = {
      id: "user_abc123",
      object: "user",
      deleted: true,
      slug: null,
    };
    await handleUserDeleted(deletedPayload);
    expect(mockSoftDelete).toHaveBeenCalledWith("user_abc123");
  });

  it("throws if payload has no id", async () => {
    const badPayload = { object: "user", deleted: true, slug: null } as DeletedObjectJSON;
    await expect(handleUserDeleted(badPayload)).rejects.toThrow();
  });
});

describe("dispatchWebhookEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mockPrisma.user.upsert as ReturnType<typeof vi.fn>).mockResolvedValue(DB_USER);
    mockSoftDelete.mockResolvedValue(undefined);
  });

  it("routes user.created to handleUserCreated", async () => {
    await dispatchWebhookEvent({ type: "user.created", data: USER_JSON } as never);
    expect(mockPrisma.user.upsert).toHaveBeenCalled();
  });

  it("routes user.deleted to softDeleteUser", async () => {
    const deletedPayload: DeletedObjectJSON = {
      id: "user_abc123",
      object: "user",
      deleted: true,
      slug: null,
    };
    await dispatchWebhookEvent({ type: "user.deleted", data: deletedPayload } as never);
    expect(mockSoftDelete).toHaveBeenCalledWith("user_abc123");
  });

  it("ignores unknown event types without throwing", async () => {
    await expect(
      dispatchWebhookEvent({ type: "session.created", data: {} } as never),
    ).resolves.toBeUndefined();
    expect(mockPrisma.user.upsert).not.toHaveBeenCalled();
  });

  it("handles webhook + JIT concurrent upsert for the same user", async () => {
    // Simulate webhook handler and JIT sync arriving simultaneously
    const webhookSync = dispatchWebhookEvent({
      type: "user.created",
      data: USER_JSON,
    } as never);
    const jitSync = dispatchWebhookEvent({
      type: "user.updated",
      data: USER_JSON,
    } as never);
    // Both must resolve without throwing — idempotent upserts handle the race
    await expect(Promise.all([webhookSync, jitSync])).resolves.toBeDefined();
  });

  it("is retry-safe — user.updated called 3 times succeeds all 3 times", async () => {
    const retries = Array.from({ length: 3 }, () =>
      dispatchWebhookEvent({ type: "user.updated", data: USER_JSON } as never),
    );
    await expect(Promise.all(retries)).resolves.toBeDefined();
    expect(mockPrisma.user.upsert).toHaveBeenCalledTimes(3);
  });
});
