import { createClient } from "@supabase/supabase-js";
import { config } from "@/config/env";

/**
 * Cliente Supabase para uso exclusivo en el servidor (API Routes, Server Actions).
 * Usa la Anon Key — no requiere cookies ni sesiones.
 *
 * NOTA: No confundir con un cliente admin. La Anon Key respeta las políticas RLS.
 * Reservar admin.ts para cuando se use SUPABASE_SERVICE_ROLE_KEY (bypass de RLS).
 *
 * No importar desde componentes client-side ('use client').
 */
export const supabase = createClient(config.supabase.url, config.supabase.anonKey);
