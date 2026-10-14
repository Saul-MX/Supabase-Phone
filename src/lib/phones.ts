import { supabase, publicImageUrl } from './supabase';
import type { Phone } from './types';

// Forma exacta de lo que devuelve la consulta de abajo (nombres de columnas de la BD).
interface PhoneRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number | string;
  currency: string;
  storage_gb: number | null;
  ram_gb: number | null;
  screen_inches: number | string | null;
  battery_mah: number | null;
  main_camera_mp: number | null;
  os: string | null;
  image_path: string | null;
  brand: { name: string; slug: string } | null;
  colors: {
    id: string;
    name: string;
    hex: string;
    image_path: string | null;
    sort_order: number;
  }[];
}

const toNumberOrNull = (value: number | string | null): number | null =>
  value === null ? null : Number(value);

function toPhone(row: PhoneRow): Phone {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand ?? { name: 'Sin marca', slug: 'sin-marca' },
    description: row.description,
    price: Number(row.price),
    currency: row.currency,
    storageGb: row.storage_gb,
    ramGb: row.ram_gb,
    screenInches: toNumberOrNull(row.screen_inches),
    batteryMah: row.battery_mah,
    mainCameraMp: row.main_camera_mp,
    os: row.os,
    imageUrl: publicImageUrl(row.image_path),
    colors: [...(row.colors ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((c) => ({
        id: c.id,
        name: c.name,
        hex: c.hex,
        imageUrl: publicImageUrl(c.image_path),
      })),
  };
}

/** Todos los celulares activos con su marca y colores, del más barato al más caro. */
export async function getPhones(): Promise<Phone[]> {
  const { data, error } = await supabase
    .from('phones')
    .select(
      `id, slug, name, description, price, currency, storage_gb, ram_gb,
       screen_inches, battery_mah, main_camera_mp, os, image_path,
       brand:brands(name, slug),
       colors:phone_colors(id, name, hex, image_path, sort_order)`,
    )
    .eq('is_active', true)
    .order('price', { ascending: true });

  if (error) {
    throw new Error(`No se pudieron leer los celulares de Supabase: ${error.message}`);
  }

  return (data as unknown as PhoneRow[]).map(toPhone);
}
