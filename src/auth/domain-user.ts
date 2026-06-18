import { DomainUser, Role } from "./types";
import { resolvePermissions } from "./permission-resolver";

/**
 * Canonical mapping from a Prisma User record to a DomainUser value object.
 *
 * Centralizes permission resolution so sync-user, current-user, and webhook
 * handlers all produce identical DomainUser shapes.
 */
export function toDomainUser(dbUser: {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  role: string;
  isActive: boolean;
  organizationId: string | null;
}): DomainUser {
  const role = dbUser.role as Role;
  return {
    id: dbUser.id,
    clerkId: dbUser.clerkId,
    email: dbUser.email,
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    imageUrl: dbUser.imageUrl,
    role,
    permissions: resolvePermissions({ role, organizationId: dbUser.organizationId }),
    isActive: dbUser.isActive,
    organizationId: dbUser.organizationId,
  };
}
