import { logger } from "@/lib/logger";
import { EmailChannel } from "./channels/email.channel";
import type {
  LeadPayload,
  NotificationChannel,
  NotificationSummary,
} from "./channels/notification-channel.interface";

/**
 * Orquestador de canales de notificación.
 *
 * Hoy: solo EmailChannel.
 * Mañana: agregar SlackChannel, WhatsAppChannel, etc. sin tocar lógica de negocio.
 */
export class NotificationService {
  private static channels: NotificationChannel[] = [
    new EmailChannel(),
    // new SlackChannel(),
    // new WhatsAppChannel(),
  ];

  static async notifyNewLead(payload: LeadPayload): Promise<NotificationSummary> {
    const settled = await Promise.allSettled(
      NotificationService.channels.map((ch) => ch.send(payload))
    );

    return settled.reduce(
      (acc, result) => {
        if (result.status === "fulfilled") {
          return {
            sent:      acc.sent + result.value.sent,
            failed:    acc.failed + result.value.failed,
            providers: [...new Set([...acc.providers, ...result.value.providers])],
            success:   acc.success && result.value.success,
          };
        }

        logger.error("Notification channel threw unexpectedly", result.reason, {
          leadId: payload.id,
        });
        return { ...acc, failed: acc.failed + 1, success: false };
      },
      { sent: 0, failed: 0, providers: [], success: true } as NotificationSummary
    );
  }
}
