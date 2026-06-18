import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "@/config/env";

export interface Database {
  public: {
    Tables: {
      contacts: {
        Row: {
          id:          string;
          name:        string;
          email:       string;
          phone:       string | null;
          company:     string;
          service:     string;
          message:     string;
          status:      string;
          origin:      string;
          metadata:    unknown;
          created_at:  string;
          updated_at:  string;
        };
        Insert: {
          id:          string;
          name:        string;
          email:       string;
          phone?:      string | null;
          company?:    string | null;
          service?:    string | null;
          message:     string;
          status?:     string;
          origin?:     string;
          metadata?:   unknown;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?:         string;
          name?:       string;
          email?:      string;
          phone?:      string | null;
          company?:    string | null;
          service?:    string | null;
          message?:    string;
          status?:     string;
          origin?:     string;
          metadata?:   unknown;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      update_contact_v1: {
        Args: {
          contact_id:   string;
          new_status:   string | null;
          new_metadata: unknown;
        };
        Returns: Database["public"]["Tables"]["contacts"]["Row"];
      };
    };
  };
}

let clientInstance: SupabaseClient<Database> | null = null;

function getClient(): SupabaseClient<Database> {
  if (!clientInstance) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for administrative operations");
    }
    clientInstance = createClient<Database>(config.supabase.url, serviceRoleKey);
  }
  return clientInstance;
}

/**
 * Cliente Supabase de servidor con permisos elevados (Service Role).
 * Hace bypass de las políticas RLS. Reservado para uso administrativo seguro en backend.
 * Nunca importar en componentes cliente.
 * 
 * Se inicializa perezosamente para evitar fallos durante la compilación estática (next build)
 * si la variable de entorno no está configurada.
 */
export const supabaseAdmin: SupabaseClient<Database> = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  }
});
