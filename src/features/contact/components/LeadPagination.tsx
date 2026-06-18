import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface LeadPaginationProps {
  page: number;
  hasNext: boolean;
  total: number;
  pageSize: number;
}

export const LeadPagination = ({ page, hasNext, total, pageSize }: LeadPaginationProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const totalPages = Math.ceil(total / pageSize) || 1;
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  if (total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 border-t border-white/5 pt-4">
      {/* Información del rango de ítems */}
      <span className="text-xs sm:text-sm text-slate-400">
        Mostrando <strong className="text-slate-200">{startItem}</strong> a{" "}
        <strong className="text-slate-200">{endItem}</strong> de{" "}
        <strong className="text-slate-200">{total}</strong> leads
      </span>

      {/* Controles de página */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg border border-white/10 text-xs sm:text-sm font-semibold bg-dark hover:bg-dark-muted/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-300 hover:text-white transition-all"
        >
          Anterior
        </button>

        <span className="text-xs sm:text-sm font-medium text-slate-400 px-2">
          Página {page} de {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={!hasNext}
          className="px-3 py-1.5 rounded-lg border border-white/10 text-xs sm:text-sm font-semibold bg-dark hover:bg-dark-muted/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-300 hover:text-white transition-all"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};
