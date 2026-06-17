import { ContactFormData } from "../validations/contact.schema";

export interface ContactSubmissionResult {
  success: boolean;
  message: string;
}

/**
 * Envía los datos del formulario de contacto a la API Route /api/contact.
 * Seguro para importar en componentes cliente ('use client').
 */
export async function submitContactForm(
  data: ContactFormData
): Promise<ContactSubmissionResult> {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    return {
      success: false,
      message: result.message ?? "Error al enviar el formulario. Intenta nuevamente.",
    };
  }

  return {
    success: true,
    message:
      result.message ??
      "¡Gracias! Tu consulta ha sido recibida correctamente. Nuestro equipo se pondrá en contacto contigo en menos de 24 horas.",
  };
}
