"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LeadListItemDTO, PaginatedResult } from "../types";
import { LeadFilters } from "./LeadFilters";
import { LeadList } from "./LeadList";
import { LeadDetail } from "./LeadDetail";
import { LeadPagination } from "./LeadPagination";

interface LeadsDashboardProps {
  initialData: PaginatedResult<LeadListItemDTO>;
  page: number;
}

export const LeadsDashboard = ({ initialData, page }: LeadsDashboardProps) => {
  const router = useRouter();
  
  // Estado local para rastrear qué lead está seleccionado para ver detalles
  const [selectedId, setSelectedId] = useState<string | undefined>();

  return (
    <div className="space-y-6">
      {/* ── Sección de Filtros ── */}
      <LeadFilters />

      {/* ── Grid Principal del CRM ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Columna Izquierda: Listado y Paginación */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-dark-muted/5 border border-white/5 rounded-xl p-4 sm:p-5 max-h-[600px] overflow-y-auto">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
              Bandeja de Leads ({initialData.total})
            </h2>
            <LeadList
              leads={initialData.items}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
          
          <LeadPagination
            page={page}
            hasNext={initialData.hasNext}
            total={initialData.total}
            pageSize={initialData.pageSize}
          />
        </div>

        {/* Columna Derecha: Detalle Completo (Lazy Loaded) */}
        <div className="lg:col-span-3 h-[670px]">
          <LeadDetail
            id={selectedId}
            onStatusUpdated={() => {
              // Re-validar los datos del Server Component para reflejar el cambio de estado en la lista
              router.refresh();
            }}
          />
        </div>
      </div>
    </div>
  );
};
