'use client';

import { useEffect, useMemo, useState } from 'react';

function fmtYear(value) { return new Date(value).getFullYear(); }
function fmtPct(value) { return `${value >= 0 ? '+' : ''}${Number(value).toFixed(1)}%`; }

export default function ApproachChart() {
  const [data, setData] = useState({ status: 'loading', points: [] });

  useEffect(() => {
    fetch('/api/approach/cagr').then((response) => response.json()).then(setData).catch(() => setData({ status: 'unavailable', points: [] }));
  }, []);

  const chart = useMemo(() => {
    const points = (data.points || []).filter((point) => point.x && Number.isFinite(Number(point.y)));
    if (!points.length) return null;
    const times = points.map((point) => new Date(point.x).getTime());
    const values = points.map((point) => Number(point.y));
    const minX = Math.min(...times); const maxX = Math.max(...times);
    const minY = Math.min(-5, Math.floor(Math.min(...values) / 5) * 5); const maxY = Math.max(25, Math.ceil(Math.max(...values) / 5) * 5);
    const x = (value) => 70 + ((new Date(value).getTime() - minX) / Math.max(1, maxX - minX)) * 790;
    const y = (value) => 365 - ((value - minY) / Math.max(1, maxY - minY)) * 310;
    return { points, minX, maxX, minY, maxY, x, y, years: [...new Set(points.map((point) => fmtYear(point.x)))].sort() };
  }, [data]);

  if (data.status === 'loading') return <div className="approach-chart-loading">Loading live portfolio data…</div>;
  if (!chart) return <div className="approach-chart-loading">Live portfolio data is being refreshed. Check back shortly.</div>;

  const yTicks = [];
  for (let value = chart.minY; value <= chart.maxY; value += 5) yTicks.push(value);
  const line = chart.points.map((point) => `${chart.x(point.x)},${chart.y(point.y)}`).join(' ');

  return <div className="approach-chart-wrap">
    <div className="approach-chart-meta"><span><i className="chart-dot" /> Each dot is one anonymised client portfolio</span><span>{data.updatedAt ? `Updated ${new Date(data.updatedAt).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}` : 'Live data'}</span></div>
    <svg className="approach-chart" viewBox="0 0 900 430" role="img" aria-label="Client portfolio compound annual growth rate by first property purchase date">
      {yTicks.map((tick) => <g key={tick}><line x1="70" x2="860" y1={chart.y(tick)} y2={chart.y(tick)} stroke={tick === 0 ? '#141a32' : '#dfe2e8'} strokeDasharray={tick === 0 ? '0' : '3 5'} /><text x="58" y={chart.y(tick) + 4} textAnchor="end">{tick}%</text></g>)}
      <line x1="70" x2="860" y1="365" y2="365" stroke="#141a32" /><text x="465" y="415" textAnchor="middle">First property purchase</text><text transform="translate(15 230) rotate(-90)" textAnchor="middle">Portfolio CAGR since purchase</text>
      {chart.years.map((year) => { const point = chart.points.find((item) => fmtYear(item.x) === year); return <text key={year} x={chart.x(point.x)} y="388" textAnchor="middle">{year}</text>; })}
      <polyline fill="none" stroke="#c79810" strokeWidth="3" points={line} opacity=".9" />
      {chart.points.map((point, index) => <circle key={`${point.x}-${index}`} cx={chart.x(point.x)} cy={chart.y(point.y)} r="5" fill="#141a32" stroke="#fff" strokeWidth="2"><title>{fmtPct(point.y)} CAGR · {fmtYear(point.x)} purchase</title></circle>)}
    </svg>
    <div className="approach-chart-foot"><strong>{data.clientCount || chart.points.length} portfolios measured</strong><span>Measured, anonymised and updated from the Ripehouse client portfolio data set.</span></div>
  </div>;
}
