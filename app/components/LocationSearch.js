'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { trackActivity } from '../../lib/activity';

// Unified autosuggest across Australian Cities (30), LGAs (540+), Suburbs (15k),
// and Streets — styled with the exact same .suburb-widget / .street-search classes
// as StreetSearch.js.
export default function LocationSearch({
  localSuburbs = null,
  scopeName = '',
  placeholder = 'Search any Australian city, council (LGA), suburb or postcode…',
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ cities: [], lgas: [], suburbs: [] });
  const [selectedSuburb, setSelectedSuburb] = useState(null);
  const [streets, setStreets] = useState(null);
  const [streetQuery, setStreetQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('idle');
  const boxRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const onClickAway = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickAway);
    return () => document.removeEventListener('mousedown', onClickAway);
  }, []);

  useEffect(() => {
    if (!selectedSuburb) return undefined;
    let cancelled = false;
    fetch(`/api/suburbs/${selectedSuburb.id}/streets`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) {
          setStreets(data?.streets || []);
          setStatus('idle');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStreets([]);
          setStatus('idle');
        }
      });
    return () => { cancelled = true; };
  }, [selectedSuburb]);

  const onInput = (value) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setResults({ cities: [], lgas: [], suburbs: [] });
      setOpen(Boolean(localSuburbs?.length));
      return;
    }

    const q = trimmed.toLowerCase();
    const localMatches = (localSuburbs || [])
      .filter((s) => s.name.toLowerCase().includes(q) || (s.postcodes || []).some((p) => p.startsWith(q)))
      .slice(0, 6)
      .map((s) => ({
        type: 'suburb',
        id: s.id,
        name: s.name,
        state: s.state,
        postcode: s.postcodes?.[0] || '',
        slug: `${s.state.toLowerCase()}/${s.slug}`,
        path: s.path,
        streetsPath: s.streetsPath,
        score: s.score,
      }));
    if (localMatches.length) {
      setResults((prev) => ({ ...prev, suburbs: localMatches }));
      setOpen(true);
    }

    setStatus('loading');
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/locations/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        setResults({
          cities: data.cities || [],
          lgas: data.lgas || [],
          suburbs: localMatches.length ? localMatches : (data.suburbs || []),
        });
        setOpen(true);
      } catch {
        // Keep local matches if remote search fails
      } finally {
        setStatus('idle');
      }
    }, 150);
  };

  const pickSuburbForStreets = (suburb, event) => {
    event.stopPropagation();
    setSelectedSuburb(suburb);
    setStreets(null);
    setStreetQuery('');
    setStatus('loading');
    setOpen(true);
  };

  const go = (path, eventType, meta = {}) => {
    setOpen(false);
    trackActivity(eventType, { pageKey: 'locations', ...meta });
    router.push(path);
  };

  const filteredStreets = () => {
    if (!streets) return [];
    const q = streetQuery.trim().toLowerCase();
    if (!q) return [...streets].sort((a, b) => (b.addresses || 0) - (a.addresses || 0)).slice(0, 8);
    return streets.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 10);
  };

  const defaultLocalSuburbs = !query.trim() && localSuburbs?.length
    ? localSuburbs.slice(0, 8).map((s) => ({
        type: 'suburb',
        id: s.id,
        name: s.name,
        state: s.state,
        postcode: s.postcodes?.[0] || '',
        slug: `${s.state.toLowerCase()}/${s.slug}`,
        path: s.path,
        streetsPath: s.streetsPath,
        score: s.score,
      }))
    : [];

  const shownSuburbs = query.trim().length >= 2 ? results.suburbs : defaultLocalSuburbs;
  const hasAny = results.cities.length > 0 || results.lgas.length > 0 || shownSuburbs.length > 0;

  return (
    <div className="suburb-widget suburb-widget-index street-search loc-search" ref={boxRef}>
      {selectedSuburb ? (
        <>
          <p className="street-search-suburb">
            <span><b>{selectedSuburb.name} {selectedSuburb.state}</b>{streets ? ` · ${streets.length} streets` : ''}</span>
            <button type="button" onClick={() => { setSelectedSuburb(null); setStreets(null); setStreetQuery(''); }}>Change suburb</button>
            <Link href={selectedSuburb.path}>View {selectedSuburb.name} Suburb Report →</Link>
            <Link href={selectedSuburb.streetsPath}>See all streets in {selectedSuburb.name} →</Link>
          </p>
          <div className="suburb-widget-search" role="combobox" aria-expanded={open} aria-haspopup="listbox">
            <input
              type="text"
              value={streetQuery}
              placeholder={status === 'loading' ? `Loading streets in ${selectedSuburb.name}…` : `Type a street name in ${selectedSuburb.name} (or pick below)…`}
              aria-label={`Street name in ${selectedSuburb.name}`}
              autoComplete="off"
              disabled={status === 'loading'}
              onChange={(e) => { setStreetQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
            />
            {open && streets && (
              <ul className="suburb-widget-results" role="listbox">
                <li className="street-search-group-label" role="presentation">
                  {streetQuery.trim() ? 'Matching streets' : `Popular streets in ${selectedSuburb.name} — or start typing above`}
                </li>
                {filteredStreets().map((item) => (
                  <li key={item.slug} role="option" aria-selected="false">
                    <button
                      type="button"
                      onClick={() => go(`/streets/${selectedSuburb.slug}/${item.slug}`, 'street_search_select', { suburbId: selectedSuburb.id, streetKey: `${selectedSuburb.id}~${item.slug}` })}
                    >
                      {item.name} <span>{item.addresses} addresses</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="suburb-widget-fine">Every street, scored — free, no sign-up to see the score.</p>
        </>
      ) : (
        <>
          <div className="suburb-widget-search loc-widget-search" role="combobox" aria-expanded={open} aria-haspopup="listbox">
            <input
              type="text"
              value={query}
              placeholder={placeholder}
              aria-label={placeholder}
              autoComplete="off"
              onChange={(e) => onInput(e.target.value)}
              onFocus={() => { if (hasAny || localSuburbs?.length) setOpen(true); }}
            />

            {open && hasAny && (
              <ul className="suburb-widget-results" role="listbox">
                {results.cities.length > 0 && (
                  <>
                    <li className="street-search-group-label" role="presentation">Cities</li>
                    {results.cities.map((city) => (
                      <li key={`city-${city.path}`} role="option" aria-selected="false">
                        <button type="button" onClick={() => go(city.path, 'loc_city_select', { city: city.name })}>
                          <span><b>{city.name}</b> <small className="loc-type-pill">City · {city.state}</small></span>
                          <span>{city.suburbCount} suburbs{city.rScoreAvg ? ` · R-Score ${city.rScoreAvg}/100` : ''}</span>
                        </button>
                      </li>
                    ))}
                  </>
                )}

                {results.lgas.length > 0 && (
                  <>
                    <li className="street-search-group-label" role="presentation">Council Areas (LGAs)</li>
                    {results.lgas.map((lga) => (
                      <li key={`lga-${lga.id}`} role="option" aria-selected="false">
                        <button type="button" onClick={() => go(lga.path, 'loc_lga_select', { lgaId: lga.id })}>
                          <span><b>{lga.name}</b> <small className="loc-type-pill">LGA · {lga.state}</small></span>
                          <span>{lga.suburbCount} suburbs{lga.rScoreAvg ? ` · R-Score ${lga.rScoreAvg}/100` : ''}</span>
                        </button>
                      </li>
                    ))}
                  </>
                )}

                {shownSuburbs.length > 0 && (
                  <>
                    <li className="street-search-group-label" role="presentation">
                      {query.trim() ? 'Suburbs — click to open suburb report or check streets' : `Top suburbs in ${scopeName || 'this area'} — or start typing above`}
                    </li>
                    {shownSuburbs.map((sub) => (
                      <li key={`sub-${sub.id}`} role="option" aria-selected="false" className="loc-suburb-option">
                        <button type="button" className="loc-suburb-row-btn" onClick={() => go(sub.path, 'loc_suburb_select', { suburbId: sub.id })}>
                          <span>
                            <b>{sub.name}</b> <small className="loc-type-pill">{sub.state}{sub.postcode ? ` ${sub.postcode}` : ''}</small>
                          </span>
                          <span>
                            {sub.score != null ? `R-Score ${sub.score}/100 · ` : ''}Suburb report →
                          </span>
                        </button>
                        <button
                          type="button"
                          className="loc-drill-streets-btn"
                          onClick={(e) => pickSuburbForStreets(sub, e)}
                        >
                          Check streets ↓
                        </button>
                      </li>
                    ))}
                  </>
                )}
              </ul>
            )}
          </div>
          <p className="suburb-widget-fine">
            {scopeName
              ? `Click inside the search box to browse ${scopeName} suburbs or drill down to individual streets.`
              : 'Search any Australian city, council area (LGA), suburb or 4-digit postcode — free, no sign-up to see the score.'}
          </p>
        </>
      )}
    </div>
  );
}
