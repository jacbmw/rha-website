import Link from 'next/link';

const logoUrl = '/images/rha-logo-dark.png';
const ripeholdLogoUrl = 'https://ripehold.com.au/img/ripehold_logo_full_white.png';

// Top 30 Australian Cities by population (ABS Significant Urban Areas / Capital & Regional Cities)
const FOOTER_TOP_30_CITIES = [
  { name: 'Sydney', state: 'NSW', path: '/locations/cities/sydney' },
  { name: 'Melbourne', state: 'VIC', path: '/locations/cities/melbourne' },
  { name: 'Brisbane', state: 'QLD', path: '/locations/cities/brisbane' },
  { name: 'Perth', state: 'WA', path: '/locations/cities/perth' },
  { name: 'Adelaide', state: 'SA', path: '/locations/cities/adelaide' },
  { name: 'Gold Coast', state: 'QLD', path: '/locations/cities/gold-coast' },
  { name: 'Newcastle', state: 'NSW', path: '/locations/cities/newcastle' },
  { name: 'Canberra', state: 'ACT', path: '/locations/cities/canberra' },
  { name: 'Sunshine Coast', state: 'QLD', path: '/locations/cities/sunshine-coast' },
  { name: 'Central Coast', state: 'NSW', path: '/locations/cities/central-coast' },
  { name: 'Wollongong', state: 'NSW', path: '/locations/cities/wollongong' },
  { name: 'Geelong', state: 'VIC', path: '/locations/cities/geelong' },
  { name: 'Hobart', state: 'TAS', path: '/locations/cities/hobart' },
  { name: 'Townsville', state: 'QLD', path: '/locations/cities/townsville' },
  { name: 'Toowoomba', state: 'QLD', path: '/locations/cities/toowoomba' },
  { name: 'Cairns', state: 'QLD', path: '/locations/cities/cairns' },
  { name: 'Darwin', state: 'NT', path: '/locations/cities/darwin' },
  { name: 'Mackay', state: 'QLD', path: '/locations/cities/mackay' },
  { name: 'Bendigo', state: 'VIC', path: '/locations/cities/bendigo' },
  { name: 'Ballarat', state: 'VIC', path: '/locations/cities/ballarat' },
  { name: 'Hervey Bay', state: 'QLD', path: '/locations/cities/hervey-bay' },
  { name: 'Launceston', state: 'TAS', path: '/locations/cities/launceston' },
  { name: 'Bundaberg', state: 'QLD', path: '/locations/cities/bundaberg' },
  { name: 'Albury-Wodonga', state: 'NSW', path: '/locations/cities/albury-wodonga' },
  { name: 'Bunbury', state: 'WA', path: '/locations/cities/bunbury' },
  { name: 'Rockhampton', state: 'QLD', path: '/locations/cities/rockhampton' },
  { name: 'Coffs Harbour', state: 'NSW', path: '/locations/cities/coffs-harbour' },
  { name: 'Shepparton', state: 'VIC', path: '/locations/cities/shepparton' },
  { name: 'Wagga Wagga', state: 'NSW', path: '/locations/cities/wagga-wagga' },
  { name: 'Mildura', state: 'VIC', path: '/locations/cities/mildura' },
];

// Top 50 Local Government Areas (LGAs) by Picki search, vetting & investor research volume
const FOOTER_TOP_50_LGAS = [
  { name: 'Brisbane', state: 'QLD', path: '/locations/lgas/qld/brisbane' },
  { name: 'Greater Bendigo', state: 'VIC', path: '/locations/lgas/vic/greater-bendigo' },
  { name: 'Sunshine Coast', state: 'QLD', path: '/locations/lgas/qld/sunshine-coast' },
  { name: 'Latrobe', state: 'VIC', path: '/locations/lgas/vic/latrobe' },
  { name: 'Launceston', state: 'TAS', path: '/locations/lgas/tas/launceston' },
  { name: 'Ipswich', state: 'QLD', path: '/locations/lgas/qld/ipswich' },
  { name: 'Casey', state: 'VIC', path: '/locations/lgas/vic/casey' },
  { name: 'Toowoomba', state: 'QLD', path: '/locations/lgas/qld/toowoomba' },
  { name: 'Tamworth Regional', state: 'NSW', path: '/locations/lgas/nsw/tamworth-regional' },
  { name: 'Ballarat', state: 'VIC', path: '/locations/lgas/vic/ballarat' },
  { name: 'Rockhampton', state: 'QLD', path: '/locations/lgas/qld/rockhampton' },
  { name: 'Bundaberg', state: 'QLD', path: '/locations/lgas/qld/bundaberg' },
  { name: 'Kingborough', state: 'TAS', path: '/locations/lgas/tas/kingborough' },
  { name: 'Townsville', state: 'QLD', path: '/locations/lgas/qld/townsville' },
  { name: 'Horsham', state: 'VIC', path: '/locations/lgas/vic/horsham' },
  { name: 'Gold Coast', state: 'QLD', path: '/locations/lgas/qld/gold-coast' },
  { name: 'Gladstone', state: 'QLD', path: '/locations/lgas/qld/gladstone' },
  { name: 'Wellington', state: 'VIC', path: '/locations/lgas/vic/wellington' },
  { name: 'Mackay', state: 'QLD', path: '/locations/lgas/qld/mackay' },
  { name: 'Brimbank', state: 'VIC', path: '/locations/lgas/vic/brimbank' },
  { name: 'East Gippsland', state: 'VIC', path: '/locations/lgas/vic/east-gippsland' },
  { name: 'Greater Geelong', state: 'VIC', path: '/locations/lgas/vic/greater-geelong' },
  { name: 'Burnie', state: 'TAS', path: '/locations/lgas/tas/burnie' },
  { name: 'Logan', state: 'QLD', path: '/locations/lgas/qld/logan' },
  { name: 'Greater Shepparton', state: 'VIC', path: '/locations/lgas/vic/greater-shepparton' },
  { name: 'Melton', state: 'VIC', path: '/locations/lgas/vic/melton' },
  { name: 'Mildura', state: 'VIC', path: '/locations/lgas/vic/mildura' },
  { name: 'Hume', state: 'VIC', path: '/locations/lgas/vic/hume' },
  { name: 'Wollondilly', state: 'NSW', path: '/locations/lgas/nsw/wollondilly' },
  { name: 'Baw Baw', state: 'VIC', path: '/locations/lgas/vic/baw-baw' },
  { name: 'Darebin', state: 'VIC', path: '/locations/lgas/vic/darebin' },
  { name: 'Fraser Coast', state: 'QLD', path: '/locations/lgas/qld/fraser-coast' },
  { name: 'Glenorchy', state: 'TAS', path: '/locations/lgas/tas/glenorchy' },
  { name: 'Warrnambool', state: 'VIC', path: '/locations/lgas/vic/warrnambool' },
  { name: 'Mitchell', state: 'VIC', path: '/locations/lgas/vic/mitchell' },
  { name: 'Albury', state: 'NSW', path: '/locations/lgas/nsw/albury' },
  { name: 'Greater Geraldton', state: 'WA', path: '/locations/lgas/wa/greater-geraldton' },
  { name: 'Moreton Bay', state: 'QLD', path: '/locations/lgas/qld/moreton-bay' },
  { name: 'Central Coast', state: 'NSW', path: '/locations/lgas/nsw/central-coast' },
  { name: 'Hobart', state: 'TAS', path: '/locations/lgas/tas/hobart' },
  { name: 'Swan Hill', state: 'VIC', path: '/locations/lgas/vic/swan-hill' },
  { name: 'Clarence', state: 'TAS', path: '/locations/lgas/tas/clarence' },
  { name: 'Wanneroo', state: 'WA', path: '/locations/lgas/wa/wanneroo' },
  { name: 'Wyndham', state: 'VIC', path: '/locations/lgas/vic/wyndham' },
  { name: 'Mid-Coast', state: 'NSW', path: '/locations/lgas/nsw/mid-coast' },
  { name: 'Wangaratta', state: 'VIC', path: '/locations/lgas/vic/wangaratta' },
  { name: 'Swan', state: 'WA', path: '/locations/lgas/wa/swan' },
  { name: 'Campaspe', state: 'VIC', path: '/locations/lgas/vic/campaspe' },
  { name: 'Playford', state: 'SA', path: '/locations/lgas/sa/playford' },
  { name: 'Wagga Wagga', state: 'NSW', path: '/locations/lgas/nsw/wagga-wagga' },
];

export default function Footer({ backHref = '/', backLabel = 'Back home ↑' }) {
  return (
    <footer className="site-footer">
      <div className="footer-seo-directory section-shell">
        <div className="footer-seo-header">
          <div>
            <p className="eyebrow"><span /> Australian Property Investment Research Directory</p>
            <h2>Explore Property Investment Data by City, Council (LGA), Suburb &amp; Street</h2>
          </div>
          <div className="footer-seo-hubs">
            <Link href="/locations">All 30 Cities &amp; 540+ LGAs →</Link>
            <Link href="/suburbs">All 15,000 Suburbs →</Link>
            <Link href="/streets">Street Score Search →</Link>
          </div>
        </div>

        <div className="footer-seo-group">
          <h3>Property Investment in Australia’s Top 30 Cities (by Population)</h3>
          <ul className="footer-seo-list">
            {FOOTER_TOP_30_CITIES.map((city) => (
              <li key={city.path}>
                <Link href={city.path}>
                  Property Investment in {city.name} ({city.state})
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-seo-group">
          <h3>Property Investment in Top 50 Council Areas / LGAs (by Picki Research Volume)</h3>
          <ul className="footer-seo-list">
            {FOOTER_TOP_50_LGAS.map((lga) => (
              <li key={lga.path}>
                <Link href={lga.path}>
                  Property Investment in {lga.name} ({lga.state})
                </Link>
              </li>
            ))}
          </ul>
          <p className="footer-seo-more">
            Looking for another council area, suburb, or street?{' '}
            <Link href="/locations">
              Search and browse all 540+ Australian Local Government Areas (LGAs), 30 Cities, 15,000 Suburbs &amp; 700,000 Streets →
            </Link>
          </p>
        </div>
      </div>

      <div className="footer-row">
        <Link className="brand footer-brand" href="/">
          <img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" />
        </Link>
        <p>© 2026 Ripehouse Advisory. All rights reserved.</p>
        <div>
          <Link href="/locations">Locations</Link>
          <Link href="/suburbs">Suburbs</Link>
          <Link href="/streets">Streets</Link>
          <Link href="/legal/privacy-policy">Privacy</Link>
          <Link href="/legal/terms-and-conditions">Terms</Link>
          <Link href={backHref}>{backLabel}</Link>
        </div>
      </div>
      <div className="footer-ripehold">
        <a href="https://ripehold.com.au" target="_blank" rel="noreferrer" aria-label="Ripehold — opens in a new tab">
          <span>For Commercial Property Advisory</span>
          <span aria-hidden="true">—</span>
          <img src={ripeholdLogoUrl} alt="Ripehold" />
        </a>
      </div>
    </footer>
  );
}
