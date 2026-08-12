'use client';

import { useEffect, useRef, useState } from 'react';
import NumbersCagrChart from './NumbersCagrChart';

const windowStat = ['5yr Rolling', 'measurement window'];
const stats = [
  ['$634M+', 'invested on behalf of clients'],
  ['1,352', 'properties acquired across Australia'],
  ['19.0%', 'median portfolio growth p.a.*'],
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
        <NumbersCagrChart />
        <div className="stats-frame">
          <div className="stats-grid stats-grid-windowed">
            <div className="stat stat-window" style={{ '--stat-delay': '0s' }}>
              <strong>{windowStat[0]}</strong><span>{windowStat[1]}</span>
            </div>
            <div className="stats-window-children">
              <p className="stats-children-caption">Measured within this window</p>
              <div className="stats-children-grid">
                {stats.map(([value, label], i) => (
                  <div className="stat" key={label} style={{ '--stat-delay': `${0.15 * (i + 1)}s` }}>
                    <strong>{value}</strong><span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
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
