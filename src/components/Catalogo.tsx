import { useMemo, useState } from 'react';
import type { Phone } from '../lib/types';
import { formatPrice } from '../lib/format';
import PhoneCard from './PhoneCard';

type Sort = 'price-asc' | 'price-desc' | 'name';

// "Galaxy" y "galaxy" y "Gälaxy" cuentan igual al buscar.
const normalize = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const STEP = 500;

export default function Catalogo({ phones }: { phones: Phone[] }) {
  const prices = phones.map((p) => p.price);
  const ceiling = phones.length ? Math.ceil(Math.max(...prices) / STEP) * STEP : 0;
  const floor = phones.length ? Math.floor(Math.min(...prices) / STEP) * STEP : 0;
  const currency = phones[0]?.currency ?? 'MXN';

  const [query, setQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [maxPrice, setMaxPrice] = useState(ceiling);
  const [sort, setSort] = useState<Sort>('price-asc');

  const brands = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    for (const p of phones) {
      const entry = map.get(p.brand.slug) ?? { name: p.brand.name, count: 0 };
      entry.count += 1;
      map.set(p.brand.slug, entry);
    }
    return [...map.entries()]
      .map(([slug, v]) => ({ slug, ...v }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [phones]);

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    const list = phones.filter(
      (p) =>
        (selectedBrands.size === 0 || selectedBrands.has(p.brand.slug)) &&
        p.price <= maxPrice &&
        (q === '' || normalize(`${p.brand.name} ${p.name}`).includes(q)),
    );
    return list.sort((a, b) => {
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'name') return a.name.localeCompare(b.name, 'es');
      return a.price - b.price;
    });
  }, [phones, query, selectedBrands, maxPrice, sort]);

  const hasFilters = query !== '' || selectedBrands.size > 0 || maxPrice < ceiling;

  const clearFilters = () => {
    setQuery('');
    setSelectedBrands(new Set());
    setMaxPrice(ceiling);
  };

  const toggleBrand = (slug: string) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  if (phones.length === 0) {
    return (
      <div className="empty">
        <h2>Todavía no hay celulares publicados</h2>
        <p>Agrega filas en la tabla phones de Supabase y vuelve a generar el sitio.</p>
      </div>
    );
  }

  return (
    <div className="catalog">
      <form className="filters" onSubmit={(e) => e.preventDefault()} role="search">
        <div className="field">
          <label htmlFor="buscar">Buscar</label>
          <input
            id="buscar"
            className="input"
            type="search"
            placeholder="Marca o modelo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <fieldset className="field">
          <legend>Marca</legend>
          <div className="chips">
            {brands.map((b) => (
              <label key={b.slug} className="chip">
                <input
                  type="checkbox"
                  checked={selectedBrands.has(b.slug)}
                  onChange={() => toggleBrand(b.slug)}
                />
                <span>
                  {b.name} <small>{b.count}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor="precio">
            Precio máximo: <strong>{formatPrice(maxPrice, currency)}</strong>
          </label>
          <input
            id="precio"
            className="range"
            type="range"
            min={floor}
            max={ceiling}
            step={STEP}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
        </div>

        {hasFilters && (
          <button type="button" className="btn btn--quiet" onClick={clearFilters}>
            Quitar filtros
          </button>
        )}
      </form>

      <section aria-label="Resultados">
        <div className="results">
          <p aria-live="polite">
            {visible.length} {visible.length === 1 ? 'celular' : 'celulares'}
          </p>
          <div className="sort">
            <label htmlFor="orden">Ordenar por</label>
            <select
              id="orden"
              className="input"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
            >
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
              <option value="name">Nombre (A a Z)</option>
            </select>
          </div>
        </div>

        {visible.length > 0 ? (
          <ul className="grid">
            {visible.map((phone) => (
              <li key={phone.id}>
                <PhoneCard phone={phone} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty">
            <h2>Ningún celular coincide con tus filtros</h2>
            <p>Prueba con otra marca o sube el precio máximo.</p>
            <button type="button" className="btn" onClick={clearFilters}>
              Quitar filtros
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
