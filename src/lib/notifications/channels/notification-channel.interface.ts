// ─── Lead Status ─────────────────────────────────────────────────────────────
// Sincronizado con el CONSTRAINT contacts_status_check en Supabase.
// Si se modifica el CHECK en SQL, actualizar aquí también.
export const LEAD_STATUSES = [
  "new",
  "qualified",
  "contacted",
  "proposal",
  "won",
  "lost",
  "closed",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

// ─── Lead Payload ─────────────────────────────────────────────────────────────
export interface LeadPayload {
  id: string;                    // UUID completo — siempre internamente
  name: string;
  email: string;
  phone?: string | null;
  company: string;
  serviceOfInterest: string;
  message: string;
  createdAt: Date;               // Date object — formatLeadDate() decide el string
  status: LeadStatus;
  origin: string;
  // Metadatos opcionales agrupados — UTM, gclid, fbclid, country, device
  // entran aquí en el futuro sin romper la interfaz
  metadata?: {
    ip?:        string;
    userAgent?: string;
    referrer?:  string;
  };
}

// ─── Notification Result ──────────────────────────────────────────────────────
export interface NotificationSummary {
  sent: number;
  failed: number;
  providers: string[];  // solo incluye proveedores con actividad real (sent + failed > 0)
  success: boolean;     // = failed === 0
}

// ─── Channel Contract ─────────────────────────────────────────────────────────
export interface NotificationChannel {
  send(payload: LeadPayload): Promise<NotificationSummary>;
}
