'use client';

import { useMemo } from 'react';

const fmtMoney = (value) => value == null ? '—' : `$${Math.round(value).toLocaleString('en-AU')}`;
const fmtPct = (value) => value == null ? '—' : `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
const fmtDate = (value) => value ? new Intl.DateTimeFormat('en-AU', { month: 'short', year: 'numeric' }).format(new Date(value)) : '—';

const STATE_POINTS = { NSW: [-32, 147], VIC: [-37, 144], QLD: [-22, 144], SA: [-30, 135], WA: [-25, 122], TAS: [-42, 146.5], NT: [-19, 133], ACT: [-35.3, 149.1] };
const project = (lat, lng) => ({ x: 30 + (lng - 112) * (300 / 42), y: 25 + (-10 - lat) * (230 / 34) });
const AUSTRALIA_OUTLINE = 'M247.9 29.7L271.4 71.7L278.6 87.9L295.7 100.1L307.1 115.6L322.1 128.5L323.6 143.4L326.4 148.1L327.1 162.3L322.1 179.9L310.7 186.6L302.9 196.2L300.7 208.4L282.1 217.1L265.7 215.1L247.9 216.5L236.4 214.4L226.4 201.6L214.3 195.5L205 198.9L188.6 179.9L167.9 170.4L150.7 173.1L115.7 186L77.1 194.1L56.4 184.6L48.6 152.2L40 137.3L48.6 104.8L65.7 97.4L92.1 81.2L112.1 71.7L136.4 58.1L152.1 58.1L164.3 41.2L172.9 33.8L197.9 37.9L207.9 41.9L208.6 69.6L228.6 75L241.4 58.1Z';
const TASMANIA_OUTLINE = 'M280 233.2L289.3 233.9L290 245.6L282.1 251.7L273.6 251L263.6 236Z';
function AustraliaMap({ properties }) {
  const valid = properties.filter((property) => property.lat != null && property.lng != null || STATE_POINTS[property.state]);
  const point = (property) => { const [lat, lng] = property.lat != null && property.lng != null ? [property.lat, property.lng] : (STATE_POINTS[property.state] || [-31, 135]); return project(lat, lng); };
  return <div className="case-map-wrap"><svg className="case-map" viewBox="0 0 360 280" role="img" aria-label="Approximate locations of purchased properties across Australia">
    <path className="australia-outline" d={AUSTRALIA_OUTLINE} />
    <path className="australia-outline" d={TASMANIA_OUTLINE} />
    {valid.map((property, index) => { const p = point(property); return <g className="case-map-pin" key={`${property.id}-${index}`} transform={`translate(${p.x} ${p.y})`}><path className="case-map-pin-shape" d="M0 1C-7.5 1 -11.5 -7 -11.5 -13C-11.5 -21 -6.4 -27 0 -27C6.4 -27 11.5 -21 11.5 -13C11.5 -7 7.5 1 0 1Z" /><circle className="case-map-pin-hole" cx="0" cy="-13" r="4.5" /><title>{`${property.suburb}, ${property.state}`}</title></g>; })}
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
    {study.videoId && <section className="case-story-video-wrap section-shell"><p className="case-eyebrow">In their own words</p><div className="case-story-video"><iframe src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(study.videoId)}?rel=0&modestbranding=1`} title={`${study.title} video testimonial`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" /></div></section>}
    <section className="case-properties"><div className="case-section-heading"><p className="case-eyebrow">The portfolio</p><h2>From purchase price<br /><i>to present value.</i></h2><p>Each property is shown as part of the whole — because the portfolio is the strategy.</p></div><div className="case-property-grid">{sorted.map((property, index) => <article className="case-property-card" key={property.id || index}>{property.image ? <img src={property.image} alt={`${property.suburb} property`} /> : <div className="case-property-placeholder"><span>R</span></div>}<div className="case-property-body"><p>{property.suburb}, {property.state}</p><h3>{fmtMoney(property.purchasePrice)} <span>→</span> {fmtMoney(property.currentValue)}</h3><div className="case-property-growth"><strong>{fmtPct(property.growthPct)}</strong><span>{fmtMoney(property.growth)} growth</span></div><small>Purchased {fmtDate(property.purchaseDate)}</small></div></article>)}</div></section>
    <section className="case-value-section"><div className="case-section-heading"><p className="case-eyebrow">Value over time</p><h2>Measure the<br /><i>compounding.</i></h2><p>Capital invested versus current portfolio value from the first purchase onward.</p></div><ValueChart properties={properties} /><div className="case-cagr-stat"><span>Portfolio CAGR since first purchase</span><strong>{fmtPct(study.portfolioCagr)}</strong><small>Calculated from purchase prices and current valuations in the live portfolio data.</small></div></section>
  </>;
}
