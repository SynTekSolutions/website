import { Role } from "./types";
import { Permission } from "./permissions";
import { RoleDefinition } from "./role-definition";

/**
 * The single source of truth for what permissions each role grants.
 *
 * Rules:
 * - Only this file maps roles to permissions. No other file may contain that mapping.
 * - All definitions are deeply frozen at the Object level (runtime immutability).
 * - TypeScript `readonly` provides compile-time immutability.
 * - To add a permission to a role, edit only this file.
 *
 * Designed for future extensibility:
 * - When permissions move to PostgreSQL, replace the static registry with a DB lookup
 *   in permission-resolver.ts without changing any call site.
 */
function defineRole(name: Role, permissions: readonly Permission[]): Readonly<RoleDefinition> {
  return Object.freeze({ name, permissions: Object.freeze([...permissions]) });
}

export const ROLE_REGISTRY: Readonly<Record<Role, Readonly<RoleDefinition>>> = Object.freeze({
  OWNER: defineRole("OWNER", [
    Permission.PRODUCT_READ,
    Permission.PRODUCT_WRITE,
    Permission.PRODUCT_DELETE,
    Permission.ORDER_READ,
    Permission.ORDER_WRITE,
    Permission.CUSTOMER_READ,
    Permission.CUSTOMER_WRITE,
    Permission.ADMIN_ACCESS,
  ]),

  ADMIN: defineRole("ADMIN", [
    Permission.PRODUCT_READ,
    Permission.PRODUCT_WRITE,
    Permission.PRODUCT_DELETE,
    Permission.ORDER_READ,
    Permission.ORDER_WRITE,
    Permission.CUSTOMER_READ,
    Permission.CUSTOMER_WRITE,
    Permission.ADMIN_ACCESS,
  ]),

  STAFF: defineRole("STAFF", [
    Permission.PRODUCT_READ,
    Permission.PRODUCT_WRITE,
    Permission.ORDER_READ,
    Permission.ORDER_WRITE,
    Permission.CUSTOMER_READ,
    Permission.CUSTOMER_WRITE,
  ]),

  VIEWER: defineRole("VIEWER", [
    Permission.PRODUCT_READ,
    Permission.ORDER_READ,
    Permission.CUSTOMER_READ,
  ]),
});
