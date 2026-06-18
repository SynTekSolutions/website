import { describe, it, expect } from "vitest";
import { Permission } from "../permissions";
import { ROLE_REGISTRY } from "../role-registry";
import {
  resolvePermissions,
  hasPermission,
  listPermissions,
} from "../permission-resolver";
import { requirePermission } from "../require-permission";
import {
  PermissionDeniedError,
  UnauthenticatedError,
  InactiveUserError,
} from "../errors";
import type { DomainUser } from "../types";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeUser(overrides: Partial<DomainUser> = {}): DomainUser {
  const role = overrides.role ?? "VIEWER";
  return {
    id: "uuid-1",
    clerkId: "clerk_1",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    imageUrl: null,
    role,
    permissions: resolvePermissions({ role }),
    isActive: true,
    organizationId: null,
    ...overrides,
  };
}

// ── ROLE_REGISTRY ─────────────────────────────────────────────────────────────

describe("ROLE_REGISTRY", () => {
  it("OWNER has all permissions", () => {
    const ownerPerms = ROLE_REGISTRY.OWNER.permissions;
    Object.values(Permission).forEach((p) => {
      expect(ownerPerms).toContain(p);
    });
  });

  it("ADMIN has ADMIN_ACCESS", () => {
    expect(ROLE_REGISTRY.ADMIN.permissions).toContain(Permission.ADMIN_ACCESS);
  });

  it("STAFF does not have ADMIN_ACCESS", () => {
    expect(ROLE_REGISTRY.STAFF.permissions).not.toContain(Permission.ADMIN_ACCESS);
  });

  it("STAFF does not have PRODUCT_DELETE", () => {
    expect(ROLE_REGISTRY.STAFF.permissions).not.toContain(Permission.PRODUCT_DELETE);
  });

  it("VIEWER has only read permissions", () => {
    const viewerPerms = ROLE_REGISTRY.VIEWER.permissions;
    expect(viewerPerms).toContain(Permission.PRODUCT_READ);
    expect(viewerPerms).toContain(Permission.ORDER_READ);
    expect(viewerPerms).toContain(Permission.CUSTOMER_READ);
    expect(viewerPerms).not.toContain(Permission.PRODUCT_WRITE);
    expect(viewerPerms).not.toContain(Permission.PRODUCT_DELETE);
    expect(viewerPerms).not.toContain(Permission.ORDER_WRITE);
    expect(viewerPerms).not.toContain(Permission.CUSTOMER_WRITE);
    expect(viewerPerms).not.toContain(Permission.ADMIN_ACCESS);
  });

  it("ROLE_REGISTRY is frozen at the top level (immutable at runtime)", () => {
    expect(() => {
      // @ts-expect-error — intentional mutation attempt
      ROLE_REGISTRY.SUPER_ADMIN = { name: "SUPER_ADMIN", permissions: [] };
    }).toThrow(TypeError);
  });

  it("ROLE_REGISTRY.ADMIN.permissions array is frozen (immutable at runtime)", () => {
    expect(() => {
      // @ts-expect-error — intentional mutation attempt
      ROLE_REGISTRY.ADMIN.permissions.push(Permission.PRODUCT_DELETE);
    }).toThrow(TypeError);
  });

  it("ROLE_REGISTRY.OWNER is frozen (immutable at runtime)", () => {
    expect(() => {
      // @ts-expect-error — intentional mutation attempt
      ROLE_REGISTRY.OWNER.name = "HACKED";
    }).toThrow(TypeError);
  });
});

// ── PermissionResolver ────────────────────────────────────────────────────────

describe("resolvePermissions", () => {
  it("returns OWNER permissions", () => {
    const perms = resolvePermissions({ role: "OWNER" });
    expect(perms).toContain(Permission.ADMIN_ACCESS);
    expect(perms).toContain(Permission.PRODUCT_DELETE);
  });

  it("returns VIEWER permissions", () => {
    const perms = resolvePermissions({ role: "VIEWER" });
    expect(perms).toContain(Permission.PRODUCT_READ);
    expect(perms).not.toContain(Permission.PRODUCT_WRITE);
  });

  it("returns empty array for an unknown role", () => {
    // @ts-expect-error — testing runtime boundary
    const perms = resolvePermissions({ role: "UNKNOWN" });
    expect(perms).toHaveLength(0);
  });

  it("accepts organizationId in context without error (future-proof)", () => {
    expect(() =>
      resolvePermissions({ role: "STAFF", organizationId: "org_123" }),
    ).not.toThrow();
  });
});

describe("hasPermission", () => {
  it("returns true when role has the permission", () => {
    expect(hasPermission({ role: "ADMIN" }, Permission.ADMIN_ACCESS)).toBe(true);
  });

  it("returns false when role lacks the permission", () => {
    expect(hasPermission({ role: "STAFF" }, Permission.ADMIN_ACCESS)).toBe(false);
  });

  it("returns false when role lacks PRODUCT_DELETE", () => {
    expect(hasPermission({ role: "VIEWER" }, Permission.PRODUCT_DELETE)).toBe(false);
  });
});

describe("listPermissions", () => {
  it("is an alias of resolvePermissions", () => {
    expect(listPermissions({ role: "STAFF" })).toEqual(
      resolvePermissions({ role: "STAFF" }),
    );
  });

  it("returns a readonly array (no runtime mutation)", () => {
    const perms = listPermissions({ role: "ADMIN" });
    expect(() => {
      // @ts-expect-error — intentional mutation attempt
      perms.push(Permission.PRODUCT_DELETE);
    }).toThrow(TypeError);
  });
});

// ── requirePermission ─────────────────────────────────────────────────────────

describe("requirePermission", () => {
  it("returns the user when permission is granted", () => {
    const user = makeUser({ role: "ADMIN" });
    const result = requirePermission(user, Permission.ADMIN_ACCESS);
    expect(result).toBe(user);
  });

  it("throws PermissionDeniedError when user lacks the permission", () => {
    const user = makeUser({ role: "VIEWER" });
    expect(() => requirePermission(user, Permission.PRODUCT_WRITE)).toThrow(
      PermissionDeniedError,
    );
  });

  it("throws UnauthenticatedError when user is null", () => {
    expect(() => requirePermission(null, Permission.PRODUCT_READ)).toThrow(
      UnauthenticatedError,
    );
  });

  it("throws InactiveUserError when user.isActive is false", () => {
    const user = makeUser({ isActive: false });
    expect(() => requirePermission(user, Permission.PRODUCT_READ)).toThrow(
      InactiveUserError,
    );
  });

  it("does not throw for STAFF with ORDER_WRITE", () => {
    const user = makeUser({ role: "STAFF" });
    expect(() => requirePermission(user, Permission.ORDER_WRITE)).not.toThrow();
  });

  it("throws PermissionDeniedError for STAFF with ADMIN_ACCESS", () => {
    const user = makeUser({ role: "STAFF" });
    expect(() => requirePermission(user, Permission.ADMIN_ACCESS)).toThrow(
      PermissionDeniedError,
    );
  });

  it("PermissionDeniedError contains the denied permission string", () => {
    const user = makeUser({ role: "VIEWER" });
    try {
      requirePermission(user, Permission.PRODUCT_DELETE);
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(PermissionDeniedError);
      expect((e as PermissionDeniedError).permission).toBe(Permission.PRODUCT_DELETE);
    }
  });

  it("InactiveUserError contains the clerkId", () => {
    const user = makeUser({ isActive: false, clerkId: "clerk_inactive_1" });
    try {
      requirePermission(user, Permission.PRODUCT_READ);
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(InactiveUserError);
      expect((e as InactiveUserError).clerkId).toBe("clerk_inactive_1");
    }
  });

  it("does NOT query the database or call Clerk (synchronous only)", () => {
    // If requirePermission were async, this test would need to await.
    // The fact that it's synchronous is itself a type-level assertion.
    const user = makeUser({ role: "OWNER" });
    const result = requirePermission(user, Permission.ADMIN_ACCESS);
    // Verify result is returned synchronously — no Promise
    expect(result).not.toBeInstanceOf(Promise);
    expect(result.role).toBe("OWNER");
  });
});
