'use client';

import { useEffect, useRef, useState } from 'react';

// Hero visuals for the street page. Both render their FINAL values on the
// server (no-JS, crawlers and reduced-motion users see the real numbers), then
// on the client pull back to zero for one frame and animate in once they
// scroll into view — the "moment" of the page.

const SEGMENTS = 4; // the rhi street score is a stepped 0/25/50/75/100 scale
const R = 52;
const CIRC = 2 * Math.PI * R;
const GAP = 7;
const SEG = CIRC / SEGMENTS;

function useRevealOnce(ref) {
  const [phase, setPhase] = useState('static'); // static (SSR) → pre → in
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window) || !ref.current) return undefined;
    const frame = requestAnimationFrame(() => setPhase('pre'));
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        requestAnimationFrame(() => setPhase('in'));
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(ref.current);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [ref]);
  return phase;
}

// Stepped dial: four arc segments, each filled in proportion to how far the
// score sits inside that 25-point step. Honest about the scale's granularity
// while still showing address-weighted averages like 13 or 63.
export function StreetDial({ score, size = 150 }) {
  const ref = useRef(null);
  const phase = useRevealOnce(ref);
  const value = phase === 'pre' ? 0 : (score ?? 0);
  return (
    <div className="suburb-dial street-dial" aria-hidden="true" ref={ref}>
      <svg viewBox="0 0 120 120" width={size} height={size}>
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const fraction = Math.max(0, Math.min(1, (value - 25 * i) / 25));
          const offset = -(i * SEG) + GAP / 2;
          return (
            <g key={i} transform="rotate(-90 60 60)">
              <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(20,26,50,.12)" strokeWidth="7" strokeDasharray={`${SEG - GAP} ${CIRC}`} strokeDashoffset={offset} />
              {score !== null && (
                <circle
                  cx="60" cy="60" r={R} fill="none" stroke="#c79810" strokeWidth="7" strokeLinecap="butt"
                  strokeDasharray={`${Math.max(0, (SEG - GAP) * fraction)} ${CIRC}`} strokeDashoffset={offset}
                  style={{ transition: phase === 'in' ? `stroke-dasharray .7s cubic-bezier(.2,.7,.2,1) ${i * 90}ms` : 'none' }}
                />
              )}
            </g>
          );
        })}
        <text x="60" y="58" textAnchor="middle" fontFamily="Georgia, serif" fontSize="30" fill="#141a32" style={{ fontVariantNumeric: 'tabular-nums' }}>{score ?? '—'}</text>
        <text x="60" y="78" textAnchor="middle" fontSize="10" fill="#687087">/ 100</text>
      </svg>
    </div>
  );
}

export function CompareBars({ rows }) {
  const ref = useRef(null);
  const phase = useRevealOnce(ref);
  return (
    <div className="street-compare-bars" ref={ref}>
      {rows.map((row, index) => (
        <div className="street-compare-row" key={row.label}>
          <div className="street-compare-head"><span>{row.label}</span><strong>{row.value ?? '—'}</strong></div>
          <div className="street-compare-track">
            <span
              className={row.accent ? 'accent' : ''}
              style={{ width: `${phase === 'pre' ? 0 : (row.value ?? 0)}%`, transition: phase === 'in' ? `width .8s cubic-bezier(.2,.7,.2,1) ${index * 120}ms` : 'none' }}
            />
          </div>
          {row.note && <p>{row.note}</p>}
        </div>
      ))}
    </div>
  );
}
