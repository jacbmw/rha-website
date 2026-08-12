'use client';

import { useEffect, useRef, useState } from 'react';

const stats = [
  ['$634M+', 'invested on behalf of clients'],
  ['1,352', 'properties acquired across Australia'],
  ['19.0%', 'median portfolio growth p.a.*'],
  ['5 yr', 'rolling measurement window'],
];

const milestones = [
  { year: '2011', label: 'Ripehouse founded', pos: '0%' },
  { year: '2015', label: 'Research system established', pos: '26%' },
  { year: '2022', label: '5-year rolling window begins', pos: '73%', gold: true },
  { year: '2026', label: 'Current measurement', pos: '100%', gold: true, now: true },
];

export default function NumbersSection() {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={`numbers${inView ? ' numbers-inview' : ''}`} id="intel" ref={sectionRef}>
      <div className="section-shell">
        <div className="numbers-heading">
          <p className="eyebrow light"><span /> The numbers behind the work</p>
          <p className="numbers-note">Live, anonymised client portfolio data<br />measured across a 5-year rolling window.</p>
        </div>
        <div className="numbers-lifetime"><span>All-time Ripehouse footprint</span><strong>$2B+</strong><span>in property purchases across Australia</span></div>
        <div className="numbers-timeline" aria-label="Measurement timeline from 2011 to 2026. Client outcomes below are measured over the highlighted 2022 to 2026 rolling window.">
          <div className="timeline-window-tag"><b>2022–2026</b><span>measured window</span></div>
          <div className="timeline-track">
            <span className="timeline-focus" />
            {milestones.map((m) => (
              <span
                key={m.year}
                className={`timeline-dot${m.gold ? ' timeline-dot-gold' : ''}${m.now ? ' timeline-dot-now' : ''}`}
                style={{ left: m.pos }}
              />
            ))}
          </div>
          <div className="timeline-labels">
            {milestones.map((m) => (
              <span key={m.year} className={m.gold ? (m.now ? 'timeline-now' : 'timeline-window') : undefined}>
                <b>{m.year}</b><small>{m.label}</small>
              </span>
            ))}
          </div>
        </div>
        <div className="window-connector" aria-hidden="true">
          <span className="wc-step" />
          <span className="wc-across" />
          <span className="wc-label">Outcomes measured within this window</span>
          <span className="wc-left" />
          <span className="wc-right" />
        </div>
        <div className="stats-frame">
          <div className="stats-grid">
            {stats.map(([value, label], i) => (
              <div className="stat" key={label} style={{ '--stat-delay': `${0.15 * i}s` }}>
                <strong>{value}</strong><span>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="numbers-footer">
          <p className="fine-print">* Figures reflect aggregate, anonymised client portfolio data measured over the five years ending June 2026. Market benchmark: combined capital-city dwelling values. Data updated periodically.</p>
          <a className="button button-light numbers-cta" href="/about/approach">See how we measure performance <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>
  );
}
