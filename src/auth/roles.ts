import { Role } from "./types";

export const ROLES: Role[] = ["OWNER", "ADMIN", "STAFF", "VIEWER"];

export function isValidRole(role: string): role is Role {
  return ROLES.includes(role as Role);
}
