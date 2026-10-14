-- =====================================================================
-- Datos de EJEMPLO (precios y specs aproximados, cámbialos por los tuyos)
-- Ejecuta DESPUÉS de schema.sql. Es seguro correrlo más de una vez.
-- image_path queda en null: la web muestra un placeholder hasta que subas
-- fotos al bucket "phone-images" y pongas aquí la ruta (ej. 'galaxy-a56/negro.webp').
-- =====================================================================

insert into public.brands (name, slug) values
  ('Samsung',  'samsung'),
  ('Apple',    'apple'),
  ('Xiaomi',   'xiaomi'),
  ('Motorola', 'motorola')
on conflict (slug) do nothing;

insert into public.phones
  (brand_id, name, slug, description, price, storage_gb, ram_gb, screen_inches, battery_mah, main_camera_mp, os)
select
  b.id, v.name, v.slug, v.description, v.price, v.storage_gb, v.ram_gb,
  v.screen_inches, v.battery_mah, v.main_camera_mp, v.os
from (values
  ('samsung',  'Galaxy A56',  'galaxy-a56',
   'Gama media con pantalla AMOLED fluida, buena batería y cámara versátil para el día a día.',
   9999.00, 256, 8, 6.7, 5000, 50, 'Android'),
  ('apple',    'iPhone 16',   'iphone-16',
   'Rendimiento fluido, cámara muy consistente y años de actualizaciones de iOS.',
   18999.00, 128, 8, 6.1, 3561, 48, 'iOS'),
  ('xiaomi',   'Redmi Note 14', 'redmi-note-14',
   'Mucho celular por poco dinero: pantalla grande, carga rápida y cámara de 108 MP.',
   5499.00, 256, 8, 6.67, 5110, 108, 'Android'),
  ('motorola', 'Moto G85',    'moto-g85',
   'Pantalla curva pOLED, Android limpio y batería para todo el día.',
   6299.00, 256, 8, 6.7, 5000, 50, 'Android')
) as v(brand_slug, name, slug, description, price, storage_gb, ram_gb, screen_inches, battery_mah, main_camera_mp, os)
join public.brands b on b.slug = v.brand_slug
on conflict (slug) do nothing;

insert into public.phone_colors (phone_id, name, hex, sort_order)
select p.id, v.color_name, v.hex, v.sort_order
from (values
  ('galaxy-a56',    'Grafito',   '#2b2d31', 1),
  ('galaxy-a56',    'Lila',      '#b9a6d8', 2),
  ('galaxy-a56',    'Menta',     '#a8d5c2', 3),
  ('iphone-16',     'Negro',     '#1d1d1f', 1),
  ('iphone-16',     'Blanco',    '#f2f2f0', 2),
  ('iphone-16',     'Rosa',      '#f2b8c6', 3),
  ('iphone-16',     'Azul ultramar', '#7d9cf5', 4),
  ('redmi-note-14', 'Negro medianoche', '#18181b', 1),
  ('redmi-note-14', 'Azul océano',      '#3b6ea8', 2),
  ('redmi-note-14', 'Verde',            '#5d8f6a', 3),
  ('moto-g85',      'Azul cobalto', '#27408b', 1),
  ('moto-g85',      'Verde oliva',  '#6b705c', 2)
) as v(phone_slug, color_name, hex, sort_order)
join public.phones p on p.slug = v.phone_slug
on conflict (phone_id, name) do nothing;
