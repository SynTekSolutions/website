import type {
  UserJSON,
  DeletedObjectJSON,
  WebhookEvent,
} from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { DomainUser } from "../types";
import { softDeleteUser } from "../sync-user";
import { syncLogger } from "../sync-logger";
import { metrics } from "../metrics";
import { toDomainUser } from "../domain-user";

/**
 * Shared upsert logic for user.created and user.updated events.
 * Receives a fully-typed UserJSON — no casting or Record<string, unknown>.
 */
async function handleUserCreatedOrUpdated(
  data: UserJSON,
  eventType: "user.created" | "user.updated",
): Promise<DomainUser> {
  const start = Date.now();
  const clerkId = data.id;

  const email = data.email_addresses?.[0]?.email_address;
  if (!email) {
    throw new Error(`Webhook payload for user ${clerkId} is missing an email address`);
  }

  const isMockEnabled = process.env.E2E_MOCK_ENABLED === "true";
  const mockRole = isMockEnabled && clerkId.includes("admin") ? "ADMIN"
                 : isMockEnabled && clerkId.includes("owner") ? "OWNER"
                 : isMockEnabled && clerkId.includes("staff") ? "STAFF"
                 : "VIEWER";
  const mockIsActive = !(isMockEnabled && clerkId.includes("inactive"));

  const dbUser = await prisma.user.upsert({
    where: { clerkId },
    update: {
      email,
      firstName: data.first_name ?? null,
      lastName: data.last_name ?? null,
      imageUrl: data.image_url ?? null,
      // Never sync role or organization from Clerk in production (ADR Decision 7)
      ...(isMockEnabled ? { role: mockRole, isActive: mockIsActive } : {}),
    },
    create: {
      clerkId,
      email,
      firstName: data.first_name ?? null,
      lastName: data.last_name ?? null,
      imageUrl: data.image_url ?? null,
      role: mockRole,
      isActive: mockIsActive,
    },
  });

  syncLogger.info({
    trigger: "webhook",
    outcome: "success",
    clerkId,
    eventType,
    durationMs: Date.now() - start,
  });
  metrics.increment("webhook_sync_total", { event: eventType });

  return toDomainUser(dbUser);
}

export async function handleUserCreated(data: UserJSON): Promise<DomainUser> {
  return handleUserCreatedOrUpdated(data, "user.created");
}

export async function handleUserUpdated(data: UserJSON): Promise<DomainUser> {
  return handleUserCreatedOrUpdated(data, "user.updated");
}

export async function handleUserDeleted(data: DeletedObjectJSON): Promise<void> {
  const clerkId = data.id;
  if (!clerkId) {
    throw new Error("user.deleted webhook payload has no id");
  }
  await softDeleteUser(clerkId);
}

/**
 * Dispatches a verified WebhookEvent to the appropriate typed handler.
 * TypeScript narrows evt.data automatically via the switch discriminant —
 * no Record<string, unknown> or casting anywhere.
 * Unhandled event types are explicitly ignored (200 OK).
 */
export async function dispatchWebhookEvent(evt: WebhookEvent): Promise<void> {
  switch (evt.type) {
    case "user.created":
      await handleUserCreated(evt.data);
      break;
    case "user.updated":
      await handleUserUpdated(evt.data);
      break;
    case "user.deleted":
      await handleUserDeleted(evt.data);
      break;
    default:
      metrics.increment("webhook_ignored_total", { event: evt.type });
      syncLogger.info({ trigger: "webhook", outcome: "skipped", eventType: evt.type });
      break;
  }
}
