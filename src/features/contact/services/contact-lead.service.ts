import "server-only";
import crypto from "crypto";
import { logger } from "@/lib/logger";
import { AnalyticsService } from "@/lib/analytics/analytics.service";
import { NotificationService } from "@/lib/notifications/notification.service";
import type { LeadPayload } from "@/lib/notifications/channels/notification-channel.interface";
import type { ContactFormData } from "../validations/contact.schema";
import { SupabaseContactRepository } from "../repositories/supabase-contact.repository";

const contactRepo = new SupabaseContactRepository();

export interface ContactSubmissionResult {
  success: boolean;
  message: string;
  leadId?: string;
}

export interface ClientMetadata {
  ip?: string;
  userAgent?: string;
  referrer?: string;
}

/**
 * Servicio público para procesar la entrada de leads desde la landing page.
 */
export class ContactLeadService {
  /**
   * Persiste el lead en el repositorio de base de datos y dispara las notificaciones.
   *
   * Flujo:
   * 1. Generar id (UUID) y created_at en servidor
   * 2. Insertar en base de datos vía repositorio (usando metadata JSONB)
   * 3. Analytics: contact_form_submitted
   * 4. await NotificationService.notifyNewLead() — awaited, serverless-safe
   * 5. Analytics: confirmation_email_sent (con resultado del envío)
   *
   * Si las notificaciones fallan, el lead YA está guardado.
   * No re-throw: el cliente recibe siempre la confirmación en pantalla.
   */
  static async saveLead(
    data: ContactFormData,
    metadata?: ClientMetadata
  ): Promise<ContactSubmissionResult> {
    const leadId = crypto.randomUUID();
    const createdAt = new Date();

    // ── 1. Persistir ──────────────────────────────────────────────────────────
    await contactRepo.create({
      id:         leadId,
      name:       data.name,
      email:      data.email,
      phone:      data.phone || null,
      company:    data.company,
      service:    data.serviceOfInterest,
      message:    data.message,
      status:     "new",
      origin:     "website",
      created_at: createdAt,
      updated_at: createdAt,
      metadata: {
        ip:        metadata?.ip,
        userAgent: metadata?.userAgent,
        referrer:  metadata?.referrer,
      },
    });

    // Log estructurado — facilita trazar la secuencia completa de un lead en Sentry/Axiom
    logger.info("Lead created", {
      leadId,
      origin:  "website",
      service: data.serviceOfInterest,
      company: data.company,
    });

    // ── 2. Analytics: lead guardado ───────────────────────────────────────────
    AnalyticsService.trackEvent("contact_form_submitted", {
      leadId,
      service: data.serviceOfInterest,
      company: data.company,
    });

    // ── 3. Notificaciones (awaited — serverless-safe) ─────────────────────────
    const leadPayload: LeadPayload = {
      id:                leadId,
      name:              data.name,
      email:             data.email,
      phone:             data.phone,
      company:           data.company,
      serviceOfInterest: data.serviceOfInterest,
      message:           data.message,
      createdAt,
      status:            "new",
      origin:            "website",
      metadata: {
        ip:        metadata?.ip,
        userAgent: metadata?.userAgent,
        referrer:  metadata?.referrer,
      },
    };

    try {
      const summary = await NotificationService.notifyNewLead(leadPayload);

      // ── 4. Analytics: resultado del envío ──────────────────────────────────
      AnalyticsService.trackEvent("confirmation_email_sent", {
        leadId,
        sent:    summary.sent,
        failed:  summary.failed,
        success: summary.success,
      });
    } catch (error) {
      // Lead guardado. Solo fallaron las notificaciones — no bloquear al usuario.
      logger.error("Notification error after lead save", error, { leadId });
    }

    return {
      success: true,
      message:
        "¡Gracias! Tu consulta ha sido recibida correctamente. Nuestro equipo se pondrá en contacto contigo en menos de 24 horas.",
      leadId,
    };
  }
}
