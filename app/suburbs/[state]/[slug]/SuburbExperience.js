'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import LineChart from './SuburbCharts';
import SuburbCalendly from './SuburbCalendly';
import SuburbScorecardPanel from '../../../components/panels/SuburbScorecardPanel';
import { getVisitorId, getAttribution } from '../../../../lib/visitor';
import { irIdentify } from '../../../../lib/ir';
import { creditPanelReferral } from '../../../../lib/abTracking';

const QUALIFIERS = [
  { value: 'researching', label: 'Just researching' },
  { value: 'looking', label: 'Actively looking to buy' },
  { value: 'own', label: 'Own here already' },
  { value: 'selling', label: 'Thinking of selling' },
];

const fmtMoney = (v) => `$${Math.round(v).toLocaleString('en-AU')}`;
const fmtRent = (v) => `$${Math.round(v)}/wk`;
const fmtDays = (v) => `${Math.round(v)}d`;
const fmtScore = (v) => Math.round(v);

// Layer 2 pitch — what's kind and useful to say changes with why they're here.
function layer2Pitch(qualifier, name) {
  switch (qualifier) {
    case 'looking':
      return `We'll tell you straight whether we'd buy in ${name} right now — and if it's not the right suburb for your situation, we'll tell you that too, and show you what we'd look at instead.`;
    case 'own':
      return `You already hold the asset — so we'll focus on what these conditions mean for your equity and your next move. That's the Legacy Sequence conversation: where ${name} sits in it, and what step comes next for you.`;
    case 'selling':
      return `We'll give you our honest read on where ${name} sits in its cycle right now and what the current data says about timing — no listing pitch, we're not agents.`;
    default:
      return `We'll walk you through the full 27-metric picture on ${name} — comparable-suburb benchmarking, where it sits in the cycle, and what the numbers actually mean for someone in your position.`;
  }
}

export default function SuburbExperience({ snapshot, scorecardPanel }) {
  const [stage, setStage] = useState('locked'); // locked | unlocked
  const [scorecard, setScorecard] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [returning, setReturning] = useState(false);
  const [qualifier, setQualifier] = useState('');
  const [formStatus, setFormStatus] = useState('idle');
  const [formError, setFormError] = useState('');
  const [phoneStage, setPhoneStage] = useState('idle'); // idle | sending | booked-form
  const [phoneError, setPhoneError] = useState('');
  const [exitOpen, setExitOpen] = useState(false);
  const unlockedRef = useRef(false);

  const applyUnlock = useCallback((payload, isReturning) => {
    unlockedRef.current = true;
    setScorecard(payload);
    setFirstName(payload.firstName || '');
    setReturning(Boolean(isReturning));
    setStage('unlocked');
  }, []);

  // Pageview event + returning-visitor silent unlock (the signed HttpOnly
  // cookie set at first unlock does the authorising — never re-gate someone
  // who already paid an email).
  useEffect(() => {
    window.gtag?.('event', 'suburb_view', { event_category: 'suburb_widget', event_label: snapshot.slug });
    let cancelled = false;
    fetch(`/api/suburbs/${snapshot.id}/scorecard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => { if (payload && !cancelled) applyUnlock(payload, true); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [snapshot.id, snapshot.slug, applyUnlock]);

  // Exit-intent recapture — desktop mouseleave or a sharp scroll-away on
  // mobile. Once per session, only while still locked, never stacked.
  useEffect(() => {
    if (sessionStorage.getItem('rha_suburb_exit_shown')) return undefined;
    let maxY = 0;
    const trigger = () => {
      if (unlockedRef.current || sessionStorage.getItem('rha_suburb_exit_shown')) return;
      sessionStorage.setItem('rha_suburb_exit_shown', '1');
      setExitOpen(true);
    };
    const armedAt = Date.now();
    const onLeave = (event) => {
      if (event.clientY > 8 || Date.now() - armedAt < 6000) return;
      trigger();
    };
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
  }, []);

  const unlock = async ({ email, name, qualifierValue, scoreWatch }) => {
    setFormStatus('sending');
    setFormError('');
    try {
      const response = await fetch(`/api/suburbs/${snapshot.id}/scorecard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName: name || '',
          qualifier: qualifierValue || undefined,
          scoreWatch: scoreWatch !== false,
          visitorId: getVisitorId(),
          attribution: getAttribution(),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || 'Something went wrong. Please try again.');
      irIdentify({ email, firstName: name || '', formSource: 'website_suburb-score_2026' });
      window.fbq?.('track', 'Lead');
      window.gtag?.('event', 'generate_lead', { event_category: 'conversion', event_label: 'suburb-scorecard' });
      window.gtag?.('event', 'scorecard_unlock', { event_category: 'suburb_widget', event_label: snapshot.slug });
      creditPanelReferral('scorecard_unlock');
      if (qualifierValue) setQualifier(qualifierValue);
      setExitOpen(false);
      setFormStatus('idle');
      applyUnlock(payload, false);
    } catch (error) {
      setFormStatus('idle');
      setFormError(error.message);
      throw error;
    }
  };

  const onGateSubmit = async (event) => {
    event.preventDefault();
    if (formStatus === 'sending') return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (data.company) return; // honeypot
    await unlock({ email: data.email, name: data.firstName, qualifierValue: data.qualifier, scoreWatch: data.scoreWatch === 'on' }).catch(() => {});
  };

  const onExitSubmit = async (event) => {
    event.preventDefault();
    if (formStatus === 'sending') return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (data.company) return;
    await unlock({ email: data.email, scoreWatch: true }).catch(() => {});
  };

  const onPhoneSubmit = async (event) => {
    event.preventDefault();
    if (phoneStage === 'sending') return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (data.company) return;
    setPhoneStage('sending');
    setPhoneError('');
    try {
      const response = await fetch(`/api/suburbs/${snapshot.id}/full-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: data.phone, qualifier: qualifier || undefined, visitorId: getVisitorId() }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || 'Something went wrong. Please try again.');
      irIdentify({ email: '', phone: data.phone, firstName, formSource: 'website_suburb-analysis_2026' });
      window.gtag?.('event', 'full_analysis_request', { event_category: 'conversion', event_label: snapshot.slug });
      setPhoneStage('booked-form');
    } catch (error) {
      setPhoneStage('idle');
      setPhoneError(error.message);
    }
  };

  return (
    <>
      <section className="suburb-scorecard section-shell" id="scorecard">
        <div className="section-label">The full scorecard</div>

        {stage === 'locked' ? (
          <div className="suburb-locked">
            {/* Blurred preview — real chart shapes, unreadable values. Proof
                there's more, not a wall. Values are the recent score curve
                only; nothing else ships in the HTML. */}
            <div className="suburb-preview" aria-hidden="true">
              <div className="suburb-preview-charts">
                {[0, 1].map((chart) => (
                  <svg key={chart} viewBox="0 0 280 90" className="suburb-preview-chart">
                    <polyline
                      fill="none" stroke="#c79810" strokeWidth="2.5"
                      points={snapshot.previewShape.map((v, i) => `${10 + (i * 260) / Math.max(1, snapshot.previewShape.length - 1)},${80 - ((chart ? (v * 7) % 100 : v) / 100) * 62}`).join(' ')}
                    />
                    <line x1="10" x2="270" y1="80" y2="80" stroke="rgba(20,26,50,.15)" />
                  </svg>
                ))}
              </div>
              <div className="suburb-preview-rows">
                {['18-month R-Score history', 'Score components', 'Price & rent trend (3 yrs)', 'Days on market', 'Supply vs council area'].map((label) => (
                  <div className="suburb-preview-row" key={label}><span>{label}</span><b>██ ▇▇▇ ██</b></div>
                ))}
              </div>
            </div>

            <SuburbScorecardPanel
              variant={scorecardPanel}
              snapshot={snapshot}
              qualifiers={QUALIFIERS}
              onSubmit={onGateSubmit}
              formStatus={formStatus}
              formError={formError}
            />
          </div>
        ) : (
          <div className="suburb-unlocked">
            <p className="suburb-greeting">
              {firstName ? (returning ? `Welcome back, ${firstName}.` : `Thanks, ${firstName}.`) : returning ? 'Welcome back.' : 'Unlocked.'}
              {' '}Here&apos;s the full read on {snapshot.name} as of {scorecard.asOf}.
            </p>

            <div className="suburb-insight"><span>Our read</span><p>{scorecard.insight}</p></div>

            <div className="suburb-chart-grid">
              <LineChart title="R-Score, last 18 months" subtitle="The signature series — nobody else measures this" data={scorecard.scoreHistory} valueKey="score" format={fmtScore} domain={[0, 100]} />
              <LineChart title="Median house price, 3 years" subtitle="90-day rolling median of settled sales" data={scorecard.priceHistory} valueKey="price" format={fmtMoney} color="#141a32" />
              <LineChart title="Median weekly rent, 3 years" subtitle="Advertised asking rents" data={scorecard.rentHistory} valueKey="rent" format={fmtRent} color="#141a32" />
              <LineChart title="Days on market, 3 years" subtitle="How long a listing takes to sell — lower is hotter" data={scorecard.domHistory} valueKey="dom" format={fmtDays} color="#687087" />
            </div>

            <div className="suburb-components">
              {scorecard.components.map((component) => (
                <div className="suburb-component" key={component.key}>
                  <div className="suburb-component-head"><b>{component.label}</b><strong>{component.score ?? '—'}</strong></div>
                  <div className="suburb-component-bar"><span style={{ width: `${component.score ?? 0}%` }} /></div>
                  <p>{component.explain}</p>
                </div>
              ))}
            </div>
            {scorecard.supply?.note && <p className="suburb-supply-note">{scorecard.supply.note}</p>}
            <p className="suburb-compliance">Grouped from the 27 indicators we measure. Scores describe measured market conditions, not personal advice or forecasts.</p>

            {/* ── Layer 2 — the call IS the product ─────────────────────── */}
            <div className="suburb-layer2">
              <p className="eyebrow light"><span /> Suburb Strategy Session · 15 minutes · free</p>
              <h2>Get the full 27-metric analysis + our read on <i>{snapshot.name}</i></h2>
              <p className="suburb-layer2-pitch">{layer2Pitch(qualifier, snapshot.name)}</p>
              <ul className="suburb-layer2-list">
                <li>The full metric table — all 27 indicators, explained in plain English</li>
                <li>How {snapshot.name} benchmarks against its true comparable suburbs</li>
                <li>Where it sits in the Legacy Sequence for <i>your</i> situation</li>
                <li>Whether we&apos;d actually buy there — and if not, we&apos;ll tell you</li>
              </ul>
              {phoneStage !== 'booked-form' ? (
                <form className="suburb-phone-form" onSubmit={onPhoneSubmit}>
                  <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="suburb-honeypot" />
                  <input type="tel" name="phone" required placeholder="Your mobile number" autoComplete="tel" />
                  <button type="submit" disabled={phoneStage === 'sending'}>{phoneStage === 'sending' ? 'One moment…' : 'Get the full analysis in a 15-minute call'}</button>
                  {phoneError && <p className="suburb-form-error" role="alert">{phoneError}</p>}
                </form>
              ) : (
                <>
                  <p className="suburb-phone-done" role="status">Got it — now pick a time that suits and we&apos;ll bring the full {snapshot.name} analysis to the call.</p>
                  <SuburbCalendly suburbName={`${snapshot.name} ${snapshot.state}`} suburbSlug={snapshot.slug.split('/')[1] || snapshot.slug} firstName={firstName} />
                </>
              )}
            </div>
          </div>
        )}
      </section>

      {exitOpen && stage === 'locked' && (
        <div className="exit-overlay" role="dialog" aria-modal="true" aria-label="Email me the scorecard" onClick={() => setExitOpen(false)}>
          <div className="exit-modal" onClick={(event) => event.stopPropagation()}>
            <button className="exit-close" aria-label="Close" onClick={() => setExitOpen(false)}>×</button>
            <p className="eyebrow"><span /> Before you go</p>
            <h3>Want us to just <i>email you</i> the scorecard?</h3>
            <p className="exit-copy">We&apos;ll send {snapshot.name}&apos;s full scorecard to your inbox — and unlock it here while we&apos;re at it.</p>
            <form className="signup-form" onSubmit={onExitSubmit}>
              <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="suburb-honeypot" />
              <input type="email" name="email" required placeholder="Your email address" autoComplete="email" />
              <button type="submit" disabled={formStatus === 'sending'}>{formStatus === 'sending' ? 'Sending…' : 'Email it to me'}</button>
            </form>
            {formError && <p className="suburb-form-error" role="alert">{formError}</p>}
            <button className="exit-dismiss" onClick={() => setExitOpen(false)}>No thanks, I&apos;m just looking</button>
          </div>
        </div>
      )}
    </>
  );
}
