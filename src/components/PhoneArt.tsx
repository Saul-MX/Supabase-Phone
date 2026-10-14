import { useId } from 'react';

interface Props {
  color: string;
  imageUrl: string | null;
  alt: string;
}

/**
 * Muestra la foto del celular si existe. Si no, dibuja una silueta
 * del celular en el color elegido, para que el catálogo se vea bien
 * aunque todavía no hayas subido fotos.
 */
export default function PhoneArt({ color, imageUrl, alt }: Props) {
  const glowId = `${useId().replace(/:/g, '')}-glow`;

  if (imageUrl) {
    return <img className="phone-art" src={imageUrl} alt={alt} loading="lazy" decoding="async" />;
  }

  return (
    <svg className="phone-art" viewBox="0 0 200 420" role="img" aria-label={alt}>
      <defs>
        <radialGradient id={glowId} cx="30%" cy="12%" r="85%">
          <stop offset="0" stopColor={color} stopOpacity="0.6" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="408" rx="58" ry="7" fill="#0e1a2b" opacity="0.12" />
      <rect x="171" y="120" width="4" height="46" rx="2" fill={color} stroke="rgba(14,26,43,.25)" />
      <rect x="30" y="8" width="140" height="392" rx="32" fill={color} stroke="rgba(14,26,43,.25)" strokeWidth="2" />
      <rect x="40" y="19" width="120" height="370" rx="23" fill="#0e1a2b" />
      <rect x="40" y="19" width="120" height="370" rx="23" fill={`url(#${glowId})`} />
      <circle cx="100" cy="40" r="5" fill="#04070d" />
    </svg>
  );
}
