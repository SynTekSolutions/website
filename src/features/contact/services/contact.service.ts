import { ContactFormData } from "../validations/contact.schema";

export interface ContactSubmissionResult {
  success: boolean;
  message: string;
}

export class ContactService {
  /**
   * Envía los datos del formulario de contacto a nuestro servicio simulado.
   * En futuros sprints, esto guardará en Supabase y enviará una notificación por Resend.
   */
  static async submitForm(data: ContactFormData): Promise<ContactSubmissionResult> {
    // Simulamos latencia de red
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Envío exitoso de formulario de contacto (Simulación):", data);

    return {
      success: true,
      message: "¡Gracias! Tu consulta ha sido recibida correctamente. Nuestro equipo se pondrá en contacto contigo en menos de 24 horas.",
    };
  }
}
