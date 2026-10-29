import { createClient } from "@supabase/supabase-js";
// Adaptador preparado. No se utiliza en el modo demo; rellenar .env no activa sincronización.
export function createConfiguredClient(url: string, anonKey: string) {
  if (!url || !anonKey) throw new Error("Falta configurar Supabase.");
  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
