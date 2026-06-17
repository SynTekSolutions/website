import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/features/contact/validations/contact.schema";
import { ContactService } from "@/features/contact/services/contact.service";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
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
      logger.info("Bot submission detected and blocked by honeypot");
      return NextResponse.json({ success: true });
    }

    // Capture metadata from headers
    const ip = (request as unknown as { ip?: string }).ip || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || undefined;
    const userAgent = request.headers.get("user-agent") || undefined;
    const referrer = request.headers.get("referer") || undefined;

    const result = await ContactService.saveLead(parsed.data, { ip, userAgent, referrer });
    return NextResponse.json(result);

  } catch (error) {
    logger.error("[contact/route] Unexpected error", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
