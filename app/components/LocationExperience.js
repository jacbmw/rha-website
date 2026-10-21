'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import LineChart from '../suburbs/[state]/[slug]/SuburbCharts';
import SuburbCalendly from '../suburbs/[state]/[slug]/SuburbCalendly';
import StreetProfile from '../streets/[state]/[suburb]/[street]/StreetProfile';
import { getAttribution, getVisitorId } from '../../lib/visitor';
import { irIdentify } from '../../lib/ir';
import { creditPanelReferral } from '../../lib/abTracking';
import { trackActivity } from '../../lib/activity';
import { CONSENT_TEXT } from '../../lib/streetShared';

const fmtMoney = (v) => (v === null || v === undefined ? '—' : `$${Math.round(v).toLocaleString('en-AU')}`);
const fmtRent = (v) => `$${Math.round(v)}/wk`;
const fmtDays = (v) => `${Math.round(v)}d`;
const fmtScore = (v) => Math.round(v);

const MOBILE_QUERY = '(max-width: 800px)';
const subscribeMobile = (cb) => {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
};
const useIsMobile = () => useSyncExternalStore(subscribeMobile, () => window.matchMedia(MOBILE_QUERY).matches, () => false);

const QUALIFIERS = [
  { value: 'buying', label: 'Investing in this area', detail: 'Comparing suburbs & streets to buy' },
  { value: 'shortlisting', label: 'Shortlisting markets', detail: 'Weighing this area against others' },
  { value: 'own', label: 'I already own here', detail: 'Checking how my suburb & street rank' },
  { value: 'curious', label: 'Just researching', detail: 'Looking at the numbers' },
];

function LocationGatePanel({
  name,
  kindWord,
  suburbCount,
  topScore,
  previewRows,
  qualifier,
  onQualifierSelect,
  formStatus,
  formError,
  onSubmit,
  onFieldFocus,
  onFieldBlur,
  onFieldInput,
  onClose,
  emailRef,
}) {
  return (
    <div className="suburb-locked street-locked">
      <div className="suburb-preview street-preview" aria-hidden="true">
        <div className="street-preview-Sample">
          <p className="street-preview-kicker">Unlocked in the {name} investor scorecard</p>
          <div className="street-preview-leaders">
            <div className="street-preview-leader"><span>#1 Suburb in {name}</span><b>████████████</b><strong>{topScore}/100</strong></div>
            <div className="street-preview-leader"><span>#2 Suburb in {name}</span><b>██████████</b><strong>{Math.max(50, topScore - 3)}/100</strong></div>
            <div className="street-preview-leader"><span>#3 Suburb in {name}</span><b>████████████</b><strong>{Math.max(48, topScore - 6)}/100</strong></div>
          </div>
        </div>
        <div className="suburb-preview-rows">
          {previewRows.map((rowLabel) => (
            <div className="suburb-preview-row" key={rowLabel}>
              <span>{rowLabel}</span><b>██ ▇▇▇ ██</b>
            </div>
          ))}
        </div>
      </div>

      <div className="suburb-gate street-gate">
        {onClose && <button type="button" className="street-sheet-close" aria-label="Close" onClick={onClose}>×</button>}
        <p className="suburb-gate-heading">
          Unlock the Best Suburbs &amp; Streets in {name} ({suburbCount} suburbs scored)
        </p>
        <p className="suburb-gate-copy">
          See which suburbs and streets in {name} score highest on the 27-indicator Ripehouse R-Score and Street Score — plus the underperforming pockets to avoid. Free, instant, and unlocks every suburb and street across Australia.
        </p>
        <ul className="street-gate-bullets">
          {previewRows.map((rowLabel) => (
            <li key={rowLabel}><span aria-hidden="true">✓</span>{rowLabel}</li>
          ))}
        </ul>
        {onQualifierSelect && (
          <div className="street-gate-pills" role="group" aria-label="Tailor scorecard for">
            {QUALIFIERS.map((option) => (
              <button
                type="button"
                key={option.value}
                className={qualifier === option.value ? 'active' : ''}
                aria-pressed={qualifier === option.value}
                onClick={() => onQualifierSelect(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
        <form className="suburb-gate-form" onSubmit={onSubmit}>
          <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="suburb-honeypot" />
          <div className="suburb-gate-fields">
            <input ref={emailRef} type="email" name="email" required placeholder="Your email address" autoComplete="email" inputMode="email" onFocus={onFieldFocus} onBlur={onFieldBlur} onInput={onFieldInput} />
            <input type="text" name="firstName" placeholder="First name (optional)" autoComplete="given-name" onFocus={onFieldFocus} onBlur={onFieldBlur} onInput={onFieldInput} />
          </div>
          <label className="suburb-gate-consent">
            <input type="checkbox" name="scoreWatch" defaultChecked />
            <span>Send me monthly R-Score updates when {name} suburb rankings shift. Unsubscribe anytime.</span>
          </label>
          <button type="submit" disabled={formStatus === 'sending'}>
            {formStatus === 'sending' ? 'Unlocking scorecard…' : `Unlock ${name} suburbs & streets →`}
          </button>
          {formError && <p className="suburb-form-error" role="alert">{formError}</p>}
          <p className="suburb-gate-fine">
            We use your details to unlock the {kindWord} scorecard and send market research updates. See our <Link href="/legal/privacy-policy">Privacy Policy</Link>.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LocationExperience({
  kind = 'lga', // 'city' | 'lga'
  slug,
  state,
  name,
  rScoreAvg,
  rScoreMax,
  suburbCount,
  lgaCount = null,
}) {
  const [stage, setStage] = useState('locked'); // locked | unlocked
  const [scorecard, setScorecard] = useState(null);
  const [qualifier, setQualifier] = useState('buying');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [formStatus, setFormStatus] = useState('idle');
  const [formError, setFormError] = useState('');
  const [phoneStage, setPhoneStage] = useState('idle'); // idle | sending | done
  const [phoneError, setPhoneError] = useState('');
  const [booked, setBooked] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [returning, setReturning] = useState(false);
  const emailRef = useRef(null);
  const unlockedRef = useRef(false);
  const sheetOpenRef = useRef(false);
  const gateFocusedRef = useRef(false);
  const gateActiveRef = useRef(false);
  const autoFocusingRef = useRef(false);
  useEffect(() => { sheetOpenRef.current = sheetOpen; }, [sheetOpen]);
  const isMobile = useIsMobile();

  const label = `${name} ${state}`;
  const kindWord = kind === 'city' ? 'city' : 'council area';
  const pageKey = `${kind}-research`;

  const ctx = useCallback(
    (extra = {}) => ({ pageKey, kind, slug, state, segment: qualifier, ...extra }),
    [pageKey, kind, slug, state, qualifier]
  );

  const fetchScorecard = useCallback(
    async (extra = {}) => {
      const response = await fetch('/api/locations/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          slug,
          state,
          visitorId: getVisitorId(),
          attribution: getAttribution(),
          ...extra,
        }),
      });
      const payload = await response.json().catch(() => null);
      return { ok: response.ok, payload };
    },
    [kind, slug, state]
  );

  // Silent unlock for returning visitors who already unlocked a suburb, street, or location scorecard.
  useEffect(() => {
    let cancelled = false;
    fetchScorecard()
      .then(({ ok, payload }) => {
        if (!ok || !payload || cancelled) return;
        unlockedRef.current = true;
        setScorecard(payload);
        setFirstName(payload.firstName || '');
        setReturning(true);
        setStage('unlocked');
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [fetchScorecard]);

  // Exit-intent recapture — once per session while locked, never while actively typing in the gate.
  useEffect(() => {
    if (sessionStorage.getItem('rha_loc_exit_shown')) return undefined;
    let maxY = 0;
    const armedAt = Date.now();
    const trigger = () => {
      if (unlockedRef.current || sheetOpenRef.current || gateActiveRef.current || sessionStorage.getItem('rha_loc_exit_shown')) return;
      sessionStorage.setItem('rha_loc_exit_shown', '1');
      setExitOpen(true);
      trackActivity('exit_intent_shown', ctx());
    };
    const onLeave = (event) => { if (event.clientY <= 8 && Date.now() - armedAt > 6000) trigger(); };
    const onScroll = () => {
      maxY = Math.max(maxY, window.scrollY);
      if (maxY > 900 && maxY - window.scrollY > 700) trigger();
    };
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, [ctx]);

  const unlock = async ({ email, firstNameVal = '', scoreWatch = true, origin = 'gate' }) => {
    setFormStatus('sending');
    setFormError('');
    try {
      const { ok, payload } = await fetchScorecard({
        email,
        firstName: firstNameVal,
        qualifier,
        scoreWatch,
      });
      if (!ok) throw new Error(payload?.message || 'Something went wrong. Please try again.');
      unlockedRef.current = true;
      irIdentify({
        email,
        firstName: firstNameVal,
        formSource: kind === 'city' ? 'website_city-scorecard_2026' : 'website_lga-scorecard_2026',
      });
      window.fbq?.('track', 'Lead');
      window.gtag?.('event', 'generate_lead', { event_category: 'conversion', event_label: `${kind}-${slug}` });
      creditPanelReferral('location_scorecard_unlock');
      trackActivity('location_scorecard_unlock', ctx({ origin }));
      setScorecard(payload);
      setFirstName(payload.firstName || firstNameVal || '');
      setReturning(false);
      setExitOpen(false);
      setSheetOpen(false);
      setFormStatus('idle');
      setStage('unlocked');
    } catch (error) {
      setFormStatus('idle');
      setFormError(error.message);
    }
  };

  const onGateSubmit = (event) => {
    event.preventDefault();
    if (formStatus === 'sending') return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (data.company) return;
    unlock({ email: data.email, firstNameVal: data.firstName || '', scoreWatch: data.scoreWatch === 'on', origin: 'gate' });
  };

  const onExitSubmit = (event) => {
    event.preventDefault();
    if (formStatus === 'sending') return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (data.company) return;
    trackActivity('exit_intent_submit', ctx());
    unlock({ email: data.email, scoreWatch: true, origin: 'exit' });
  };

  const onPhoneSubmit = async (event) => {
    event.preventDefault();
    if (phoneStage === 'sending') return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (data.company) return;
    const smsConsent = data.smsConsent === 'on';
    const aiCallConsent = data.aiCallConsent === 'on';
    setPhoneStage('sending');
    setPhoneError('');
    try {
      const response = await fetch('/api/locations/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          slug,
          state,
          phone: data.phone,
          smsConsent,
          aiCallConsent,
          qualifier,
          visitorId: getVisitorId(),
          attribution: getAttribution(),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || 'Something went wrong. Please try again.');
      irIdentify({
        phone: data.phone,
        firstName,
        formSource: kind === 'city' ? 'website_city-review_2026' : 'website_lga-review_2026',
      });
      window.gtag?.('event', 'location_review_request', { event_category: 'conversion', event_label: `${kind}-${slug}` });
      trackActivity('review_submit', ctx({ smsConsent, aiCallConsent }));
      setPhoneStage('done');
    } catch (error) {
      setPhoneStage('idle');
      setPhoneError(error.message);
    }
  };

  const recordRealGateFocus = () => {
    gateActiveRef.current = true;
    if (!gateFocusedRef.current) {
      gateFocusedRef.current = true;
      trackActivity('gate_focus', ctx());
    }
  };
  const onFieldFocus = () => {
    if (autoFocusingRef.current) return;
    recordRealGateFocus();
  };
  const onFieldBlur = () => { gateActiveRef.current = false; };
  const onFieldInput = () => { recordRealGateFocus(); };

  const previewRows = [
    `Top 10 & Bottom 5 suburbs in ${name} ranked by R-Score`,
    `4-pillar score breakdown & 3-year price, rent and DOM charts`,
    `Top 12 highest-scoring streets in ${name} (block-level Street Score)`,
    kind === 'city' && lgaCount > 1
      ? `Side-by-side comparison of all ${lgaCount} ${name} council areas (LGAs)`
      : `Highest-yielding & fastest-selling suburbs in ${name}`,
  ];

  const topScore = rScoreMax ?? Math.min(98, (rScoreAvg || 68) + 18);
  const profileSnapshot = {
    key: `${kind}:${slug}`,
    name: label,
    suburb: { id: 0, name, state, slug },
  };
  const profileSegment = qualifier === 'own' ? 'own' : qualifier === 'curious' ? 'curious' : 'buying';

  return (
    <>
      <section className="suburb-scorecard section-shell" id="scorecard">
        <div className="section-label">
          {kind === 'city' ? `The full ${name} investor scorecard` : `The full ${name} (${state}) council scorecard`}
        </div>

        {stage === 'locked' ? (
          <>
            <div className="street-segment in" role="group" aria-label="What brings you here?">
              <p className="street-segment-heading">What are you researching in {name}?</p>
              <p className="street-segment-copy">
                Pick one to tailor the {name} suburb &amp; street rankings — then enter your email once to unlock every city, council, suburb and street report on the site.
              </p>
              <div className="street-segment-grid">
                {QUALIFIERS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={qualifier === option.value ? 'active' : ''}
                    aria-pressed={qualifier === option.value}
                    onClick={() => {
                      setQualifier(option.value);
                      trackActivity('segment_select', ctx({ segment: option.value }));
                      requestAnimationFrame(() => {
                        document.getElementById('loc-gate')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setTimeout(() => {
                          autoFocusingRef.current = true;
                          emailRef.current?.focus({ preventScroll: true });
                          autoFocusingRef.current = false;
                        }, 240);
                      });
                    }}
                  >
                    <b>{option.label}</b><span>{option.detail}</span>
                  </button>
                ))}
              </div>
            </div>

            <div id="loc-gate">
              <LocationGatePanel
                name={name}
                kindWord={kindWord}
                suburbCount={suburbCount}
                topScore={topScore}
                previewRows={previewRows}
                qualifier={qualifier}
                formStatus={formStatus}
                formError={formError}
                onSubmit={onGateSubmit}
                onFieldFocus={onFieldFocus}
                onFieldBlur={onFieldBlur}
                onFieldInput={onFieldInput}
                emailRef={emailRef}
              />
            </div>

            {sheetOpen && isMobile && (
              <div className="street-sheet-overlay" role="dialog" aria-modal="true" aria-label="Unlock the full scorecard" onClick={() => setSheetOpen(false)}>
                <div className="street-sheet" onClick={(event) => event.stopPropagation()}>
                  <div className="street-sheet-handle" aria-hidden="true" />
                  <LocationGatePanel
                    name={name}
                    kindWord={kindWord}
                    suburbCount={suburbCount}
                    topScore={topScore}
                    previewRows={previewRows}
                    qualifier={qualifier}
                    onQualifierSelect={(val) => setQualifier(val)}
                    formStatus={formStatus}
                    formError={formError}
                    onSubmit={onGateSubmit}
                    onFieldFocus={onFieldFocus}
                    onFieldBlur={onFieldBlur}
                    onFieldInput={onFieldInput}
                    onClose={() => setSheetOpen(false)}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="suburb-unlocked street-unlocked">
            <p className="suburb-greeting">
              {firstName ? (returning ? `Welcome back, ${firstName}.` : `Thanks, ${firstName}.`) : returning ? 'Welcome back.' : 'Unlocked.'}
              {' '}Here&apos;s the full Ripehouse research scorecard on {name} as of {scorecard.asOf}.
            </p>

            {scorecard.insight && (
              <div className="suburb-insight">
                <span>Our read</span>
                <p>{scorecard.insight}</p>
              </div>
            )}

            {scorecard.components?.length > 0 && (
              <div className="suburb-components">
                {scorecard.components.map((component) => (
                  <div className="suburb-component" key={component.key}>
                    <div className="suburb-component-head">
                      <b>{component.label}</b>
                      <strong>{component.score ?? '—'}</strong>
                    </div>
                    <div className="suburb-component-bar">
                      <span style={{ width: `${component.score ?? 0}%` }} />
                    </div>
                    <p>{component.explain}</p>
                  </div>
                ))}
              </div>
            )}

            {scorecard.scoreHistory?.length > 0 && (
              <div className="suburb-chart-grid" style={{ marginTop: '28px' }}>
                <LineChart
                  title={`R-Score, last 18 months (${scorecard.anchorSuburbName || name} benchmark)`}
                  subtitle="The signature 27-indicator Ripehouse series"
                  data={scorecard.scoreHistory}
                  valueKey="score"
                  format={fmtScore}
                  domain={[0, 100]}
                />
                <LineChart
                  title={`Median house price, 3 years (${scorecard.anchorSuburbName || name})`}
                  subtitle="90-day rolling median of settled sales"
                  data={scorecard.priceHistory}
                  valueKey="price"
                  format={fmtMoney}
                  color="#141a32"
                />
                <LineChart
                  title={`Median weekly rent, 3 years (${scorecard.anchorSuburbName || name})`}
                  subtitle="Advertised asking rents"
                  data={scorecard.rentHistory}
                  valueKey="rent"
                  format={fmtRent}
                  color="#141a32"
                />
                <LineChart
                  title={`Days on market, 3 years (${scorecard.anchorSuburbName || name})`}
                  subtitle="How long a listing takes to sell — lower is hotter"
                  data={scorecard.domHistory}
                  valueKey="dom"
                  format={fmtDays}
                  color="#687087"
                />
              </div>
            )}

            {scorecard.topSuburbs?.length > 0 && (
              <div className="street-blocks" style={{ marginTop: '28px' }}>
                <p className="street-subhead">Top-Scoring Suburbs in {name} (by R-Score)</p>
                <p className="street-note">
                  Click any suburb to open its full 3-year R-Score history, or click <b>Best streets</b> to drill down to the highest-scoring streets inside that suburb.
                </p>
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Suburb</th>
                      <th>R-Score</th>
                      <th>Median price</th>
                      <th>Median rent</th>
                      <th>Gross yield</th>
                      <th>Vacancy</th>
                      <th>Streets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scorecard.topSuburbs.map((sub, idx) => (
                      <tr key={sub.id}>
                        <td>#{idx + 1}</td>
                        <td>
                          <Link href={sub.path}><b>{sub.name}</b></Link>
                          {sub.lgaName ? <span className="loc-table-sub"> · {sub.lgaName}</span> : ''}
                        </td>
                        <td><strong>{sub.score ?? '—'}/100</strong></td>
                        <td>{fmtMoney(sub.medianPrice)}</td>
                        <td>{sub.medianRent ? `$${sub.medianRent}/wk` : '—'}</td>
                        <td>{sub.grossYield !== null ? `${sub.grossYield}%` : '—'}</td>
                        <td>{sub.vacancy !== null ? `${sub.vacancy}%` : '—'}</td>
                        <td><Link href={sub.streetsPath}>Best streets →</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {scorecard.topStreets?.length > 0 && (
              <div className="street-blocks" style={{ marginTop: '28px' }}>
                <p className="street-subhead">Highest-Scoring Streets Across {name}</p>
                <p className="street-note">
                  Streets in {name}’s top suburbs that pass the Ripehouse Street Score tests (census block owner-occupier share &gt;65%, public housing ≤5%, and block-level rent &amp; yield).
                </p>
                <table>
                  <thead>
                    <tr>
                      <th>Street</th>
                      <th>Suburb</th>
                      <th>Street Score</th>
                      <th>Addresses</th>
                      <th>Typical rent</th>
                      <th>Yield</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scorecard.topStreets.map((st) => (
                      <tr key={st.key}>
                        <td><Link href={st.path}><b>{st.name}</b></Link></td>
                        <td><Link href={st.suburbPath}>{st.suburbName}</Link></td>
                        <td><strong>{st.score}/100</strong></td>
                        <td>{st.addresses}</td>
                        <td>{st.rent ? `$${st.rent}/wk` : '—'}</td>
                        <td>{st.yieldRate !== null ? `${st.yieldRate}%` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="street-segment-block street-bestworst" style={{ marginTop: '28px' }}>
              {scorecard.topYieldSuburbs?.length > 0 && (
                <div>
                  <p className="street-subhead">Highest rental yields in {name}</p>
                  <ol className="street-list">
                    {scorecard.topYieldSuburbs.map((sub) => (
                      <li key={`yield-${sub.id}`}>
                        <Link href={sub.path}>{sub.name}</Link>
                        <span>{sub.grossYield}% yield · R-Score {sub.score ?? '—'}/100 · {fmtMoney(sub.medianPrice)}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {scorecard.bottomSuburbs?.length > 0 && (
                <div>
                  <p className="street-subhead">Lowest R-Score suburbs in {name} (caution)</p>
                  <ol className="street-list">
                    {scorecard.bottomSuburbs.map((sub) => (
                      <li key={`low-${sub.id}`}>
                        <Link href={sub.path}>{sub.name}</Link>
                        <span>R-Score {sub.score ?? '—'}/100 · {fmtMoney(sub.medianPrice)}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* ── Layer 2: Phone + Consent → IDR Calendly + Progressive Profiling (unified with StreetExperience) ── */}
            <div className="suburb-layer2" style={{ marginTop: '32px' }}>
              <p className="eyebrow light"><span /> 15-minute Investor Decision Review · free</p>
              <h2>Want our honest read on buying in <i>{name}</i> vs other markets?</h2>
              <p className="suburb-layer2-pitch">
                We’ll walk you through how {name}’s top-scoring suburbs and streets stack up against the 5 Australian corridors we are actively buying in for clients right now — and tell you straight whether {name} fits your position.
              </p>
              {phoneStage !== 'done' ? (
                <form className="street-phone-form" onSubmit={onPhoneSubmit}>
                  <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="suburb-honeypot" />
                  <div className="suburb-phone-form">
                    <input type="tel" name="phone" required placeholder="Your Australian mobile number" autoComplete="tel" inputMode="tel" />
                    <button type="submit" disabled={phoneStage === 'sending'}>
                      {phoneStage === 'sending' ? 'One moment…' : `Book a 15-min ${name} Review →`}
                    </button>
                  </div>
                  <p className="street-consent-intro">How can we reach you about your review? (Optional — unticked by default)</p>
                  <label className="street-consent">
                    <input type="checkbox" name="smsConsent" onChange={(e) => trackActivity('consent_toggle', ctx({ type: 'sms', checked: e.target.checked }))} />
                    <span><b>Text me.</b> {CONSENT_TEXT.sms}</span>
                  </label>
                  <label className="street-consent">
                    <input type="checkbox" name="aiCallConsent" onChange={(e) => trackActivity('consent_toggle', ctx({ type: 'ai_call', checked: e.target.checked }))} />
                    <span><b>Call me.</b> {CONSENT_TEXT.aiCall}</span>
                  </label>
                  <p className="street-consent-fine"><b>No high-pressure pitch — if {name} isn’t the right step for you, we’ll say so.</b></p>
                  {phoneError && <p className="suburb-form-error" role="alert">{phoneError}</p>}
                </form>
              ) : (
                <>
                  <p className="suburb-phone-done" role="status">
                    Got it — now pick a time that suits and we’ll bring the full {name} suburb &amp; street analysis to the call.
                  </p>
                  <SuburbCalendly
                    suburbName={label}
                    suburbSlug={`${kind}-${slug}`}
                    firstName={firstName}
                    sessionLabel={`Location Market Review — ${label}`}
                    utmContent={`${kind}-${slug}`}
                    onBooked={() => { setBooked(true); trackActivity('review_booked', ctx()); }}
                  />
                  <StreetProfile
                    snapshot={profileSnapshot}
                    segment={profileSegment}
                    heading={booked ? 'While you wait — help us tailor your Market Review' : 'Help us tailor your Market Review'}
                  />
                </>
              )}
              {phoneStage !== 'done' && (
                <StreetProfile
                  snapshot={profileSnapshot}
                  segment={profileSegment}
                  heading="While you read — two quick questions (optional)"
                />
              )}
            </div>
          </div>
        )}
      </section>

      {stage === 'locked' && !sheetOpen && !exitOpen && (
        <div className="street-sticky" aria-hidden={!isMobile}>
          <button type="button" onClick={() => setSheetOpen(true)}>
            Unlock {name} suburbs &amp; streets →
          </button>
        </div>
      )}

      {exitOpen && stage === 'locked' && (
        <div className="exit-overlay" role="dialog" aria-modal="true" aria-label={`Email me the ${name} scorecard`} onClick={() => setExitOpen(false)}>
          <div className="exit-modal" onClick={(event) => event.stopPropagation()}>
            <button className="exit-close" aria-label="Close" onClick={() => setExitOpen(false)}>×</button>
            <p className="eyebrow"><span /> Before you go</p>
            <h3>Want us to email you the <i>{name}</i> suburb &amp; street scorecard?</h3>
            <p className="exit-copy">
              Enter your email once to unlock the Top 10 &amp; Bottom 5 suburbs and highest-scoring streets in {name} — plus every suburb and street report across Australia.
            </p>
            <form className="signup-form" onSubmit={onExitSubmit}>
              <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="suburb-honeypot" />
              <input type="email" name="email" required placeholder="Your email address" autoComplete="email" inputMode="email" />
              <button type="submit" disabled={formStatus === 'sending'}>
                {formStatus === 'sending' ? 'Sending…' : `Unlock ${name} scorecard`}
              </button>
            </form>
            {formError && <p className="suburb-form-error" role="alert">{formError}</p>}
            <button className="exit-dismiss" onClick={() => setExitOpen(false)}>No thanks, I&apos;m just looking</button>
          </div>
        </div>
      )}
    </>
  );
}
