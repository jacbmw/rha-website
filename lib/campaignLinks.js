// Campaign entry links for Street Score (and any other page we point content
// at). Two families, both 302 to a page on this site with UTMs + our own
// entry identifiers (rha_src / rha_ref) appended, so first/last touch and the
// dashboard lead row carry exactly which video / post brought the visitor in:
//
//   /go/yt/<videoId>?s=<state>/<suburb>[/<street>]&c=<campaign>
//     -> utm_source=youtube utm_medium=video utm_content=<videoId> rha_src=yt rha_ref=<videoId>
//   /go/s/<code>?src=facebook|instagram|linkedin|blog|email|other&s=...&c=...
//     -> utm_source=<src> utm_medium=social|blog|email|referral utm_content=<code> rha_src=<src> rha_ref=<code>
//
// `to=suburbs` targets /suburbs/<s> instead of /streets/<s>. Any utm_* / fbclid
// / gclid already on the incoming link wins over the defaults. Targets are
// restricted to on-site /streets and /suburbs paths (no open redirect).

import { NextResponse } from 'next/server';
import { postActivityServer } from './activityServer';

const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const PATH_RE = /^[a-z]{2,3}(\/[a-z0-9-]{1,80}){0,2}$/;
const SOURCES = { facebook: 'social', instagram: 'social', linkedin: 'social', tiktok: 'social', blog: 'blog', email: 'email', other: 'referral' };
const RESERVED = new Set(['s', 'c', 'src', 'to']);

const clean = (value, max = 80) => String(value || '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, max);

export function buildCampaignTarget(requestUrl, { kind, id }) {
  const incoming = new URL(requestUrl);
  const sp = incoming.searchParams;
  const ref = ID_RE.test(String(id || '')) ? String(id) : '';
  const section = sp.get('to') === 'suburbs' ? 'suburbs' : 'streets';
  const path = String(sp.get('s') || '').toLowerCase().replace(/^\/+|\/+$/g, '');
  const target = new URL(`/${section}${PATH_RE.test(path) ? `/${path}` : ''}`, incoming.origin);
  const campaign = clean(sp.get('c')) || 'street-score';

  let params;
  if (kind === 'yt') {
    params = { utm_source: 'youtube', utm_medium: 'video', utm_campaign: campaign, utm_content: ref, rha_src: 'yt', rha_ref: ref };
  } else {
    const src = SOURCES[clean(sp.get('src'))] ? clean(sp.get('src')) : 'facebook';
    params = { utm_source: src, utm_medium: SOURCES[src], utm_campaign: campaign, utm_content: ref, rha_src: src, rha_ref: ref };
  }
  for (const [key, value] of Object.entries(params)) if (value) target.searchParams.set(key, value);
  for (const [key, value] of sp.entries()) if (!RESERVED.has(key) && value) target.searchParams.set(key, value.slice(0, 200));
  return { target, params, path: target.pathname };
}

export function campaignRedirect(request, { kind, id }) {
  const { target, params, path } = buildCampaignTarget(request.url, { kind, id });
  // Count the click server-side too — it survives visitors who bounce before
  // any client JS (and the pageview beacon) runs.
  postActivityServer({
    visitor_id: request.cookies.get('rha_vid')?.value || null,
    event_type: 'campaign_click',
    page_key: 'go-link',
    page_url: path,
    utm_source: params.utm_source,
    utm_medium: params.utm_medium,
    utm_campaign: params.utm_campaign,
    utm_content: params.utm_content,
    rha_src: params.rha_src,
    rha_ref: params.rha_ref,
    props: { kind, target: target.pathname + target.search, referrer: request.headers.get('referer') || null },
  }, request);
  return NextResponse.redirect(target, { status: 302, headers: { 'Cache-Control': 'no-store' } });
}
