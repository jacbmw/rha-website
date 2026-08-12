'use client';

import { useEffect, useMemo, useState } from 'react';

// Live client-portfolio CAGR scatter for the navy numbers section.
// Same data source as the approach page chart (/api/approach/cagr),
// restyled for the dark field. Every dot is a real, anonymised portfolio.

function fmtYear(value) { return new Date(value).getFullYear(); }
function fmtPct(value) { return `${value >= 0 ? '+' : ''}${Number(value).toFixed(1)}%`; }

const WINDOW_START = new Date('2022-01-01').getTime();

export default function NumbersCagrChart() {
  const [data, setData] = useState({ status: 'loading', points: [] });
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    fetch('/api/approach/cagr').then((response) => response.json()).then(setData).catch(() => setData({ status: 'unavailable', points: [] }));
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 800px)');
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const width = narrow ? 460 : 900;
  const right = width - 20;

  const chart = useMemo(() => {
    const points = (data.points || []).filter((point) => point.x && Number.isFinite(Number(point.y)));
    if (!points.length) return null;
    const times = points.map((point) => new Date(point.x).getTime());
    const values = points.map((point) => Number(point.y));
    const minX = Math.min(...times); const maxX = Math.max(...times);
    const minY = Math.min(-5, Math.floor(Math.min(...values) / 5) * 5); const maxY = Math.max(25, Math.ceil(Math.max(...values) / 5) * 5);
    const x = (value) => 58 + ((new Date(value).getTime() - minX) / Math.max(1, maxX - minX)) * (right - 58);
    const y = (value) => 302 - ((value - minY) / Math.max(1, maxY - minY)) * 272;
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const years = [...new Set(points.map((point) => fmtYear(point.x)))].sort();
    const tickStep = maxY - minY > 45 ? 10 : 5;
    return { points, minX, maxX, minY, maxY, x, y, median, years, tickStep };
  }, [data, right]);

  if (data.status === 'loading') return <div className="numbers-chart-loading">Loading live portfolio data…</div>;
  if (!chart) return <div className="numbers-chart-loading">Live portfolio data is being refreshed. Check back shortly.</div>;

  const yTicks = [];
  for (let value = chart.minY; value <= chart.maxY; value += chart.tickStep) yTicks.push(value);
  const windowX = Math.max(58, Math.min(right, chart.x(WINDOW_START)));

  return (
    <div className="numbers-chart">
      <div className="numbers-chart-meta">
        <span><i className="numbers-chart-dot" /> Each dot is one anonymised client portfolio — CAGR since first purchase</span>
        <span>{data.updatedAt ? `Updated ${new Date(data.updatedAt).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}` : 'Live data'}</span>
      </div>
      <svg viewBox={`0 0 ${width} 360`} role="img" aria-label="Live scatter of client portfolio compound annual growth rates by first property purchase date. Each dot is one anonymised client portfolio.">
        {/* Measured-window band */}
        <rect x={windowX} y="30" width={right - windowX} height="272" fill="rgba(199,152,16,.06)" />
        <line x1={windowX} x2={windowX} y1="30" y2="302" stroke="rgba(199,152,16,.45)" strokeDasharray="2 5" />
        <text className="nc-window-label" x={windowX + 10} y="44">2022–2026 measured window</text>

        {yTicks.map((tick) => (
          <g key={tick}>
            <line x1="58" x2={right} y1={chart.y(tick)} y2={chart.y(tick)} stroke={tick === 0 ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.10)'} strokeDasharray={tick === 0 ? '0' : '3 6'} />
            <text x="46" y={chart.y(tick) + 4} textAnchor="end">{tick}%</text>
          </g>
        ))}

        {chart.years.map((year) => {
          const point = chart.points.find((item) => fmtYear(item.x) === year);
          return <text key={year} x={chart.x(point.x)} y="330" textAnchor="middle">{year}</text>;
        })}

        {chart.points.map((point, index) => (
          <circle key={`${point.x}-${index}`} cx={chart.x(point.x)} cy={chart.y(point.y)} r="3" fill="#c79810" opacity=".5">
            <title>{fmtPct(point.y)} CAGR · {fmtYear(point.x)} purchase</title>
          </circle>
        ))}

        {/* Median annotation */}
        <line x1="58" x2={right} y1={chart.y(chart.median)} y2={chart.y(chart.median)} stroke="#c79810" strokeWidth="2" strokeDasharray="7 6" />
        <text className="nc-median-label" x={right - 6} y={chart.y(chart.median) - 9} textAnchor="end">{fmtPct(chart.median)} median</text>
      </svg>
      <div className="numbers-chart-foot">
        <strong>{data.clientCount || chart.points.length} portfolios measured</strong>
        <span>Live, anonymised and updated from the Ripehouse client portfolio data set.</span>
      </div>
    </div>
  );
}
