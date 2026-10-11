// Server-side lead forwarding for the Street Score funnel. Every capture
// (email gate, phone/consent, profile answers, new street checks by
// identified visitors) goes through the same /api/public/leads proxy as the
// suburb widget with touchExisting:true, so progressive captures land on ONE
// rha_leads row. Street-specific fields are persisted by rha-dashboard
// (rha_leads.street_* / entry_* / *_consent columns, rha_lead_street_checks,
// rha_lead_web_profile, Investor Motivation fill-blanks).

import { forwardToRha } from './rha-api';
import { SEGMENT_LABELS } from './streetShared';

const str = (value, max = 255) => (value === undefined || value === null || value === '' ? undefined : String(value).slice(0, max));

export function attributionFields(attribution) {
  const a = attribution && typeof attribution === 'object' ? attribution : {};
  const touch = (obj) => (obj && typeof obj === 'object' ? Object.fromEntries(Object.entries(obj).filter(([, v]) => typeof v === 'string').map(([k, v]) => [k, v.slice(0, 255)])) : undefined);
  return {
    page_url: str(a.pageUrl, 2000),
    ref: str(a.referrer, 2000),
    gclid: str(a.gclid),
    fbclid: str(a.fbclid),
    utmSource: str(a.utmSource),
    utmMedium: str(a.utmMedium),
    utmCampaign: str(a.utmCampaign),
    utmContent: str(a.utmContent),
    utmTerm: str(a.utmTerm),
    utmId: str(a.utmId),
    entrySource: str(a.entrySource, 40),
    entryRef: str(a.entryRef, 120),
    lastEntrySource: str(a.lastEntrySource, 40),
    lastEntryRef: str(a.lastEntryRef, 120),
    firstTouch: touch(a.firstTouch),
    lastTouch: touch(a.lastTouch),
  };
}

export function streetFields(snapshot, segment, checks) {
  return {
    suburbId: snapshot.suburb.id,
    suburbName: `${snapshot.suburb.name} ${snapshot.suburb.state}`,
    streetKey: snapshot.key,
    streetName: `${snapshot.name}, ${snapshot.suburb.name} ${snapshot.suburb.state}`,
    streetScore: snapshot.score,
    suburbStreetAverage: snapshot.suburb.average,
    streetUrl: snapshot.path,
    segment: SEGMENT_LABELS[segment] ? segment : undefined,
    streetsChecked: Number.isFinite(Number(checks?.streetsChecked)) ? Math.min(500, Number(checks.streetsChecked)) : undefined,
    suburbsChecked: Number.isFinite(Number(checks?.suburbsChecked)) ? Math.min(500, Number(checks.suburbsChecked)) : undefined,
  };
}

export async function forwardStreetLead(payload) {
  return forwardToRha(process.env.RHA_PUBLIC_LEAD_PATH || '/api/public/leads', {
    method: 'POST',
    headers: { 'X-API-Key': process.env.RHA_LEADS_API_KEY || '' },
    body: JSON.stringify({ leadSource: 'rha-website-street-score', touchExisting: true, ...payload }),
  });
}

export function segmentTag(segment) {
  return SEGMENT_LABELS[segment] ? `Street Segment — ${SEGMENT_LABELS[segment]}` : null;
}
