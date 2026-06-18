/**
 * Centralized auth error hierarchy.
 * All auth-related errors extend AuthError for easy instanceof checks.
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Restore prototype chain for proper instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Thrown when a valid Clerk session belongs to a user whose local DB record is inactive. */
export class InactiveUserError extends AuthError {
  constructor(public readonly clerkId: string) {
    super(`User account is inactive: ${clerkId}`);
    this.name = "InactiveUserError";
  }
}

/** Thrown when a Clerk ID resolves to a 404 from the Clerk API — user has been deleted upstream. */
export class ClerkUserNotFoundError extends AuthError {
  constructor(public readonly clerkId: string) {
    super(`User not found in Clerk: ${clerkId}`);
    this.name = "ClerkUserNotFoundError";
  }
}

/** Thrown when a user lacks a required permission. */
export class PermissionDeniedError extends AuthError {
  constructor(public readonly permission: string) {
    super(`Permission denied: ${permission}`);
    this.name = "PermissionDeniedError";
  }
}

/** Thrown when a request reaches a protected route without a valid session. */
export class UnauthenticatedError extends AuthError {
  constructor() {
    super("Unauthenticated: a valid session is required");
    this.name = "UnauthenticatedError";
  }
}
