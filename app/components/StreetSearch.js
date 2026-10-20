'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { trackActivity } from '../../lib/activity';

const SUFFIX_MAP = {
  st: 'street', rd: 'road', ave: 'avenue', av: 'avenue', dr: 'drive', drv: 'drive',
  ct: 'court', crt: 'court', pl: 'place', cres: 'crescent', cr: 'crescent', crs: 'crescent',
  tce: 'terrace', pde: 'parade', hwy: 'highway', ln: 'lane', cl: 'close',
  bvd: 'boulevard', blvd: 'boulevard', cct: 'circuit', gr: 'grove', grv: 'grove',
  esp: 'esplanade', sq: 'square', pkwy: 'parkway', wy: 'way', cir: 'circle',
  hts: 'heights', mws: 'mews', prom: 'promenade', trl: 'trail', wk: 'walk', gdns: 'gardens',
};

const STREET_SUFFIX_RE = /\b(street|st|road|rd|avenue|ave|av|drive|dr|drv|court|ct|crt|place|pl|crescent|cres|cr|crs|terrace|tce|parade|pde|highway|hwy|lane|ln|close|cl|boulevard|bvd|blvd|circuit|cct|grove|gr|grv|esplanade|esp|way|wy)\b/i;

// Strip leading unit/house numbers ("12/34 Smith St" -> "smith street") and
// expand common Australian street-type abbreviations so "Smith Rd" matches
// G-NAF's "Smith Road".
function normaliseStreetQuery(raw) {
  const stripped = String(raw || '')
    .split(',')[0]
    .trim()
    .toLowerCase()
    .replace(/^(unit|apt|apartment|shop|lot|villa|suite)\s+\S+\s+/i, '')
    .replace(/^[\da-z]*\d[\da-z]*\s*[/-]\s*/i, '')
    .replace(/^\d+[a-z]?(\s*-\s*\d+[a-z]?)?\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!stripped) return '';
  const words = stripped.split(' ');
  if (words.length >= 2) {
    const last = words[words.length - 1].replace(/\.$/, '');
    if (SUFFIX_MAP[last]) words[words.length - 1] = SUFFIX_MAP[last];
  }
  return words.join(' ');
}

// When a visitor types "12 Smith St, Frankston" or "Smith St Frankston" in
// step 1, split out the street part and the suburb candidate so we can still
// find the suburb and pre-fill the street in step 2.
function splitStreetAndSuburb(raw) {
  const text = String(raw || '').trim();
  if (text.includes(',')) {
    const [left, ...rest] = text.split(',');
    const right = rest.join(' ').trim();
    if (right.length >= 2) return { streetHint: normaliseStreetQuery(left), suburbQuery: right };
  }
  const match = STREET_SUFFIX_RE.exec(text);
  if (match) {
    const afterSuffix = text.slice(match.index + match[0].length).trim();
    const beforeAndSuffix = text.slice(0, match.index + match[0].length).trim();
    if (afterSuffix.length >= 2) {
      return { streetHint: normaliseStreetQuery(beforeAndSuffix), suburbQuery: afterSuffix };
    }
    return { streetHint: normaliseStreetQuery(beforeAndSuffix), suburbQuery: '' };
  }
  return { streetHint: '', suburbQuery: text };
}

// Two-step Street Score search: suburb (or postcode) autosuggest against the
// existing /api/suburbs/search, then the suburb's streets filtered locally.
// Pass `suburb` to skip step one (used on the per-suburb street list page).
export default function StreetSearch({ suburb: fixedSuburb = null, dark = false }) {
  const router = useRouter();
  const [suburb, setSuburb] = useState(fixedSuburb);
  const [query, setQuery] = useState('');
  const [pendingStreet, setPendingStreet] = useState('');
  const [results, setResults] = useState([]);
  const [streets, setStreets] = useState(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState('idle');
  const debounceRef = useRef(null);
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const onClickAway = (event) => { if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', onClickAway);
    return () => document.removeEventListener('mousedown', onClickAway);
  }, []);

  const topStreetsInSuburb = (list) => [...(list || [])].sort((a, b) => (b.addresses || 0) - (a.addresses || 0)).slice(0, 8);

  const streetMatches = (value, list = streets) => {
    const q = normaliseStreetQuery(value);
    if (!list) return [];
    if (q.length < 1) return topStreetsInSuburb(list);
    const starts = list.filter((s) => s.name.toLowerCase().startsWith(q));
    const contains = list.filter((s) => !s.name.toLowerCase().startsWith(q) && s.name.toLowerCase().includes(q));
    return [...starts, ...contains].slice(0, 10);
  };

  useEffect(() => {
    if (!suburb) return undefined;
    let cancelled = false;
    fetch(`/api/suburbs/${suburb.id}/streets`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('failed'))))
      .then((payload) => {
        if (cancelled) return;
        const list = payload.streets || [];
        setStreets(list);
        setStatus('idle');
        if (!fixedSuburb) {
          const initialQuery = pendingStreet || '';
          if (initialQuery) setQuery(initialQuery);
          const initialMatches = streetMatches(initialQuery, list);
          setResults(initialMatches);
          setOpen(initialMatches.length > 0);
          requestAnimationFrame(() => inputRef.current?.focus());
        }
      })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [suburb]); // eslint-disable-line react-hooks/exhaustive-deps

  const onChange = (value) => {
    setQuery(value);
    setActive(-1);
    if (suburb) {
      const found = streetMatches(value);
      setResults(found);
      setOpen(Boolean(value.trim()) || found.length > 0);
      return;
    }
    clearTimeout(debounceRef.current);
    const trimmed = value.trim();
    if (trimmed.length < 2) { setResults([]); setPendingStreet(''); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      const response = await fetch(`/api/suburbs/search?q=${encodeURIComponent(trimmed)}`).catch(() => null);
      const payload = await response?.json().catch(() => null);
      let found = payload?.results || [];
      const { streetHint, suburbQuery } = splitStreetAndSuburb(trimmed);
      setPendingStreet(streetHint || '');
      if (!found.length && suburbQuery && suburbQuery !== trimmed && suburbQuery.length >= 2) {
        const retry = await fetch(`/api/suburbs/search?q=${encodeURIComponent(suburbQuery)}`).catch(() => null);
        const retryPayload = await retry?.json().catch(() => null);
        found = retryPayload?.results || [];
      }
      setResults(found);
      setOpen(true);
    }, 180);
  };

  const select = (item) => {
    setOpen(false);
    if (!suburb) {
      const subSlug = item.slug?.includes('/') ? item.slug : `${String(item.state || '').toLowerCase()}/${item.slug}`;
      trackActivity('street_search_suburb', { pageKey: 'street-search', suburbId: item.id, query });
      setSuburb({ ...item, slug: subSlug });
      setStatus('loading');
      setQuery(pendingStreet || '');
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
    else if (event.key === 'Enter' && results.length === 1) { event.preventDefault(); select(results[0]); }
    else if (event.key === 'Escape') setOpen(false);
  };

  return (
    <div className={`suburb-widget suburb-widget-index street-search${dark ? ' suburb-widget-dark' : ''}`} ref={boxRef}>
      {suburb && !fixedSuburb && (
        <p className="street-search-suburb">
          <span><b>{suburb.name} {suburb.state}</b>{streets ? ` · ${streets.length} streets` : ''}</span>
          <button type="button" onClick={() => { setSuburb(null); setStreets(null); setQuery(''); setPendingStreet(''); setResults([]); setOpen(false); }}>Change suburb</button>
          {suburb.slug && <Link href={`/streets/${suburb.slug}`}>See all streets in {suburb.name} →</Link>}
        </p>
      )}
      <div className="suburb-widget-search" role="combobox" aria-expanded={open} aria-haspopup="listbox" aria-controls="street-search-results">
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={suburb ? (status === 'loading' ? `Loading streets in ${suburb.name}…` : `Step 2: Type your street in ${suburb.name} (or pick below)`) : 'Step 1: Type a suburb or postcode (e.g. Frankston or 3199)'}
          aria-label={suburb ? 'Search for a street' : 'Search for a suburb'}
          autoComplete="off"
          disabled={suburb && status === 'loading'}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (suburb && streets && !results.length) {
              const initial = streetMatches(query, streets);
              setResults(initial);
              if (initial.length) setOpen(true);
            } else if (results.length) {
              setOpen(true);
            }
          }}
        />
        {open && (
          <ul className="suburb-widget-results" id="street-search-results" role="listbox">
            {suburb && !query.trim() && results.length > 0 && (
              <li className="street-search-group-label" role="presentation">Popular streets in {suburb.name} — or start typing above</li>
            )}
            {results.map((item, index) => (
              <li key={item.slug} role="option" aria-selected={index === active}>
                <button type="button" className={index === active ? 'active' : ''} onMouseEnter={() => setActive(index)} onClick={() => select(item)}>
                  {item.name} <span>{suburb ? `${item.addresses} addresses` : `${item.state} ${item.postcode}`}</span>
                </button>
              </li>
            ))}
            {!results.length && (
              <li className="suburb-widget-miss">
                <p>
                  {suburb
                    ? `No street matching "${query}" in ${suburb.name}.`
                    : pendingStreet
                      ? `Type the suburb or postcode for "${pendingStreet}" first (e.g. Preston or 3072) — then we'll pull up the street.`
                      : 'No suburb found — start with the suburb name or 4-digit postcode.'}
                </p>
              </li>
            )}
          </ul>
        )}
      </div>
      {status === 'error' && <p className="suburb-form-error">Couldn&apos;t load streets for {suburb?.name}. Please try again shortly.</p>}
      <p className="suburb-widget-fine">Every street, scored — free, no sign-up to see the score.</p>
    </div>
  );
}
