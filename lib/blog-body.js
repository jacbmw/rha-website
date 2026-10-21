// Blog HTML body helpers + automatic SEO internal linking to City & LGA
// research pages (/locations/cities/[slug] and /locations/lgas/[state]/[slug]).
// Browser-safe (imported by both SSR blog pages and client EndlessScroll).

export const BLOG_LOCATION_TARGETS = [
  // Multi-word Cities & LGAs first (longest match wins)
  { term: 'Albury-Wodonga', label: 'Albury-Wodonga (NSW/VIC)', kind: 'City', path: '/locations/cities/albury-wodonga' },
  { term: 'Sunshine Coast', label: 'Sunshine Coast (QLD)', kind: 'City', path: '/locations/cities/sunshine-coast' },
  { term: 'Central Coast', label: 'Central Coast (NSW)', kind: 'City', path: '/locations/cities/central-coast' },
  { term: 'Coffs Harbour', label: 'Coffs Harbour (NSW)', kind: 'City', path: '/locations/cities/coffs-harbour' },
  { term: 'Wagga Wagga', label: 'Wagga Wagga (NSW)', kind: 'City', path: '/locations/cities/wagga-wagga' },
  { term: 'Gold Coast', label: 'Gold Coast (QLD)', kind: 'City', path: '/locations/cities/gold-coast' },
  { term: 'Hervey Bay', label: 'Hervey Bay (QLD)', kind: 'City', path: '/locations/cities/hervey-bay' },
  { term: 'Greater Bendigo', label: 'Greater Bendigo (VIC)', kind: 'LGA', path: '/locations/lgas/vic/greater-bendigo' },
  { term: 'Greater Geelong', label: 'Greater Geelong (VIC)', kind: 'LGA', path: '/locations/lgas/vic/greater-geelong' },
  { term: 'Greater Shepparton', label: 'Greater Shepparton (VIC)', kind: 'LGA', path: '/locations/lgas/vic/greater-shepparton' },
  { term: 'Greater Geraldton', label: 'Greater Geraldton (WA)', kind: 'LGA', path: '/locations/lgas/wa/greater-geraldton' },
  { term: 'Greater Dandenong', label: 'Greater Dandenong (VIC)', kind: 'LGA', path: '/locations/lgas/vic/greater-dandenong' },
  { term: 'Mornington Peninsula', label: 'Mornington Peninsula (VIC)', kind: 'LGA', path: '/locations/lgas/vic/mornington-peninsula' },
  { term: 'Canterbury-Bankstown', label: 'Canterbury-Bankstown (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/canterbury-bankstown' },
  { term: 'Northern Beaches', label: 'Northern Beaches (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/northern-beaches' },
  { term: 'Sutherland Shire', label: 'Sutherland Shire (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/sutherland-shire' },
  { term: 'The Hills Shire', label: 'The Hills Shire (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/the-hills-shire' },
  { term: 'Tamworth Regional', label: 'Tamworth Regional (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/tamworth-regional' },
  { term: 'Bathurst Regional', label: 'Bathurst Regional (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/bathurst-regional' },
  { term: 'Dubbo Regional', label: 'Dubbo Regional (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/dubbo-regional' },
  { term: 'Lake Macquarie', label: 'Lake Macquarie (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/lake-macquarie' },
  { term: 'Port Macquarie', label: 'Port Macquarie-Hastings (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/port-macquarie-hastings' },
  { term: 'Port Stephens', label: 'Port Stephens (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/port-stephens' },
  { term: 'Blue Mountains', label: 'Blue Mountains (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/blue-mountains' },
  { term: 'East Gippsland', label: 'East Gippsland (VIC)', kind: 'LGA', path: '/locations/lgas/vic/east-gippsland' },
  { term: 'Latrobe Valley', label: 'Latrobe (VIC)', kind: 'LGA', path: '/locations/lgas/vic/latrobe' },
  { term: 'Moreton Bay', label: 'Moreton Bay (QLD)', kind: 'LGA', path: '/locations/lgas/qld/moreton-bay' },
  { term: 'Fraser Coast', label: 'Fraser Coast (QLD)', kind: 'LGA', path: '/locations/lgas/qld/fraser-coast' },
  { term: 'Scenic Rim', label: 'Scenic Rim (QLD)', kind: 'LGA', path: '/locations/lgas/qld/scenic-rim' },
  { term: 'Lockyer Valley', label: 'Lockyer Valley (QLD)', kind: 'LGA', path: '/locations/lgas/qld/lockyer-valley' },
  { term: 'Western Downs', label: 'Western Downs (QLD)', kind: 'LGA', path: '/locations/lgas/qld/western-downs' },
  { term: 'Mount Barker', label: 'Mount Barker (SA)', kind: 'LGA', path: '/locations/lgas/sa/mount-barker' },
  { term: 'Port Adelaide', label: 'Port Adelaide Enfield (SA)', kind: 'LGA', path: '/locations/lgas/sa/port-adelaide-enfield' },
  { term: 'Tea Tree Gully', label: 'Tea Tree Gully (SA)', kind: 'LGA', path: '/locations/lgas/sa/tea-tree-gully' },
  { term: 'Charles Sturt', label: 'Charles Sturt (SA)', kind: 'LGA', path: '/locations/lgas/sa/charles-sturt' },
  { term: 'Swan Hill', label: 'Swan Hill (VIC)', kind: 'LGA', path: '/locations/lgas/vic/swan-hill' },
  { term: 'Baw Baw', label: 'Baw Baw (VIC)', kind: 'LGA', path: '/locations/lgas/vic/baw-baw' },
  { term: 'Byron Bay', label: 'Byron (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/byron' },
  { term: 'Logan City', label: 'Logan (QLD)', kind: 'LGA', path: '/locations/lgas/qld/logan' },
  { term: 'City of Casey', label: 'Casey (VIC)', kind: 'LGA', path: '/locations/lgas/vic/casey' },
  { term: 'City of Wyndham', label: 'Wyndham (VIC)', kind: 'LGA', path: '/locations/lgas/vic/wyndham' },
  { term: 'City of Melton', label: 'Melton (VIC)', kind: 'LGA', path: '/locations/lgas/vic/melton' },
  { term: 'City of Hume', label: 'Hume (VIC)', kind: 'LGA', path: '/locations/lgas/vic/hume' },
  { term: 'City of Playford', label: 'Playford (SA)', kind: 'LGA', path: '/locations/lgas/sa/playford' },

  // Single-word Top 30 Cities
  { term: 'Sydney', label: 'Sydney (NSW)', kind: 'City', path: '/locations/cities/sydney' },
  { term: 'Melbourne', label: 'Melbourne (VIC)', kind: 'City', path: '/locations/cities/melbourne' },
  { term: 'Brisbane', label: 'Brisbane (QLD)', kind: 'City', path: '/locations/cities/brisbane' },
  { term: 'Perth', label: 'Perth (WA)', kind: 'City', path: '/locations/cities/perth' },
  { term: 'Adelaide', label: 'Adelaide (SA)', kind: 'City', path: '/locations/cities/adelaide' },
  { term: 'Newcastle', label: 'Newcastle (NSW)', kind: 'City', path: '/locations/cities/newcastle' },
  { term: 'Canberra', label: 'Canberra (ACT)', kind: 'City', path: '/locations/cities/canberra' },
  { term: 'Wollongong', label: 'Wollongong (NSW)', kind: 'City', path: '/locations/cities/wollongong' },
  { term: 'Geelong', label: 'Geelong (VIC)', kind: 'City', path: '/locations/cities/geelong' },
  { term: 'Hobart', label: 'Hobart (TAS)', kind: 'City', path: '/locations/cities/hobart' },
  { term: 'Townsville', label: 'Townsville (QLD)', kind: 'City', path: '/locations/cities/townsville' },
  { term: 'Toowoomba', label: 'Toowoomba (QLD)', kind: 'City', path: '/locations/cities/toowoomba' },
  { term: 'Cairns', label: 'Cairns (QLD)', kind: 'City', path: '/locations/cities/cairns' },
  { term: 'Darwin', label: 'Darwin (NT)', kind: 'City', path: '/locations/cities/darwin' },
  { term: 'Mackay', label: 'Mackay (QLD)', kind: 'City', path: '/locations/cities/mackay' },
  { term: 'Bendigo', label: 'Bendigo (VIC)', kind: 'City', path: '/locations/cities/bendigo' },
  { term: 'Ballarat', label: 'Ballarat (VIC)', kind: 'City', path: '/locations/cities/ballarat' },
  { term: 'Launceston', label: 'Launceston (TAS)', kind: 'City', path: '/locations/cities/launceston' },
  { term: 'Bundaberg', label: 'Bundaberg (QLD)', kind: 'City', path: '/locations/cities/bundaberg' },
  { term: 'Bunbury', label: 'Bunbury (WA)', kind: 'City', path: '/locations/cities/bunbury' },
  { term: 'Rockhampton', label: 'Rockhampton (QLD)', kind: 'City', path: '/locations/cities/rockhampton' },
  { term: 'Shepparton', label: 'Shepparton (VIC)', kind: 'City', path: '/locations/cities/shepparton' },
  { term: 'Mildura', label: 'Mildura (VIC)', kind: 'City', path: '/locations/cities/mildura' },

  // Distinctive single-word LGAs
  { term: 'Kingborough', label: 'Kingborough (TAS)', kind: 'LGA', path: '/locations/lgas/tas/kingborough' },
  { term: 'Glenorchy', label: 'Glenorchy (TAS)', kind: 'LGA', path: '/locations/lgas/tas/glenorchy' },
  { term: 'Burnie', label: 'Burnie (TAS)', kind: 'LGA', path: '/locations/lgas/tas/burnie' },
  { term: 'Devonport', label: 'Devonport (TAS)', kind: 'LGA', path: '/locations/lgas/tas/devonport' },
  { term: 'Ipswich', label: 'Ipswich (QLD)', kind: 'LGA', path: '/locations/lgas/qld/ipswich' },
  { term: 'Gladstone', label: 'Gladstone (QLD)', kind: 'LGA', path: '/locations/lgas/qld/gladstone' },
  { term: 'Redland', label: 'Redland (QLD)', kind: 'LGA', path: '/locations/lgas/qld/redland' },
  { term: 'Noosa', label: 'Noosa (QLD)', kind: 'LGA', path: '/locations/lgas/qld/noosa' },
  { term: 'Gympie', label: 'Gympie (QLD)', kind: 'LGA', path: '/locations/lgas/qld/gympie' },
  { term: 'Tamworth', label: 'Tamworth Regional (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/tamworth-regional' },
  { term: 'Wollondilly', label: 'Wollondilly (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/wollondilly' },
  { term: 'Shoalhaven', label: 'Shoalhaven (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/shoalhaven' },
  { term: 'Shellharbour', label: 'Shellharbour (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/shellharbour' },
  { term: 'Maitland', label: 'Maitland (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/maitland' },
  { term: 'Cessnock', label: 'Cessnock (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/cessnock' },
  { term: 'Parramatta', label: 'Parramatta (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/parramatta' },
  { term: 'Blacktown', label: 'Blacktown (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/blacktown' },
  { term: 'Penrith', label: 'Penrith (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/penrith' },
  { term: 'Liverpool', label: 'Liverpool (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/liverpool' },
  { term: 'Albury', label: 'Albury (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/albury' },
  { term: 'Wodonga', label: 'Wodonga (VIC)', kind: 'LGA', path: '/locations/lgas/vic/wodonga' },
  { term: 'Lismore', label: 'Lismore (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/lismore' },
  { term: 'Ballina', label: 'Ballina (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/ballina' },
  { term: 'Bathurst', label: 'Bathurst Regional (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/bathurst-regional' },
  { term: 'Dubbo', label: 'Dubbo Regional (NSW)', kind: 'LGA', path: '/locations/lgas/nsw/dubbo-regional' },
  { term: 'Warrnambool', label: 'Warrnambool (VIC)', kind: 'LGA', path: '/locations/lgas/vic/warrnambool' },
  { term: 'Wangaratta', label: 'Wangaratta (VIC)', kind: 'LGA', path: '/locations/lgas/vic/wangaratta' },
  { term: 'Horsham', label: 'Horsham (VIC)', kind: 'LGA', path: '/locations/lgas/vic/horsham' },
  { term: 'Campaspe', label: 'Campaspe (VIC)', kind: 'LGA', path: '/locations/lgas/vic/campaspe' },
  { term: 'Brimbank', label: 'Brimbank (VIC)', kind: 'LGA', path: '/locations/lgas/vic/brimbank' },
  { term: 'Wyndham', label: 'Wyndham (VIC)', kind: 'LGA', path: '/locations/lgas/vic/wyndham' },
  { term: 'Whittlesea', label: 'Whittlesea (VIC)', kind: 'LGA', path: '/locations/lgas/vic/whittlesea' },
  { term: 'Frankston', label: 'Frankston (VIC)', kind: 'LGA', path: '/locations/lgas/vic/frankston' },
  { term: 'Darebin', label: 'Darebin (VIC)', kind: 'LGA', path: '/locations/lgas/vic/darebin' },
  { term: 'Cardinia', label: 'Cardinia (VIC)', kind: 'LGA', path: '/locations/lgas/vic/cardinia' },
  { term: 'Wanneroo', label: 'Wanneroo (WA)', kind: 'LGA', path: '/locations/lgas/wa/wanneroo' },
  { term: 'Joondalup', label: 'Joondalup (WA)', kind: 'LGA', path: '/locations/lgas/wa/joondalup' },
  { term: 'Rockingham', label: 'Rockingham (WA)', kind: 'LGA', path: '/locations/lgas/wa/rockingham' },
  { term: 'Mandurah', label: 'Mandurah (WA)', kind: 'LGA', path: '/locations/lgas/wa/mandurah' },
  { term: 'Cockburn', label: 'Cockburn (WA)', kind: 'LGA', path: '/locations/lgas/wa/cockburn' },
  { term: 'Armadale', label: 'Armadale (WA)', kind: 'LGA', path: '/locations/lgas/wa/armadale' },
  { term: 'Gosnells', label: 'Gosnells (WA)', kind: 'LGA', path: '/locations/lgas/wa/gosnells' },
  { term: 'Kwinana', label: 'Kwinana (WA)', kind: 'LGA', path: '/locations/lgas/wa/kwinana' },
  { term: 'Busselton', label: 'Busselton (WA)', kind: 'LGA', path: '/locations/lgas/wa/busselton' },
  { term: 'Onkaparinga', label: 'Onkaparinga (SA)', kind: 'LGA', path: '/locations/lgas/sa/onkaparinga' },
  { term: 'Playford', label: 'Playford (SA)', kind: 'LGA', path: '/locations/lgas/sa/playford' },
  { term: 'Salisbury', label: 'Salisbury (SA)', kind: 'LGA', path: '/locations/lgas/sa/salisbury' },
  { term: 'Whyalla', label: 'Whyalla (SA)', kind: 'LGA', path: '/locations/lgas/sa/whyalla' },
  { term: 'Gawler', label: 'Gawler (SA)', kind: 'LGA', path: '/locations/lgas/sa/gawler' },
  { term: 'Palmerston', label: 'Palmerston (NT)', kind: 'LGA', path: '/locations/lgas/nt/palmerston' },
];

const ESCAPED_TERMS = BLOG_LOCATION_TARGETS.map((item) =>
  item.term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
);
const LOCATION_REGEX = new RegExp(`\\b(${ESCAPED_TERMS.join('|')})\\b`, 'g');
const TARGET_BY_TERM = new Map(BLOG_LOCATION_TARGETS.map((item) => [item.term, item]));

// Inject contextual internal links for the first occurrence of up to `maxLinks`
// cities/LGAs inside paragraph/list text nodes (never inside <a>, headings, code, or attributes).
export function linkLocationsInHtml(html, maxLinks = 8) {
  const source = String(html || '');
  if (!source) return '';
  const linkedPaths = new Set();
  const skipTags = /^(a|h[1-6]|script|style|code|pre|button|summary)$/i;
  const tokens = source.split(/(<[^>]+>)/g);
  let skipDepth = 0;

  return tokens
    .map((token) => {
      if (token.startsWith('<')) {
        const match = /^<(\/?)([a-zA-Z0-9]+)/.exec(token);
        if (match && !token.endsWith('/>')) {
          const [, closing, tag] = match;
          if (skipTags.test(tag)) {
            skipDepth = closing ? Math.max(0, skipDepth - 1) : skipDepth + 1;
          }
        }
        return token;
      }
      if (skipDepth > 0 || linkedPaths.size >= maxLinks) return token;

      return token.replace(LOCATION_REGEX, (matched) => {
        if (linkedPaths.size >= maxLinks) return matched;
        const target = TARGET_BY_TERM.get(matched);
        if (!target || linkedPaths.has(target.path)) return matched;
        linkedPaths.add(target.path);
        return `<a href="${target.path}" class="article-loc-link" title="Property Investment in ${target.label}">${matched}</a>`;
      });
    })
    .join('');
}

// Extract all unique Cities and LGAs mentioned in a blog post for the
// "Markets & Locations Mentioned in This Article" research block.
export function extractMentionedLocations(post, maxItems = 10) {
  if (!post) return [];
  const plain = `${post.name || ''} ${post.summary || ''} ${String(post.body || '').replace(/<[^>]+>/g, ' ')}`;
  const seenPaths = new Set();
  const found = [];
  let match;
  const re = new RegExp(LOCATION_REGEX.source, 'g');
  while ((match = re.exec(plain)) !== null) {
    const target = TARGET_BY_TERM.get(match[1]);
    if (target && !seenPaths.has(target.path)) {
      seenPaths.add(target.path);
      found.push(target);
      if (found.length >= maxItems) break;
    }
  }
  return found;
}

export function splitBody(html, fraction = 0.3) {
  const body = linkLocationsInHtml(String(html || ''));
  const target = body.length * fraction;
  const blocks = /^(p|h[1-6]|ul|ol|li|blockquote|figure|figcaption|table|thead|tbody|tr|td|th|div|section|pre)$/;
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)[^>]*?(\/?)>/g;
  let depth = 0;
  let match;
  while ((match = tagRe.exec(body))) {
    const [, closing, name, selfClosing] = match;
    if (selfClosing || !blocks.test(name.toLowerCase())) continue;
    depth += closing ? -1 : 1;
    if (closing && depth <= 0 && tagRe.lastIndex >= target) {
      const rest = body.slice(tagRe.lastIndex);
      if (!rest.trim()) break;
      return [body.slice(0, tagRe.lastIndex), rest];
    }
  }
  return [body, ''];
}
