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
