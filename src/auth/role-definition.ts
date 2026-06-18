import { Role } from "./types";
import { Permission } from "./permissions";

/**
 * A role definition is a named, immutable collection of permissions.
 * Roles are defined statically; business logic never references Role strings directly.
 */
export interface RoleDefinition {
  readonly name: Role;
  readonly permissions: readonly Permission[];
}
