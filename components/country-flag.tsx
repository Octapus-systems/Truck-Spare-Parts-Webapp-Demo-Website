// Inline SVG flags for the market selector. Emoji flags don't render on Windows.
type FlagMarket = "UAE" | "Qatar" | "Saudi" | "USD";

const W = 30;
const H = 20;

// Qatar: nine-point serrated edge between the white hoist and maroon fly.
const qatarEdge = Array.from({ length: 9 }, (_, i) => {
  const step = H / 9;
  return `12.5,${(i + 0.5) * step} 9,${(i + 1) * step}`;
}).join(" ");

const flags: Record<FlagMarket, { label: string; art: React.ReactNode }> = {
  UAE: {
    label: "United Arab Emirates",
    art: (
      <>
        <rect width={W} height={H / 3} fill="#00732F" />
        <rect y={H / 3} width={W} height={H / 3} fill="#fff" />
        <rect y={(2 * H) / 3} width={W} height={H / 3} fill="#000" />
        <rect width={8} height={H} fill="#FF0000" />
      </>
    ),
  },
  Qatar: {
    label: "Qatar",
    art: (
      <>
        <rect width={W} height={H} fill="#fff" />
        <polygon points={`${W},0 9,0 ${qatarEdge} ${W},${H}`} fill="#8A1538" />
      </>
    ),
  },
  Saudi: {
    label: "Saudi Arabia",
    art: (
      <>
        <rect width={W} height={H} fill="#006C35" />
        {/* Simplified shahada and sword, legible at icon size. */}
        <path d="M8 7.5c1.5-1.2 2.5 1 4 0s2.5 1 4 0 2.5 1 4 0 1.5.6 2 .3" stroke="#fff" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        <path d="M9 13h12.5M20 12v2" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" />
      </>
    ),
  },
  USD: {
    label: "United States",
    art: (
      <>
        <rect width={W} height={H} fill="#fff" />
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} y={(i * 2 * H) / 13} width={W} height={H / 13} fill="#B22234" />
        ))}
        <rect width={12} height={(7 * H) / 13} fill="#3C3B6E" />
      </>
    ),
  },
};

export function CountryFlag({ market, className }: { market: FlagMarket; className?: string }) {
  const flag = flags[market];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={22} height={15} role="img" aria-label={flag.label} className={className}>
      <title>{flag.label}</title>
      {flag.art}
    </svg>
  );
}
