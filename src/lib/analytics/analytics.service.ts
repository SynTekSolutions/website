import { logger } from "@/lib/logger";
import { ConsoleAnalyticsProvider } from "./providers/console.provider";
// Sprint 2.5: import { PostHogProvider } from "./providers/posthog.provider";

// Cambiar de Console → PostHog en Sprint 2.5: solo esta línea
const provider = new ConsoleAnalyticsProvider();

export type AnalyticsEvent =
  | "contact_form_submitted"
  | "confirmation_email_sent"
  | "cta_clicked"
  | "calendly_clicked"
  | "whatsapp_clicked"
  | "service_viewed";

export interface EventProperties {
  service?: string;
  serviceId?: string;
  company?: string;
  location?: string;
  label?: string;
  type?: string;
  leadId?: string;
  sent?: number;
  failed?: number;
  success?: boolean;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Servicio de analytics desacoplado del proveedor concreto.
 * Sprint 2.5: reemplazar ConsoleAnalyticsProvider por PostHogProvider sin
 * tocar ningún call site fuera de este archivo.
 */
export class AnalyticsService {
  static trackEvent(event: AnalyticsEvent, properties?: EventProperties): void {
    try {
      provider.track(event, properties);
    } catch (error) {
      logger.error("Analytics track failed", error, { event });
    }
  }

  static trackPageview(url: string): void {
    try {
      provider.track("$pageview", { url });
    } catch (error) {
      logger.error("Analytics pageview failed", error, { url });
    }
  }
}

