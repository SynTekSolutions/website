import { NextRequest, NextResponse } from "next/server";
import { ContactAdminService } from "@/features/contact/services/contact-admin.service";
import { createAuditedAction } from "@/audit/create-audited-action";
import { AuditAction, AuditOperation, ResourceType } from "@/audit/types";
import { Permission } from "@/auth/permissions";

/**
 * GET /api/admin/leads/[id]
 * Recupera los detalles completos de un lead de forma diferida (lazy load).
 */
export const GET = createAuditedAction<
  [NextRequest, { params: Promise<{ id: string }> }],
  NextResponse
>({
  action: AuditAction.ADMIN_ACCESS,
  operation: AuditOperation.READ,
  resourceType: ResourceType.CONTACT,
  permissions: [Permission.CUSTOMER_READ],
  getResourceId: async (args) => {
    const { id } = await args[1].params;
    return id;
  },
  handler: async (context, request, { params }) => {
    const { id } = await params;
    const lead = await ContactAdminService.getLeadById(id);

    if (!lead) {
      return NextResponse.json(
        { success: false, message: "Lead no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: lead });
  },
});

/**
 * PATCH /api/admin/leads/[id]
 * Realiza una actualización parcial del lead (ej. status, metadata/notes).
 */
export const PATCH = createAuditedAction<
  [NextRequest, { params: Promise<{ id: string }> }],
  NextResponse,
  { status: string } | undefined,
  { status: string } | undefined
>({
  action: AuditAction.CONTACT_UPDATE,
  operation: AuditOperation.UPDATE,
  resourceType: ResourceType.CONTACT,
  permissions: [Permission.CUSTOMER_WRITE],
  getResourceId: async (args) => {
    const { id } = await args[1].params;
    return id;
  },
  captureBeforeState: async (args) => {
    const { id } = await args[1].params;
    const lead = await ContactAdminService.getLeadById(id);
    return lead ? { status: lead.status } : undefined;
  },
  captureAfterState: async (args) => {
    const { id } = await args[1].params;
    const lead = await ContactAdminService.getLeadById(id);
    return lead ? { status: lead.status } : undefined;
  },
  getMetadata: (context) => {
    const before = context.beforeState;
    const after = context.afterState;
    if (before && after) {
      return {
        previousStatus: before.status,
        newStatus: after.status,
        changed: before.status !== after.status,
      };
    }
    return undefined;
  },
  handler: async (context, request, { params }) => {
    const { id } = await params;
    const body = await request.json();

    // Actualizar lead
    const updatedLead = await ContactAdminService.updateLead(id, {
      status: body.status,
      metadata: body.metadata,
    });

    return NextResponse.json({ success: true, data: updatedLead });
  },
});
