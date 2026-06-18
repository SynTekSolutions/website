import { LeadStatus } from "@/lib/notifications/channels/notification-channel.interface";

export interface StatusStyle {
  label: string;
  badgeClass: string;
}

export const LEAD_STATUS_CONFIG: Record<LeadStatus, StatusStyle> = {
  new: {
    label: "Nuevo",
    badgeClass: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  },
  qualified: {
    label: "Calificado",
    badgeClass: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  },
  contacted: {
    label: "Contactado",
    badgeClass: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  },
  proposal: {
    label: "Propuesta",
    badgeClass: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  },
  won: {
    label: "Ganado",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },
  lost: {
    label: "Perdido",
    badgeClass: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  },
  closed: {
    label: "Cerrado",
    badgeClass: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  },
} as const;
