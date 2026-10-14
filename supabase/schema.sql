-- =====================================================================
-- Catálogo de celulares · Esquema de Supabase
-- Pégalo completo en: Supabase Dashboard → SQL Editor → New query → Run
-- =====================================================================

-- ---------- Tablas ----------

create table public.brands (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

create table public.phones (
  id              uuid primary key default gen_random_uuid(),
  brand_id        uuid not null references public.brands(id) on delete restrict,
  name            text not null,
  slug            text not null unique,          -- se usa en la URL: /celulares/<slug>
  description     text,
  price           numeric(10,2) not null check (price >= 0),
  currency        text not null default 'MXN',
  storage_gb      integer,
  ram_gb          integer,
  screen_inches   numeric(3,1),
  battery_mah     integer,
  main_camera_mp  integer,
  os              text,
  image_path      text,                          -- ruta dentro del bucket "phone-images"
  is_active       boolean not null default true, -- false = oculto del catálogo
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.phone_colors (
  id          uuid primary key default gen_random_uuid(),
  phone_id    uuid not null references public.phones(id) on delete cascade,
  name        text not null,
  hex         text not null check (hex ~ '^#[0-9A-Fa-f]{6}$'),
  image_path  text,                              -- foto del celular en este color (opcional)
  sort_order  integer not null default 0,
  unique (phone_id, name)
);

create index phones_brand_id_idx on public.phones (brand_id);
create index phones_price_idx on public.phones (price);
create index phone_colors_phone_id_idx on public.phone_colors (phone_id);

-- ---------- updated_at automático ----------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger phones_set_updated_at
before update on public.phones
for each row execute function public.set_updated_at();

-- ---------- Row Level Security ----------
-- Con RLS activado y SIN políticas de insert/update/delete, la llave "anon"
-- (la que usa tu web) solo puede LEER. Para editar datos usa el dashboard
-- de Supabase o la service_role key desde un script/servidor (nunca en el navegador).

alter table public.brands       enable row level security;
alter table public.phones       enable row level security;
alter table public.phone_colors enable row level security;

create policy "brands: lectura pública"
  on public.brands for select
  to anon, authenticated
  using (true);

create policy "phones: lectura pública de activos"
  on public.phones for select
  to anon, authenticated
  using (is_active);

create policy "phone_colors: lectura pública de celulares activos"
  on public.phone_colors for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.phones p
      where p.id = phone_colors.phone_id and p.is_active
    )
  );

-- ---------- Storage (fotos) ----------
-- Bucket público: las fotos se sirven por URL directa. Subir archivos
-- se hace desde el dashboard (Storage → phone-images → Upload).

insert into storage.buckets (id, name, public)
values ('phone-images', 'phone-images', true)
on conflict (id) do nothing;

create policy "phone-images: lectura pública"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'phone-images');
