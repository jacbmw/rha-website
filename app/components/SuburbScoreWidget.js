'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getVisitorId, getAttribution } from '../../lib/visitor';
import { irIdentify } from '../../lib/ir';
import { storePanelReferral } from '../../lib/abTracking';

// "Your Suburb, Scored" entry widget — injected mid-article on blog posts and
// on the homepage after the proof section. Autosuggest accepts suburb names
// AND postcodes; a no-results state captures the lead anyway.
export default function SuburbScoreWidget({ variant = 'panel' }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [noResults, setNoResults] = useState(false);
  const [missStatus, setMissStatus] = useState('idle');
  const boxRef = useRef(null);
  const debounceRef = useRef(null);
  const lastQueryRef = useRef('');

  useEffect(() => {
    const onClickAway = (event) => { if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', onClickAway);
    return () => document.removeEventListener('mousedown', onClickAway);
  }, []);

  const runSearch = (value) => {
    clearTimeout(debounceRef.current);
    if (value.trim().length < 2) { setResults([]); setOpen(false); setNoResults(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/suburbs/search?q=${encodeURIComponent(value.trim())}`);
        const payload = await response.json().catch(() => null);
        const found = payload?.results || [];
        lastQueryRef.current = value.trim();
        setResults(found);
        setNoResults(!found.length);
        setOpen(true);
        setActive(-1);
        window.gtag?.('event', 'suburb_search', { event_category: 'suburb_widget', event_label: value.trim().toLowerCase() });
      } catch {
        setResults([]);
        setOpen(false);
      }
    }, 200);
  };

  const select = (item) => {
    setOpen(false);
    storePanelReferral('panel-suburb-widget', variant);
    router.push(`/suburbs/${item.slug}`);
  };

  const onKeyDown = (event) => {
    if (!open || !results.length) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (event.key === 'Enter' && active >= 0) { event.preventDefault(); select(results[active]); }
    else if (event.key === 'Escape') setOpen(false);
  };

  const onMissSubmit = async (event) => {
    event.preventDefault();
    if (missStatus === 'sending') return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (data.company) return; // honeypot
    setMissStatus('sending');
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          source: 'suburb-miss',
          formSource: 'website_suburb-score-miss_2026',
          suburbQuery: lastQueryRef.current,
          visitorId: getVisitorId(),
          attribution: getAttribution(),
        }),
      });
      if (!response.ok) throw new Error('failed');
      irIdentify({ email: data.email, formSource: 'website_suburb-score-miss_2026' });
      setMissStatus('done');
    } catch {
      setMissStatus('idle');
    }
  };

  return (
    <aside className={`suburb-widget suburb-widget-${variant}`} ref={boxRef}>
      <p className="suburb-widget-label">Your suburb, scored</p>
      <h3 className="suburb-widget-heading">What does the data say about <i>your</i> suburb?</h3>
      <p className="suburb-widget-copy">We score every suburb in Australia across 27 indicators — updated monthly. See yours.</p>
      <div className="suburb-widget-search" role="combobox" aria-expanded={open} aria-haspopup="listbox" aria-controls="suburb-widget-results">
        <input
          type="text"
          value={query}
          placeholder="Start typing a suburb or postcode…"
          aria-label="Search for a suburb"
          autoComplete="off"
          onChange={(event) => { setQuery(event.target.value); runSearch(event.target.value); }}
          onKeyDown={onKeyDown}
          onFocus={() => { if (results.length || noResults) setOpen(true); }}
        />
        {open && (
          <ul className="suburb-widget-results" id="suburb-widget-results" role="listbox">
            {results.map((item, index) => (
              <li key={`${item.id}-${item.slug}`} role="option" aria-selected={index === active}>
                <button type="button" className={index === active ? 'active' : ''} onMouseEnter={() => setActive(index)} onClick={() => select(item)}>
                  {item.name} <span>{item.state} {item.postcode}</span>
                </button>
              </li>
            ))}
            {noResults && (
              <li className="suburb-widget-miss">
                {missStatus === 'done' ? (
                  <p>Done — we&apos;ll send that scorecard as soon as it&apos;s ready.</p>
                ) : (
                  <>
                    <p>We may not have enough data for that suburb yet — leave your email and we&apos;ll send its scorecard when it&apos;s ready.</p>
                    <form className="signup-form" onSubmit={onMissSubmit}>
                      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="suburb-honeypot" />
                      <input type="email" name="email" required placeholder="Your email address" />
                      <button type="submit" disabled={missStatus === 'sending'}>{missStatus === 'sending' ? '…' : 'Notify me'}</button>
                    </form>
                  </>
                )}
              </li>
            )}
          </ul>
        )}
      </div>
      <p className="suburb-widget-fine">Free · no signup to see the snapshot</p>
      <noscript><p className="suburb-widget-fine"><Link href="/suburbs">Browse every suburb we score →</Link></p></noscript>
    </aside>
  );
}
