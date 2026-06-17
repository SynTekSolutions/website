/**
 * Asuntos de correo electrónico centralizados.
 * Cuando haya propuestas, recordatorios, onboarding o recuperación de contraseña,
 * todos sus asuntos se agregan aquí — no repartidos por los templates.
 */
export const EMAIL_SUBJECTS = {
  newLead: (name: string, company: string, shortId: string) =>
    `🔔 Nuevo Lead #${shortId} — ${name} @ ${company}`,

  confirmation: () =>
    `Tu consulta ha sido recibida — Syntek Solutions`,
} as const;
