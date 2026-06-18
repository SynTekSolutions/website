import { Role } from "./types";
import { Permission } from "./permissions";
import { ROLE_REGISTRY } from "./role-registry";

/**
 * Context passed to the permission resolver.
 *
 * Today: only role is needed.
 * Tomorrow: add organizationId, tenantId, or any other dimension without breaking call sites.
 */
export interface PermissionContext {
  role: Role;
  /** Reserved for future multi-tenant / organization-scoped permissions. */
  organizationId?: string | null;
}

/**
 * Returns the full list of permissions granted to the given role.
 *
 * When permissions move to PostgreSQL, replace the registry lookup here
 * without touching requirePermission() or any call site.
 */
export function resolvePermissions(context: PermissionContext): readonly Permission[] {
  return ROLE_REGISTRY[context.role]?.permissions ?? [];
}

/**
 * Returns true if the given role has the specified permission.
 */
export function hasPermission(context: PermissionContext, permission: Permission): boolean {
  return resolvePermissions(context).includes(permission);
}

/**
 * Returns all permissions for a role as a readonly array.
 * Alias of resolvePermissions — kept for semantic clarity at call sites.
 */
export function listPermissions(context: PermissionContext): readonly Permission[] {
  return resolvePermissions(context);
}
