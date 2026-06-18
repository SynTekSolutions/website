import { Permission } from "./permissions";

export type Role = "OWNER" | "ADMIN" | "STAFF" | "VIEWER";

export type DomainUser = {
  id: string; // UUID
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  role: Role;
  permissions: readonly Permission[]; // Readonly array of Permission
  isActive: boolean;
  organizationId?: string | null;
}

export type DomainSession = {
  userId: string;
  clerkSessionId: string;
  expiresAt: Date;
}

export interface AuthProvider {
  getCurrentUser(): Promise<DomainUser | null>;
  getSession(): Promise<DomainSession | null>;
  syncUser(clerkId: string): Promise<DomainUser>;
  signOut(): Promise<void>;
}
