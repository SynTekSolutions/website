import { logger } from "@/lib/logger";
import type { AnalyticsProvider } from "./analytics-provider.interface";

/**
 * Implementación de analytics que escribe al console.
 * Sprint 2.5: reemplazar por PostHogProvider sin tocar ningún call site.
 */
export class ConsoleAnalyticsProvider implements AnalyticsProvider {
  track(event: string, properties?: Record<string, unknown>): void {
    logger.info(`[analytics] ${event}`, properties);
  }
}
