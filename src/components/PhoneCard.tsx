import { useState, type CSSProperties } from 'react';
import type { Phone } from '../lib/types';
import { formatPrice } from '../lib/format';
import PhoneArt from './PhoneArt';

const FALLBACK_COLOR = '#c5ccd6';

export default function PhoneCard({ phone }: { phone: Phone }) {
  const [index, setIndex] = useState(0);
  const color = phone.colors[index];
  const hex = color?.hex ?? FALLBACK_COLOR;
  const image = color?.imageUrl ?? phone.imageUrl;

  const specs = [
    phone.storageGb ? `${phone.storageGb} GB de almacenamiento` : null,
    phone.ramGb ? `${phone.ramGb} GB de RAM` : null,
  ]
    .filter((s): s is string => s !== null)
    .join(', ');

  return (
    <article className="card" style={{ '--tint': hex } as CSSProperties}>
      <div className="stage">
        <PhoneArt
          color={hex}
          imageUrl={image}
          alt={color ? `${phone.name} en color ${color.name}` : phone.name}
        />
      </div>

      {phone.colors.length > 0 && (
        <div className="swatches" role="group" aria-label={`Colores de ${phone.name}`}>
          {phone.colors.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className="swatch"
              style={{ '--swatch': c.hex } as CSSProperties}
              aria-label={c.name}
              aria-pressed={i === index}
              title={c.name}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}

      <div>
        <p className="card__brand">{phone.brand.name}</p>
        <h3 className="card__title">
          <a href={`/celulares/${phone.slug}`}>{phone.name}</a>
        </h3>
        {specs && <p className="card__specs">{specs}</p>}
      </div>

      <p className="price">{formatPrice(phone.price, phone.currency)}</p>
    </article>
  );
}
