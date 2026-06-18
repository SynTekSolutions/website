import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/features/contact/validations/contact.schema";
import { ContactLeadService } from "@/features/contact/services/contact-lead.service";
import { createAuditedAction } from "@/audit/create-audited-action";
import { AuditAction, AuditOperation, ResourceType } from "@/audit/types";
import { RequestContext } from "@/lib/request-context";

export const POST = createAuditedAction<[NextRequest], NextResponse>({
  action: AuditAction.CONTACT_CREATE,
  operation: AuditOperation.CREATE,
  resourceType: ResourceType.CONTACT,
  getResourceId: async (args, response) => {
    try {
      if (response) {
        const clone = response.clone();
        const body = await clone.json();
        return body?.leadId;
      }
    } catch {
      // Safe fallback
    }
    return undefined;
  },
  handler: async (context, request: NextRequest) => {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // honeypot check: silently accept bot submissions
    if (parsed.data._honey) {
      return NextResponse.json({ success: true });
    }

    const ip = RequestContext.getIp();
    const userAgent = RequestContext.getUserAgent();
    const referrer = request.headers.get("referer") || undefined;

    const result = await ContactLeadService.saveLead(parsed.data, { ip, userAgent, referrer });
    return NextResponse.json(result);
  },
});
