import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/admin";
import { contactSchema } from "@/features/contact/validations/contact.schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar con el schema Zod existente
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Datos inválidos.", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, phone, company, serviceOfInterest, message } = parsed.data;

    const { error } = await supabase.from("contacts").insert({
      name,
      email,
      phone: phone || null,
      company,
      service: serviceOfInterest,
      message,
      source: "landing",
    });

    if (error) {
      console.error("[contact/route] Supabase insert error:", error.message);
      return NextResponse.json(
        { success: false, message: "Error al guardar el contacto. Intenta nuevamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact/route] Unexpected error:", err);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
