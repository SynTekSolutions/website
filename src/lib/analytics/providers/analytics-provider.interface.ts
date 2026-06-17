export interface AnalyticsProvider {
  track(event: string, properties?: Record<string, unknown>): void;
}
