/**
 * Logger centralizado.
 *
 * Hoy usa console. En Sprint 2.6, reemplaza la implementación interna
 * por Sentry/Logtail/Axiom sin tocar ningún call site.
 */

type LogContext = Record<string, unknown>;

export const logger = {
  info: (message: string, context?: LogContext) =>
    console.info("[syntek]", message, context ?? ""),

  warn: (message: string, context?: LogContext) =>
    console.warn("[syntek]", message, context ?? ""),

  error: (message: string, error?: unknown, context?: LogContext) =>
    console.error("[syntek]", message, error, context ?? ""),
};
