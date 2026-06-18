/**
 * Minimal metrics interface for auth/sync operations.
 *
 * Today: logger-backed (structured JSON logs).
 * Tomorrow: swap `defaultMetrics` for a Prometheus / OpenTelemetry implementation
 * without changing any call site.
 */
export interface Metrics {
  increment(key: MetricKey, tags?: Record<string, string>): void;
}

export type MetricKey =
  | "jit_sync_total"
  | "webhook_sync_total"
  | "sync_failures_total"
  | "inactive_login_attempts"
  | "webhook_ignored_total"
  | "clerk_api_timeout_total"
  | "session_revocation_total"
  | "session_revocation_failures_total";

/** Default implementation: structured log line for each counter increment. */
const loggerMetrics: Metrics = {
  increment(key: MetricKey, tags?: Record<string, string>): void {
    console.info(
      JSON.stringify({
        metric: key,
        value: 1,
        tags: tags ?? {},
        timestamp: new Date().toISOString(),
      }),
    );
  },
};

export const metrics: Metrics = loggerMetrics;
