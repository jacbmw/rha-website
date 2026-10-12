// Static (no animation) mini Street Score visual for the Market Intel
// takeover panels: the same 4-segment stepped dial as the street page hero
// (stepped 0/25/50/75/100 scale), plus street-vs-suburb bars beneath.

const SEGMENTS = 4;
const R = 52;
const CIRC = 2 * Math.PI * R;
const GAP = 7;
const SEG = CIRC / SEGMENTS;

function Bar({ label, value, y, accent, muted, track }) {
  return (
    <g>
      <text x="6" y={y + 5} fontSize="7" fill={muted}>{label}</text>
      <rect x="46" y={y} width="68" height="6" fill={track} />
      <rect x="46" y={y} width={Math.max(0, Math.min(68, (value ?? 0) * 0.68))} height="6" fill={accent ? '#c79810' : muted} />
      <text x="46" y={y + 15} fontSize="7" fill={muted}>{value ?? '—'}</text>
    </g>
  );
}

export default function StreetScoreArt({ score = 75, suburbAverage = 50, dark = false }) {
  const track = dark ? 'rgba(244,241,234,.18)' : 'rgba(20,26,50,.12)';
  const ink = dark ? '#f4f1ea' : '#141a32';
  const muted = dark ? 'rgba(244,241,234,.65)' : '#687087';
  return (
    <svg className="street-score-art" viewBox="0 0 120 158" aria-hidden="true">
      {Array.from({ length: SEGMENTS }, (_, i) => {
        const fraction = Math.max(0, Math.min(1, (score - 25 * i) / 25));
        const offset = -(i * SEG) + GAP / 2;
        return (
          <g key={i} transform="rotate(-90 60 60)">
            <circle cx="60" cy="60" r={R} fill="none" stroke={track} strokeWidth="7" strokeDasharray={`${SEG - GAP} ${CIRC}`} strokeDashoffset={offset} />
            <circle cx="60" cy="60" r={R} fill="none" stroke="#c79810" strokeWidth="7" strokeLinecap="butt" strokeDasharray={`${Math.max(0, (SEG - GAP) * fraction)} ${CIRC}`} strokeDashoffset={offset} />
          </g>
        );
      })}
      <text x="60" y="58" textAnchor="middle" fontFamily="Georgia, serif" fontSize="30" fill={ink} style={{ fontVariantNumeric: 'tabular-nums' }}>{score}</text>
      <text x="60" y="78" textAnchor="middle" fontSize="10" fill={muted}>/ 100</text>
      <Bar label="Street" value={score} y={124} accent muted={muted} track={track} />
      <Bar label="Suburb avg" value={suburbAverage} y={142} muted={muted} track={track} />
    </svg>
  );
}
