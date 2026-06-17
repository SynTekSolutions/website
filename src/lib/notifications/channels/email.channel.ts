import { render } from "react-email";
import { resend } from "@/lib/email/resend";
import { config } from "@/config/env";
import { logger } from "@/lib/logger";
import { EMAIL_SUBJECTS } from "@/lib/email/subjects";
import { ContactNotification } from "@/lib/email/templates/ContactNotification";
import { ContactConfirmationES } from "@/lib/email/templates/ContactConfirmationES";
import type {
  LeadPayload,
  NotificationChannel,
  NotificationSummary,
} from "./notification-channel.interface";

export class EmailChannel implements NotificationChannel {
  async send(payload: LeadPayload): Promise<NotificationSummary> {
    if (!config.resend.enabled) {
      logger.info("Email notifications disabled via feature flag", {
        leadId: payload.id,
      });
      // providers: [] porque no se intentó ningún envío
      return { sent: 0, failed: 0, providers: [], success: true };
    }

    const results = await Promise.allSettled([
      this.sendInternal(payload),
      this.sendClient(payload),
    ]);

    let sent = 0;
    let failed = 0;

    results.forEach((result, i) => {
      const type = i === 0 ? "internal" : "client";
      if (result.status === "rejected") {
        failed++;
        logger.error("Email send failed", result.reason, {
          leadId: payload.id,
          type,
          provider: "resend",
        });
      } else {
        sent++;
      }
    });

    return {
      sent,
      failed,
      // providers solo reporta actividad real
      providers: sent + failed > 0 ? ["resend"] : [],
      success: failed === 0,
    };
  }

  private async sendInternal(payload: LeadPayload): Promise<void> {
    const shortId = payload.id.slice(0, 8);

    const html = await render(
      ContactNotification({ ...payload }) as React.ReactElement
    );

    const { error } = await resend.emails.send({
      from:    config.resend.from,
      to:      config.resend.to,
      subject: EMAIL_SUBJECTS.newLead(payload.name, payload.company, shortId),
      html,
    });

    // Resend puede responder fulfilled pero con error en el payload — falso positivo
    if (error) throw new Error(`Resend internal error: ${error.message}`);
  }

  private async sendClient(payload: LeadPayload): Promise<void> {
    const shortId = payload.id.slice(0, 8);

    const html = await render(
      ContactConfirmationES({
        id:                payload.id,
        name:              payload.name,
        company:           payload.company,
        serviceOfInterest: payload.serviceOfInterest,
        createdAt:         payload.createdAt,
      }) as React.ReactElement
    );

    const { error } = await resend.emails.send({
      from:    config.resend.from,
      to:      payload.email,
      subject: EMAIL_SUBJECTS.confirmation(),
      html,
    });

    if (error) throw new Error(`Resend client error: ${error.message}`);

    logger.info("Confirmation email sent", { leadId: payload.id, shortId });
  }
}
