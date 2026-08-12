'use client';

// Lightweight SVG charts rendered client-side from the scorecard JSON —
// no charting library (well under the 30KB budget; it's ~0KB).

const W = 560;
const H = 170;
const PAD = { top: 14, right: 12, bottom: 26, left: 46 };

function buildScale(points) {
  const values = points.map((p) => p.value).filter((v) => v !== null && v !== undefined);
  if (!values.length) return null;
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) { min -= 1; max += 1; }
  const span = max - min;
  min -= span * 0.08;
  max += span * 0.08;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i) => PAD.left + (points.length < 2 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v) => PAD.top + innerH - ((v - min) / (max - min)) * innerH;
  return { x, y, min, max };
}

function monthShort(month) {
  const [y, m] = String(month).split('-');
  return new Intl.DateTimeFormat('en-AU', { month: 'short', year: '2-digit' }).format(new Date(Number(y), Number(m) - 1, 1));
}

export default function LineChart({ title, subtitle, data, valueKey, format = (v) => v, color = '#c79810', domain }) {
  const points = (data || []).map((row) => ({ month: row.month, value: row[valueKey] }));
  const scale = buildScale(domain ? points.concat(domain.map((v) => ({ value: v }))) : points);
  if (!scale) {
    return (
      <figure className="suburb-chart">
        <figcaption><b>{title}</b>{subtitle && <span>{subtitle}</span>}</figcaption>
        <p className="suburb-chart-empty">Not enough data to chart this reliably — a thin market, shown honestly.</p>
      </figure>
    );
  }
  const drawn = points.map((p, i) => (p.value === null || p.value === undefined ? null : `${scale.x(i).toFixed(1)},${scale.y(p.value).toFixed(1)}`));
  const path = drawn.filter(Boolean).join(' ');
  const last = [...points].reverse().find((p) => p.value !== null && p.value !== undefined);
  const lastIndex = last ? points.lastIndexOf(last) : -1;

  return (
    <figure className="suburb-chart">
      <figcaption><b>{title}</b>{subtitle && <span>{subtitle}</span>}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title} chart`}>
        {[scale.min, (scale.min + scale.max) / 2, scale.max].map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={scale.y(v)} y2={scale.y(v)} stroke="rgba(20,26,50,.08)" />
            <text x={PAD.left - 6} y={scale.y(v) + 3} textAnchor="end" fontSize="9" fill="#687087">{format(v)}</text>
          </g>
        ))}
        <polyline points={path} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        {lastIndex >= 0 && (
          <g>
            <circle cx={scale.x(lastIndex)} cy={scale.y(last.value)} r="3.6" fill={color} />
            <text x={Math.min(scale.x(lastIndex), W - PAD.right - 4)} y={scale.y(last.value) - 8} textAnchor="end" fontSize="10" fontWeight="700" fill="#141a32">{format(last.value)}</text>
          </g>
        )}
        {points.length > 1 && (
          <g>
            <text x={PAD.left} y={H - 8} fontSize="9" fill="#687087">{monthShort(points[0].month)}</text>
            <text x={W - PAD.right} y={H - 8} textAnchor="end" fontSize="9" fill="#687087">{monthShort(points[points.length - 1].month)}</text>
          </g>
        )}
      </svg>
    </figure>
  );
}
