'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getVisitorId, getAttribution } from '../../lib/visitor';
import { irIdentify } from '../../lib/ir';
import { storePanelReferral } from '../../lib/abTracking';
import usePanelTracking from './panels/usePanelTracking';
import { rich } from './page-sections/rich';
import defaultVariant from '../../content/panels/panel-suburb-score.json';

const PANEL_KEY = 'panel-suburb-score';

// "Your Suburb, Scored" entry widget — injected mid-article on blog posts and
// on the homepage after the proof section. Autosuggest accepts suburb names
// AND postcodes; a no-results state captures the lead anyway.
//
// Copy is now managed by the panel variant system (rha_page_variants,
// panel-suburb-score) and served from the dashboard; the bundled JSON below
// is the permanent fallback.
export default function SuburbScoreWidget({ variant, placement = 'panel' }) {
  const router = useRouter();
  const { id, props: variantProps, preview } = variant || {};
  const props = { ...defaultVariant.props, ...variantProps };
  const { trackClick, trackConversion } = usePanelTracking(PANEL_KEY, id, preview);

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
    trackConversion('suburb_selected');
    storePanelReferral(PANEL_KEY, id);
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
      trackConversion('suburb_miss');
      setMissStatus('done');
    } catch {
      setMissStatus('idle');
    }
  };

  const showArt = props.showSampleScorecard && (placement === 'home' || placement === 'article');
  const isDark = props.theme === 'dark';

  return (
    <aside className={`suburb-widget suburb-widget-${placement}${isDark ? ' suburb-widget-dark' : ''}`} ref={boxRef}>
      <div className="suburb-widget-main">
      {props.showMobileChart && (
        <svg className="suburb-widget-minichart" viewBox="0 0 96 64" aria-hidden="true" role="presentation">
          <circle cx="26" cy="32" r="20" fill="none" stroke={isDark ? 'rgba(244,241,234,.18)' : 'rgba(20,26,50,.14)'} strokeWidth="5" />
          <circle cx="26" cy="32" r="20" fill="none" stroke="#c79810" strokeWidth="5" strokeLinecap="round" strokeDasharray="103 125.7" transform="rotate(-90 26 32)" />
          <text x="26" y="36" textAnchor="middle" fontFamily="Georgia, serif" fontSize="14" fill={isDark ? '#f4f1ea' : '#141a32'}>82</text>
          <rect x="58" y="14" width="34" height="3.5" fill={isDark ? 'rgba(244,241,234,.18)' : 'rgba(20,26,50,.14)'} />
          <rect x="58" y="14" width="28" height="3.5" fill="#c79810" />
          <rect x="58" y="30" width="34" height="3.5" fill={isDark ? 'rgba(244,241,234,.18)' : 'rgba(20,26,50,.14)'} />
          <rect x="58" y="30" width="12" height="3.5" fill={isDark ? '#f4f1ea' : '#141a32'} />
          <rect x="58" y="46" width="34" height="3.5" fill={isDark ? 'rgba(244,241,234,.18)' : 'rgba(20,26,50,.14)'} />
          <rect x="58" y="46" width="22" height="3.5" fill={isDark ? '#f4f1ea' : '#141a32'} />
        </svg>
      )}
      <p className="suburb-widget-label">{props.eyebrow}</p>
      <h3 className="suburb-widget-heading">{rich(props.heading)}</h3>
      <p className="suburb-widget-copy">{props.copy}</p>
      <div className="suburb-widget-search" role="combobox" aria-expanded={open} aria-haspopup="listbox" aria-controls="suburb-widget-results">
        <input
          type="text"
          value={query}
          placeholder={props.placeholder}
          aria-label="Search for a suburb"
          autoComplete="off"
          onChange={(event) => { setQuery(event.target.value); runSearch(event.target.value); }}
          onKeyDown={onKeyDown}
          onFocus={() => { trackClick(); if (results.length || noResults) setOpen(true); }}
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
                  <p>{props.notifyDone}</p>
                ) : (
                  <>
                    <p>{props.noResultsHeading}</p>
                    <form className="signup-form" onSubmit={onMissSubmit}>
                      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="suburb-honeypot" />
                      <input type="email" name="email" required placeholder={props.emailPlaceholder} />
                      <button type="submit" disabled={missStatus === 'sending'}>{missStatus === 'sending' ? props.notifySending : props.notifyButton}</button>
                    </form>
                  </>
                )}
              </li>
            )}
          </ul>
        )}
      </div>
      <p className="suburb-widget-fine">{props.finePrint}</p>
      <noscript><p className="suburb-widget-fine"><Link href="/suburbs">{props.browseFallback}</Link></p></noscript>
      </div>
      {showArt && (
        <div className="suburb-widget-art" aria-hidden="true">
          <svg viewBox="0 0 340 240" role="presentation">
            <rect x="0" y="0" width="340" height="240" rx="2" fill="#141a32" />
            <rect x="0" y="0" width="3" height="240" fill="#c79810" />
            <text x="26" y="38" fontSize="9" fontWeight="700" letterSpacing="2.2" fill="#c79810">SAMPLE SCORECARD</text>
            <circle cx="84" cy="128" r="52" fill="none" stroke="rgba(244,241,234,.16)" strokeWidth="7" />
            <circle cx="84" cy="128" r="52" fill="none" stroke="#c79810" strokeWidth="7" strokeLinecap="round" strokeDasharray="267.9 326.7" transform="rotate(-90 84 128)" />
            <text x="84" y="128" textAnchor="middle" fontFamily="Georgia, serif" fontSize="32" fill="#f4f1ea">82</text>
            <text x="84" y="148" textAnchor="middle" fontSize="10" fill="rgba(244,241,234,.55)">/ 100</text>
            <text x="172" y="82" fontSize="8.5" fontWeight="700" letterSpacing="1.6" fill="rgba(244,241,234,.6)">YIELD PRESSURE</text>
            <rect x="172" y="90" width="142" height="4" fill="rgba(244,241,234,.16)" />
            <rect x="172" y="90" width="118" height="4" fill="#c79810" />
            <text x="172" y="120" fontSize="8.5" fontWeight="700" letterSpacing="1.6" fill="rgba(244,241,234,.6)">VACANCY</text>
            <rect x="172" y="128" width="142" height="4" fill="rgba(244,241,234,.16)" />
            <rect x="172" y="128" width="46" height="4" fill="#f4f1ea" />
            <text x="172" y="158" fontSize="8.5" fontWeight="700" letterSpacing="1.6" fill="rgba(244,241,234,.6)">SUPPLY</text>
            <rect x="172" y="166" width="142" height="4" fill="rgba(244,241,234,.16)" />
            <rect x="172" y="166" width="88" height="4" fill="#f4f1ea" />
            <text x="26" y="216" fontSize="9" fill="rgba(244,241,234,.45)">27 indicators · 15,000 suburbs · updated monthly</text>
          </svg>
        </div>
      )}
    </aside>
  );
}
