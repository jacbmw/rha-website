'use client';

import { useEffect, useRef, useState } from 'react';

const icons = {
  strategy: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="20" cy="20" r="15" />
      <circle cx="20" cy="20" r="8.5" />
      <circle cx="20" cy="20" r="2" fill="currentColor" stroke="none" />
      <path d="M20 5v4M20 31v4M5 20h4M31 20h4" />
    </svg>
  ),
  research: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="17" cy="17" r="11" />
      <path d="M25 25l9 9" strokeLinecap="round" />
      <path d="M11.5 20v-3.5M17 20v-7M22.5 20v-4.5" strokeLinecap="round" />
    </svg>
  ),
  partnership: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="14" cy="13" r="5" />
      <circle cx="27" cy="16" r="4" />
      <path d="M5 33c0-5.5 4-9.5 9-9.5s9 4 9 9.5" />
      <path d="M26 26.5c4 .5 7 3.5 7 6.5" strokeLinecap="round" />
    </svg>
  ),
};

const principles = [
  {
    number: '01',
    icon: 'strategy',
    title: 'Strategy before property',
    text: 'The right property is only useful when it serves a bigger plan. We start with your goals, borrowing capacity and time horizon.',
  },
  {
    number: '02',
    icon: 'research',
    title: 'Research without the noise',
    text: 'Our team follows the fundamentals that matter: supply, demand, infrastructure, liveability and long-term growth drivers.',
  },
  {
    number: '03',
    icon: 'partnership',
    title: 'Advice that stays with you',
    text: 'From your first acquisition to the next stage of your portfolio, we bring the people, perspective and accountability to keep you moving.',
  },
];

export default function Principles() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`principles${inView ? ' principles-inview' : ''}`} ref={ref}>
      {principles.map((item, index) => (
        <article className="principle" key={item.number} style={{ '--principle-delay': `${0.18 * index}s` }}>
          <div className="principle-top">
            <span className="principle-number">{item.number}</span>
            <span className="principle-icon">{icons[item.icon]}</span>
          </div>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
          <a href="/discovery-call" aria-label={`Learn more about ${item.title}`}><span aria-hidden="true">↗</span></a>
        </article>
      ))}
    </div>
  );
}
