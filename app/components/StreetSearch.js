'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trackActivity } from '../../lib/activity';

// Two-step Street Score search: suburb (or postcode) autosuggest against the
// existing /api/suburbs/search, then the suburb's streets filtered locally.
// Pass `suburb` to skip step one (used on the per-suburb street list page).
export default function StreetSearch({ suburb: fixedSuburb = null, dark = false }) {
  const router = useRouter();
  const [suburb, setSuburb] = useState(fixedSuburb);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [streets, setStreets] = useState(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState('idle');
  const debounceRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    const onClickAway = (event) => { if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', onClickAway);
    return () => document.removeEventListener('mousedown', onClickAway);
  }, []);

  useEffect(() => {
    if (!suburb) return undefined;
    let cancelled = false;
    fetch(`/api/suburbs/${suburb.id}/streets`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('failed'))))
      .then((payload) => { if (!cancelled) { setStreets(payload.streets || []); setStatus('idle'); } })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [suburb]);

  const streetMatches = (value) => {
    const q = value.trim().toLowerCase();
    if (!streets || q.length < 1) return [];
    const starts = streets.filter((s) => s.name.toLowerCase().startsWith(q));
    const contains = streets.filter((s) => !s.name.toLowerCase().startsWith(q) && s.name.toLowerCase().includes(q));
    return [...starts, ...contains].slice(0, 10);
  };

  const onChange = (value) => {
    setQuery(value);
    setActive(-1);
    if (suburb) {
      const found = streetMatches(value);
      setResults(found);
      setOpen(Boolean(value.trim()));
      return;
    }
    clearTimeout(debounceRef.current);
    if (value.trim().length < 2) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      const response = await fetch(`/api/suburbs/search?q=${encodeURIComponent(value.trim())}`).catch(() => null);
      const payload = await response?.json().catch(() => null);
      setResults(payload?.results || []);
      setOpen(true);
    }, 200);
  };

  const select = (item) => {
    setOpen(false);
    if (!suburb) {
      trackActivity('street_search_suburb', { pageKey: 'street-search', suburbId: item.id, query });
      setSuburb(item);
      setStatus('loading');
      setQuery('');
      setResults([]);
      return;
    }
    trackActivity('street_search_select', { pageKey: 'street-search', suburbId: suburb.id, streetKey: `${suburb.id}~${item.slug}`, query });
    router.push(`/streets/${suburb.slug}/${item.slug}`);
  };

  const onKeyDown = (event) => {
    if (!open || !results.length) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (event.key === 'Enter' && active >= 0) { event.preventDefault(); select(results[active]); }
    else if (event.key === 'Escape') setOpen(false);
  };

  return (
    <div className={`suburb-widget suburb-widget-index street-search${dark ? ' suburb-widget-dark' : ''}`} ref={boxRef}>
      {suburb && !fixedSuburb && (
        <p className="street-search-suburb">
          {suburb.name} {suburb.state} <button type="button" onClick={() => { setSuburb(null); setStreets(null); setQuery(''); }}>Change suburb</button>
        </p>
      )}
      <div className="suburb-widget-search" role="combobox" aria-expanded={open} aria-haspopup="listbox" aria-controls="street-search-results">
        <input
          type="text"
          value={query}
          placeholder={suburb ? (status === 'loading' ? 'Loading streets…' : `Start typing a street in ${suburb.name}`) : 'Start with the suburb or postcode'}
          aria-label={suburb ? 'Search for a street' : 'Search for a suburb'}
          autoComplete="off"
          disabled={suburb && status === 'loading'}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => { if (results.length) setOpen(true); }}
        />
        {open && (
          <ul className="suburb-widget-results" id="street-search-results" role="listbox">
            {results.map((item, index) => (
              <li key={item.slug} role="option" aria-selected={index === active}>
                <button type="button" className={index === active ? 'active' : ''} onMouseEnter={() => setActive(index)} onClick={() => select(item)}>
                  {item.name} <span>{suburb ? `${item.addresses} addresses` : `${item.state} ${item.postcode}`}</span>
                </button>
              </li>
            ))}
            {!results.length && <li className="suburb-widget-miss"><p>{suburb ? `No street by that name in ${suburb.name}.` : 'No suburb found — try the postcode.'}</p></li>}
          </ul>
        )}
      </div>
      {status === 'error' && <p className="suburb-form-error">Couldn&apos;t load streets for {suburb?.name}. Please try again shortly.</p>}
      <p className="suburb-widget-fine">Every street, scored — free, no sign-up to see the score.</p>
    </div>
  );
}
