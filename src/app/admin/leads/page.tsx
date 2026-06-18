import React from "react";
import { ContactAdminService } from "@/features/contact/services/contact-admin.service";
import { LeadsDashboard } from "@/features/contact/components/LeadsDashboard";
import { AdminNavbar } from "@/components/layout/AdminNavbar";
import { LeadStatus } from "@/lib/notifications/channels/notification-channel.interface";

import { getCurrentUser } from "@/auth/current-user";
import { hasPermission } from "@/auth/permission-resolver";
import { Permission } from "@/auth/permissions";
import { InactiveUserError, PermissionDeniedError } from "@/auth/errors";
import { redirect } from "next/navigation";
import { buildSignInRedirectUrl } from "@/auth/redirect-helper";

// Desactivar caché estática para que lea siempre los parámetros actualizados
export const dynamic = "force-dynamic";

interface AdminLeadsPageProps {
  searchParams: Promise<{
    search?:   string;
    status?:   string;
    service?:  string;
    page?:     string;
  }>;
}

export default async function AdminLeadsPage({ searchParams }: AdminLeadsPageProps) {
  const params = await searchParams;
  
  console.log(
    `[ADMIN LEADS PAGE] E2E_MOCK_ENABLED=${process.env.E2E_MOCK_ENABLED} PLAYWRIGHT_TEST_ENV=${process.env.PLAYWRIGHT_TEST_ENV} NODE_ENV=${process.env.NODE_ENV}`
  );

  // Construct current URL with query parameters
  const queryString = new URLSearchParams(params as Record<string, string>).toString();
  const currentPath = `/admin/leads${queryString ? `?${queryString}` : ""}`;

  // Enforce page-level authorization
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect(buildSignInRedirectUrl(currentPath));
    }
    if (!user.isActive) {
      throw new InactiveUserError(user.clerkId);
    }
    if (!hasPermission({ role: user.role, organizationId: user.organizationId }, Permission.ADMIN_ACCESS)) {
      throw new PermissionDeniedError(Permission.ADMIN_ACCESS);
    }
  } catch (error) {
    if (error instanceof Error && (error.message === "NEXT_REDIRECT" || (error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))) {
      throw error;
    }
    const isInactive = error instanceof InactiveUserError || (error instanceof Error && error.name === "InactiveUserError");
    const isDenied = error instanceof PermissionDeniedError || (error instanceof Error && error.name === "PermissionDeniedError");
    
    if (isInactive) {
      redirect(`/sign-in?error=inactive&redirect_url=${encodeURIComponent(currentPath)}`);
    } else if (isDenied) {
      redirect(`/sign-in?error=denied&redirect_url=${encodeURIComponent(currentPath)}`);
    } else {
      redirect(buildSignInRedirectUrl(currentPath));
    }
  }

  const page = Number(params.page) || 1;
  const pageSize = 20;

  // Mapear filtros de búsqueda
  const filters = {
    search: params.search || undefined,
    status: params.status ? (params.status as LeadStatus) : undefined,
    service: params.service || undefined,
    pagination: {
      page,
      pageSize,
    },
    sort: {
      field: "created_at" as const,
      direction: "desc" as const,
    },
  };

  // Cargar leads en el servidor directamente desde el servicio (bypass RLS)
  const leadsData = await ContactAdminService.getLeads(filters);

  const isMockEnabled =
    process.env.E2E_MOCK_ENABLED === "true" &&
    (process.env.NODE_ENV !== "production" || process.env.PLAYWRIGHT_TEST_ENV === "true");

  return (
    <div className="min-h-screen bg-dark text-slate-100 flex flex-col">
      <AdminNavbar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Encabezado */}
          <div className="flex flex-col gap-1.5 border-b border-white/5 pb-5">
            <div className="flex items-center justify-between w-full flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-xs font-semibold text-secondary uppercase tracking-widest">
                  Gestión de Leads
                </span>
              </div>
              {isMockEnabled && (
                <a
                  href="/api/mock/logout"
                  id="btn-mock-logout"
                  className="text-xs bg-red-500/15 hover:bg-red-500/30 text-red-200 border border-red-500/30 px-3 py-1.5 rounded-lg transition-all"
                >
                  Cerrar Sesión (Mock)
                </a>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              CRM & Leads
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Administra y realiza seguimiento de las solicitudes del sitio web
            </p>
          </div>

          {/* Dashboard interactivo */}
          <LeadsDashboard initialData={leadsData} page={page} />
        </div>
      </div>
    </div>
  );
}
