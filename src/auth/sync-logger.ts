import { RequestContext } from "@/lib/request-context";

export type SyncTrigger = "jit" | "webhook";
export type SyncOutcome = "success" | "failure" | "skipped" | "not_found";

interface SyncLogEntry {
  trigger: SyncTrigger;
  outcome: SyncOutcome;
  clerkId?: string;
  /** Svix event ID for webhook-triggered syncs. */
  eventId?: string;
  eventType?: string;
  durationMs?: number;
  error?: string;
}

/**
 * Structured logger for sync operations.
 * Automatically attaches the current requestId from AsyncLocalStorage.
 */
export const syncLogger = {
  info(entry: SyncLogEntry): void {
    console.info(
      JSON.stringify({
        ...entry,
        requestId: RequestContext.getRequestId(),
        timestamp: new Date().toISOString(),
      }),
    );
  },

  error(entry: SyncLogEntry & { error: string }): void {
    console.error(
      JSON.stringify({
        ...entry,
        requestId: RequestContext.getRequestId(),
        timestamp: new Date().toISOString(),
      }),
    );
  },
};
