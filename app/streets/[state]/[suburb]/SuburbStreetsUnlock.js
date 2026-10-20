'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getVisitorId, getAttribution, getStreetChecks } from '../../../../lib/visitor';
import { irIdentify } from '../../../../lib/ir';
import { trackActivity } from '../../../../lib/activity';
import { creditPanelReferral } from '../../../../lib/abTracking';
import { COLLECTION_NOTICE } from '../../../../lib/streetShared';

function CollectionNotice({ className }) {
  const [before, after] = COLLECTION_NOTICE.split('See our Privacy Policy');
  return <p className={className}>{before}See our <Link href="/legal/privacy-policy">Privacy Policy</Link>{after}</p>;
}

export default function SuburbStreetsUnlock({ suburb, suburbPath, anchorKey }) {
  const [unlocked, setUnlocked] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const openedRef = useRef(false);

  const ctx = useCallback((extra = {}) => ({
    pageKey: 'suburb-streets',
    streetKey: anchorKey,
    suburbId: suburb.id,
    ...extra,
  }), [anchorKey, suburb.id]);

  // Silent unlock for returning visitors who already unlocked any street/suburb.
  useEffect(() => {
    if (!anchorKey) return undefined;
    let cancelled = false;
    fetch(`/api/streets/${encodeURIComponent(anchorKey)}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: getVisitorId(), attribution: getAttribution(), checks: getStreetChecks(), segment: 'curious' }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!cancelled && payload?.best?.length) {
          setUnlocked({ best: payload.best, worst: payload.worst || [] });
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [anchorKey]);

  if (!anchorKey) return null;

  const onFocus = () => {
    if (!openedRef.current) {
      openedRef.current = true;
      trackActivity('gate_open', ctx({ origin: 'suburb_list' }));
      trackActivity('gate_focus', ctx({ origin: 'suburb_list' }));
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (status === 'sending') return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (data.company) return;
    setStatus('sending');
    setError('');
    try {
      const response = await fetch(`/api/streets/${encodeURIComponent(anchorKey)}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          firstName: data.firstName || '',
          segment: 'curious',
          streetWatch: true,
          visitorId: getVisitorId(),
          attribution: getAttribution(),
          checks: getStreetChecks(),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || 'Something went wrong. Please try again.');
      irIdentify({ email: data.email, firstName: data.firstName || '', formSource: 'website_street-score_2026' });
      window.fbq?.('track', 'Lead');
      window.gtag?.('event', 'generate_lead', { event_category: 'conversion', event_label: 'street-score-suburb' });
      trackActivity('report_unlock', ctx({ returning: false, origin: 'suburb_list' }));
      creditPanelReferral('street_report_unlock');
      setUnlocked({ best: payload.best || [], worst: payload.worst || [] });
      setStatus('idle');
    } catch (err) {
      setStatus('idle');
      setError(err.message);
      trackActivity('report_unlock_error', ctx({ message: err.message, origin: 'suburb_list' }));
    }
  };

  return (
    <section className="section-shell street-suburb-unlock">
      {unlocked ? (
        <div className="street-suburb-unlocked">
          <div className="section-label">Unlocked · {suburb.name} street leaderboard</div>
          <div className="street-bestworst">
            <div>
              <p className="street-subhead">Top 5 streets in {suburb.name}</p>
              <ol className="street-list">
                {unlocked.best.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/streets/${suburbPath}/${s.slug}`} onClick={() => trackActivity('best_street_click', ctx({ to: s.slug }))}>{s.name}</Link>
                    <span>{s.score}/100</span>
                  </li>
                ))}
              </ol>
            </div>
            {unlocked.worst?.length > 0 && (
              <div>
                <p className="street-subhead">Bottom 5 in {suburb.name}</p>
                <ol className="street-list">
                  {unlocked.worst.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/streets/${suburbPath}/${s.slug}`} onClick={() => trackActivity('worst_street_click', ctx({ to: s.slug }))}>{s.name}</Link>
                      <span>{s.score}/100</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="suburb-locked street-locked street-suburb-gate">
          <div className="suburb-preview street-preview" aria-hidden="true">
            <div className="street-preview-Sample">
              <p className="street-preview-kicker">Top &amp; bottom streets in {suburb.name}</p>
              <div className="street-preview-leaders">
                <div className="street-preview-leader"><span>#1 in {suburb.name}</span><b>████████████ Street</b><strong>100/100</strong></div>
                <div className="street-preview-leader"><span>#2 in {suburb.name}</span><b>██████████ Avenue</b><strong>100/100</strong></div>
                <div className="street-preview-leader"><span>#3 in {suburb.name}</span><b>████████████ Road</b><strong>75/100</strong></div>
                <div className="street-preview-leader"><span>Lowest in {suburb.name}</span><b>██████████ Court</b><strong>25/100</strong></div>
              </div>
            </div>
          </div>
          <div className="suburb-gate street-gate">
            <p className="suburb-gate-heading">Skip the guesswork — see the Top 5 &amp; Bottom 5 streets in {suburb.name}</p>
            <p className="suburb-gate-copy">
              Instead of checking {suburb.streetCount} streets one by one, unlock the highest- and lowest-scoring streets in {suburb.name} right here (plus full reports on any street you click). Free, no phone number.
            </p>
            <form className="suburb-gate-form" onSubmit={onSubmit}>
              <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="suburb-honeypot" />
              <div className="suburb-gate-fields">
                <input type="email" name="email" required placeholder="Enter your email address" autoComplete="email" inputMode="email" onFocus={onFocus} />
                <input type="text" name="firstName" placeholder="First name (optional)" autoComplete="given-name" onFocus={onFocus} />
              </div>
              <button type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Unlocking…' : `Unlock ${suburb.name}'s top & bottom streets →`}</button>
              {error && <p className="suburb-form-error" role="alert">{error}</p>}
              <CollectionNotice className="suburb-gate-fine" />
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
