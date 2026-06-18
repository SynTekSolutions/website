import "server-only";
import { Resend } from "resend";
import { config } from "@/config/env";

/**
 * Singleton del cliente Resend.
 * Solo se instancia en el servidor — nunca importar desde client components.
 */
export const resend = new Resend(config.resend.apiKey);
