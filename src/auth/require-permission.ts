import { Permission } from "./permissions";
import { DomainUser } from "./types";
import {
  PermissionDeniedError,
  UnauthenticatedError,
  InactiveUserError,
} from "./errors";
import { hasPermission } from "./permission-resolver";

// Re-export for backwards compatibility (existing imports of ForbiddenError / UnauthorizedError)
export { PermissionDeniedError as ForbiddenError, UnauthenticatedError as UnauthorizedError } from "./errors";

/**
 * Guards a Server Action or Route Handler with a single permission check.
 *
 * Contract:
 * - Does NOT query the database.
 * - Does NOT call the Clerk API.
 * - Does NOT resolve roles. The DomainUser already carries resolved permissions.
 * - Throws typed errors so callers can respond appropriately.
 *
 * Usage:
 *   const user = await getCurrentUser();
 *   requirePermission(user, Permission.PRODUCT_DELETE);
 */
export function requirePermission(
  user: DomainUser | null,
  permission: Permission,
): DomainUser {
  if (!user) {
    throw new UnauthenticatedError();
  }

  if (!user.isActive) {
    throw new InactiveUserError(user.clerkId);
  }

  if (!hasPermission({ role: user.role, organizationId: user.organizationId }, permission)) {
    throw new PermissionDeniedError(permission);
  }

  return user;
}
