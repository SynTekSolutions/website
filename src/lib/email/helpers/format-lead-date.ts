/**
 * Helper centralizado de formato de fechas para email templates.
 *
 * Los templates NUNCA llaman toLocaleDateString() directamente.
 * Si el formato cambia, o se añade un idioma (en-US), solo cambia este helper.
 */
export function formatLeadDate(date: Date, locale: string = "es-CO"): string {
  return new Intl.DateTimeFormat(locale, {
    day:      "2-digit",
    month:    "long",
    year:     "numeric",
    hour:     "2-digit",
    minute:   "2-digit",
    timeZone: "America/Bogota",
  }).format(date);
}

/**
 * Versión corta: solo fecha, sin hora.
 * Útil para subjects y resúmenes.
 */
export function formatLeadDateShort(date: Date, locale: string = "es-CO"): string {
  return new Intl.DateTimeFormat(locale, {
    day:   "2-digit",
    month: "long",
    year:  "numeric",
  }).format(date);
}
