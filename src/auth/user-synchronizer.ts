import { DomainUser } from "./types";
import type { WebhookEvent } from "@clerk/nextjs/server";

/**
 * Abstraction over the user synchronization mechanism.
 *
 * Consumers (getCurrentUser, webhook handlers) depend on this interface,
 * not directly on sync-user.ts. Enables easy mocking in tests.
 */
export interface UserSynchronizer {
  /**
   * Fetches a user from Clerk and upserts them into PostgreSQL.
   * Throws ClerkUserNotFoundError if the user no longer exists in Clerk.
   * Throws ClerkApiTimeoutError if the Clerk API does not respond within the timeout.
   */
  sync(clerkId: string): Promise<DomainUser>;

  /**
   * Marks a user as inactive in PostgreSQL (soft delete).
   * Idempotent: if the user does not exist in the local DB, returns gracefully.
   */
  softDelete(clerkId: string): Promise<void>;

  /**
   * Dispatches a verified Clerk webhook event to the appropriate handler.
   * Unhandled event types are ignored and return without error.
   */
  handleWebhook(event: WebhookEvent): Promise<void>;
}
