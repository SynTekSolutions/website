import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { LEAD_STATUSES } from "@/lib/notifications/channels/notification-channel.interface";
import { LEAD_STATUS_CONFIG } from "../config/status-config";
import { SERVICES } from "@/content/services";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const LeadFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [localSearch, setLocalSearch] = useState(searchParams.get("search") || "");

  const selectedStatus = searchParams.get("status") || "";
  const selectedService = searchParams.get("service") || "";

  // Debounce para la búsqueda
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (localSearch) {
        params.set("search", localSearch);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [localSearch, pathname, router, searchParams]);

  // Sincronizar el input de búsqueda
  useEffect(() => {
    setLocalSearch(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSelectChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setLocalSearch("");
    router.push(pathname);
  };

  const hasActiveFilters = Boolean(
    searchParams.get("search") || searchParams.get("status") || searchParams.get("service")
  );

  return (
    <div className="bg-dark-muted/10 border border-white/5 rounded-xl p-4 sm:p-5 flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {/* Barra de búsqueda */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <label htmlFor="search-input" className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Buscar
          </label>
          <div className="relative">
            <Search className="absolute inset-y-0 left-0 pl-3 h-full w-4 text-slate-500 pointer-events-none" aria-hidden="true" />
            <input
              id="search-input"
              type="text"
              placeholder="Nombre, email o empresa..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-dark border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
            />
          </div>
        </div>

        {/* Filtrar por Estado */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status-select" className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Estado
          </label>
          <Select value={selectedStatus} onValueChange={(value) => handleSelectChange("status", value)}>
            <SelectTrigger id="status-select" className="bg-dark border-white/10 text-slate-200">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los estados</SelectItem>
              {LEAD_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {LEAD_STATUS_CONFIG[status]?.label || status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtrar por Servicio */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="service-select" className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Servicio de interés
          </label>
          <Select value={selectedService} onValueChange={(value) => handleSelectChange("service", value)}>
            <SelectTrigger id="service-select" className="bg-dark border-white/10 text-slate-200">
              <SelectValue placeholder="Todos los servicios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los servicios</SelectItem>
              {SERVICES.map((srv) => (
                <SelectItem key={srv.id} value={srv.id}>
                  {srv.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-end w-full border-t border-white/5 pt-3">
          <button
            onClick={handleClearFilters}
            className="text-xs text-secondary hover:text-secondary-hover font-semibold flex items-center gap-1 bg-transparent border-0 cursor-pointer"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};
