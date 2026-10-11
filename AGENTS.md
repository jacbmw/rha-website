# rha-website — project notes

## Commands
- `npm run dev` / `npm run build` / `npm run start` / `npm run lint`
- Verify with `npm run lint` + `npm run build` before shipping. There are no tests.

## Suburb widget ("Your Suburb, Scored")
- Data layer: `lib/suburbs.js` reads Aurora `warehouse.ssc_data_dump` (one row per
  suburb per month; `r_perc` = R-Score 0–100, `r_raw` orders the rank) and
  `warehouse.suburb_ssc` (suburb+postcode+state → `ssc_id` registry). Uses the
  existing `RIPEHOUSE_DB_*` env credentials. Registry is cached in-process 24h;
  `-999` is the bake's "missing" sentinel.
- Pages: `/suburbs` (index), `/suburbs/[state]` (letter nav), `/suburbs/[state]/browse/[letter]`
  (kept separate so no index page blows the <100KB HTML budget), `/suburbs/[state]/[slug]`
  (ISR 24h, on-demand). Suburb pages with `confidence: low` are noindexed and
  suppress the verdict band.
- APIs: `GET /api/suburbs/search` (autosuggest, accepts postcodes),
  `GET /api/suburbs/[id]/snapshot` (Layer 0, public), `POST /api/suburbs/[id]/scorecard`
  (Layer 1 — server-gated: creates/touches a lead via the dashboard before returning
  data; sets the signed `rha_suburb_unlock` HttpOnly cookie so returning visitors skip
  the form), `POST /api/suburbs/[id]/full-analysis` (Layer 2 phone capture),
  `GET /api/og/suburb/[id]` (dynamic OG score card).
- Gating secret: `RHA_SUBURB_UNLOCK_SECRET` (falls back to `RHA_LEADS_API_KEY`).
- Rate limits are in-process (`lib/rateLimit.js`): search/snapshot 60/min/IP,
  scorecard 10/min/IP + 2 distinct suburbs per IP per day.
- Suburb sitemaps: `app/suburbs/sitemap.js` (batches of 5,000 at
  `/suburbs/sitemap/[id].xml`). NOTE: Next 16 passes the `id` to `sitemap({ id })`
  as a **Promise** — always `await id`.
- Lead path: same `/api/public/leads` proxy as the newsletter/ebook forms, plus
  `touchExisting: true` + `suburbId`/`suburbName`/`qualifier` fields. The dashboard
  (rha-dashboard repo) persists these to `rha_leads.suburb_id/suburb_name`
  (migration `20260812_rha_leads_suburb.sql`) and syncs a `SUBURB` attribute to Brevo.
- The global newsletter `ExitIntentModal` never fires on `/suburbs` pages — the
  suburb page runs its own scorecard recapture instead.

## Marketing consent forwarding

The newsletter signup route forwards `marketingOptIn: true` to `/api/public/leads`
when a reader explicitly subscribes. `rha-dashboard` treats all public-lead emails
as opted-in by default (confirmation happens upstream), so omitting the flag also
records consent unless the address is already restricted.

## Street Score ("Your street, versus its suburb")
- Data layer: `lib/streets.js`. Every G-NAF street in a suburb is scored with rhi's
  street score (= `sweetspot_score`, rhi `SearchController::helperCalculateScoreSweetspot`
  + `AbsHelpers::buildOutArea`): address → `gnaf_aug_2024` 2021 mesh block → SA1;
  per SA1 owner-occ > 65% & public housing ≤ 5% (rhi.`2021Census_G37_AUST_SA1`), then
  SA1 rent/yield (`warehouse.Production_sa1_yield`) vs suburb median rent/yield
  (`warehouse.hpc_rent`/`hpc_yield`, type='ssc') → 100/75/50/25/0; street = address-weighted
  mean. Covers streets with no listing history. Listing evidence comes from
  `real_estate.daily_property_bake` sampled on the 1st of each of the last 36 months.
- **DB gotchas:** `daily_property_bake.ssc_id` is VARCHAR — bind it as a STRING or MySQL
  full-scans 154M rows. Any range scan of the bake is too slow for a request. Heavy
  queries carry `/*+ MAX_EXECUTION_TIME(...) */`; killing node does NOT cancel a running
  Aurora query.
- **Bake first, compute live as fallback.** `npm run bake:streets` (`scripts/bake-streets.mjs`,
  nightly via `.github/workflows/bake-streets.yml`, needs `RIPEHOUSE_DB_*` repo secrets) writes
  `warehouse.street_score_bake` + `street_score_suburb_bake` using the same `computeSuburbStreets`.
  `getSuburbStreets` reads the bake when < 45 days old (~10ms; ~300ms page cold) else computes
  live (~1–6s). The bake also drives national/state percentiles (`getStreetContext`, shown once
  ≥300k streets are baked), the street sitemaps (`app/streets/sitemap.js`, batches listed in
  `robots.js`) and `countIndexableStreets`. First full national pass takes a few nights
  (180-min budget, stalest suburbs first); `--all` / `--suburb vic/frankston` for manual runs.
- Gate + Street Review copy is in the panel-variant system: `panel-street-report`,
  `panel-street-review` (`content/panels/*.json` defaults; tokens `{street}` `{suburb}` `{segment}`).
  Mobile: the gate is a bottom sheet + sticky CTA (`useIsMobile` via `useSyncExternalStore`).
  Hero visuals (`StreetVisuals.js`) render final values on the server and animate in on intersect.
- Pages: `/streets` (2-step search), `/streets/[state]/[suburb]` (street list),
  `/streets/[state]/[suburb]/[street]` (Layer 0 free: score, verdict, street-vs-suburb
  comparison, 4 tests, 3 stats; noindex + no verdict when `confidence: low`).
- APIs: `GET /api/suburbs/[id]/streets`, `POST /api/streets/[key]/report` (Layer 1, segment-
  branched buying/own/rent/curious, shares the `rha_suburb_unlock` cookie, 8 streets/IP/day),
  `POST /api/streets/[key]/review` (Layer 2 phone + separate unticked SMS / call-incl-AI
  consents, wording in `lib/streetShared.js` with `CONSENT_VERSION`), `POST /api/streets/profile`
  (progressive profiling → dashboard Investor Motivation, fill-blanks only),
  `GET /api/og/street/[key]`. Street key = `<sscId>~<street-slug>`.
- Campaign links (`lib/campaignLinks.js`): `/go/yt/<videoId>?s=<state>/<suburb>[/<street>]&c=<campaign>`
  and `/go/s/<code>?src=facebook|instagram|linkedin|tiktok|blog|email|other&s=...&c=...` → 302 with
  UTMs + `rha_src`/`rha_ref` (captured in first/last touch, sent as entrySource/entryRef).
- Guest activity: `lib/activity.js` (browser) / `lib/activityServer.js` (server) →
  dashboard `POST /api/ir/activity` → `rha_ir_activity`, linked to the lead on identify.
- Lead path: `leadSource: 'rha-website-street-score'`, `touchExisting: true`, fields
  streetKey/streetName/segment/streetScore/suburbStreetAverage/streetsChecked/suburbsChecked/
  consents/webProfile/entry*; persisted by rha-dashboard `lib/streetScoreCapture.js`.
- `NEXT_PUBLIC_RHA_YOUTUBE_URL` (optional) shows the YouTube link to "curious" visitors.
