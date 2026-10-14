import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Faltan PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY. Copia .env.example a .env y llena los valores de tu proyecto de Supabase.',
  );
}

// Cliente con la llave pública (anon). Gracias a RLS solo puede leer lo que las
// políticas de schema.sql permiten. Nunca pongas aquí la service_role key.
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

const BUCKET = 'phone-images';

/** Convierte una ruta del bucket (ej. "galaxy-a56/lila.webp") en una URL pública. */
export function publicImageUrl(path: string | null): string | null {
  if (!path) return null;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
