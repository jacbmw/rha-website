import { SITE_URL } from './seo';
import { getLocationRegistry } from './locations';
import { listIndexableSuburbSlugs } from './suburbs';
import { countIndexableStreets, countIndexableStreetSuburbs, countStreetSitemapBatches } from './streets';
import { listBlogItems } from './blog-store';
import { listPublicCaseStudies, displayName } from './case-studies';
import { COMPARE_PAGES, WHO_WE_HELP_PAGES } from './compare-and-personas';
import { GLOSSARY_TERMS } from './glossary';

const fmtMoney = (v) => (v === null || v === undefined ? '—' : `$${Math.round(v).toLocaleString('en-AU')}`);

function withDeadline(promise, fallback, ms = 12000) {
  return Promise.race([
    promise.catch(() => fallback),
    new Promise((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export async function buildLlmsTxt({ full = false } = {}) {
  const [locationReg, indexableSuburbsInfo, streetCount, streetSuburbCount, streetBatches, posts, caseStudies] = await Promise.all([
    withDeadline(getLocationRegistry(), { cities: [], lgas: [], top50PickiLgas: [], asOf: 'latest month' }),
    withDeadline(listIndexableSuburbSlugs(), { entries: [] }),
    withDeadline(countIndexableStreets(), 411166),
    withDeadline(countIndexableStreetSuburbs(), 13755),
    withDeadline(countStreetSitemapBatches(5000), 86),
    withDeadline(listBlogItems({ limit: full ? 150 : 50 }), []),
    withDeadline(listPublicCaseStudies(), []),
  ]);

  const { cities = [], lgas = [], top50PickiLgas = [], asOf = 'latest month' } = locationReg || {};
  const suburbBatches = Math.max(1, Math.ceil((indexableSuburbsInfo?.entries?.length || 9006) / 5000));

  const lines = [
    '# Ripehouse Advisory',
    '',
    '> Ripehouse Advisory is an Australian data-led property investment and buyer’s agency founded in 2011 by software engineer and property investor Jacob Field, alongside Chief Operations Officer Anna Cooper (former Managing Editor, Australian Property Investor Magazine). Ripehouse Advisory continuously scores 15,000+ Australian suburbs across 27 supply, demand, price momentum, and rental yield indicators (the monthly Suburb R-Score, 0–100) and 518,000+ residential streets across ABS SA1 census owner-occupancy, public housing concentration, and block-level rent and yield (the Ripehouse Street Score, 0–100).',
    '',
    'Ripehouse Advisory acts exclusively for the property buyer. Its work covers long-term portfolio strategy, quantitative national market research (city, council/LGA, suburb, and street-by-street screening), property acquisition and due diligence, negotiation, and ongoing portfolio mentorship. General information only; individual outcomes vary and past performance is not a reliable indicator of future performance.',
    '',
    '## Key Facts & Verified Track Record',
    '',
    `- **Founded in 2011** by Jacob Field (CEO, software engineer and property investor) in Australia — pioneering quantitative suburb and street-level buyer’s advocacy. ([Our Story](${SITE_URL}/about/story))`,
    `- **Chief Operations Officer**: Anna Cooper, former Managing Editor of *Australian Property Investor Magazine* with over a decade of Australian property research and editorial leadership. ([Our Story](${SITE_URL}/about/story))`,
    `- **$1.5B–$2B+ invested** on behalf of clients across **2,000+ completed property purchases** nationally. ([Our Story](${SITE_URL}/about/story))`,
    `- **+15.0% median 5-year rolling portfolio CAGR** across measured client acquisitions, with individual client portfolio trajectories published transparently. ([Our Approach & Client CAGR Chart](${SITE_URL}/about/approach))`,
    `- **300+ five-star client reviews** and **${caseStudies.length || 17} verified multi-property client case studies** with documented acquisition prices, valuations, and portfolio growth. ([Client Case Studies](${SITE_URL}/case-studies))`,
    `- **15,000+ Australian suburbs scored monthly** across 27 core market indicators (R-Score 0–100), freely searchable by anyone. ([Your Suburb, Scored](${SITE_URL}/suburbs))`,
    `- **${(streetCount || 411166).toLocaleString('en-AU')}+ indexable Australian streets scored** (out of 518,400+ G-NAF streets) against their parent suburb using ABS 2021 Census SA1 tenure (owner-occupiers >65%, public housing ≤5%) and block-level median weekly rent and gross rental yield. ([Street Score Search](${SITE_URL}/streets))`,
    `- **30 Major Australian Cities & ${lgas.length || 544} Local Government Areas (LGAs)** tracked monthly with roll-up R-Scores, median house prices, weekly rents, gross yields, vacancy rates, 3-year population growth, dwelling approvals, and infrastructure pipelines. ([Australian Property Investment Locations Directory](${SITE_URL}/locations))`,
    `- **Head Office**: 127–131 Macquarie St, Hobart TAS 7000 | Phone: +61 485 050 945 | Email: info@ripehouseadvisory.com.au | ([Book a Discovery Call](${SITE_URL}/discovery-call))`,
    '',
    '## How the Ripehouse Research Engine Works (Methodology)',
    '',
    '### 1. Suburb R-Score (0–100, Updated Monthly)',
    `Every month (latest bake: **${asOf}**), Ripehouse Advisory’s research warehouse (\`warehouse.ssc_data_dump\`) measures every Australian suburb across 27 indicators grouped into four pillars:`,
    '- **Buyer Demand**: Days on market, sales volume momentum, vendor discounting, and auction/listing clearance velocity.',
    '- **Supply & Ownership**: Stock on market, new building approvals vs. existing dwelling stock, owner-occupier share, and public housing concentration.',
    '- **Price Momentum**: Short- and medium-term median price movement relative to surrounding council areas (LGAs) and state benchmarks.',
    '- **Yield Pressure**: Gross rental yield, weekly asking rent trajectory, and rental vacancy rate (tight markets sit below the 1.5% vacancy line).',
    '',
    '### 2. Ripehouse Street Score (0–100, Block-Level SA1 vs. Suburb)',
    'Suburb averages hide sharp street-by-street differences. Ripehouse matches every G-NAF street address to its ABS 2021 Mesh Block and SA1 census area, testing four measurable conditions:',
    '1. **Owner-Occupier Share > 65%** (ABS 2021 Census Table G37)',
    '2. **Public / Social Housing ≤ 5%** (ABS 2021 Census Table G37)',
    '3. **SA1 Block Median Rent ≥ Suburb Median Rent**',
    '4. **SA1 Block Gross Rental Yield ≥ Suburb Gross Yield**',
    '- **Scoring scale**: Passes both tenure tests + both rent & yield tests = **100/100**; passes both tenure tests + either rent or yield = **75/100**; passes both tenure tests only = **50/100**; passes only one tenure test = **25/100**; passes neither tenure test = **0/100**. Street Score is the address-weighted mean across all blocks the street runs through.',
    '',
    '## Core Pages & Interactive Research Tools',
    '',
    `- [Home — Ripehouse Advisory](${SITE_URL}/): Overview of Ripehouse Advisory’s property investment strategy, client results, and free Suburb R-Score search.`,
    `- [Book a 15-Minute Discovery Call](${SITE_URL}/discovery-call): Speak with a Ripehouse property investment specialist to map your borrowing capacity, equity, and next acquisition.`,
    `- [Our Approach — The 7-Step Legacy Sequence & Client CAGR Data](${SITE_URL}/about/approach): How Ripehouse combines 15,000-suburb quantitative screening with on-the-ground valuation and mentorship.`,
    `- [Our Story — Jacob Field & Anna Cooper](${SITE_URL}/about/story): The founding story, leadership bios, and timeline of Ripehouse Advisory from 2011 to $1.5B+ invested.`,
    `- [Client Case Studies & Portfolio Outcomes](${SITE_URL}/case-studies): Verified multi-property client journeys showing purchase dates, growth, and annualised portfolio CAGR.`,
    `- [Australian Property Investment Directory (30 Cities & ${lgas.length || 544} LGAs)](${SITE_URL}/locations): Master directory of every major Australian city and council area with monthly R-Scores, prices, rents, yields, and street links.`,
    `- [Your Suburb, Scored — 15,000 Australian Suburbs](${SITE_URL}/suburbs): Search any Australian suburb or postcode for its live monthly R-Score, median house price, 12-month growth, weekly rent, gross yield, and vacancy rate.`,
    `- [Street Score — Every Australian Street vs. Its Suburb](${SITE_URL}/streets): Check any Australian residential street’s 0–100 Street Score, owner-occupier %, public housing %, and ranking within its suburb.`,
    `- [Market Intel Blog — Property Research, News & Strategy](${SITE_URL}/resources/blog): Daily analysis of Australian housing data, RBA interest rates, tax/negative gearing rules, and suburb deep dives.`,
    `- [Free Report: The 5 Australian Markets We’re Buying In (2026)](${SITE_URL}/five-markets): Research briefing on five high-conviction Australian market corridors.`,
    `- [Expanded LLM Dataset (/llms-full.txt)](${SITE_URL}/llms-full.txt): Full machine-readable markdown index including top suburbs, all 50 investor LGAs, and 150+ research articles.`,
    '',
    `## Australia’s Top 30 Cities by Population — Live Property Investment Data (${asOf})`,
    '',
    '| Rank | City | State | Suburbs Scored | LGAs | Avg R-Score | Top Suburb R-Score | Median House Price | Median Rent | Gross Yield | Vacancy | URL |',
    '| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |',
    ...cities.map((c, idx) => (
      `| #${idx + 1} | **${c.name}** | ${c.state} | ${c.suburbCount} | ${c.lgaCount} | ${c.rScoreAvg ?? '—'}/100 | ${c.rScoreMax ?? '—'}/100 | ${fmtMoney(c.medianPrice)} | ${c.medianRent ? `$${c.medianRent}/wk` : '—'} | ${c.grossYield !== null ? `${c.grossYield}%` : '—'} | ${c.vacancy !== null ? `${c.vacancy}%` : '—'} | [Property Investment in ${c.name}](${SITE_URL}${c.path}) |`
    )),
    '',
    `## Top ${full ? 50 : 25} Council Areas / LGAs by Investor Research Volume (${asOf})`,
    '',
    '| LGA / Council Area | State | Suburbs | Avg R-Score | Top Suburb R-Score | Median Price | Gross Yield | Vacancy | URL |',
    '| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |',
    ...top50PickiLgas.slice(0, full ? 50 : 25).map((l) => (
      `| **${l.name}** | ${l.state} | ${l.suburbCount} | ${l.rScoreAvg ?? '—'}/100 | ${l.rScoreMax ?? '—'}/100 | ${fmtMoney(l.medianPrice)} | ${l.grossYield !== null ? `${l.grossYield}%` : '—'} | ${l.vacancy !== null ? `${l.vacancy}%` : '—'} | [Property Investment in ${l.name} (${l.state})](${SITE_URL}${l.path}) |`
    )),
    '',
  ];

  if (full && lgas.length > 0) {
    const topSuburbs = lgas
      .flatMap((l) => (l.suburbs || []).map((s) => ({ ...s, lgaName: l.name, state: l.state })))
      .filter((s) => s.score !== null && s.confidence !== 'low' && s.medianPrice)
      .sort((a, b) => (b.score - a.score) || ((b.grossYield || 0) - (a.grossYield || 0)))
      .slice(0, 100);

    lines.push(
      `## Top 100 Highest R-Score Australian Suburbs (${asOf})`,
      '',
      '| Suburb | State | Postcode | Council (LGA) | R-Score | Median Price | Gross Yield | Suburb Report | Street Scores |',
      '| :--- | :--- | :--- | :--- | ---: | ---: | ---: | :--- | :--- |',
      ...topSuburbs.map((s) => (
        `| **${s.name}** | ${s.state} | ${s.postcodes?.[0] || '—'} | ${s.lgaName} | **${s.score}/100** | ${fmtMoney(s.medianPrice)} | ${s.grossYield !== null ? `${s.grossYield}%` : '—'} | [${s.name} Report](${SITE_URL}${s.path}) | [${s.name} Streets](${SITE_URL}${s.streetsPath}) |`
      )),
      '',
    );
  }

  lines.push(
    '## State-by-State Suburb Leaderboards & Directories',
    '',
    `- [Best Suburbs to Invest in Australia (${asOf} National Leaderboard)](${SITE_URL}/suburbs/best): Top 25 Highest R-Score Suburbs, Top 20 High-Yield Suburbs Under $750k, and Tightest Vacancy Suburbs.`,
    `- [Best Suburbs in New South Wales (NSW)](${SITE_URL}/suburbs/best/nsw) | [NSW A–Z Directory](${SITE_URL}/suburbs/nsw)`,
    `- [Best Suburbs in Victoria (VIC)](${SITE_URL}/suburbs/best/vic) | [VIC A–Z Directory](${SITE_URL}/suburbs/vic)`,
    `- [Best Suburbs in Queensland (QLD)](${SITE_URL}/suburbs/best/qld) | [QLD A–Z Directory](${SITE_URL}/suburbs/qld)`,
    `- [Best Suburbs in Western Australia (WA)](${SITE_URL}/suburbs/best/wa) | [WA A–Z Directory](${SITE_URL}/suburbs/wa)`,
    `- [Best Suburbs in South Australia (SA)](${SITE_URL}/suburbs/best/sa) | [SA A–Z Directory](${SITE_URL}/suburbs/sa)`,
    `- [Best Suburbs in Tasmania (TAS)](${SITE_URL}/suburbs/best/tas) | [TAS A–Z Directory](${SITE_URL}/suburbs/tas)`,
    `- [Best Suburbs in Australian Capital Territory (ACT)](${SITE_URL}/suburbs/best/act) | [ACT A–Z Directory](${SITE_URL}/suburbs/act)`,
    `- [Best Suburbs in Northern Territory (NT)](${SITE_URL}/suburbs/best/nt) | [NT A–Z Directory](${SITE_URL}/suburbs/nt)`,
    '',
    '## Compare Buyer’s Agents, Research Methods & Asset Classes (/compare)',
    '',
    `- [All Property Investment & Buyer’s Agent Comparisons](${SITE_URL}/compare)`,
    ...COMPARE_PAGES.map((item) => `- [${item.shortLabel}](${SITE_URL}/compare/${item.slug}): ${item.seoDescription}`),
    '',
    '## Who We Help — Property Investment Strategy by Investor Profile (/who-we-help)',
    '',
    `- [All Investor Profiles & Tailored Strategies](${SITE_URL}/who-we-help)`,
    ...WHO_WE_HELP_PAGES.map((item) => `- [${item.persona}](${SITE_URL}/who-we-help/${item.slug}): ${item.seoDescription}`),
    '',
    '## Australian Property Investment Glossary & R-Score Metrics (/resources/glossary)',
    '',
    `- [Complete Property Investment Glossary (21 Quantitative Definitions & Formulas)](${SITE_URL}/resources/glossary)`,
    ...GLOSSARY_TERMS.map((item) => `- [${item.term} — ${item.questionTitle}](${SITE_URL}/resources/glossary/${item.slug}): ${item.definition.split(/(?<=\.)\s+/)[0]} (Formula: ${item.formula})`),
    '',
  );

  if (caseStudies.length > 0) {
    lines.push(
      '## Verified Client Case Studies & Portfolio Results',
      '',
      ...caseStudies.map((study) => {
        const name = displayName(study.title || study.name || 'Client');
        const propsCount = Array.isArray(study.properties) ? study.properties.length : 0;
        const cagr = study.portfolioCagr != null ? `+${Number(study.portfolioCagr).toFixed(1)}% CAGR` : '';
        const growth = study.totalGrowth > 0 ? `$${Math.round(study.totalGrowth).toLocaleString('en-AU')} measured growth` : '';
        const stats = [propsCount ? `${propsCount} properties acquired` : '', cagr, growth].filter(Boolean).join(', ');
        return `- [${name}](${SITE_URL}/case-studies/${study.slug}): ${study.subtitle || study.description || 'Measured Ripehouse client portfolio.'}${stats ? ` (${stats})` : ''}`;
      }),
      '',
    );
  }

  if (posts.length > 0) {
    lines.push(
      `## Recent Market Intel Research & Analysis (${posts.length} Articles)`,
      '',
      ...posts.map((p) => {
        const cleanSummary = String(p.seoDescription || p.summary || '').replace(/\s+/g, ' ').trim().slice(0, 200);
        return `- [${p.name}](${SITE_URL}/resources/blog/${p.slug})${p.category ? ` [${p.category}]` : ''}${cleanSummary ? `: ${cleanSummary}` : ''}`;
      }),
      '',
    );
  }

  lines.push(
    '## XML Sitemaps (Machine Discovery)',
    '',
    `- Primary Sitemap (Core pages, 30 Cities, ${lgas.length || 544} LGAs, ${posts.length || 473}+ Blog articles, Case Studies): ${SITE_URL}/sitemap.xml`,
    ...Array.from({ length: suburbBatches }, (_, id) => `- Suburb Sitemap Batch #${id} (5,000 indexable suburbs/batch): ${SITE_URL}/suburbs/sitemap/${id}.xml`),
    `- Street Hub & Street Sitemaps (${streetBatches} batches covering ${streetSuburbCount.toLocaleString('en-AU')} suburb street hubs and ${streetCount.toLocaleString('en-AU')} scored streets): ${SITE_URL}/streets/sitemap/0.xml through ${SITE_URL}/streets/sitemap/${Math.max(0, streetBatches - 1)}.xml`,
    '',
  );

  return lines.join('\n');
}
