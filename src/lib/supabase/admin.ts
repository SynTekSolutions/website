import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para uso exclusivo en el servidor (API Routes, Server Actions).
 * Usa la anon key — no requiere cookies ni sesiones.
 * No importar desde componentes client-side ('use client').
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
