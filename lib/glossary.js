// 25 Australian Property Investment & R-Score / Street-Score Glossary Definitions.
// Built to win Google Featured Snippets, People Also Ask, and LLM / AI Search citations
// by pairing a 3-sentence direct definition + "At a Glance" summary + benchmark table
// with live monthly Ripehouse warehouse data.

export const GLOSSARY_TERMS = [
  {
    slug: 'gross-rental-yield',
    term: 'Gross Rental Yield',
    category: 'Yield & Cashflow',
    questionTitle: 'What is Gross Rental Yield in Australian Property?',
    definition: 'Gross rental yield is the annual rental income a property generates before expenses, expressed as a percentage of the property’s market value or purchase price. To calculate gross rental yield in Australia, multiply the weekly rent by 52, divide by the property price, and multiply by 100. It is one of the 27 core indicators in the monthly Ripehouse Suburb R-Score and one of the four block-level tests in the Ripehouse Street Score.',
    formula: '(Weekly Rent × 52 ÷ Property Price) × 100',
    benchmarkBand: '4.5% – 5.8%+ (Growth Corridor House)',
    atAGlance: [
      'Formula: Annual rent (Weekly rent × 52) divided by property purchase price or current value, expressed as a percentage.',
      'Inner-ring Sydney and Melbourne houses typically yield 2.2%–3.0%, whereas high-R-Score regional cities and outer-metro growth corridors often yield 4.5%–5.8%+.',
      'Gross rental yield plays a critical role in bank serviceability calculators—determining whether you can borrow for Purchase #2 and #3.',
      'In the Ripehouse Street Score, an ABS SA1 census block passes the yield test when its gross yield sits at or above the surrounding suburb median.',
    ],
    compareBars: [
      { label: 'High-Scoring Growth Corridor House (Yield ~5.2%)', value: 86, accent: true, note: 'Strong tenant income supports bank borrowing capacity for your next acquisition' },
      { label: 'National Capital City House Average (Yield ~3.6%)', value: 60, note: 'Moderate rental return relative to purchase price' },
      { label: 'Inner-Ring Blue-Chip House (Yield ~2.4%)', value: 40, note: 'Heavy negative cashflow drain requires large out-of-pocket top-ups' },
    ],
    tableRows: [
      ['5.0% – 6.0%+', 'Strong Cashflow + Serviceability', 'Typical of high-R-Score regional cities and affordable metro corridors ($480k–$750k)'],
      ['3.8% – 4.9%', 'Balanced Growth & Yield', 'Typical of middle-ring capital city suburbs and lifestyle growth corridors ($750k–$1.1M)'],
      ['Under 3.0%', 'Cashflow Intensive', 'Typical of $1.6M+ inner-ring capital city houses where prices have decoupled from rents'],
    ],
    sections: [
      {
        heading: 'Gross rental yield vs net rental yield',
        body: 'Gross rental yield measures raw rental inflow before holding costs. Net rental yield subtracts ongoing ownership expenses—council rates, water service charges, landlord building insurance, property management fees (typically 6%–8% of rent), maintenance, and strata levies (if applicable)—before dividing by the property price. Because freestanding established houses do not pay high-rise body corporate levies, they retain a higher share of gross yield as net income.',
      },
      {
        heading: 'Why chasing ultra-high yield (8%+) without an R-Score is dangerous',
        body: 'Single-industry mining towns can advertise 8%–10% gross yields when commodity prices spike, only to suffer 40% price drops when a project closes. That is why Ripehouse Advisory never screens for gross rental yield in isolation: we require a high overall 27-indicator Suburb R-Score (70+/100), economic diversity, and a 75–100 ABS SA1 Street Score.',
      },
    ],
    liveRankType: 'yield',
  },
  {
    slug: 'rental-vacancy-rate',
    term: 'Rental Vacancy Rate',
    category: 'Supply & Demand',
    questionTitle: 'What is a Rental Vacancy Rate in Australia?',
    definition: 'A rental vacancy rate is the percentage of all formal long-term rental properties in a suburb or city that are currently unoccupied and available for lease for more than 21 days. In Australian residential property analysis, a vacancy rate around 2.5% to 3.0% is considered a balanced market, while anything below 1.5% indicates an acute rental shortage with upward pressure on weekly rents. Ripehouse Advisory tracks suburb-level vacancy monthly across 15,000+ suburbs as a key input to the R-Score.',
    formula: '(Vacant Rental Listings > 21 Days ÷ Total Established Rental Stock) × 100',
    benchmarkBand: 'Under 1.5% (Tight Rental Market)',
    atAGlance: [
      'A vacancy rate below 1.5% signals that tenants are competing for scarce available stock, driving down leasing downtime and pushing weekly asking rents higher.',
      'A balanced Australian rental market historically sits between 2.0% and 3.0% vacancy.',
      'Vacancy rates above 3.5% indicate oversupply—often caused by high-density apartment completions or greenfield house-and-land stage releases.',
      'Ripehouse Advisory uses monthly vacancy rate trajectories inside the Yield Pressure pillar of the 27-indicator Suburb R-Score.',
    ],
    compareBars: [
      { label: 'Tight Rental Supply (Vacancy < 1.0% — Strong Upward Rent Pressure)', value: 94, accent: true, note: 'Properties lease rapidly with multiple qualified tenant applications' },
      { label: 'Balanced Rental Market (Vacancy ~2.5%)', value: 58, note: 'Equilibrium between tenant demand and landlord supply' },
      { label: 'Oversupplied Rental Market (Vacancy > 3.5%)', value: 22, note: 'Landlords must discount weekly rent or offer rent-free weeks to secure tenants' },
    ],
    tableRows: [
      ['0.1% – 1.4%', 'Tight / Undersupplied', 'High tenant competition, rapid leasing times, and rising weekly asking rents'],
      ['1.5% – 2.9%', 'Balanced Equilibrium', 'Normal tenant turnover with stable weekly rents'],
      ['3.0%+', 'Loosening / Oversupplied', 'Extended vacancy periods; common in high-rise apartment precincts'],
    ],
    sections: [
      {
        heading: 'Why vacancy rates lead capital growth in affordable corridors',
        body: 'When a suburb’s rental vacancy rate drops below 1.0% and stays there for multiple quarters, weekly rents rise sharply. As rents climb, two things happen: gross rental yields expand (attracting interstate investors), and local tenants realise that mortgage repayments on a modest house are comparable to their rising weekly rent (converting renters into first-home buyers).',
      },
    ],
    liveRankType: 'vacancy',
  },
  {
    slug: 'suburb-r-score',
    term: 'Ripehouse Suburb R-Score',
    category: 'Ripehouse Methodology',
    questionTitle: 'What is the Ripehouse Suburb R-Score (0–100)?',
    definition: 'The Ripehouse Suburb R-Score is a monthly quantitative rating from 0 to 100 that ranks all 15,000+ Australian suburbs across 27 supply, demand, price momentum, and rental yield indicators. Developed and refined by Ripehouse Advisory since 2011, the R-Score identifies suburbs where buyer demand is accelerating against constrained housing supply. An R-Score of 90 to 100 places a suburb in the top 10% of Australian markets for that month.',
    formula: 'Percentile Rank (0–100) of 27 Weighted Supply, Demand, Momentum & Yield Indicators',
    benchmarkBand: '75 – 100 / 100 (Warm to Strongest Market Band)',
    atAGlance: [
      'Measures 15,000+ Australian suburbs every month across four pillars: Buyer Demand, Supply & Ownership, Price Momentum, and Yield Pressure.',
      'Replaces media hotspot hype and lagging 12-month median price tables with forward-leaning listing, discounting, approval, and vacancy signals.',
      'Suburbs with low data volume or thin recent sales are flagged as low-confidence rather than given a misleading verdict.',
      'Freely searchable for any suburb in Australia at ripehouseadvisory.com.au/suburbs.',
    ],
    compareBars: [
      { label: 'Strongest Market Band (R-Score 90–100)', value: 95, accent: true, note: 'Top tier of the 15,000 Australian suburbs measured this month' },
      { label: 'Warmer Than Most Band (R-Score 70–89)', value: 78, note: 'Demand, supply, and yield indicators sitting above the national midpoint' },
      { label: 'Mixed / Cooling Band (R-Score < 50)', value: 38, note: 'Softer demand or rising supply pipeline relative to national benchmarks' },
    ],
    tableRows: [
      ['90 – 100', 'Strongest Markets', 'Top decile nationally across buyer demand, tight supply, price momentum, and rental tightness'],
      ['70 – 89', 'Warmer Than Most', 'Majority of the 27 indicators tracking above the national median'],
      ['40 – 69', 'Mixed Conditions', 'Some indicators warm (e.g. yield) while others cool (e.g. days on market or new supply)'],
      ['0 – 39', 'Quieter Conditions', 'Loose supply or soft buyer demand this month'],
    ],
    sections: [
      {
        heading: 'The four pillars inside the 27-indicator R-Score',
        body: 'Every monthly bake groups 27 raw and percentile-ranked indicators into four pillars: (1) Buyer Demand—days on market, sales volume momentum, vendor discounting, and clearance pace; (2) Supply & Ownership—stock on market, building approvals relative to dwelling stock, owner-occupier share, and public housing mix; (3) Price Momentum—price trajectory relative to the council area and state; and (4) Yield Pressure—gross rental yield, weekly rent growth, and vacancy rate.',
      },
    ],
    liveRankType: 'rscore',
  },
  {
    slug: 'street-score',
    term: 'Ripehouse Street Score',
    category: 'Ripehouse Methodology',
    questionTitle: 'What is the Ripehouse Street Score (0–100)?',
    definition: 'The Ripehouse Street Score is a 0-to-100 block-level rating that measures how an individual Australian residential street compares with the rest of its suburb across four tests: owner-occupier share (>65%), public housing concentration (≤5%), median weekly rent, and gross rental yield. Every G-NAF address on the street is matched to its ABS 2021 Mesh Block and SA1 census area, and the Street Score is the address-weighted average across those blocks. It covers 518,400+ Australian streets, including quiet streets with no recent sales history.',
    formula: 'Address-Weighted Mean of ABS SA1 Block Scores (100 / 75 / 50 / 25 / 0)',
    benchmarkBand: '75 – 100 / 100 (Strong Street Profile)',
    atAGlance: [
      'Tests every ABS SA1 block along a street against 4 rules: Owner-occupiers >65%, Public housing ≤5%, Block rent ≥ Suburb rent, and Block yield ≥ Suburb yield.',
      'A block scores 100 when all 4 tests pass; 75 when both tenure tests + 1 market test pass; 50 when both tenure tests pass; 25 when only 1 tenure test passes; 0 when neither tenure test passes.',
      'Across 411,000+ high-confidence Australian streets, only ~35% achieve a Street Score of 75 or higher.',
      'Free to check for any street in Australia at ripehouseadvisory.com.au/streets.',
    ],
    compareBars: [
      { label: '100/100 Street Score (Passes All 4 Tenure, Rent & Yield Tests)', value: 100, accent: true, note: 'Owner-occ >65%, public housing ≤5%, and both rent & yield beat the suburb median' },
      { label: '75/100 Street Score (Passes Both Tenure Tests + Rent or Yield)', value: 75, note: 'Top ~35% of Australian residential streets' },
      { label: '0–25/100 Street Score (Fails Tenure Thresholds)', value: 25, note: 'Indicates high public housing (>5%) or low owner-occupation (≤65%) on the block' },
    ],
    tableRows: [
      ['100 / 100', 'All 4 Tests Pass', 'Owner-occupiers >65%, public housing ≤5%, SA1 rent ≥ suburb median, SA1 yield ≥ suburb median'],
      ['75 / 100', '3 of 4 Tests Pass', 'Passes both ABS Census tenure tests plus either the rent or yield test'],
      ['50 / 100', 'Tenure Tests Pass Only', 'Owner-occupiers >65% and public housing ≤5%, but rent and yield sit below suburb median'],
      ['0 – 25 / 100', 'Tenure Test Failure', 'One or both tenure tests fail (owner-occupiers ≤65% or public housing >5%)'],
    ],
    sections: [
      {
        heading: 'Why street-level scoring matters more than suburb averages',
        body: 'In almost every Australian suburb, public housing and high-density rental flats are clustered into specific ABS SA1 census blocks rather than spread evenly. A buyer relying only on a suburb’s median price can inadvertently buy right inside a 20%-public-housing block. Checking the Street Score before inspecting a property surfaces that block-level reality immediately.',
      },
    ],
    liveRankType: 'rscore',
  },
  {
    slug: 'days-on-market',
    term: 'Days on Market (DOM)',
    category: 'Buyer Demand',
    questionTitle: 'What is Days on Market (DOM) in Australian Real Estate?',
    definition: 'Days on Market (DOM) measures the median number of calendar days a residential property spends actively listed for sale on portals before going under contract or selling at auction. Falling Days on Market (for example, dropping from 55 days to 22 days) is one of the earliest quantitative signals that buyer demand is outstripping available listings in a suburb. Ripehouse Advisory tracks DOM levels and 12-month DOM momentum across 15,000+ suburbs in the monthly R-Score.',
    formula: 'Contract / Sale Date − Initial Public Listing Date (Median Across Settled Sales)',
    benchmarkBand: 'Under 30 Days (Fast-Moving Seller’s Market)',
    atAGlance: [
      'Under 25–30 days on market typically indicates strong buyer urgency and limited negotiation discounting.',
      '45 to 75+ days on market indicates a slower, buyer-favoured market where purchasers have time to negotiate price and conditions.',
      'Ripehouse tracks both the absolute DOM reading and the rate of change in DOM to catch turning points early.',
      'Displayed on every Ripehouse Suburb and Council (LGA) research page.',
    ],
    compareBars: [
      { label: 'Hot Seller’s Market (14–25 Days on Market — High Buyer Competition)', value: 90, accent: true, note: 'Listings sell rapidly, often with multiple competing offers' },
      { label: 'Balanced Market (35–48 Days on Market)', value: 58, note: 'Normal campaign duration for private treaty sales' },
      { label: 'Buyer’s Market (65+ Days on Market — High Negotiation Leverage)', value: 28, note: 'Stale stock gives buyers leverage on price, finance, and building clauses' },
    ],
    tableRows: [
      ['Under 28 days', 'High Buyer Demand', 'Fast absorption of new listings; upward pressure on sale prices'],
      ['28 – 50 days', 'Balanced Absorption', 'Standard 4-to-6 week marketing campaign length'],
      ['Over 55 days', 'Slow Absorption / Buyer Leverage', 'Vendors often discount asking guides to meet the market'],
    ],
    sections: [
      {
        heading: 'How to use Days on Market when negotiating',
        body: 'In a suburb where median Days on Market is 21 days, hesitating for two weeks means losing A-grade properties. Conversely, when a specific listing has been on the market for 75 days in a 35-day suburb, or when an entire LGA’s DOM rises above 60 days, buyers gain substantial leverage to negotiate below the price guide and attach protective contract conditions.',
      },
    ],
    liveRankType: 'rscore',
  },
  {
    slug: 'owner-occupier-ratio',
    term: 'Owner-Occupier Ratio',
    category: 'Supply & Ownership',
    questionTitle: 'What is the Owner-Occupier Ratio in Property Investing?',
    definition: 'The owner-occupier ratio is the percentage of occupied private dwellings in a suburb or ABS SA1 census block that are lived in by the people who own them (either outright or with a mortgage), rather than rented to tenants. Ripehouse Advisory’s Street Score requires an owner-occupier ratio above 65% at the SA1 block level because homeowners maintain their streetscapes, hold properties longer, and bid emotionally when buying.',
    formula: '(Owned Outright + Owned with a Mortgage) ÷ Total Occupied Dwellings × 100',
    benchmarkBand: '> 65% Owner-Occupied (Ripehouse Street Test)',
    atAGlance: [
      'Investors should buy where owner-occupiers want to live: owner-occupiers make up ~66% of the Australian housing market and drive long-term capital growth.',
      'Streets with >65% owner-occupiers show higher pride of ownership, better garden and facade upkeep, and lower turnover.',
      'Streets dominated by >50% renters (often investor-heavy new estates or unit blocks) experience higher listing volatility during downturns.',
      'Measured directly from ABS 2021 Census Table G37 at the SA1 block level on every Ripehouse Street Score page.',
    ],
    compareBars: [
      { label: 'High Owner-Occupier Street (72%–88% Homeowners —Passes Ripehouse Test)', value: 92, accent: true, note: 'Tightly held street where emotional homebuyers drive resale prices' },
      { label: 'Ripehouse Minimum Street Threshold (65% Owner-Occupiers)', value: 65, note: 'Cut-off line used in the Ripehouse Street Score' },
      { label: 'Investor-Dominated Rental Strip (< 45% Owner-Occupiers)', value: 35, note: 'Higher tenant churn and price sensitivity during rate hikes' },
    ],
    tableRows: [
      ['70% – 85%+', 'Tightly Held Homeowner Pocket', 'Strong street presentation, low stock turnover, deep emotional buyer pool'],
      ['65% – 69%', 'Solid Owner-Occupier Majority', 'Passes the Ripehouse SA1 Street Score tenure threshold'],
      ['Under 65%', 'Renter / Investor Heavy', 'Fails the Ripehouse owner-occupier street test; higher supply elasticity'],
    ],
    sections: [
      {
        heading: 'Why investors want tenants in the suburb, but homeowners on the street',
        body: 'It sounds paradoxical at first: as a landlord you need strong tenant demand, yet you want your house to sit on a street where more than 65% of the neighbours own their homes. The reason is simple—tenants prefer living on quiet, well-kept homeowner streets, and when you eventually sell or revalue the property with a bank valuer, comparable sales set by emotional owner-occupiers achieve higher prices than investor-to-investor sales.',
      },
    ],
    liveRankType: 'rscore',
  },
  {
    slug: 'public-housing-concentration',
    term: 'Public Housing Concentration (SA1)',
    category: 'Supply & Ownership',
    questionTitle: 'How Does Public Housing Concentration Affect Property Values?',
    definition: 'Public housing concentration measures the percentage of dwellings in a census block (ABS SA1) or suburb that are rented from a state housing authority (such as Homes Victoria, Homes NSW, Housing ACT, or Dept of Housing) or community housing provider. While small, dispersed levels of social housing are normal across Australia, concentrated pockets exceeding 5% to 10% in a single SA1 block often correlate with softer capital growth and valuation discounts on adjacent homes. The Ripehouse Street Score tests that public and community housing is 5% or less on the block.',
    formula: '(State Housing Authority + Community Housing Dwellings) ÷ Total Occupied Dwellings × 100',
    benchmarkBand: '≤ 5% per ABS SA1 Block (Ripehouse Street Test)',
    atAGlance: [
      'Suburb-wide public housing figures can look low (e.g. 4%) while hiding a specific street or SA1 block that is 25% public housing.',
      'Ripehouse Advisory’s Street Score tests public and community housing at the granular ABS 2021 Census SA1 level (≤5% threshold).',
      'Checking the Street Score before making an offer prevents interstate buyers from unknowingly purchasing next to a concentrated housing commission cluster.',
      'Published transparently on all 411,000+ indexable Ripehouse street pages.',
    ],
    compareBars: [
      { label: 'Low Public Housing SA1 Block (0% – 5% — Passes Ripehouse Street Test)', value: 95, accent: true, note: 'Meets Ripehouse institutional street-level due diligence standard' },
      { label: 'Moderate Concentration Block (6% – 12%)', value: 45, note: 'Fails the ≤5% SA1 Street Score test; requires manual street inspection' },
      { label: 'High Concentration Estate Block (15%+)', value: 15, note: 'Historically experiences slower capital growth and narrower buyer appeal' },
    ],
    tableRows: [
      ['0% – 5.0%', 'Passes Ripehouse Test', 'Low social-housing concentration at the ABS SA1 census block level'],
      ['5.1% – 10.0%', 'Elevated Concentration', 'Fails automated Street Score test; check exact street pocket carefully'],
      ['Over 10.0%', 'High Concentration Pocket', 'Concentrated state/community housing cluster on the block'],
    ],
    sections: [
      {
        heading: 'Why SA1 block resolution is essential',
        body: 'An ABS Statistical Area Level 1 (SA1) typically covers just a few residential blocks (roughly 100 to 250 homes). Measuring public housing at the SA1 level rather than the whole suburb level is the only quantitative way to spot street-by-street tenure shifts across Australia.',
      },
    ],
    liveRankType: 'rscore',
  },
  {
    slug: 'sa1-statistical-area-level-1',
    term: 'SA1 (Statistical Area Level 1)',
    category: 'Data & Geography',
    questionTitle: 'What is an ABS SA1 (Statistical Area Level 1) in Property Research?',
    definition: 'An SA1 (Statistical Area Level 1) is the second-smallest geographic building block in the Australian Statistical Geography Standard (ASGS) used by the Australian Bureau of Statistics (ABS) to release Census data. Most urban SA1 blocks contain between 200 and 800 residents (roughly 80 to 250 dwellings), making them 20 to 50 times more granular than a whole suburb. Ripehouse Advisory maps every Australian street address via G-NAF to its SA1 block to compute the Ripehouse Street Score.',
    formula: 'ABS ASGS Micro-Area (~200–800 Residents / 1–4 Residential Blocks)',
    benchmarkBand: '~61,800 SA1 Blocks Across Australia',
    atAGlance: [
      'A typical Australian suburb contains 15 to 60 separate SA1 census blocks.',
      'Analyzing data at the SA1 level reveals micro-pockets of high owner-occupancy, higher weekly rents, or concentrated public housing that suburb medians hide.',
      'Ripehouse combines ABS Mesh Blocks, G-NAF geocoded addresses, and SA1 Census & rental yield tables to score 518,400+ streets.',
    ],
    compareBars: [
      { label: 'SA1 Block Resolution (~150 Dwellings per Block)', value: 96, accent: true, note: 'Captures street-by-street differences in tenure, rent, and yield' },
      { label: 'Suburb / SSC Resolution (~4,000 Dwellings)', value: 55, note: 'Useful for macro market timing (R-Score), too broad for street selection' },
      { label: 'Postcode / LGA Resolution (~25,000+ Dwellings)', value: 25, note: 'Blends multiple distinct suburbs and demographics together' },
    ],
    tableRows: [
      ['Mesh Block (MB)', '~30 – 60 dwellings', 'Smallest ABS geographic unit; used by Ripehouse to link G-NAF addresses to SA1s'],
      ['SA1 (Statistical Area 1)', '~80 – 250 dwellings', 'Granular block level used for the Ripehouse Street Score (tenure, rent & yield)'],
      ['SSC / SAL (Suburb)', '~500 – 15,000 dwellings', 'Suburb level used for the monthly 27-indicator Ripehouse R-Score'],
      ['LGA (Council Area)', '~5,000 – 500,000 dwellings', 'Local Government Area used for infrastructure, building approvals & council analysis'],
    ],
    sections: [
      {
        heading: 'How G-NAF, Mesh Blocks, and SA1s connect on every Street Score page',
        body: 'When you look up a street on ripehouseadvisory.com.au/streets, you will see a provenance line such as “42 addresses across 2 census blocks.” Our warehouse matches every individual house number on that street in the Geocoded National Address File (G-NAF) to its 2021 ABS Mesh Block, rolls those up into their parent SA1 blocks, and calculates an address-weighted score across the exact blocks that street runs through.',
      },
    ],
    liveRankType: 'rscore',
  },
  {
    slug: 'loan-to-value-ratio-lvr',
    term: 'Loan-to-Value Ratio (LVR)',
    category: 'Finance & Structure',
    questionTitle: 'What is Loan-to-Value Ratio (LVR) in Australia?',
    definition: 'Loan-to-Value Ratio (LVR) is the size of a mortgage loan expressed as a percentage of the lender’s formal valuation of the property. For example, borrowing $560,000 to purchase a property valued at $700,000 results in an 80% LVR. In Australia, 80% LVR is the standard threshold above which lenders charge Lenders Mortgage Insurance (LMI), unless the borrower qualifies for a government guarantee or professional LMI waiver.',
    formula: '(Loan Amount ÷ Bank Property Valuation) × 100',
    benchmarkBand: '80% LVR (Standard No-LMI Threshold)',
    atAGlance: [
      'At 80% LVR, your deposit (or usable equity split) covers 20% of the property value plus stamp duty and acquisition costs.',
      'Borrowing at 88%–90% LVR incurs Lenders Mortgage Insurance (LMI) for investors, but allows you to enter a rising market or keep a larger cash buffer.',
      'When your property grows in value, your LVR drops—allowing you to refinance back up to 80% LVR and release usable equity for your next purchase.',
    ],
    compareBars: [
      { label: '80% LVR Standard Investor Structure (Zero LMI + Optimal Rate Tier)', value: 88, accent: true, note: 'Avoids LMI and unlocks standard bank interest rate pricing' },
      { label: '88%–90% LVR High-Leverage Entry (With Capitalised LMI)', value: 70, note: 'Useful when preserving cash buffers or deploying a smaller initial deposit' },
      { label: '95% LVR (High Repayment Load & Negative Equity Vulnerability)', value: 30, note: 'Leaves minimal equity buffer if the broader market softens' },
    ],
    tableRows: [
      ['≤ 80% LVR', 'No LMI Standard Tier', 'Preferred structure for equity releases and multi-property scaling'],
      ['81% – 90% LVR', 'LMI / Medico Waiver Tier', 'Incurs LMI (unless eligible for a doctor/professional LMI waiver)'],
      ['> 90% LVR', 'High LVR Restricted Tier', 'Generally restricted to first-home owner schemes or medico policies'],
    ],
    sections: [
      {
        heading: 'How LVR drives equity recycling in the Legacy Sequence',
        body: 'Suppose you buy a $600,000 house with a $480,000 loan (80% LVR). Over three years in a high-R-Score suburb, the property revalues to $780,000. At 80% of the new valuation ($624,000), you have created $144,000 in new usable equity ($624,000 − $480,000) that can be drawn as a separate loan split to fund the 20% deposit on your next investment property.',
      },
    ],
    liveRankType: 'yield',
  },
  {
    slug: 'usable-home-equity',
    term: 'Usable Home Equity',
    category: 'Finance & Structure',
    questionTitle: 'What is Usable Equity and How Do You Calculate It?',
    definition: 'Usable equity is the portion of your property’s equity that a bank will actually allow you to borrow against without paying Lenders Mortgage Insurance—typically calculated as 80% of the property’s current bank valuation minus your existing loan balance. It differs from total paper equity, which is the full market value minus your debt. Australian homeowners routinely use a standalone usable-equity loan split to fund the 20% deposit and stamp duty for an investment property.',
    formula: '(Current Property Value × 0.80) − Existing Mortgage Balance',
    benchmarkBand: '$150,000+ Usable Equity (Typical Investor Launchpad)',
    atAGlance: [
      'Example: If your home is worth $1,000,000 and your mortgage is $500,000, your total equity is $500,000, and your usable equity at 80% LVR is $300,000 ($800,000 − $500,000).',
      'Accessing usable equity requires both sufficient property valuation AND sufficient household income (borrowing serviceability) to support the new loan.',
      'Always establish a separate loan split for investment equity rather than mixing it into your home loan.',
    ],
    compareBars: [
      { label: 'Total Paper Equity (100% Valuation − Debt)', value: 100, note: 'Only accessible in full if you sell the property' },
      { label: 'Usable Equity at 80% LVR ((Valuation × 0.80) − Debt)', value: 80, accent: true, note: 'The capital you can unlock via refinance without selling or paying LMI' },
    ],
    tableRows: [
      ['Home Value: $800k | Loan: $450k', 'Total Equity: $350k', 'Usable Equity (at 80% LVR): $190,000'],
      ['Home Value: $1.1M | Loan: $550k', 'Total Equity: $550k', 'Usable Equity (at 80% LVR): $330,000'],
      ['Home Value: $1.5M | Loan: $700k', 'Total Equity: $800k', 'Usable Equity (at 80% LVR): $500,000'],
    ],
    sections: [
      {
        heading: 'Why you should never invest 100% of your usable equity',
        body: 'Just because a bank will release $300,000 of usable equity does not mean all $300,000 should go into a deposit. Ripehouse Advisory always sizes your purchase so a dedicated cash/redraw reserve remains untouched for interest-rate movements, maintenance, and peace of mind.',
      },
    ],
    liveRankType: 'rscore',
  },
  {
    slug: 'borrowing-capacity-serviceability',
    term: 'Borrowing Capacity (Serviceability)',
    category: 'Finance & Structure',
    questionTitle: 'What is Borrowing Capacity (Serviceability) in Australia?',
    definition: 'Borrowing capacity—called serviceability by lenders—is the maximum loan amount a bank calculates you can afford to repay based on your post-tax income, existing debts, living expenses (HEM), and Rental income, tested at the APRA serviceability buffer (currently the actual interest rate plus 3.0%). In modern Australian property investing, borrowing capacity is a scarcer resource than equity. Protecting and expanding your serviceability through strong rental yields is essential to scaling past one or two properties.',
    formula: 'Net Assessed Income (incl. Shaded Rent) − Living Expenses − Existing Debt @ (Actual Rate + 3% Buffer)',
    benchmarkBand: '+3.0% APRA Stress-Test Buffer Above Actual Mortgage Rate',
    atAGlance: [
      'When you apply for a 6.2% mortgage, Australian banks test whether you can afford repayments at ~9.2% (actual rate + 3% APRA buffer).',
      'Most lenders shade (discount) gross rental income by 20% to account for rates, insurance, and management fees.',
      'Credit card limits—even with a $0 balance—reduce borrowing capacity by roughly $4 to $5 for every $1 of credit limit.',
      'Buying a high-yielding house (5.0%+ gross yield) preserves far more borrowing capacity for your next purchase than a 2.5%-yielding property.',
    ],
    compareBars: [
      { label: 'Portfolio Built with 5.0%+ Yield & Clean Debt Structure', value: 90, accent: true, note: 'Strong rental inflows help offset the bank’s +3% APRA stress-test buffer' },
      { label: 'Portfolio With Low-Yield Assets & Unused Credit Card Limits', value: 35, note: 'Hits the bank serviceability ceiling after 1–2 purchases' },
    ],
    tableRows: [
      ['APRA Serviceability Buffer', '+3.0% above loan rate', 'Banks test your repayments at ~9.0%–9.5% p.a.'],
      ['Rental Income Shading', '70% – 80% of gross rent', 'Banks only count 70%–80% of the weekly rent towards your income'],
      ['Unused Credit Card Limits', '~5x limit reduction', 'A $20,000 credit card limit can cut borrowing capacity by ~$90,000–$100,000'],
    ],
    sections: [
      {
        heading: 'Why borrowing capacity is part of property selection',
        body: 'Every property you buy changes how the bank views your next application. If you buy a $1.2M property yielding 2.7%, your borrowing capacity drops sharply. If you buy a $650,000 house in an 85+ R-Score corridor yielding 5.4%, the rental income covers a much larger share of the bank’s shaded serviceability calculation.',
      },
    ],
    liveRankType: 'yield',
  },
  {
    slug: 'offset-account-vs-redraw',
    term: 'Offset Account vs Redraw Facility',
    category: 'Finance & Structure',
    questionTitle: 'What is the Difference Between an Offset Account and Redraw in Australia?',
    definition: 'An offset account is a separate transactional bank account linked to your mortgage whose balance reduces the loan principal on which daily interest is calculated, whereas a redraw facility holds extra repayments directly inside the loan account itself. While both reduce the interest you pay by the exact same dollar amount, an offset account is legally separate cash (preserving future tax deductibility if your home ever becomes an investment property), whereas redrawing funds from a loan is treated by the ATO as new borrowing.',
    formula: 'Daily Interest = (Loan Balance − Offset Balance) × (Annual Interest Rate ÷ 365)',
    benchmarkBand: '100% Offset Preferred for Future Rentvestors / Upgraders',
    atAGlance: [
      'Dollar for dollar, $50,000 in a 100% offset account saves the exact same mortgage interest as $50,000 paid into redraw.',
      'Crucial tax difference: if you ever move out of your current home and turn it into an investment property, money pulled out of an offset account for your new home keeps the original loan tax-deductible; pulling money out of redraw does not.',
      'Some lenders (such as ANZ) calculate minimum monthly repayments on the full contracted balance even when you have a large redraw buffer.',
    ],
    compareBars: [
      { label: '100% Offset Account (Full Tax-Deductibility Flexibility + Instant Cash Access)', value: 96, accent: true, note: 'Essential if you may ever upgrade your home and keep the first property as a rental' },
      { label: 'Redraw Facility (Same Interest Saving, Lower Tax & Repayment Flexibility)', value: 55, note: 'Redrawing for personal use permanently taints the loan’s tax deductibility' },
    ],
    tableRows: [
      ['Legal Nature of Funds', '100% Offset: Your cash in a deposit account', 'Redraw: Extra repayments reducing the loan debt'],
      ['Turning Home into a Rental Later', 'Offset: Preserves full deductible loan balance', 'Redraw: Paid-down principal cannot be redrawn for a new home tax-deductibly'],
      ['Access & Liquidity', 'Offset: Instant EFTPOS / transfer access', 'Redraw: Subject to lender redraw rules and minimum repayment recalculations'],
    ],
    sections: [
      {
        heading: 'The costly mistake future upgraders make with redraw',
        body: 'Many young homeowners pay an extra $150,000 directly into their home loan (redraw), then decide five years later to redraw that $150,000 as a deposit on a larger family home while keeping their first home as an investment property. Under ATO tax rulings, because the $150,000 was redrawn to buy a private family home, the interest on that $150,000 is NOT tax-deductible against the rental property. Had that $150,000 sat in a 100% offset account instead, the entire original loan would have remained tax-deductible when the property became a rental.',
      },
    ],
    liveRankType: 'rscore',
  },
  {
    slug: 'negative-gearing-vs-positive-cashflow',
    term: 'Negative Gearing vs Positive Cashflow',
    category: 'Tax & Cashflow',
    questionTitle: 'What is Negative Gearing vs Positive Cashflow in Australia?',
    definition: 'A property is negatively geared when its deductible annual rental expenses and loan interest exceed the gross rental income it generates, creating a net rental loss that can generally be offset against the owner’s other taxable income under Australian tax law. A property is positively geared (or positive cashflow) when its rental income exceeds all interest and operating expenses, putting net cash in the owner’s pocket each year. Ripehouse Advisory treats negative gearing as a temporary tax outcome—never a reason to buy an underperforming asset.',
    formula: 'Net Position = Annual Gross Rent − (Loan Interest + Council Rates + Insurance + Management + Maintenance)',
    benchmarkBand: 'Balanced Yield (4.5%–5.8%) + High Capital Growth R-Score',
    atAGlance: [
      'Negative gearing is a tax rule, not an investment strategy: losing $1.00 to get back $0.32–$0.47 from the ATO still leaves you out of pocket unless the land grows strongly.',
      'Conversely, chasing high positive cashflow in a stagnant one-industry town sacrifices the leveraged capital growth that actually builds net wealth.',
      'The optimal middle ground is a high-R-Score growth suburb with a 4.5%–5.8% gross yield—where rising rents push the property from mildly negatively geared into positive cashflow within a few years.',
    ],
    compareBars: [
      { label: 'High-R-Score Growth + 5.0% Yield (Transitions to Positive Cashflow as Rents Rise)', value: 94, accent: true, note: 'Captures strong capital growth without crippling household cashflow' },
      { label: 'Pure Negative Gearing Speculation (2.3% Yield Inner-City Unit/House)', value: 38, note: 'Permanent heavy cashflow loss that caps portfolio scaling' },
    ],
    tableRows: [
      ['Negatively Geared', 'Expenses + Interest > Rent', 'Reduces taxable income today, but requires out-of-pocket cashflow top-ups'],
      ['Neutral / Self-Funding', 'Rent ≈ Expenses + Interest', 'Minimal weekly holding cost while capital growth compounds'],
      ['Positively Geared', 'Rent > Expenses + Interest', 'Generates net taxable income and boosts bank serviceability'],
    ],
    sections: [
      {
        heading: 'How rising rents turn a growth property into a cashflow engine',
        body: 'Yield on cost is what matters over a 10-year hold. If you buy a $600,000 house renting for $600/wk (5.2% yield) in a suburb with a 0.8% vacancy rate, and weekly rent grows at 6% p.a., within five years that property is renting for ~$800/wk—a 6.9% yield on your original purchase price, turning an initially neutral asset into a strong positive-cashflow contributor.',
      },
    ],
    liveRankType: 'yield',
  },
  {
    slug: 'compound-annual-growth-rate-cagr',
    term: 'Compound Annual Growth Rate (CAGR)',
    category: 'Ripehouse Methodology',
    questionTitle: 'What is CAGR (Compound Annual Growth Rate) in Property Portfolios?',
    definition: 'Compound Annual Growth Rate (CAGR) is the annualised geometric rate of return that measures how fast a property or multi-property portfolio has grown in value per year from its initial purchase date to today. Unlike a simple average or total percentage gain, CAGR accounts for compounding over the exact holding period, allowing fair comparison between a property held for 2 years and one held for 7 years. Across Ripehouse Advisory’s measured client acquisitions, the median 5-year rolling portfolio CAGR is +15.0%.',
    formula: 'CAGR = ((Current Portfolio Value ÷ Initial Purchase Value) ^ (1 ÷ Years Held)) − 1',
    benchmarkBand: '+15.0% Median 5-Year Rolling Client Portfolio CAGR',
    atAGlance: [
      'You can only optimise what you can measure: Ripehouse publishes every measured client portfolio on a live CAGR scatter chart at ripehouseadvisory.com.au/about/approach.',
      'A 10% CAGR doubles a property’s value in ~7.3 years; a 15% CAGR doubles it in ~5.0 years.',
      'Because residential property uses 80%–88% mortgage leverage, a 10%–15% asset CAGR represents a 40%–75%+ annualised return on your invested cash deposit.',
    ],
    compareBars: [
      { label: 'Ripehouse Median 5-Year Rolling Client Portfolio CAGR (+15.0%)', value: 90, accent: true, note: 'Aggregate, anonymised client portfolio tracking (/about/approach)' },
      { label: 'Long-Term Australian Capital City Dwelling Average (~6.8% p.a.)', value: 48, note: 'Passive market-wide average across all suburbs and streets' },
    ],
    tableRows: [
      ['7.2% CAGR', 'Doubles asset value in ~10 years', 'Historical passive Australian housing average'],
      ['10.0% CAGR', 'Doubles asset value in ~7.3 years', 'Outperformance via suburb and street selection'],
      ['15.0% CAGR', 'Doubles asset value in ~5.0 years', 'Ripehouse median 5-year rolling client portfolio benchmark (past performance)'],
    ],
    sections: [
      {
        heading: 'Why we publish our client CAGR chart openly',
        body: 'Most buyer’s agencies cherry-pick three flashy client wins and hide the rest. On our Approach page (/about/approach), every dot on the chart is a measured client portfolio plotted by purchase date and annualised growth rate—because transparent measurement is the only way to hold a research system accountable.',
      },
    ],
    liveRankType: 'rscore',
  },
  {
    slug: 'land-to-asset-ratio',
    term: 'Land-to-Asset Ratio',
    category: 'Asset Selection',
    questionTitle: 'What is Land-to-Asset Ratio in Property Investment?',
    definition: 'Land-to-asset ratio is the proportion of a property’s total market value that comes from the underlying land rather than the physical building structure on top of it. Because scarce urban land appreciates over time while buildings physically depreciate, properties with a high land-to-asset ratio (typically 60% to 75%+ for established freestanding houses) historically deliver stronger long-term capital growth than low-land-content high-rise apartments.',
    formula: '(Underlying Land Value ÷ Total Property Purchase Price) × 100',
    benchmarkBand: '60% – 75%+ (Established Freestanding House)',
    atAGlance: [
      'Land appreciates due to population growth and supply scarcity; buildings depreciate due to physical wear and tear.',
      'Established freestanding houses on 450m²–800m² lots typically carry a 60%–75%+ land-to-asset ratio.',
      'High-rise off-the-plan apartments often carry a 10%–20% notional land-to-asset ratio, with 80%+ tied up in a depreciating concrete structure and strata levies.',
    ],
    compareBars: [
      { label: 'Established Freestanding House (65%–75% Land-to-Asset Ratio)', value: 92, accent: true, note: 'Majority of your capital sits in appreciating land' },
      { label: 'Townhouse / Villa in Small Complex (40%–50% Land Component)', value: 55, note: 'Moderate land share with shared common property' },
      { label: 'High-Rise Apartment (10%–20% Notional Land Component)', value: 18, note: 'Dominated by depreciating building value and ongoing strata levies' },
    ],
    tableRows: [
      ['60% – 80%', 'Established House on Torrens Title', 'Strongest long-term capital growth driver + renovation/value-add flexibility'],
      ['35% – 55%', 'Boutique Townhouse / Villa', 'Moderate land share; check strata fees carefully'],
      ['10% – 25%', 'High-Density Apartment', 'Low land scarcity; vulnerable to new tower supply nearby'],
    ],
    sections: [
      {
        heading: 'Balancing land value with rental yield',
        body: 'If you buy a vacant block of land (100% land-to-asset ratio), you get zero rental income and zero borrowing serviceability. If you buy an established 3- or 4-bedroom house where the land accounts for 65% of the value and the dwelling generates a 5.0% gross rental yield, you get the best of both worlds: appreciating scarce land funded by weekly tenant rent.',
      },
    ],
    liveRankType: 'rscore',
  },
  {
    slug: 'building-approvals-pipeline',
    term: 'Building Approvals Pipeline',
    category: 'Supply & Ownership',
    questionTitle: 'How Do Building Approvals Affect Suburb Property Prices?',
    definition: 'The building approvals pipeline measures the number of new residential dwellings (houses, townhouses, and apartments) approved for construction by local councils and private certifiers over a 12-month period, expressed as a percentage of the area’s existing dwelling stock. A low building approvals ratio (<1.5% of existing stock) indicates constrained future supply that supports price and rent growth, whereas a high ratio (>4%–8% in greenfield estates) warns of incoming supply competition.',
    formula: '(Annual New Dwellings Approved ÷ Existing Total Dwellings) × 100',
    benchmarkBand: '< 1.5% Annual New Supply Addition (Constrained Supply)',
    atAGlance: [
      'Tracked on all 544 Ripehouse Council (LGA) pages and inside the 27-indicator monthly Suburb R-Score.',
      'Even when buyer demand is strong, a suburb surrounded by 5,000 approved greenfield lots can struggle to grow in price because buyers always have a brand-new alternative next door.',
      'Established infill suburbs with <1% annual dwelling additions channel all new buyer demand into the fixed pool of existing homes.',
    ],
    compareBars: [
      { label: 'Supply-Constrained Established Suburb (< 1.2% Annual New Approvals)', value: 92, accent: true, note: 'New demand must bid up existing homes and rentals' },
      { label: 'Moderate Infill Council Area (1.5% – 2.8% Annual Approvals)', value: 60, note: 'Absorbed comfortably when population growth exceeds 2% p.a.' },
      { label: 'Greenfield House & Land Fringe (5%+ Annual Stock Expansion)', value: 22, note: 'Constant developer land releases cap resale prices and rental growth' },
    ],
    tableRows: [
      ['Under 1.5% of stock', 'Tightly Constrained Supply', 'Highly supportive of capital growth and low rental vacancy'],
      ['1.5% – 3.0% of stock', 'Balanced Supply Pipeline', 'Healthy if matched by strong 3-year population growth'],
      ['Over 3.5% of stock', 'Elevated Supply Risk', 'Watch for greenfield stage releases or apartment tower completions'],
    ],
    sections: [
      {
        heading: 'How to check building approvals for any Australian council area',
        body: 'Every one of our 544 Local Government Area research pages (/locations) displays the council’s current annual new dwelling approvals as a percentage of stock alongside its 3-year population growth rate and infrastructure pipeline.',
      },
    ],
    liveRankType: 'vacancy',
  },
  {
    slug: 'vendor-discounting',
    term: 'Vendor Discounting',
    category: 'Buyer Demand',
    questionTitle: 'What is Vendor Discounting in the Australian Property Market?',
    definition: 'Vendor discounting is the average percentage difference between a property’s original advertised asking price and its final settled contract price on private treaty sales. When vendor discounting narrows (for example, from -6.5% to -1.5%, or when homes sell above asking price), it signals that buyer competition is intensifying and sellers hold the upper hand. It is one of the demand indicators tracked monthly in the Ripehouse 27-indicator Suburb R-Score.',
    formula: '((Final Sale Price − Initial Advertised Asking Price) ÷ Initial Asking Price) × 100',
    benchmarkBand: '0% to -2.5% (Tight Seller’s Market)',
    atAGlance: [
      'Narrowing vendor discounts (closer to 0%) alongside falling Days on Market is a reliable early signal of an accelerating suburb.',
      'Wider vendor discounts (-5% to -8%+) show that vendors are having to cut their price expectations to secure a buyer.',
      'Tracking vendor discounting helps our acquisitions team calibrate offer strategy in each council area.',
    ],
    compareBars: [
      { label: 'Tight Seller’s Market (0% to -2% Discounting — Properties Selling at/above Guide)', value: 90, accent: true, note: 'Strong buyer depth absorbing new listings' },
      { label: 'Normal Private Treaty Market (-3.5% to -4.5% Discounting)', value: 58, note: 'Standard negotiation buffer built into asking prices' },
      { label: 'Soft Buyer’s Market (-6.5%+ Discounting)', value: 25, note: 'Motivated sellers accepting substantial reductions below initial guides' },
    ],
    tableRows: [
      ['0% to -2.0%', 'Strong Seller’s Market', 'Properties selling at or above initial asking guides'],
      ['-2.1% to -4.5%', 'Balanced Market', 'Normal room for private treaty price negotiation'],
      ['More than -5.0%', 'Buyer-Favoured Market', 'Substantial negotiation discounts achievable on stale listings'],
    ],
    sections: [
      {
        heading: 'Combining Vendor Discounting with Days on Market',
        body: 'When both Days on Market and Vendor Discounting compress simultaneously over three consecutive monthly bakes, a suburb is transitioning from accumulation to expansion—often months before the lagging 12-month median house price reflects the move.',
      },
    ],
    liveRankType: 'rscore',
  },
  {
    slug: 'cross-collateralisation',
    term: 'Cross-Collateralisation (Cross-Securitisation)',
    category: 'Finance & Structure',
    questionTitle: 'What is Cross-Collateralisation in Australian Mortgages?',
    definition: 'Cross-collateralisation (also called cross-securitisation) is a loan structure where a bank uses more than one property—typically your family home and your investment property—as combined security for the same mortgage facility. While convenient for the bank, cross-collateralisation ties your properties together, allows the lender to offset a valuation drop in one property against the growth of another, and makes selling or refinancing a single property much harder.',
    formula: 'Avoided via Standalone Equity Split (20% Deposit) + Separate 80% Investment Loan',
    benchmarkBand: 'Standalone Uncrossed Loans (Best Practice)',
    atAGlance: [
      'Cross-collateralising gives one bank control over your entire portfolio and your family home.',
      'If you sell one crossed property, the bank can force a revaluation of your other properties and demand that sale proceeds pay down your remaining loans.',
      'The clean alternative: set up a standalone 20% equity split on Property A, and use a separate 80% LVR loan (often with a different lender) for Property B.',
    ],
    compareBars: [
      { label: 'Standalone Uncrossed Loan Structure (Independent Valuations & Refinance Freedom)', value: 96, accent: true, note: 'Protects your family home and lets you harvest equity from individual winners' },
      { label: 'Cross-Collateralised Portfolio at One Bank', value: 22, note: 'Winners are netted off against laggards; bank controls sale proceeds' },
    ],
    tableRows: [
      ['Equity Release Flexibility', 'Standalone: Refinance any single property that grew', 'Crossed: Bank revalues all properties together and nets them off'],
      ['Family Home Protection', 'Standalone: Investment property is secured only by itself + the deposit split', 'Crossed: Family home is directly tied to the investment mortgage'],
      ['Selling a Property', 'Standalone: You keep the net proceeds after clearing that property’s loan', 'Crossed: Bank can retain sale proceeds to reduce your overall LVR'],
    ],
    sections: [
      {
        heading: 'How to structure an equity purchase without cross-collateralising',
        body: 'Instead of giving one bank both titles for a single 105% loan, your broker creates a standalone investment loan split against your existing home for the 20% deposit plus stamp duty, then arranges a completely separate 80% LVR mortgage for the new investment property. Neither property is cross-secured to the other.',
      },
    ],
    liveRankType: 'rscore',
  },
  {
    slug: 'torrens-title-vs-strata-title',
    term: 'Torrens Title vs Strata Title',
    category: 'Asset Selection',
    questionTitle: 'What is the Difference Between Torrens Title and Strata Title in Australia?',
    definition: 'Torrens title (freehold title) means you own both the physical building and the exact parcel of land it sits on outright, whereas strata title means you own an individual lot (such as an apartment or townhouse interior) plus a shared ownership interest in the common property (roof, driveways, lifts, gardens) managed by an owners corporation or body corporate. Ripehouse Advisory strongly favours Torrens-titled freestanding houses because they carry a higher land-to-asset ratio, zero body corporate levies, and full control over improvements.',
    formula: 'Torrens Title = 100% Individual Land Ownership & Zero Body Corporate Levies',
    benchmarkBand: 'Torrens Title Freestanding House Preferred',
    atAGlance: [
      'Torrens title gives you 100% ownership of the land lot and building with zero quarterly strata or body corporate levies.',
      'Strata title owners must pay quarterly administrative and capital works (sinking fund) levies—and can be hit with unexpected special levies for roof, cladding, or lift repairs.',
      'High-density strata complexes also dilute the land-to-asset ratio, which is the primary driver of long-term capital growth.',
    ],
    compareBars: [
      { label: 'Torrens Title Freestanding House (High Land Content + $0 Strata Fees)', value: 94, accent: true, note: 'Full control over renovations, landscaping, and holding costs' },
      { label: 'Strata Title Apartment / High-Rise (Ongoing Body Corporate & Special Levy Risk)', value: 30, note: 'Quarterly strata levies erode net rental yield by 1.0%–2.5% p.a.' },
    ],
    tableRows: [
      ['Land Ownership', 'Torrens: 100% of the defined lot', 'Strata: Shared undivided interest with all other lot owners'],
      ['Ongoing Levies', 'Torrens: $0 strata/body corporate fees', 'Strata: $3,000 – $12,000+/yr in admin & sinking fund levies'],
      ['Renovation Control', 'Torrens: Subject only to council rules', 'Strata: Requires owners corporation / by-law approval for external changes'],
    ],
    sections: [
      {
        heading: 'How strata levies quietly destroy net rental yield',
        body: 'An apartment advertised with a 5.2% gross rental yield often drops below a 3.0% net yield once $6,500 per year in body corporate levies, special levies, council rates, and management fees are deducted. On a Torrens-titled house, every dollar saved on strata fees stays in your cashflow buffer.',
      },
    ],
    liveRankType: 'yield',
  },
  {
    slug: 'debt-recycling',
    term: 'Debt Recycling',
    category: 'Tax & Cashflow',
    questionTitle: 'What is Debt Recycling in Australia?',
    definition: 'Debt recycling is a financial strategy where a homeowner progressively replaces non-tax-deductible home loan debt with tax-deductible investment debt by paying down their home loan and re-borrowing the equivalent equity in a separate loan split to invest in income-producing assets such as residential property. As rental income and tax refunds arrive, they are directed toward paying down the remaining non-deductible home loan faster.',
    formula: 'Pay Down Non-Deductible Home Debt → Re-Borrow in Separate Split for Income-Producing Asset',
    benchmarkBand: 'Requires Strict Split Separation & Accountant Guidance',
    atAGlance: [
      'Interest on your principal place of residence (family home) is not tax-deductible; interest on a loan used to buy an income-producing rental property generally is.',
      'Debt recycling converts "bad" (non-deductible) debt into "productive" (tax-deductible, asset-backed) debt over time.',
      'Must be executed using clean, separate loan splits—never by redrawing mixed funds from a single loan account.',
    ],
    compareBars: [
      { label: 'Cleanly Split Investment Equity Loan (100% Traceable Purpose for Tax Deductibility)', value: 92, accent: true, note: 'Clear audit trail linking borrowed funds directly to the income-producing property' },
      { label: 'Mixed / Unsplit Redraw Account (Tainted Tax Deductibility)', value: 20, note: 'Blending private and investment funds complicates or destroys interest deductions' },
    ],
    tableRows: [
      ['Non-Deductible Debt', 'Home mortgage on your principal residence', 'Paid with after-tax salary; 0% tax deduction'],
      ['Recycled Investment Split', 'Separate loan split used solely for investment property deposit & costs', 'Interest generally deductible against assessable income (confirm with tax adviser)'],
    ],
    sections: [
      {
        heading: 'Always coordinate debt recycling with your accountant and broker',
        body: 'Because the Australian Taxation Office (ATO) traces the exact use of borrowed funds—not which property secures the loan—loan splits must be set up cleanly before a deposit is paid. Our team works alongside your tax accountant and mortgage broker so your finance structure matches your purchase brief.',
      },
    ],
    liveRankType: 'rscore',
  },
  {
    slug: 'off-market-property',
    term: 'Off-Market & Pre-Market Property',
    category: 'Acquisitions',
    questionTitle: 'What is an Off-Market Property in Australia (And Is It Actually Cheaper)?',
    definition: 'An off-market property is a residential home offered for sale privately—either directly through a selling agent’s database or to buyer’s agents—without a public advertising campaign on realestate.com.au or Domain. While many buyer’s agents market “off-market access” as an automatic bargain, off-market simply describes how a sale is advertised; it does not guarantee a discount or make a poor street a good investment. At Ripehouse Advisory, every off-market, pre-market, and on-market property must pass the exact same 27-indicator Suburb R-Score, ABS SA1 Street Score, and settled comparable sales valuation test.',
    formula: 'Value = Purchase Price vs Settled Comparable Sales (Regardless of Advertising Channel)',
    benchmarkBand: 'Must Pass Suburb R-Score + 75–100 Street Score + Valuer Check',
    atAGlance: [
      'Off-market means no public portal advertisement; pre-market means offered quietly 1–2 weeks before portal launch.',
      'Warning: vendors often test ambitious “dream prices” off-market before paying for marketing—so buying off-market without independent comparable sales analysis can mean overpaying.',
      'Ripehouse evaluates both off-market and on-market opportunities across our national agent network, rejecting any property that fails our Street Score or valuation checks.',
    ],
    compareBars: [
      { label: 'Vetted Property Passing Suburb R-Score + SA1 Street Score + Comparable Valuation', value: 96, accent: true, note: 'Channel-agnostic: only the street quality, fundamentals, and price vs comparables matter' },
      { label: 'Unvetted “Exclusive Off-Market” Pitched Above Settled Comparables', value: 28, note: 'Many off-market listings are overpriced stock or sit on low-scoring streets' },
    ],
    tableRows: [
      ['True Pre-Market / Distressed Off-Market', 'Vendor wants a fast, quiet sale with minimal fuss', 'Can offer reduced buyer competition when bought at or below settled comparables'],
      ['Vendor “Price Fishing” Off-Market', 'Agent tests an inflated price before launching on portals', 'Dangerous for buyers who assume “off-market” automatically equals a discount'],
    ],
    sections: [
      {
        heading: 'Why data beats the “secret off-market” sales pitch',
        body: 'If a buyer’s agent tells you their main value is a “secret list of off-market properties,” ask yourself: why would a selling agent legally bound to get the highest price for their vendor sell a house cheaply in secret? The real advantage in acquisitions is knowing—down to the SA1 census block and settled comparable dollar—which properties are genuinely under-priced relative to their street and suburb fundamentals.',
      },
    ],
    liveRankType: 'rscore',
  },
  {
    slug: 'buyers-agent-advocate',
    term: 'Buyer’s Agent (Buyer’s Advocate)',
    category: 'Acquisitions',
    questionTitle: 'What is a Buyer’s Agent (Buyer’s Advocate) in Australia?',
    definition: 'A buyer’s agent (also called a buyer’s advocate) is a licensed real estate professional who represents the property buyer exclusively in researching, evaluating, and negotiating the purchase of a residential or commercial property. Unlike a traditional selling agent—who is legally contracted and paid by the vendor to achieve the highest possible sale price—an independent buyer’s agent is paid solely by the buyer to protect their price, terms, and asset selection. Ripehouse Advisory goes beyond traditional buyer’s agency by pairing licensed acquisitions specialists with a quantitative research engine covering 15,000+ suburbs and 518,400+ streets.',
    formula: '100% Buyer Representation = Zero Developer Commissions + Quantitative Due Diligence',
    benchmarkBand: 'Independent, Research-Led & National',
    atAGlance: [
      'Selling agents work for the seller; a licensed buyer’s agent works legally and exclusively for the buyer.',
      'A true independent buyer’s agent never accepts developer kickbacks, off-the-plan commissions, or vendor referral fees.',
      'Ripehouse Advisory combines a 7-step advisory process (Discovery, Wealth Consultation, Strategy, Research, Asset Presentation, Negotiation & Settlement, and Mentorship) with Australia’s largest suburb and street scoring database.',
    ],
    compareBars: [
      { label: 'Data-Led National Buyer’s Agency (Ripehouse Advisory — 15,000 Suburbs + 518k Streets)', value: 96, accent: true, note: 'Quantitative screening + valuer due diligence + ongoing post-settlement mentorship' },
      { label: 'Single-Postcode Traditional Buyer’s Agent', value: 45, note: 'Limited to one city or a handful of familiar suburbs' },
    ],
    tableRows: [
      ['Who They Represent', 'Buyer’s Agent: Exclusively the buyer', 'Selling Agent: Exclusively the property vendor'],
      ['How They Are Paid', 'Transparent client fee (zero developer kickbacks)', 'Commission paid by the seller from the sale price'],
      ['Geographic Reach', 'Ripehouse: All 30 cities, 544 LGAs & 15,000 suburbs', 'Selling Agent: Local listing territory only'],
    ],
    sections: [
      {
        heading: 'How to verify a buyer’s agent’s research claims',
        body: 'Before hiring any buyer’s agent in Australia, ask to see their live suburb and street data tools and their full distribution of client portfolio CAGRs. At Ripehouse Advisory, we publish our Suburb R-Scores (/suburbs), Street Scores (/streets), City & LGA Directory (/locations), and client CAGR chart (/about/approach) openly.',
      },
    ],
    liveRankType: 'rscore',
  },
  {
    slug: 'local-government-area-lga',
    term: 'Local Government Area (LGA)',
    category: 'Data & Geography',
    questionTitle: 'What is a Local Government Area (LGA) in Australian Property Research?',
    definition: 'A Local Government Area (LGA)—commonly known as a city council, municipal council, or shire—is the administrative region governed by a local council in Australia, responsible for town planning, zoning, building approvals, local infrastructure, and council rates. Australia has 544 tracked LGAs across its eight states and territories. In property investment research, analyzing the LGA level reveals macro population migration, annual dwelling approval supply, economic employment diversity, and multi-year infrastructure pipelines.',
    formula: '544 Australian Council Areas Roll Up 15,000+ Suburbs',
    benchmarkBand: 'Top 50 Investor LGAs Tracked at /locations',
    atAGlance: [
      'Council planning rules, zoning changes, and building approval volumes are decided at the LGA level.',
      'A single capital city like Greater Sydney (33 LGAs) or Greater Melbourne (31 LGAs) is actually dozens of distinct council markets with very different supply pipelines and R-Scores.',
      'Ripehouse Advisory publishes dedicated monthly research pages for all 544 Australian LGAs at ripehouseadvisory.com.au/locations.',
    ],
    compareBars: [
      { label: 'High-Performing Growth LGA (Strong Pop Growth + High Infra Spend + Tight Supply)', value: 90, accent: true, note: 'Macro tailwinds lifting the best suburbs and streets inside the council area' },
      { label: 'Oversupplied Council Area (High Building Approvals vs Population Growth)', value: 35, note: 'Excessive new dwelling approvals dampen price and rental growth' },
    ],
    tableRows: [
      ['City Level (Top 30 Cities)', '1 – 33 LGAs per City', 'Broad urban employment basin and macro cycle'],
      ['LGA Level (544 Councils)', '5 – 80+ Suburbs per LGA', 'Council planning, building approvals, population growth & infrastructure spend'],
      ['Suburb Level (15,000+ Suburbs)', '15 – 60 SA1 Blocks per Suburb', 'Monthly 27-indicator R-Score, median price, rent, yield & vacancy'],
      ['Street Level (518,400+ Streets)', '1 – 4 SA1 Blocks per Street', 'Block-level owner-occupier %, public housing %, rent & yield'],
    ],
    sections: [
      {
        heading: 'How to drill down from City to LGA to Suburb to Street',
        body: 'On our Australian Property Investment Directory (/locations), you can start with any of Australia’s Top 30 Cities or Top 50 Investor LGAs, compare every suburb inside that council by its monthly R-Score, and click straight into the highest-scoring streets in each suburb.',
      },
    ],
    liveRankType: 'rscore',
  },
  {
    slug: 'property-overlays-flood-bushfire-easements',
    term: 'Planning Overlays (Flood, Bushfire, Slope & Easements)',
    category: 'Asset Selection',
    questionTitle: 'What Are Planning Overlays (Flood, Bushfire & Easements) in Australia?',
    definition: 'Planning overlays and title encumbrances—including flood and overland flow overlays, bushfire prone area (BAL) ratings, heritage overlays, acoustic/main-road corridors, steep lot slopes, and underground drainage or sewer easements—are council or title restrictions attached to a specific parcel of land. Even on a high-scoring street in a 95/100 R-Score suburb, a severe flood overlay or poorly positioned sewer easement can slash resale demand, spike building insurance premiums, and restrict future renovations or granny-flat additions.',
    formula: 'Quantitative Suburb/Street Screen + Lot-Level GIS & Contract Overlay Check',
    benchmarkBand: 'Zero Severe Flood / Overland Flow or Restrictive Title Encumbrances',
    atAGlance: [
      'Two houses side-by-side on the same street can have completely different overland flow, flood, or sewer easement profiles.',
      'Flood overlays can increase annual landlord insurance premiums from $1,800/yr to $6,000–$12,000+/yr, wiping out net rental yield.',
      'Steep block slopes (>10%–15% gradient) add tens of thousands of dollars in retaining wall, drainage, and site-cost risk.',
      'Ripehouse Advisory checks lot-level GIS overlays, contours, and contract titles on every property before it is ever presented to a client.',
    ],
    compareBars: [
      { label: 'Clean Lot on 75–100 Scored Street (Level Block, No Flood Overlay, Clear Title)', value: 96, accent: true, note: 'Broadest buyer appeal, standard insurance premiums, and future value-add flexibility' },
      { label: 'Overlay-Compromised Lot (Flood Zone, Main Road Acoustic, or Major Sewer Easement)', value: 20, note: 'High insurance costs, bank lending restrictions, and discounted resale buyer pool' },
    ],
    tableRows: [
      ['Flood & Overland Flow Overlays', 'Council flood mapping & storm runoff paths', 'Can trigger lender LVR restrictions and extreme insurance premiums'],
      ['Bushfire Attack Level (BAL)', 'Vegetation & slope bushfire risk mapping', 'Increases construction/renovation compliance costs'],
      ['Underground Easements', 'Sewer, stormwater, or utility pipes on title plan', 'Prevents building over the easement zone (e.g. extensions, pools, granny flats)'],
      ['Block Slope & Topography', 'Elevation change across the parcel', 'Low-side of the street or steep gradients increase drainage and structural risk'],
    ],
    sections: [
      {
        heading: 'Why quantitative scores must be paired with lot-level human due diligence',
        body: 'Our Suburb R-Score and Street Score narrow 518,000+ streets down to the strongest blocks in Australia. From there, our research analysts and valuers inspect each individual lot’s council planning overlays, contour maps, easements, aspect, and nearby land uses so you never inherit a hidden defect.',
      },
    ],
    liveRankType: 'rscore',
  },
  {
    slug: 'rentvesting',
    term: 'Rentvesting',
    category: 'Strategy',
    questionTitle: 'What is Rentvesting in Australia?',
    definition: 'Rentvesting is a property investment strategy where you rent the home you live in—typically in an expensive inner-city or coastal lifestyle suburb where gross rental yields are low (~2.2%–2.8%)—while using your deposit and borrowing capacity to buy one or more tax-deductible investment properties in high-growth, higher-yielding (4.8%–5.8%+) markets. It separates your personal lifestyle address from your capital allocation decision.',
    formula: 'Rent Where Yield Is Low (~2.5%) + Buy Where R-Score (80+) & Yield (5.0%+) Are High',
    benchmarkBand: 'Ideal for High-Cost Capital City Residents',
    atAGlance: [
      'In suburbs where a $1.8M house rents for $900/wk (2.6% yield), renting costs roughly half as much per week as a standard 80% LVR mortgage.',
      'Rentvesting keeps your borrowing capacity in tax-deductible investment debt rather than locking it into a single non-deductible home loan.',
      'Even Ripehouse’s Street Score reports calculate the exact monthly Rent-vs-Buy dollar gap for every street in Australia.',
    ],
    compareBars: [
      { label: 'Rentvesting (Rent Lifestyle Suburb + Own 1–3 High-R-Score Investment Houses)', value: 92, accent: true, note: 'Captures national growth & tax-deductible leverage without sacrificing lifestyle' },
      { label: 'Buying a Compromised High-Density Unit Just to “Own Where You Live”', value: 32, note: 'Low land content, high strata levies, and weak capital growth' },
    ],
    tableRows: [
      ['Living Arrangement', 'Rent in preferred lifestyle suburb near work/schools', 'Subsidised by landlords accepting a 2.3%–2.8% gross yield'],
      ['Capital Allocation', 'Buy freestanding houses in 80+ R-Score corridors', 'Achieves 4.8%–5.8%+ gross yield and strong land appreciation'],
      ['Tax Treatment', 'Investment loan interest & expenses generally deductible', 'Home loan interest on a principal residence is 0% deductible'],
    ],
    sections: [
      {
        heading: 'Explore our dedicated Rentvestor strategy guide',
        body: 'To see a full breakdown of how we structure portfolios for Australian rentvestors, visit our dedicated Rentvesting Strategy profile at /who-we-help/rentvesting-strategy.',
      },
    ],
    liveRankType: 'yield',
  },
  {
    slug: 'median-house-price',
    term: 'Median House Price (vs Average Price)',
    category: 'Data & Geography',
    questionTitle: 'What is a Median House Price (And Why Can It Mislead Investors)?',
    definition: 'A suburb’s median house price is the middle settled sale price when all house sales in that suburb over a given period (typically 12 months) are ordered from lowest to highest. While more resistant to extreme outliers than a simple mean average, a 12-month suburb median is a lagging indicator that can shift artificially due to changes in the mix of homes sold (for example, more 4-bedroom homes selling than 3-bedroom homes) rather than genuine value growth. That is why Ripehouse Advisory combines median price trends with 26 other supply, demand, and rental indicators in the monthly Suburb R-Score.',
    formula: 'Middle Settled Sale Price (#50th Percentile) Over Rolling 12 Months',
    benchmarkBand: 'Must Be Paired with R-Score & Street Score',
    atAGlance: [
      'Median price is the middle sale (50% sold above, 50% sold below); mean price is total dollar volume divided by number of sales.',
      'Compositional shift trap: if a new pocket of larger homes sells in a suburb, the published median price can jump +12% even if individual house values did not change.',
      'Small sales volume (<20 sales in 12 months) makes a suburb’s median price volatile—which is why Ripehouse flags thin markets as low-confidence.',
    ],
    compareBars: [
      { label: '27-Indicator R-Score + SA1 Street Score (Forward Demand, Supply & Block Quality)', value: 95, accent: true, note: 'Filters out compositional distortion and lagging median noise' },
      { label: 'Standalone 12-Month Suburb Median Price Change', value: 42, note: 'Lagging by 6–12 months and vulnerable to stock-mix shifts' },
    ],
    tableRows: [
      ['Median Price', 'Middle sale in ordered list', 'Standard headline metric; can be skewed by stock composition'],
      ['Ripehouse R-Score (0–100)', '27 supply, demand, momentum & yield indicators', 'Captures real-time market pressure before 12m medians catch up'],
      ['SA1 Street Score (0–100)', 'Block-level tenure, rent & yield vs suburb median', 'Separates premium homeowner streets from lower-priced pockets'],
    ],
    sections: [
      {
        heading: 'Why a rising median does not always mean a rising market',
        body: 'Imagine a suburb where 3-bedroom houses on the south side sell for $550,000 and 4-bedroom houses on the north side sell for $850,000. If 70% of sales this quarter happen on the north side, the published suburb median jumps by $150,000 overnight without a single house increasing in value. Our 27-indicator R-Score and block-level SA1 analysis control for that distortion.',
      },
    ],
    liveRankType: 'rscore',
  },
  {
    slug: 'lenders-mortgage-insurance-lmi',
    term: 'Lenders Mortgage Insurance (LMI)',
    category: 'Finance & Structure',
    questionTitle: 'What is Lenders Mortgage Insurance (LMI) in Australia?',
    definition: 'Lenders Mortgage Insurance (LMI) is a one-off insurance premium charged to a borrower when their mortgage exceeds 80% of the property’s bank valuation (80% LVR). Importantly, LMI protects the bank—not the borrower—against a loss if the borrower defaults and the property sells for less than the loan balance. For property investors, LMI can often be capitalised (added onto the loan) and its cost is generally tax-deductible over five years (or the term of the loan, whichever is shorter) under Australian tax rules.',
    formula: 'Applies When Loan-to-Value Ratio (LVR) > 80% (Unless Waived)',
    benchmarkBand: '80% LVR Avoids LMI; 88% LVR Used Strategically',
    atAGlance: [
      'LMI insures the lender, not you—yet for investors, paying LMI at 88% LVR can sometimes unlock a second property or preserve a larger cash safety buffer.',
      'Unlike owner-occupier LMI, LMI on an income-producing investment property is generally deductible as a borrowing expense over 5 years.',
      'Eligible doctors, dentists, vets, pharmacists, and certain finance/legal professionals can often access 90%–95% LVR with waived LMI.',
    ],
    compareBars: [
      { label: '80% LVR Standard Deposit / Equity Split ($0 LMI)', value: 90, accent: true, note: 'Lowest interest rate tier and zero insurance premium' },
      { label: '88% LVR Strategic Investor Entry (Capitalised, Deductible LMI)', value: 74, note: 'Enters a rising 90+ R-Score market sooner while keeping cash in reserve' },
    ],
    tableRows: [
      ['80% LVR ($120k deposit on $600k)', '$0 LMI', 'Standard benchmark for equity releases and cash buyers'],
      ['88% LVR ($72k deposit on $600k)', '~$8,000 – $14,000 LMI', 'Preserves ~$48,000 of cash/equity for buffers or a second deposit'],
      ['90% Medico Waiver', '$0 LMI (Eligible Professions)', 'Available to qualifying medical & healthcare practitioners'],
    ],
    sections: [
      {
        heading: 'When paying LMI makes mathematical sense—and when it doesn’t',
        body: 'If waiting two years to save an extra $45,000 deposit means watching a $600,000 house in a 92/100 R-Score suburb rise to $710,000, avoiding a $10,000 LMI fee just cost you $110,000 in missed equity. Conversely, if you already have ample usable equity at 80% LVR, staying at 80% LVR avoids LMI completely.',
      },
    ],
    liveRankType: 'rscore',
  },
  {
    slug: 'stamp-duty-transfer-duty',
    term: 'Stamp Duty (Transfer Duty)',
    category: 'Tax & Cashflow',
    questionTitle: 'What is Stamp Duty (Transfer Duty) on Australian Investment Property?',
    definition: 'Stamp duty (officially called transfer duty in most Australian states) is a state government tax levied on the purchase and transfer of real estate, calculated on a sliding scale based on the property’s contract price or market value and the state or territory in which it sits. Unlike first-home buyers—who may receive concessions—property investors pay full stamp duty upfront at settlement (except in the ACT, where stamp duty is tax-deductible for leasehold investment properties). Stamp duty forms part of your property’s capital cost base, reducing Capital Gains Tax when you eventually sell.',
    formula: 'State-Specific Sliding Scale Based on Purchase Price (~3.5% to 5.5% of Price)',
    benchmarkBand: 'Budget ~4% – 5.5% for Stamp Duty + Legal/Inspection Costs',
    atAGlance: [
      'Each of Australia’s 8 states and territories sets its own stamp duty rates and thresholds.',
      'On a $650,000 investment house, stamp duty typically ranges from ~$15,000 to ~$34,000 depending on the state (with Queensland and NSW generally lower than Victoria at mid-tier price points).',
      'Stamp duty is not an annual tax—it is paid once at settlement and added to your CGT cost base.',
    ],
    compareBars: [
      { label: 'Total Acquisition Cash / Equity Required at 80% LVR (~25% of Purchase Price)', value: 85, accent: true, note: '20% deposit + ~4.5%–5% for stamp duty, conveyancing & building/pest inspection' },
      { label: 'Deposit Portion Alone (20% of Purchase Price)', value: 68, note: 'Always include state stamp duty when sizing your maximum purchase price' },
    ],
    tableRows: [
      ['Upfront Tax Treatment (NSW, VIC, QLD, WA, SA, TAS, NT)', 'Capitalised into CGT cost base', 'Not immediately deductible against annual rent, but reduces future CGT on sale'],
      ['Upfront Tax Treatment (ACT)', '99-year Crown Lease rule', 'Generally deductible for income-producing ACT properties (confirm with tax adviser)'],
    ],
    sections: [
      {
        heading: 'How state stamp duty differences affect your purchase budget',
        body: 'Because Victoria levies higher transfer duty than Queensland or New South Wales on a $650,000–$800,000 purchase, the exact same $160,000 equity release can support a different maximum contract price depending on which state you buy in. We factor exact state transfer duty and land-tax rules into your Strategy Session brief.',
      },
    ],
    liveRankType: 'yield',
  },
  {
    slug: 'capital-gains-tax-cgt-property',
    term: 'Capital Gains Tax (CGT) & 50% Discount',
    category: 'Tax & Cashflow',
    questionTitle: 'How Does Capital Gains Tax (CGT) Work on Australian Investment Property?',
    definition: 'Capital Gains Tax (CGT) is the tax payable on the net profit made when you sell an investment property for more than its cost base (purchase price plus acquisition costs such as stamp duty, legal fees, buyer’s agent fees, and capital improvements, minus claimed building depreciation). In Australia, CGT is not a separate tax rate; the net capital gain is added to your taxable income in the financial year you sign the sale contract. Individual and trust investors who hold an investment property for more than 12 months generally receive a 50% CGT discount (33.3% inside a complying superannuation fund / SMSF).',
    formula: 'Taxable Gain (Held > 12 Months) = (Sale Price − Cost Base) × 50%',
    benchmarkBand: '$0 CGT Triggered When Refinancing Equity (Without Selling)',
    atAGlance: [
      'CGT is only triggered when you sell (sign a contract of sale)—never when you refinance a property to release usable equity.',
      'Hold for more than 12 months (contract date to contract date) to qualify for the 50% CGT discount for individuals/trusts (or 33.3% for SMSFs).',
      'Your buyer’s agent fee, stamp duty, legal conveyancing fees, and capital renovations all form part of your CGT cost base, reducing the taxable gain on sale.',
    ],
    compareBars: [
      { label: 'Refinancing Equity to Fund Next Deposit ($0 CGT Payable)', value: 100, accent: true, note: 'Borrowing against increased property value is not a CGT event' },
      { label: 'Selling After >12 Months (50% Individual / Trust CGT Discount Applies)', value: 50, note: 'Only half of the net capital gain is added to assessable income' },
      { label: 'Selling Within 12 Months (No CGT Discount — 100% of Gain Taxed)', value: 15, note: 'Full net gain taxed at marginal income tax rates' },
    ],
    tableRows: [
      ['Refinancing Equity (Holding Asset)', '$0 CGT', 'Equity is released via loan refinance; asset continues compounding'],
      ['Selling After 12+ Months (Individual / Trust)', '50% CGT Discount', 'Half of net capital gain added to taxable income'],
      ['Selling After 12+ Months (SMSF in Accumulation)', '33.3% CGT Discount', 'Effective 10% CGT rate inside a complying SMSF'],
    ],
    sections: [
      {
        heading: 'Why holding and refinancing beats flipping in Australia',
        body: 'Flipping properties in Australia triggers stamp duty on the way in, selling agent commission on the way out, and Capital Gains Tax on the profit. By contrast, buying a high-R-Score asset on a 75–100 scored street, holding it long-term, and refinancing usable equity at 80% LVR lets you harvest capital growth for your next deposit completely free of CGT.',
      },
    ],
    liveRankType: 'rscore',
  },
  {
    slug: 'pre-approval-vs-unconditional-approval',
    term: 'Pre-Approval vs Unconditional Finance Approval',
    category: 'Acquisitions',
    questionTitle: 'What is the Difference Between Pre-Approval and Unconditional Approval?',
    definition: 'Loan pre-approval (conditional approval) is an initial indication from a lender that you meet their income and credit criteria to borrow up to a specified amount, subject to the bank later valuing and accepting the specific property you buy. Unconditional approval (formal approval) is the final binding loan approval issued after you have signed a contract (or agreed terms) and the bank’s valuer has inspected and signed off on the property security. You should never make an unconditional offer or bid at auction without understanding the conditions attached to your pre-approval.',
    formula: 'Pre-Approval (Borrower Vetted) + Bank Property Valuation = Unconditional Approval',
    benchmarkBand: 'Credit-Assessed Pre-Approval Before Property Shortlisting',
    atAGlance: [
      'Automated “instant online pre-approvals” are not human credit-assessed and can fail when a real credit assessor reviews payslips and expenses.',
      'Even with a rock-solid pre-approval, the lender must still value the specific property you purchase before issuing unconditional approval.',
      'Buying on a high-scoring street (Street Score 75–100) at or below settled comparable sales ensures bank valuations come back smoothly at contract price.',
    ],
    compareBars: [
      { label: 'Full Credit-Assessed Pre-Approval + Comparable Sales Valuation Check', value: 95, accent: true, note: 'Ready to negotiate confidently with strong contract terms' },
      { label: 'Automated System-Generated “Pre-Approval” Without Document Review', value: 30, note: 'High risk of delays or declines during formal finance clause period' },
    ],
    tableRows: [
      ['1. Credit-Assessed Pre-Approval', 'Valid for 60 – 90 days', 'Assessor verifies income, living expenses, and existing loan statements'],
      ['2. Property Valuation & Security Check', 'Triggered upon accepted offer', 'Bank valuer confirms property value and checks for restrictive overlays'],
      ['3. Unconditional (Formal) Approval', 'Loan documents issued', 'Finance condition satisfied; ready to proceed to settlement'],
    ],
    sections: [
      {
        heading: 'How Ripehouse protects your bank valuation before you sign',
        body: 'One of the biggest causes of finance stress is overpaying for a property and having the bank’s valuer assess it $40,000 below contract price. Before we ever submit an offer, our analysts and valuers benchmark the property against recent settled comparable sales on equivalent SA1 streets so the contract price stands up to bank valuation scrutiny.',
      },
    ],
    liveRankType: 'rscore',
  },
  {
    slug: 'comparable-sales-valuation',
    term: 'Comparable Sales Analysis (Comps)',
    category: 'Acquisitions',
    questionTitle: 'What Are Comparable Sales (Comps) in Property Valuation?',
    definition: 'Comparable sales (or “comps”) are recently settled property transactions (typically within the past 3 to 6 months and within 0.5 to 1.5 kilometres) that share the same land size, bedroom/bathroom configuration, building condition, and street quality as the property being valued. Bank valuers and buyer’s agents use settled comparable sales—not current advertised asking prices—as the primary legal evidence of what a property is worth today. Ripehouse Advisory cross-checks every comparable sale against its Ripehouse Street Score so a home on a 25/100 street is never valued against a sale on a 100/100 street.',
    formula: 'Fair Market Value = Settled Sales of Equivalent Land, Condition & SA1 Street Score',
    benchmarkBand: 'Settled Sales Within ≤ 90–180 Days on Matching Street Score Blocks',
    atAGlance: [
      'Asking prices on portals reflect what vendors hope to get; settled comparable sales reflect what buyers and bank valuers actually paid.',
      'A “comparable” sale on a neighbouring street with 80% owner-occupiers is NOT comparable to a listing on a street with 20% public housing.',
      'Adding Street Score parity to comparable sales analysis prevents overpaying for inferior micro-pockets.',
    ],
    compareBars: [
      { label: 'Street-Score-Matched Settled Comparables (Last 90 Days, Same SA1 Profile)', value: 96, accent: true, note: 'The exact standard used by Ripehouse analysts and valuers' },
      { label: 'Selling Agent’s “Cherry-Picked” Comparables Sheet', value: 35, note: 'Often compares a B-grade street listing against A-grade street sales' },
    ],
    tableRows: [
      ['Inferior Comparable', 'Smaller land, unrenovated, or lower Street Score', 'Sets the floor price below the subject property'],
      ['Direct Comparable', 'Matching land size, dwelling, and SA1 Street Score', 'Establishes true current bank valuation range'],
      ['Superior Comparable', 'Larger land, renovated, or higher Street Score', 'Sets the ceiling price you must not pay above'],
    ],
    sections: [
      {
        heading: 'How selling agents use mismatched comparables—and how to spot it',
        body: 'At almost every open home, the selling agent hands out a sheet of three recent sales that justify a high price guide. When you run those three addresses through the Ripehouse Street Score (/streets), you will frequently discover that the high-priced sales occurred on 75–100/100 owner-occupied streets while the listing being sold sits on a 25/100 block. Checking the Street Score takes 10 seconds and saves tens of thousands at the negotiation table.',
      },
    ],
    liveRankType: 'rscore',
  },
];

export function findGlossaryTerm(slug) {
  return GLOSSARY_TERMS.find((item) => item.slug === String(slug || '').toLowerCase()) || null;
}
