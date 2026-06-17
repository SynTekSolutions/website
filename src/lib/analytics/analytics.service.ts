export type AnalyticsEvent =
  | "contact_form_submitted"
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
  [key: string]: string | number | boolean | undefined;
}

export class AnalyticsService {
  /**
   * Registra un evento de negocio tipado de forma consistente.
   * Esto prepara la infraestructura para integrar PostHog, Google Analytics y Meta Pixel más adelante.
   */
  static trackEvent(event: AnalyticsEvent, properties?: EventProperties): void {
    console.log(`[Analytics Event] => ${event}`, properties);
    
    // Aquí se conectarán los proveedores en el Sprint 2:
    // if (typeof window !== "undefined") {
    //   window.gtag?.("event", event, properties);
    //   window.posthog?.capture(event, properties);
    //   window.fbq?.("trackCustom", event, properties);
    // }
  }

  /**
   * Registra una vista de página.
   */
  static trackPageview(url: string): void {
    console.log(`[Analytics Pageview] => ${url}`);
    
    // Aquí se conectará la analítica de rutas en el Sprint 2:
    // if (typeof window !== "undefined") {
    //   window.gtag?.("config", process.env.NEXT_PUBLIC_GA_ID, { page_path: url });
    //   window.posthog?.capture("$pageview", { $current_url: url });
    // }
  }
}
