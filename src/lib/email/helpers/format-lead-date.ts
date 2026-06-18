/**
 * Helper centralizado de formato de fechas para email templates y componentes.
 *
 * Los templates y componentes NUNCA llaman toLocaleDateString() directamente.
 * Si el formato cambia, o se añade un idioma (en-US), solo cambia este helper.
 */
export function formatLeadDate(date: Date | string | number, locale: string = "es-CO"): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day:      "2-digit",
    month:    "long",
    year:     "numeric",
    hour:     "2-digit",
    minute:   "2-digit",
    timeZone: "America/Bogota",
  }).format(d);
}

/**
 * Versión corta: solo fecha, sin hora.
 * Útil para subjects y resúmenes.
 */
export function formatLeadDateShort(date: Date | string | number, locale: string = "es-CO"): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day:   "2-digit",
    month: "long",
    year:  "numeric",
  }).format(d);
}
