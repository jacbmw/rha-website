'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import SuburbCalendly from '../../../../suburbs/[state]/[slug]/SuburbCalendly';
import StreetProfile from './StreetProfile';
import usePanelTracking from '../../../../components/panels/usePanelTracking';
import { getVisitorId, getAttribution, recordStreetCheck, getStreetChecks } from '../../../../../lib/visitor';
import { irIdentify } from '../../../../../lib/ir';
import { trackActivity, trackEngagement } from '../../../../../lib/activity';
import { creditPanelReferral } from '../../../../../lib/abTracking';
import { resolvePanelClient } from '../../../../../lib/panelClient';
import { SEGMENT_OPTIONS, SEGMENT_LABELS, CONSENT_TEXT, COLLECTION_NOTICE } from '../../../../../lib/streetShared';
import reportPanelDefault from '../../../../../content/panels/panel-street-report.json';
import reviewPanelDefault from '../../../../../content/panels/panel-street-review.json';

// Privacy Act collection notice with the policy actually linked.
function CollectionNotice({ className, prefix = '' }) {
  const [before, after] = COLLECTION_NOTICE.split('See our Privacy Policy');
  return <p className={className}>{prefix}{before}See our <Link href="/legal/privacy-policy">Privacy Policy</Link>{after}</p>;
}

const SEGMENT_KEY = 'rha_street_segment';
const RECORDED_KEY = 'rha_street_recorded';
const YOUTUBE_URL = process.env.NEXT_PUBLIC_RHA_YOUTUBE_URL || '';
const MOBILE_QUERY = '(max-width: 800px)';

const fmtMoney = (v) => (v === null || v === undefined ? '—' : `$${Math.round(v).toLocaleString('en-AU')}`);
const readStorage = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const writeStorage = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };

// Copy tokens: {street} {suburb} {segment}. All gate / Layer 2 copy comes from
// the panel-variant system (panel-street-report, panel-street-review) so the
// headline, offer and button text can be A/B tested from the dashboard.
const fill = (template, tokens) => String(template || '').replace(/\{(street|suburb|segment)\}/g, (_, k) => tokens[k] ?? '');

// Hydration-safe mobile check (server snapshot = false; subscribes to the media query).
const subscribeMobile = (cb) => {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const useIsMobile = () => useSyncExternalStore(subscribeMobile, () => window.matchMedia(MOBILE_QUERY).matches, () => false);

// Layer 2 pitch — honest, segment-aware, and lower-pressure for renters.
// Visitors who skipped the segment tap (or picked "curious") still get the
// default buying/general Street Review offer so no unlocked lead hits a dead end.
function layer2Copy(props, segment, tokens) {
  const key = ['buying', 'own', 'rent'].includes(segment) ? segment : 'buying';
  return {
    heading: fill(props[`${key}Heading`], tokens),
    pitch: fill(props[`${key}Pitch`], tokens),
    button: fill(props[`${key}Button`], tokens),
  };
}

function SegmentCards({ props, tokens, segment, onSelect }) {
  return (
    <div className="street-segment in" role="group" aria-label="What brings you here?">
      <p className="street-segment-heading">{fill(props.segmentHeading, tokens)}</p>
      <p className="street-segment-copy">{fill(props.segmentCopy, tokens)}</p>
      <div className="street-segment-grid">
        {SEGMENT_OPTIONS.map((option) => (
          <button type="button" key={option.value} className={segment === option.value ? 'active' : ''} aria-pressed={segment === option.value} onClick={() => onSelect(option.value)}>
            <b>{option.label}</b><span>{option.detail}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// The email gate. Rendered inline on the page (always visible while locked)
// and also inside the mobile sticky CTA bottom sheet when opened from scroll.
function GatePanel({ props, tokens, snapshot, segment, onSegmentSelect, previewRows, formStatus, formError, onSubmit, onFieldFocus, onFieldBlur, onFieldInput, onClose, emailRef }) {
  const topScore = snapshot.topScore ?? 100;
  return (
    <div className="suburb-locked street-locked">
      <div className="suburb-preview street-preview" aria-hidden="true">
        <div className="street-preview-Sample">
          <p className="street-preview-kicker">Unlocked in the {snapshot.suburb.name} street report</p>
          <div className="street-preview-leaders">
            <div className="street-preview-leader"><span>#1 in {snapshot.suburb.name}</span><b>████████████ Street</b><strong>{topScore}/100</strong></div>
            <div className="street-preview-leader"><span>#2 in {snapshot.suburb.name}</span><b>██████████ Avenue</b><strong>{Math.max(50, topScore - 12)}/100</strong></div>
            <div className="street-preview-leader"><span>#3 in {snapshot.suburb.name}</span><b>████████████ Road</b><strong>{Math.max(50, topScore - 25)}/100</strong></div>
          </div>
        </div>
        <div className="suburb-preview-rows">
          {previewRows.map((label) => <div className="suburb-preview-row" key={label}><span>{label}</span><b>██ ▇▇▇ ██</b></div>)}
        </div>
      </div>
      <div className="suburb-gate street-gate">
        {onClose && <button type="button" className="street-sheet-close" aria-label="Close" onClick={onClose}>×</button>}
        <p className="suburb-gate-heading">{fill(segment ? props.headingSegment : props.heading, tokens)}</p>
        <p className="suburb-gate-copy">{fill(props.copy, tokens)}</p>
        <ul className="street-gate-bullets">
          {previewRows.map((label) => <li key={label}><span aria-hidden="true">✓</span>{label}</li>)}
        </ul>
        {onSegmentSelect && (
          <div className="street-gate-pills" role="group" aria-label="Tailor report for">
            {SEGMENT_OPTIONS.map((option) => (
              <button type="button" key={option.value} className={segment === option.value ? 'active' : ''} aria-pressed={segment === option.value} onClick={() => onSegmentSelect(option.value)}>
                {option.label}
              </button>
            ))}
          </div>
        )}
        <form className="suburb-gate-form" onSubmit={onSubmit}>
          <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="suburb-honeypot" />
          <div className="suburb-gate-fields">
            <input ref={emailRef} type="email" name="email" required placeholder={props.emailPlaceholder} autoComplete="email" inputMode="email" onFocus={onFieldFocus} onBlur={onFieldBlur} onInput={onFieldInput} />
            <input type="text" name="firstName" placeholder={props.firstNamePlaceholder} autoComplete="given-name" onFocus={onFieldFocus} onBlur={onFieldBlur} onInput={onFieldInput} />
          </div>
          <label className="suburb-gate-consent">
            <input type="checkbox" name="streetWatch" defaultChecked />
            <span>{fill(props.streetWatchLabel, tokens)}</span>
          </label>
          <button type="submit" disabled={formStatus === 'sending'}>{formStatus === 'sending' ? props.buttonSendingLabel : props.buttonLabel}</button>
          {formError && <p className="suburb-form-error" role="alert">{formError}</p>}
          <CollectionNotice className="suburb-gate-fine" />
        </form>
      </div>
    </div>
  );
}

function StreetLink({ street, suburbSlug, onClick }) {
  return <Link href={`/streets/${suburbSlug}/${street.slug}`} onClick={onClick}>{street.name}</Link>;
}

function ReportBody({ report, snapshot, activeSegment, onStreetClick }) {
  const suburbSlug = snapshot.suburb.slug;
  const seg = activeSegment || report.segment || 'buying';
  return (
    <>
      <div className="suburb-components street-drivers">
        {report.drivers.map((driver) => (
          <div className="suburb-component" key={driver.key}>
            <div className="suburb-component-head"><b>{driver.label}</b><strong className={driver.pass === null ? '' : driver.pass ? 'pass' : 'fail'}>{driver.value ?? '—'}</strong></div>
            <p><span className="street-driver-line">{driver.pass === null ? 'Not enough data' : driver.pass ? 'Passes' : 'Misses'} the line: {driver.line}.</span> {driver.explain}</p>
          </div>
        ))}
      </div>

      {report.blocks.length > 1 && (
        <div className="street-blocks">
          <p className="street-subhead">Block by block</p>
          <p className="street-note">{snapshot.name} runs through {report.blocks.length} census blocks. Streets often change character from one end to the other — here&apos;s each block.</p>
          <table>
            <thead><tr><th>Addresses</th><th>Block score</th><th>Owner-occ.</th><th>Public housing</th><th>Rent</th></tr></thead>
            <tbody>
              {report.blocks.map((block, index) => (
                <tr key={index}><td>{block.addresses}</td><td>{block.score ?? '—'}</td><td>{block.ownerOcc === null ? '—' : `${block.ownerOcc}%`}</td><td>{block.publicHousing === null ? '—' : `${block.publicHousing}%`}</td><td>{block.rent === null ? '—' : `$${block.rent}/wk`}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="street-evidence">
        <p className="street-subhead">Listing evidence</p>
        <p className="street-note">
          {report.listings.count
            ? `${report.listings.count} propert${report.listings.count === 1 ? 'y' : 'ies'} on ${snapshot.name} came through our research engine in the last three years${report.listings.medianPropertyScore !== null ? `, with a median property score of ${Math.round(report.listings.medianPropertyScore)}/100` : ''}${report.listings.lastListed ? ` (most recent: ${report.listings.lastListed})` : ''}.`
            : `No properties on ${snapshot.name} have come through our listing engine in the last three years — the score above comes from the census and rental data for its blocks, which covers every address.`}
        </p>
      </div>

      {seg === 'own' && (
        <div className="street-segment-block">
          <p className="street-subhead">Value guide</p>
          <p className="street-note">
            {report.valueGuide?.soldPrice
              ? `Recent sales across the blocks on ${snapshot.name} centre around ${fmtMoney(report.valueGuide.soldPrice)}${report.valueGuide.range && report.valueGuide.range[0] !== report.valueGuide.range[1] ? ` (block medians ${fmtMoney(report.valueGuide.range[0])}–${fmtMoney(report.valueGuide.range[1])})` : ''}${report.valueGuide.suburbMedian ? `, against a ${snapshot.suburb.name} median of ${fmtMoney(report.valueGuide.suburbMedian)}` : ''}. This is an area guide, not a valuation of your home.`
              : 'There are not enough recent sales on these blocks for a reliable value guide — this is one we would look at by hand.'}
          </p>
          {report.drag && <div className="suburb-insight"><span>Portfolio drag check</span><p>{report.drag}</p></div>}
        </div>
      )}

      {seg === 'rent' && (
        <div className="street-segment-block">
          <p className="street-subhead">Is the rent fair?</p>
          {report.rentCheck ? (
            <p className="street-note">{report.rentCheck.verdict} Blocks on this street rent for around ${report.rentCheck.streetRent}/wk; across {snapshot.suburb.name} the middle half of rents run ${report.rentCheck.suburbLower ?? '—'}–${report.rentCheck.suburbUpper ?? '—'}/wk (median ${report.rentCheck.suburbMedian}).</p>
          ) : <p className="street-note">Rental data is too thin here for a fair-rent check.</p>}
          {report.rentVsOwn && (
            <div className="street-rentvsown">
              <div><span>Rent</span><strong>${report.rentVsOwn.weeklyRent}/wk</strong></div>
              <div><span>Owning (repayments + costs)</span><strong>${report.rentVsOwn.weeklyRepayment + report.rentVsOwn.weeklyOwnerCosts}/wk</strong></div>
              <div><span>{report.rentVsOwn.weeklyGap >= 0 ? 'Owning costs more by' : 'Owning costs less by'}</span><strong>${Math.abs(report.rentVsOwn.weeklyGap)}/wk</strong></div>
              <p className="street-note">On a {fmtMoney(report.rentVsOwn.price)} purchase with a {fmtMoney(report.rentVsOwn.deposit)} deposit. Assumes {report.rentVsOwn.assumptions} Illustrative only.</p>
            </div>
          )}
        </div>
      )}

      {report.betterStreets?.length > 0 ? (
        <div className="street-segment-block">
          <p className="street-subhead">3 better-scoring streets nearby</p>
          <ul className="street-list">
            {report.betterStreets.map((s) => (
              <li key={s.slug}><StreetLink street={s} suburbSlug={suburbSlug} onClick={() => onStreetClick('better_street_click', s.slug)} /><span>{s.score}/100{s.soldPrice ? ` · blocks selling around ${fmtMoney(s.soldPrice)}` : ''}{s.priceMatched ? ' · similar price' : ''}</span></li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="street-segment-block"><p className="street-note">No street in {snapshot.suburb.name} scores higher than {snapshot.name} on these measures — it&apos;s at the top of its suburb.</p></div>
      )}

      {report.best?.length > 0 && (
        <div className="street-segment-block street-bestworst">
          <div>
            <p className="street-subhead">Top 5 streets in {snapshot.suburb.name}</p>
            <ol className="street-list">{report.best.map((s) => <li key={s.slug}><StreetLink street={s} suburbSlug={suburbSlug} onClick={() => onStreetClick('best_street_click', s.slug)} /><span>{s.score}/100</span></li>)}</ol>
          </div>
          <div>
            <p className="street-subhead">Bottom 5</p>
            <ol className="street-list">{report.worst.map((s) => <li key={s.slug}><StreetLink street={s} suburbSlug={suburbSlug} onClick={() => onStreetClick('worst_street_click', s.slug)} /><span>{s.score}/100</span></li>)}</ol>
          </div>
        </div>
      )}
      <p className="suburb-compliance">Street scores describe the census tenure and rental profile of the blocks a street runs through. They are not a valuation, personal advice or a forecast.</p>
    </>
  );
}

export default function StreetExperience({ snapshot }) {
  const [stage, setStage] = useState('locked');
  const [report, setReport] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [returning, setReturning] = useState(false);
  const [segment, setSegment] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [checksInfo, setChecksInfo] = useState({ streetsChecked: 1, suburbsChecked: 1 });
  const [multiPrompt, setMultiPrompt] = useState(false);
  const [formStatus, setFormStatus] = useState('idle');
  const [formError, setFormError] = useState('');
  const [switching, setSwitching] = useState(false);
  const [phoneStage, setPhoneStage] = useState('idle'); // idle | sending | done
  const [phoneError, setPhoneError] = useState('');
  const [booked, setBooked] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const segmentRef = useRef(null);
  const unlockedRef = useRef(false);
  const gateOpenedRef = useRef(false);
  const gateFocusedRef = useRef(false);
  const gateActiveRef = useRef(false);
  const autoFocusingRef = useRef(false);
  const sheetOpenRef = useRef(false);
  const inlineEmailRef = useRef(null);
  useEffect(() => { sheetOpenRef.current = sheetOpen; }, [sheetOpen]);
  const isMobile = useIsMobile();
  const tokens = { street: snapshot.name, suburb: snapshot.suburb.name, segment: segment ? SEGMENT_LABELS[segment].toLowerCase() : '' };

  // Panel variants resolve client-side (ISR page). Bundled JSON renders
  // immediately; the dashboard variant upgrades it.
  const [reportPanel, setReportPanel] = useState({ id: null, props: reportPanelDefault.props, preview: false });
  const [reviewPanel, setReviewPanel] = useState({ id: null, props: reviewPanelDefault.props, preview: false });
  useEffect(() => {
    let cancelled = false;
    resolvePanelClient('panel-street-report', reportPanelDefault.props).then((r) => { if (!cancelled) setReportPanel(r); }).catch(() => {});
    resolvePanelClient('panel-street-review', reviewPanelDefault.props).then((r) => { if (!cancelled) setReviewPanel(r); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  // Gate panel: display = street page loaded; click = a gate field focused;
  // completion = the gate form unlocks (exit-intent recapture excluded).
  const { trackClick: trackGateClick, trackConversion: trackGateConversion } = usePanelTracking('panel-street-report', reportPanel.id, reportPanel.preview);
  // Review panel: display = report unlocked (the pitch is on screen); click =
  // phone field focused; completion = phone submitted.
  const { trackClick: trackReviewClick, trackConversion: trackReviewConversion } = usePanelTracking('panel-street-review', stage === 'unlocked' ? reviewPanel.id : null, reviewPanel.preview);
  const gateProps = reportPanel.props;
  const reviewProps = reviewPanel.props;

  const ctx = useCallback((extra = {}) => ({ pageKey: 'street-score', streetKey: snapshot.key, suburbId: snapshot.suburb.id, segment: segmentRef.current, ...extra }), [snapshot.key, snapshot.suburb.id]);

  const recordGateOpen = useCallback((origin) => {
    if (!gateOpenedRef.current) {
      gateOpenedRef.current = true;
      trackActivity('gate_open', ctx({ origin }));
    }
  }, [ctx]);

  const chooseSegment = useCallback((value, origin) => {
    segmentRef.current = value;
    setSegment(value);
    writeStorage(SEGMENT_KEY, value);
    trackActivity('segment_select', ctx({ origin }));
    window.gtag?.('event', 'street_segment', { event_category: 'street_score', event_label: value });
  }, [ctx]);

  const fetchReport = useCallback(async (body) => {
    const response = await fetch(`/api/streets/${encodeURIComponent(snapshot.key)}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: getVisitorId(), attribution: getAttribution(), checks: getStreetChecks(), ...body }),
    });
    const payload = await response.json().catch(() => null);
    return { ok: response.ok, payload };
  }, [snapshot.key]);

  const markRecorded = useCallback((seg) => {
    const recorded = readStorage(RECORDED_KEY, []);
    const id = `${snapshot.key}|${seg || ''}`;
    if (!recorded.includes(id)) writeStorage(RECORDED_KEY, [...recorded, id].slice(-100));
  }, [snapshot.key]);

  const applyUnlock = useCallback((payload, isReturning) => {
    unlockedRef.current = true;
    setReport(payload);
    setFirstName(payload.firstName || '');
    setReturning(Boolean(isReturning));
    setStage('unlocked');
  }, []);

  // Page view + street check counter + engagement + returning-visitor silent
  // unlock (the signed HttpOnly cookie authorises; identified visitors on a
  // street they haven't checked before are recorded against their lead).
  useEffect(() => {
    const checks = recordStreetCheck(snapshot.key, snapshot.suburb.id);
    const stored = readStorage(SEGMENT_KEY, null);
    if (SEGMENT_LABELS[stored]) segmentRef.current = stored;
    queueMicrotask(() => {
      setChecksInfo(checks);
      if (SEGMENT_LABELS[stored]) setSegment(stored);
    });
    trackActivity('street_view', ctx({ score: snapshot.score, gap: snapshot.gap, confidence: snapshot.confidence, streetsChecked: checks.streetsChecked, suburbsChecked: checks.suburbsChecked }));
    window.gtag?.('event', 'street_view', { event_category: 'street_score', event_label: snapshot.path });
    const stopEngagement = trackEngagement(ctx());
    let cancelled = false;
    const seg = segmentRef.current;
    const recordCheck = !readStorage(RECORDED_KEY, []).includes(`${snapshot.key}|${seg || ''}`);
    fetchReport({ segment: seg || undefined, recordCheck })
      .then(({ ok, payload }) => {
        if (!ok || !payload || cancelled) return;
        if (recordCheck) markRecorded(seg);
        if (seg) setSegment(seg);
        trackActivity('report_unlock', ctx({ returning: true }));
        applyUnlock(payload, true);
      })
      .catch(() => {});
    return () => { cancelled = true; stopEngagement(); };
  }, [snapshot.key, snapshot.suburb.id, snapshot.score, snapshot.gap, snapshot.confidence, snapshot.path, ctx, fetchReport, markRecorded, applyUnlock]);

  // Multi-street comparison prompt: visitors checking their 3rd+ street without
  // unlocking are high-intent comparers — prompt them once per session to unlock
  // all streets + the suburb Top/Bottom 5 list in one go.
  useEffect(() => {
    if (stage !== 'locked' || checksInfo.streetsChecked < 3) return undefined;
    if (sessionStorage.getItem('rha_street_multi_prompt')) return undefined;
    const timer = setTimeout(() => {
      if (unlockedRef.current || sheetOpenRef.current || gateActiveRef.current || sessionStorage.getItem('rha_street_multi_prompt')) return;
      sessionStorage.setItem('rha_street_multi_prompt', '1');
      sessionStorage.setItem('rha_street_exit_shown', '1');
      setMultiPrompt(true);
      setExitOpen(true);
      trackActivity('exit_intent_shown', ctx({ reason: 'multi_street', streetsChecked: checksInfo.streetsChecked }));
    }, 3200);
    return () => clearTimeout(timer);
  }, [stage, checksInfo.streetsChecked, ctx]);

  // Exit-intent recapture — once per session, only while locked.
  useEffect(() => {
    if (sessionStorage.getItem('rha_street_exit_shown')) return undefined;
    let maxY = 0;
    const armedAt = Date.now();
    const trigger = () => {
      // Never stack on the gate sheet or while the user is actively typing.
      if (unlockedRef.current || sheetOpenRef.current || gateActiveRef.current || sessionStorage.getItem('rha_street_exit_shown')) return;
      sessionStorage.setItem('rha_street_exit_shown', '1');
      setMultiPrompt(false);
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

  const unlock = async ({ email, name, streetWatch, origin }) => {
    setFormStatus('sending');
    setFormError('');
    const seg = segmentRef.current;
    try {
      const { ok, payload } = await fetchReport({ email, firstName: name || '', segment: seg || undefined, streetWatch: streetWatch !== false });
      if (!ok) throw new Error(payload?.message || 'Something went wrong. Please try again.');
      markRecorded(seg);
      irIdentify({ email, firstName: name || '', formSource: 'website_street-score_2026' });
      window.fbq?.('track', 'Lead');
      window.gtag?.('event', 'generate_lead', { event_category: 'conversion', event_label: 'street-score' });
      trackActivity('report_unlock', ctx({ returning: false, origin }));
      // Conversion credit for the Market Intel panel that sent this visitor.
      creditPanelReferral('street_report_unlock');
      if (origin === 'gate') trackGateConversion('report_unlock');
      setExitOpen(false);
      setSheetOpen(false);
      setFormStatus('idle');
      applyUnlock(payload, false);
    } catch (error) {
      setFormStatus('idle');
      setFormError(error.message);
      trackActivity('report_unlock_error', ctx({ message: error.message, origin }));
    }
  };

  const onGateSubmit = (event) => {
    event.preventDefault();
    if (formStatus === 'sending') return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (data.company) return;
    recordGateOpen('submit');
    unlock({ email: data.email, name: data.firstName, streetWatch: data.streetWatch === 'on', origin: 'gate' });
  };

  const onExitSubmit = (event) => {
    event.preventDefault();
    if (formStatus === 'sending') return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (data.company) return;
    trackActivity('exit_intent_submit', ctx({ multiPrompt }));
    unlock({ email: data.email, streetWatch: true, origin: 'exit' });
  };

  const switchSegment = async (value) => {
    if (value === segmentRef.current || switching) return;
    chooseSegment(value, 'switch');
    setSwitching(true);
    try {
      const { ok, payload } = await fetchReport({ segment: value, recordCheck: true });
      if (ok && payload) {
        markRecorded(value);
        setReport(payload);
      }
    } finally {
      setSwitching(false);
    }
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
      const response = await fetch(`/api/streets/${encodeURIComponent(snapshot.key)}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: data.phone, smsConsent, aiCallConsent, segment: segmentRef.current || undefined, visitorId: getVisitorId(), attribution: getAttribution(), checks: getStreetChecks() }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || 'Something went wrong. Please try again.');
      irIdentify({ phone: data.phone, firstName, formSource: 'website_street-review_2026' });
      window.gtag?.('event', 'street_review_request', { event_category: 'conversion', event_label: snapshot.path });
      trackActivity('review_submit', ctx({ smsConsent, aiCallConsent }));
      trackReviewConversion('review_submit');
      setPhoneStage('done');
    } catch (error) {
      setPhoneStage('idle');
      setPhoneError(error.message);
      trackActivity('review_error', ctx({ message: error.message }));
    }
  };

  const onStreetClick = (eventType, to) => trackActivity(eventType, ctx({ to }));
  const copy = layer2Copy(reviewProps, segment, tokens);
  const reviewLabel = `Street Review — ${snapshot.name}, ${snapshot.suburb.name} ${snapshot.suburb.state}`;
  const previewRows = [
    'Why it scores what it scores — all 4 test figures',
    `Block-by-block census breakdown (${snapshot.blocks || 1} ${snapshot.blocks === 1 ? 'block' : 'blocks'})`,
    segment === 'own'
      ? 'Value guide ($ range) + portfolio drag check'
      : segment === 'rent'
        ? 'Fair-rent check + rent-vs-own weekly maths'
        : `3 better-scoring streets in ${snapshot.suburb.name}`,
    `Top 5 & bottom 5 streets in ${snapshot.suburb.name}`,
  ];
  const recordRealGateFocus = () => {
    gateActiveRef.current = true;
    recordGateOpen('focus');
    trackGateClick();
    if (!gateFocusedRef.current) { gateFocusedRef.current = true; trackActivity('gate_focus', ctx()); }
  };
  const onGateFieldFocus = () => {
    if (autoFocusingRef.current) return;
    recordRealGateFocus();
  };
  const onGateFieldBlur = () => {
    gateActiveRef.current = false;
  };
  const onGateFieldInput = () => {
    recordRealGateFocus();
  };
  const focusInlineGate = (origin) => {
    recordGateOpen(origin);
    requestAnimationFrame(() => {
      document.getElementById('street-gate')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        autoFocusingRef.current = true;
        inlineEmailRef.current?.focus({ preventScroll: true });
        autoFocusingRef.current = false;
      }, 260);
    });
  };
  const openStickySheet = () => {
    setSheetOpen(true);
    recordGateOpen('sticky');
  };

  return (
    <>
      <section className="suburb-scorecard section-shell" id="report">
        <div className="section-label">The full street report</div>

        {stage === 'locked' ? (
          <>
            {checksInfo.streetsChecked >= 2 && (
              <div className="street-multi-banner">
                <div>
                  <span className="street-multi-badge">Comparing streets · {checksInfo.streetsChecked} streets checked</span>
                  <p>
                    Stop checking one street at a time — enter your email once to unlock <b>every street you check</b>, plus the <b>Top 5 &amp; Bottom 5 streets in {snapshot.suburb.name}</b>.
                  </p>
                </div>
                <button type="button" onClick={() => focusInlineGate('multi_banner')}>Unlock all {snapshot.suburb.name} streets ↓</button>
              </div>
            )}
            <SegmentCards
              props={gateProps}
              tokens={tokens}
              segment={segment}
              onSelect={(value) => { chooseSegment(value, 'tap'); focusInlineGate('tap'); }}
            />
            <div id="street-gate">
              <GatePanel
                props={gateProps}
                tokens={tokens}
                snapshot={snapshot}
                segment={segment}
                previewRows={previewRows}
                formStatus={formStatus}
                formError={formError}
                onSubmit={onGateSubmit}
                onFieldFocus={onGateFieldFocus}
                onFieldBlur={onGateFieldBlur}
                onFieldInput={onGateFieldInput}
                emailRef={inlineEmailRef}
              />
            </div>
            {/* Mobile sticky CTA opens a compact bottom sheet when the visitor taps the sticky bar. */}
            {sheetOpen && isMobile && (
              <div className="street-sheet-overlay" role="dialog" aria-modal="true" aria-label="Unlock the full report" onClick={() => { setSheetOpen(false); trackActivity('gate_close', ctx()); }}>
                <div className="street-sheet" onClick={(event) => event.stopPropagation()}>
                  <div className="street-sheet-handle" aria-hidden="true" />
                  <GatePanel
                    props={gateProps}
                    tokens={tokens}
                    snapshot={snapshot}
                    segment={segment}
                    onSegmentSelect={(value) => chooseSegment(value, 'sheet')}
                    previewRows={previewRows}
                    formStatus={formStatus}
                    formError={formError}
                    onSubmit={onGateSubmit}
                    onFieldFocus={onGateFieldFocus}
                    onFieldBlur={onGateFieldBlur}
                    onFieldInput={onGateFieldInput}
                    onClose={() => { setSheetOpen(false); trackActivity('gate_close', ctx()); }}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="suburb-unlocked">
            <p className="suburb-greeting">
              {firstName ? (returning ? `Welcome back, ${firstName}.` : `Thanks, ${firstName}.`) : returning ? 'Welcome back.' : 'Unlocked.'}
              {' '}Here&apos;s the full read on {snapshot.name}{report.asOf ? ` as of ${report.asOf}` : ''}.
            </p>

            <div className="street-segment-switch" role="group" aria-label="Tailor this report">
              <span>Tailored for:</span>
              {SEGMENT_OPTIONS.map((option) => (
                <button type="button" key={option.value} className={(segment || report.segment) === option.value ? 'active' : ''} aria-pressed={(segment || report.segment) === option.value} disabled={switching} onClick={() => switchSegment(option.value)}>{option.label}</button>
              ))}
            </div>

            <ReportBody report={report} snapshot={snapshot} activeSegment={segment || report.segment} onStreetClick={onStreetClick} />

            <p className="street-compare-another">
              Weighing up another street? <Link href={`/streets/${snapshot.suburb.slug}`} onClick={() => trackActivity('compare_another_click', ctx())}>Compare with any street in {snapshot.suburb.name} →</Link>
            </p>

            {segment === 'curious' && (
              <div className="street-curious">
                <p className="street-subhead">{fill(reviewProps.curiousHeading, tokens)}</p>
                <p className="street-note">{fill(reviewProps.curiousCopy, tokens)}{YOUTUBE_URL ? ' Prefer to watch? We break down streets and suburbs like this on YouTube.' : ' You\u2019ll get our market notes too.'}</p>
                {YOUTUBE_URL && <a className="text-link" href={YOUTUBE_URL} target="_blank" rel="noreferrer" onClick={() => trackActivity('youtube_click', ctx())}>Watch on YouTube →</a>}
              </div>
            )}

            <div className="suburb-layer2">
              <p className="eyebrow light"><span /> {reviewProps.eyebrow}</p>
              <h2>{copy.heading}</h2>
              <p className="suburb-layer2-pitch">{copy.pitch}</p>
              {phoneStage !== 'done' ? (
                <form className="street-phone-form" onSubmit={onPhoneSubmit}>
                  <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="suburb-honeypot" />
                  <div className="suburb-phone-form">
                    <input type="tel" name="phone" required placeholder={reviewProps.phonePlaceholder} autoComplete="tel" inputMode="tel" onFocus={trackReviewClick} />
                    <button type="submit" disabled={phoneStage === 'sending'}>{phoneStage === 'sending' ? 'One moment…' : copy.button}</button>
                  </div>
                  <p className="street-consent-intro">{reviewProps.consentIntro}</p>
                  <label className="street-consent"><input type="checkbox" name="smsConsent" onChange={(e) => trackActivity('consent_toggle', ctx({ type: 'sms', checked: e.target.checked }))} /><span><b>Text me.</b> {CONSENT_TEXT.sms}</span></label>
                  <label className="street-consent"><input type="checkbox" name="aiCallConsent" onChange={(e) => trackActivity('consent_toggle', ctx({ type: 'ai_call', checked: e.target.checked }))} /><span><b>Call me.</b> {CONSENT_TEXT.aiCall}</span></label>
                  <p className="street-consent-fine"><b>{reviewProps.noSalesLine}</b></p>
                  <CollectionNotice className="street-consent-fine" />
                  {phoneError && <p className="suburb-form-error" role="alert">{phoneError}</p>}
                </form>
              ) : (
                <>
                  <p className="suburb-phone-done" role="status">{fill(reviewProps.doneCopy, tokens)}</p>
                  {segment !== 'rent' && (
                    <SuburbCalendly
                      suburbName={`${snapshot.name}, ${snapshot.suburb.name}`}
                      suburbSlug={snapshot.slug}
                      firstName={firstName}
                      sessionLabel={reviewLabel}
                      utmContent={`street-${snapshot.suburb.slug.replace('/', '-')}-${snapshot.slug}`}
                      onBooked={() => { setBooked(true); trackActivity('review_booked', ctx()); }}
                    />
                  )}
                  <StreetProfile snapshot={snapshot} segment={segment} heading={booked ? 'While you wait — help us tailor your Street Review' : 'Help us tailor your Street Review'} />
                </>
              )}
              {phoneStage !== 'done' && (
                <StreetProfile snapshot={snapshot} segment={segment || 'buying'} heading="While you read — two quick questions (optional)" />
              )}
            </div>
          </div>
        )}
      </section>

      {/* Mobile sticky action — the primary CTA never scrolls out of reach. */}
      {stage === 'locked' && !sheetOpen && !exitOpen && (
        <div className="street-sticky" aria-hidden={!isMobile}>
          <button type="button" onClick={openStickySheet}>{fill(gateProps.stickyLabel, tokens)}</button>
        </div>
      )}

      {exitOpen && stage === 'locked' && (
        <div className="exit-overlay" role="dialog" aria-modal="true" aria-label="Email me the street report" onClick={() => setExitOpen(false)}>
          <div className="exit-modal" onClick={(event) => event.stopPropagation()}>
            <button className="exit-close" aria-label="Close" onClick={() => setExitOpen(false)}>×</button>
            <p className="eyebrow"><span /> {multiPrompt ? `Comparing streets · ${checksInfo.streetsChecked} streets checked` : 'Before you go'}</p>
            <h3>{multiPrompt ? `Comparing streets in ${snapshot.suburb.name}?` : fill(gateProps.exitHeading, tokens)}</h3>
            <p className="exit-copy">
              {multiPrompt
                ? `Enter your email once to unlock the full report on every street you check — plus the Top 5 & Bottom 5 streets in ${snapshot.suburb.name} so you don\u2019t have to check them one by one.`
                : fill(gateProps.exitCopy, tokens)}
            </p>
            <form className="signup-form" onSubmit={onExitSubmit}>
              <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="suburb-honeypot" />
              <input type="email" name="email" required placeholder="Your email address" autoComplete="email" inputMode="email" />
              <button type="submit" disabled={formStatus === 'sending'}>{formStatus === 'sending' ? 'Sending…' : (multiPrompt ? `Unlock all ${snapshot.suburb.name} streets` : gateProps.exitButton)}</button>
            </form>
            {formError && <p className="suburb-form-error" role="alert">{formError}</p>}
            <button className="exit-dismiss" onClick={() => setExitOpen(false)}>No thanks, I&apos;m just looking</button>
          </div>
        </div>
      )}
    </>
  );
}
