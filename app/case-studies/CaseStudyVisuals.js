'use client';

import { useMemo } from 'react';

const fmtMoney = (value) => value == null ? '—' : `$${Math.round(value).toLocaleString('en-AU')}`;
const fmtPct = (value) => value == null ? '—' : `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
const fmtDate = (value) => value ? new Intl.DateTimeFormat('en-AU', { month: 'short', year: 'numeric' }).format(new Date(value)) : '—';

function AustraliaMap({ properties }) {
  const valid = properties.filter((property) => property.lat != null && property.lng != null);
  const point = (property) => ({ x: 50 + ((property.lng + 153) / 40) * 260, y: 35 + ((-property.lat - 10) / 34) * 205 });
  return <div className="case-map-wrap"><svg className="case-map" viewBox="0 0 360 280" role="img" aria-label="Approximate locations of purchased properties across Australia">
    <path className="australia-outline" d="M44 105l13-31 21-19 28-7 19-18 26 6 17-9 25 7 17-13 25 9 18 21 31 10 18 28 22 13 1 20-15 20-12 29-23 8-21 29-29 9-15 21-28-5-20 13-30-9-20 4-22-18-26-3-15-22-23-10-4-26-16-16 2-20zM275 231l10 3 6 11-10 11-13-5z" />
    {valid.map((property, index) => { const p = point(property); return <g key={`${property.id}-${index}`}><circle className="case-map-ring" cx={p.x} cy={p.y} r="10" /><circle className="case-map-dot" cx={p.x} cy={p.y} r="5"><title>{property.suburb}, {property.state}</title></circle></g>; })}
  </svg><div className="case-map-legend"><span><i /> Approximate LGA location</span><small>Locations shown at council-area level</small></div></div>;
}

function ValueChart({ properties }) {
  const points = properties.filter((property) => property.purchaseDate && property.purchasePrice != null && property.currentValue != null).sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));
  if (points.length < 1) return <div className="case-chart-empty">Valuation history will appear as property data is refreshed.</div>;
  const series = points.reduce((out, property, index) => { const prior = out[index - 1]; return [...out, { label: fmtDate(property.purchaseDate), value: (prior?.value || 0) + property.currentValue, invested: (prior?.invested || 0) + property.purchasePrice }]; }, []);
  const max = Math.max(...series.map((point) => Math.max(point.value, point.invested)), 1);
  const x = (index) => 55 + (index / Math.max(series.length - 1, 1)) * 580;
  const y = (value) => 260 - (value / max) * 215;
  const valueLine = series.map((point, index) => `${x(index)},${y(point.value)}`).join(' ');
  const investedLine = series.map((point, index) => `${x(index)},${y(point.invested)}`).join(' ');
  return <div className="case-chart-wrap"><div className="case-chart-legend"><span><i className="legend-value" /> Current portfolio value</span><span><i className="legend-invested" /> Capital invested</span></div><svg className="case-value-chart" viewBox="0 0 680 310" role="img" aria-label="Portfolio value compared with capital invested over time"><line x1="55" x2="635" y1="260" y2="260" stroke="#141a32" /><polyline points={investedLine} fill="none" stroke="#9aa0b0" strokeDasharray="5 5" strokeWidth="2" /><polyline points={valueLine} fill="none" stroke="#c79810" strokeWidth="4" />{series.map((point, index) => <g key={point.label}><circle cx={x(index)} cy={y(point.value)} fill="#c79810" r="5" /><text x={x(index)} y="284" textAnchor="middle">{point.label}</text></g>)}<text x="55" y={y(max) - 8}>{fmtMoney(max)}</text></svg></div>;
}

export default function CaseStudyVisuals({ study }) {
  const properties = study.properties || [];
  const sorted = useMemo(() => [...properties].sort((a, b) => new Date(a.purchaseDate || 0) - new Date(b.purchaseDate || 0)), [properties]);
  return <>
    <section className="case-study-data-grid"><div className="case-map-panel"><p className="case-eyebrow">Where the strategy landed</p><h2>Purchased across<br /><i>Australia.</i></h2><AustraliaMap properties={properties} /></div><div className="case-timeline-panel"><p className="case-eyebrow">The sequence</p><h2>Every purchase<br /><i>has a purpose.</i></h2><div className="case-timeline">{sorted.map((property, index) => <div className="case-timeline-item" key={property.id || index}><span className="case-timeline-dot" /><div><b>{fmtDate(property.purchaseDate)}</b><strong>{property.suburb}, {property.state}</strong><small>{property.purchasePrice != null ? `Purchased ${fmtMoney(property.purchasePrice)}` : 'Purchase value unavailable'}</small></div></div>)}</div></div></section>
    <section className="case-properties"><div className="case-section-heading"><p className="case-eyebrow">The portfolio</p><h2>From purchase price<br /><i>to present value.</i></h2><p>Each property is shown as part of the whole — because the portfolio is the strategy.</p></div><div className="case-property-grid">{sorted.map((property, index) => <article className="case-property-card" key={property.id || index}>{property.image ? <img src={property.image} alt={`${property.suburb} property`} /> : <div className="case-property-placeholder"><span>R</span></div>}<div className="case-property-body"><p>{property.suburb}, {property.state}</p><h3>{fmtMoney(property.purchasePrice)} <span>→</span> {fmtMoney(property.currentValue)}</h3><div className="case-property-growth"><strong>{fmtPct(property.growthPct)}</strong><span>{fmtMoney(property.growth)} growth</span></div><small>Purchased {fmtDate(property.purchaseDate)}</small></div></article>)}</div></section>
    <section className="case-value-section"><div className="case-section-heading"><p className="case-eyebrow">Value over time</p><h2>Measure the<br /><i>compounding.</i></h2><p>Capital invested versus current portfolio value from the first purchase onward.</p></div><ValueChart properties={properties} /><div className="case-cagr-stat"><span>Portfolio CAGR since first purchase</span><strong>{fmtPct(study.portfolioCagr)}</strong><small>Calculated from purchase prices and current valuations in the live portfolio data.</small></div></section>
  </>;
}
