import { useEffect, useId, useState, type CSSProperties } from 'react';
import type { PhoneColor } from '../lib/types';
import PhoneArt from './PhoneArt';

const FALLBACK_COLOR = '#c5ccd6';

interface Props {
  phoneName: string;
  imageUrl: string | null;
  colors: PhoneColor[];
}

/** Foto grande + selector de color. Al elegir un color, toda la página se tiñe de él. */
export default function ColorStage({ phoneName, imageUrl, colors }: Props) {
  const [index, setIndex] = useState(0);
  const labelId = useId();
  const color = colors[index];
  const hex = color?.hex ?? FALLBACK_COLOR;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', hex);
    return () => root.style.removeProperty('--accent');
  }, [hex]);

  return (
    <div className="color-stage" style={{ '--tint': hex } as CSSProperties}>
      <div className="stage stage--large">
        <PhoneArt
          color={hex}
          imageUrl={color?.imageUrl ?? imageUrl}
          alt={color ? `${phoneName} en color ${color.name}` : phoneName}
        />
      </div>

      {colors.length > 0 && (
        <div className="color-picker">
          <p id={labelId} aria-live="polite">
            Color: <strong>{color.name}</strong>
          </p>
          <div className="swatches swatches--large" role="group" aria-labelledby={labelId}>
            {colors.map((c, i) => (
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
        </div>
      )}
    </div>
  );
}
