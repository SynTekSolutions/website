import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { dispatchWebhookEvent } from "@/auth/handlers";
import { syncLogger } from "@/auth/sync-logger";
import { metrics } from "@/auth/metrics";

// Infer the event type from the handler's signature — no direct @clerk/nextjs import needed.
// This preserves type safety while respecting the ESLint boundary rule.
type WebhookEvent = Parameters<typeof dispatchWebhookEvent>[0];

export async function POST(req: NextRequest) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!CLERK_WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable.");
    return new NextResponse("Internal Server Error", { status: 500 });
  }

  // Get headers (Next.js 15 headers() is async)
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse("Error: Missing Svix headers", { status: 400 });
  }

  // Read raw body — Svix verifies against the exact bytes received,
  // NOT a re-serialized JSON string (which could differ in key order / whitespace).
  const body = await req.text();

  let evt: WebhookEvent;

  const isMockEnabled =
    process.env.E2E_MOCK_ENABLED === "true" &&
    (process.env.NODE_ENV !== "production" || process.env.PLAYWRIGHT_TEST_ENV === "true");

  if (isMockEnabled && svixSignature === "mock-signature") {
    try {
      evt = JSON.parse(body) as WebhookEvent;
    } catch (err) {
      console.error("Failed to parse mock webhook JSON body:", err);
      return new NextResponse("Error: Invalid JSON body", { status: 400 });
    }
  } else {
    const wh = new Webhook(CLERK_WEBHOOK_SECRET);
    try {
      evt = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Svix signature verification failed:", err);
      return new NextResponse("Error: Verification failed", { status: 400 });
    }
  }

  const start = Date.now();

  try {
    await dispatchWebhookEvent(evt);
    syncLogger.info({
      trigger: "webhook",
      outcome: "success",
      eventId: svixId,
      eventType: evt.type,
      durationMs: Date.now() - start,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    syncLogger.error({
      trigger: "webhook",
      outcome: "failure",
      eventId: svixId,
      eventType: evt.type,
      durationMs: Date.now() - start,
      error: message,
    });
    metrics.increment("sync_failures_total", {
      trigger: "webhook",
      event: evt.type,
      retry: svixId,
    });
    // Return 500 so Clerk retries this event automatically
    return new NextResponse("Error: Internal processing error", { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
