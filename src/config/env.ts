import { z } from "zod";

// ─── Schema base (siempre requerido) ─────────────────────────────────────────
const baseSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL:      z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  RESEND_ENABLED:              z.enum(["true", "false"]).default("true"),
  EMAIL_NOTIFICATIONS_ENABLED: z.enum(["true", "false"]).default("true"),
});

// ─── Variables de Resend (opcionales en schema, validadas condicionalmente) ───
const resendSchema = z.object({
  RESEND_API_KEY:    z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  RESEND_TO_EMAIL:   z.string().email().optional(),
});

const parsed = baseSchema.merge(resendSchema).parse(process.env);

// ─── Validación condicional ───────────────────────────────────────────────────
// RESEND_ENABLED=false → arranca sin RESEND_API_KEY (dev, CI, preview deployments)
// RESEND_ENABLED=true  → falla inmediatamente si falta cualquier variable de Resend
const resendEnabled =
  parsed.RESEND_ENABLED === "true" &&
  parsed.EMAIL_NOTIFICATIONS_ENABLED === "true";

if (resendEnabled) {
  if (!parsed.RESEND_API_KEY)
    throw new Error("RESEND_API_KEY is required when RESEND_ENABLED=true");
  if (!parsed.RESEND_FROM_EMAIL)
    throw new Error("RESEND_FROM_EMAIL is required when RESEND_ENABLED=true");
  if (!parsed.RESEND_TO_EMAIL)
    throw new Error("RESEND_TO_EMAIL is required when RESEND_ENABLED=true");
}

// ─── Accesos tipados y agrupados ──────────────────────────────────────────────
export const config = {
  supabase: {
    url:     parsed.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  resend: {
    apiKey:  parsed.RESEND_API_KEY ?? "",
    from:    parsed.RESEND_FROM_EMAIL ?? "",
    to:      parsed.RESEND_TO_EMAIL ?? "",
    enabled: resendEnabled,
  },
} as const;
