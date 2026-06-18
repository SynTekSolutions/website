import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadDetailDTO } from "../types";
import { LEAD_STATUSES } from "@/lib/notifications/channels/notification-channel.interface";
import { LEAD_STATUS_CONFIG } from "../config/status-config";
import { formatLeadDate } from "@/lib/email/helpers/format-lead-date";
import { buildSignInRedirectUrl } from "@/auth/redirect-helper";

interface LeadDetailProps {
  id?: string;
  onStatusUpdated: () => void;
}

export const LeadDetail = ({ id, onStatusUpdated }: LeadDetailProps) => {
  const [lead, setLead] = useState<LeadDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Cargar detalles (Lazy Load) al cambiar el ID seleccionado
  useEffect(() => {
    if (!id) {
      setLead(null);
      return;
    }

    const fetchLeadDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/leads/${id}`);
        const result = await res.json();
        
        if (!res.ok || !result.success) {
          throw new Error(result.message || "Error al cargar el detalle.");
        }

        setLead(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrió un error.");
        setLead(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeadDetails();
  }, [id]);

  // Guardar cambio de estado vía PATCH
  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        if (res.status === 401 || res.status === 403 || result.error?.startsWith("AUTH_")) {
          window.location.href = buildSignInRedirectUrl(window.location.pathname + window.location.search);
          return;
        }
        throw new Error(result.message || "Error al actualizar.");
      }

      setLead(result.data);
      onStatusUpdated();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ocurrió un error.";
      alert(`Error al actualizar el estado: ${message}`);
    } finally {
      setIsUpdating(false);
    }
  };
  if (!id) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-dark-muted/5 border border-white/5 rounded-xl text-slate-500">
        <svg
          className="w-16 h-16 mb-4 text-slate-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p className="font-semibold text-slate-400">Selecciona un Lead</p>
        <p className="text-xs sm:text-sm mt-1 max-w-xs mx-auto">
          Haz clic en cualquier lead de la lista izquierda para ver sus detalles completos, mensaje y metadatos técnicos.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-6 bg-dark-muted/5 border border-white/5 rounded-xl h-full">
        <div className="h-4 bg-white/10 rounded w-1/4"></div>
        <div className="h-8 bg-white/10 rounded w-3/4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-white/10 rounded"></div>
          <div className="h-4 bg-white/10 rounded w-5/6"></div>
        </div>
        <div className="h-24 bg-white/10 rounded-lg"></div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-rose-500/5 border border-rose-500/10 rounded-xl text-rose-400">
        <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="font-semibold">Error al cargar datos</p>
        <p className="text-sm mt-1">{error || "No se pudo recuperar el lead."}</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-muted/10 border border-white/5 rounded-xl p-5 sm:p-6 space-y-6 flex flex-col justify-between h-full">
      <div className="space-y-6">
        {/* Encabezado del detalle */}
        <div className="border-bottom border-white/5 pb-4">
          <span className="text-xs text-slate-500 font-mono">UUID: {lead.id}</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{lead.name}</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Recibido el <span suppressHydrationWarning>{formatLeadDate(lead.created_at)}</span> · Origen: <strong className="text-slate-200">{lead.origin}</strong>
          </p>
        </div>

        {/* Ficha técnica */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-dark/40 p-4 rounded-lg border border-white/5">
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">Empresa</span>
            <span className="text-slate-200 font-medium">{lead.company}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">Servicio de interés</span>
            <span className="text-slate-200 font-medium">{lead.service}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">Email</span>
            <a href={`mailto:${lead.email}`} className="text-secondary hover:text-secondary-hover transition-colors font-medium break-all">
              {lead.email}
            </a>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">Teléfono</span>
            {lead.phone ? (
              <a href={`tel:${lead.phone}`} className="text-slate-200 hover:text-white transition-colors font-medium">
                {lead.phone}
              </a>
            ) : (
              <span className="text-slate-500 font-medium">—</span>
            )}
          </div>
        </div>

        {/* Mensaje */}
        <div className="space-y-2">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Detalles del proyecto</span>
          <div className="bg-dark border border-white/10 rounded-lg p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap select-text max-h-[160px] overflow-y-auto">
            {lead.message}
          </div>
        </div>

        {/* Metadatos técnicos */}
        <div className="space-y-2">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Metadatos del Cliente (JSONB)</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-dark-muted/5 p-3 rounded-lg border border-white/5 text-slate-400 font-mono">
            <div className="truncate">
              <strong className="text-slate-500 block uppercase text-[10px]">Dirección IP</strong>
              {lead.metadata.ip || "Desconocida"}
            </div>
            <div className="truncate" title={lead.metadata.referrer as string}>
              <strong className="text-slate-500 block uppercase text-[10px]">Referencia</strong>
              {lead.metadata.referrer || "Directa"}
            </div>
            <div className="truncate" title={lead.metadata.userAgent as string}>
              <strong className="text-slate-500 block uppercase text-[10px]">Navegador</strong>
              {lead.metadata.userAgent || "No detectado"}
            </div>
          </div>
        </div>
      </div>

      {/* Cambiar Estado */}
      <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-auto">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Estado comercial:</span>
          <Select value={lead.status} onValueChange={handleStatusChange} disabled={isUpdating}>
            <SelectTrigger className="bg-dark border-white/10 text-slate-200 w-auto" id="detail-status-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {LEAD_STATUS_CONFIG[status]?.label || status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isUpdating && (
            <svg className="animate-spin h-4 w-4 text-secondary ml-1" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};
