import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClerkUserNotFoundError } from "../errors";

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      upsert: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("../clerk", () => ({
  clerk: {
    users: {
      getUser: vi.fn(),
    },
  },
}));

vi.mock("@/lib/request-context", () => ({
  RequestContext: { getRequestId: () => "test-request-id" },
}));

// Import after mocks
import { syncUserFromClerk, softDeleteUser } from "../sync-user";
import { prisma } from "@/lib/prisma";
import { clerk } from "../clerk";
import { Prisma } from "@/generated/prisma/client";

const mockPrisma = vi.mocked(prisma);
const mockClerk = vi.mocked(clerk);

const CLERK_USER = {
  id: "user_abc123",
  emailAddresses: [{ emailAddress: "alice@example.com" }],
  firstName: "Alice",
  lastName: "Smith",
  imageUrl: "https://cdn.example.com/alice.jpg",
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

describe("syncUserFromClerk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mockClerk.users.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(CLERK_USER);
    (mockPrisma.user.upsert as ReturnType<typeof vi.fn>).mockResolvedValue(DB_USER);
  });

  it("returns a DomainUser on success", async () => {
    const user = await syncUserFromClerk("user_abc123");
    expect(user.clerkId).toBe("user_abc123");
    expect(user.email).toBe("alice@example.com");
    expect(user.role).toBe("VIEWER");
  });

  it("is idempotent — calling 5 times produces 1 upsert result each time", async () => {
    const calls = Array.from({ length: 5 }, () => syncUserFromClerk("user_abc123"));
    const results = await Promise.all(calls);
    // All results must be structurally equal
    results.forEach((r) => expect(r.clerkId).toBe("user_abc123"));
    // Clerk API is called once per syncUserFromClerk — 5 calls = 5 Clerk lookups, 5 upserts
    expect(mockClerk.users.getUser).toHaveBeenCalledTimes(5);
    expect(mockPrisma.user.upsert).toHaveBeenCalledTimes(5);
    // The upsert always uses clerkId as the where key, never email
    const calls2 = (mockPrisma.user.upsert as ReturnType<typeof vi.fn>).mock.calls;
    calls2.forEach((call: unknown[]) => {
      const args = call[0] as { where: { clerkId: string } };
      expect(args.where.clerkId).toBe("user_abc123");
    });
  });

  it("throws ClerkUserNotFoundError on Clerk 404", async () => {
    (mockClerk.users.getUser as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("not found"),
    );
    await expect(syncUserFromClerk("ghost_123")).rejects.toBeInstanceOf(
      ClerkUserNotFoundError,
    );
  });

  it("throws a timeout error if Clerk API exceeds 5s", async () => {
    (mockClerk.users.getUser as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 10_000)),
    );
    await expect(syncUserFromClerk("slow_user")).rejects.toThrow("timeout");
  }, 10_000);

  it("handles concurrent JIT syncs for the same clerkId without race errors", async () => {
    const results = await Promise.all([
      syncUserFromClerk("user_abc123"),
      syncUserFromClerk("user_abc123"),
    ]);
    // Both calls should succeed — the DB-level upsert handles the concurrency
    expect(results).toHaveLength(2);
    results.forEach((r) => expect(r.clerkId).toBe("user_abc123"));
  });

  it("never syncs role or permissions from Clerk", async () => {
    await syncUserFromClerk("user_abc123");
    const upsertCall = (mockPrisma.user.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      update: Record<string, unknown>;
      create: Record<string, unknown>;
    };
    expect(upsertCall.update).not.toHaveProperty("role");
    expect(upsertCall.update).not.toHaveProperty("permissions");
    expect(upsertCall.create).not.toHaveProperty("permissions");
  });
});

describe("softDeleteUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mockPrisma.user.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...DB_USER,
      isActive: false,
    });
  });

  it("marks the user as inactive", async () => {
    await softDeleteUser("user_abc123");
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clerkId: "user_abc123" },
        data: expect.objectContaining({ isActive: false }),
      }),
    );
  });

  it("is idempotent — P2025 (record not found) does not throw", async () => {
    const p2025 = new Prisma.PrismaClientKnownRequestError("Record not found", {
      code: "P2025",
      clientVersion: "7.x",
    });
    (mockPrisma.user.update as ReturnType<typeof vi.fn>).mockRejectedValue(p2025);
    await expect(softDeleteUser("unknown_user")).resolves.toBeUndefined();
  });

  it("re-throws non-P2025 Prisma errors", async () => {
    const dbErr = new Prisma.PrismaClientKnownRequestError("Constraint failed", {
      code: "P2002",
      clientVersion: "7.x",
    });
    (mockPrisma.user.update as ReturnType<typeof vi.fn>).mockRejectedValue(dbErr);
    await expect(softDeleteUser("user_abc123")).rejects.toThrow();
  });
});
