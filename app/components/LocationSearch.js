'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trackActivity } from '../../lib/activity';

// Unified autosuggest across Australian Cities (30), LGAs (550+), Suburbs (15k),
// and Streets. Can also be pre-scoped with `localSuburbs` on a City or LGA page
// so visitors can filter suburbs inside that City/LGA immediately or search nationally.
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

    // Instant local match within the current City/LGA's suburbs while remote search runs
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
    <div className="suburb-search street-search loc-search" ref={boxRef}>
      {selectedSuburb ? (
        <>
          <div className="street-search-Crumb">
            <span>Streets in <b>{selectedSuburb.name} {selectedSuburb.state}</b></span>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => go(selectedSuburb.path, 'loc_suburb_select', { suburbId: selectedSuburb.id })}>
                View {selectedSuburb.name} Suburb Report →
              </button>
              <button type="button" onClick={() => { setSelectedSuburb(null); setStreets(null); setStreetQuery(''); }}>
                Change location
              </button>
            </div>
          </div>
          <div className="suburb-search-bar">
            <span className="suburb-search-icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              value={streetQuery}
              placeholder={`Type a street name in ${selectedSuburb.name}…`}
              aria-label={`Street name in ${selectedSuburb.name}`}
              autoComplete="off"
              onChange={(e) => { setStreetQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
            />
            {status === 'loading' && <span className="suburb-search-spin" aria-hidden="true" />}
          </div>
          {open && streets && filteredStreets().length > 0 && (
            <ul className="suburb-search-list" role="listbox">
              <li className="street-search-hint">
                <span>{streetQuery.trim() ? 'Matching streets' : `Popular streets in ${selectedSuburb.name}`}</span>
                <button type="button" className="loc-search-inline-btn" onClick={() => go(selectedSuburb.streetsPath, 'loc_all_streets', { suburbId: selectedSuburb.id })}>
                  See all {streets.length} streets →
                </button>
              </li>
              {filteredStreets().map((item) => (
                <li key={item.slug} role="option" aria-selected="false">
                  <button
                    type="button"
                    onClick={() => go(`/streets/${selectedSuburb.slug}/${item.slug}`, 'street_search_select', { suburbId: selectedSuburb.id, streetKey: `${selectedSuburb.id}~${item.slug}` })}
                  >
                    <span className="suburb-search-name">{item.name}</span>
                    <span className="suburb-search-meta">{selectedSuburb.name} {selectedSuburb.state} · {item.addresses} addresses</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          <div className="suburb-search-bar">
            <span className="suburb-search-icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              value={query}
              placeholder={placeholder}
              aria-label={placeholder}
              autoComplete="off"
              onChange={(e) => onInput(e.target.value)}
              onFocus={() => { if (hasAny || localSuburbs?.length) setOpen(true); }}
            />
            {status === 'loading' && <span className="suburb-search-spin" aria-hidden="true" />}
          </div>

          {open && hasAny && (
            <ul className="suburb-search-list loc-search-dropdown" role="listbox">
              {results.cities.length > 0 && (
                <>
                  <li className="street-search-hint"><span>Cities</span></li>
                  {results.cities.map((city) => (
                    <li key={`city-${city.path}`} role="option" aria-selected="false">
                      <button type="button" onClick={() => go(city.path, 'loc_city_select', { city: city.name })}>
                        <span className="suburb-search-name">{city.name} <small className="loc-type-pill">City · {city.state}</small></span>
                        <span className="suburb-search-meta">{city.suburbCount} suburbs{city.rScoreAvg ? ` · R-Score avg ${city.rScoreAvg}/100` : ''}</span>
                      </button>
                    </li>
                  ))}
                </>
              )}

              {results.lgas.length > 0 && (
                <>
                  <li className="street-search-hint"><span>Council Areas (LGAs)</span></li>
                  {results.lgas.map((lga) => (
                    <li key={`lga-${lga.id}`} role="option" aria-selected="false">
                      <button type="button" onClick={() => go(lga.path, 'loc_lga_select', { lgaId: lga.id })}>
                        <span className="suburb-search-name">{lga.name} <small className="loc-type-pill">LGA · {lga.state}</small></span>
                        <span className="suburb-search-meta">{lga.suburbCount} suburbs{lga.rScoreAvg ? ` · R-Score avg ${lga.rScoreAvg}/100` : ''}</span>
                      </button>
                    </li>
                  ))}
                </>
              )}

              {shownSuburbs.length > 0 && (
                <>
                  <li className="street-search-hint">
                    <span>{query.trim() ? 'Suburbs (click suburb or drill down to streets)' : `Top suburbs in ${scopeName || 'this area'}`}</span>
                  </li>
                  {shownSuburbs.map((sub) => (
                    <li key={`sub-${sub.id}`} role="option" aria-selected="false" className="loc-suburb-option">
                      <button type="button" onClick={() => go(sub.path, 'loc_suburb_select', { suburbId: sub.id })}>
                        <span className="suburb-search-name">
                          {sub.name} <small className="loc-type-pill">Suburb · {sub.state} {sub.postcode}</small>
                        </span>
                        <span className="suburb-search-meta">
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
        </>
      )}
    </div>
  );
}
