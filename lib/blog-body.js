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

  // Multi-word Investment Suburbs
  { term: 'Gillieston Heights', label: 'Gillieston Heights (NSW)', kind: 'Suburb', path: '/suburbs/nsw/gillieston-heights' },
  { term: 'Springfield Lakes', label: 'Springfield Lakes (QLD)', kind: 'Suburb', path: '/suburbs/qld/springfield-lakes' },
  { term: 'Hoppers Crossing', label: 'Hoppers Crossing (VIC)', kind: 'Suburb', path: '/suburbs/vic/hoppers-crossing' },
  { term: 'Redbank Plains', label: 'Redbank Plains (QLD)', kind: 'Suburb', path: '/suburbs/qld/redbank-plains' },
  { term: 'Port Melbourne', label: 'Port Melbourne (VIC)', kind: 'Suburb', path: '/suburbs/vic/port-melbourne' },
  { term: 'Upper Coomera', label: 'Upper Coomera (QLD)', kind: 'Suburb', path: '/suburbs/qld/upper-coomera' },
  { term: 'Morphett Vale', label: 'Morphett Vale (SA)', kind: 'Suburb', path: '/suburbs/sa/morphett-vale' },
  { term: 'Aldinga Beach', label: 'Aldinga Beach (SA)', kind: 'Suburb', path: '/suburbs/sa/aldinga-beach' },
  { term: 'Blackmans Bay', label: 'Blackmans Bay (TAS)', kind: 'Suburb', path: '/suburbs/tas/blackmans-bay' },
  { term: 'Prospect Vale', label: 'Prospect Vale (TAS)', kind: 'Suburb', path: '/suburbs/tas/prospect-vale' },
  { term: 'Mount Gambier', label: 'Mount Gambier (SA)', kind: 'Suburb', path: '/suburbs/sa/mount-gambier' },
  { term: 'Marsden Park', label: 'Marsden Park (NSW)', kind: 'Suburb', path: '/suburbs/nsw/marsden-park' },
  { term: 'Mount Druitt', label: 'Mount Druitt (NSW)', kind: 'Suburb', path: '/suburbs/nsw/mount-druitt' },
  { term: 'Davoren Park', label: 'Davoren Park (SA)', kind: 'Suburb', path: '/suburbs/sa/davoren-park' },
  { term: 'Clyde North', label: 'Clyde North (VIC)', kind: 'Suburb', path: '/suburbs/vic/clyde-north' },
  { term: 'North Lakes', label: 'North Lakes (QLD)', kind: 'Suburb', path: '/suburbs/qld/north-lakes' },
  { term: 'Potts Point', label: 'Potts Point (NSW)', kind: 'Suburb', path: '/suburbs/nsw/potts-point' },
  { term: 'Point Cook', label: 'Point Cook (VIC)', kind: 'Suburb', path: '/suburbs/vic/point-cook' },
  { term: 'Ocean Reef', label: 'Ocean Reef (WA)', kind: 'Suburb', path: '/suburbs/wa/ocean-reef' },
  { term: 'Halls Head', label: 'Halls Head (WA)', kind: 'Suburb', path: '/suburbs/wa/halls-head' },
  { term: 'Rouse Hill', label: 'Rouse Hill (NSW)', kind: 'Suburb', path: '/suburbs/nsw/rouse-hill' },
  { term: 'Munno Para', label: 'Munno Para (SA)', kind: 'Suburb', path: '/suburbs/sa/munno-para' },
  { term: 'Oran Park', label: 'Oran Park (NSW)', kind: 'Suburb', path: '/suburbs/nsw/oran-park' },
  { term: 'Sandy Bay', label: 'Sandy Bay (TAS)', kind: 'Suburb', path: '/suburbs/tas/sandy-bay' },
  { term: 'St Marys', label: 'St Marys (NSW)', kind: 'Suburb', path: '/suburbs/nsw/st-marys' },

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

  // Distinctive single-word Investment Suburbs
  { term: 'Tarneit', label: 'Tarneit (VIC)', kind: 'Suburb', path: '/suburbs/vic/tarneit' },
  { term: 'Mernda', label: 'Mernda (VIC)', kind: 'Suburb', path: '/suburbs/vic/mernda' },
  { term: 'Werribee', label: 'Werribee (VIC)', kind: 'Suburb', path: '/suburbs/vic/werribee' },
  { term: 'Pakenham', label: 'Pakenham (VIC)', kind: 'Suburb', path: '/suburbs/vic/pakenham' },
  { term: 'Craigieburn', label: 'Craigieburn (VIC)', kind: 'Suburb', path: '/suburbs/vic/craigieburn' },
  { term: 'Sunbury', label: 'Sunbury (VIC)', kind: 'Suburb', path: '/suburbs/vic/sunbury' },
  { term: 'Scarborough', label: 'Scarborough (WA)', kind: 'Suburb', path: '/suburbs/wa/scarborough' },
  { term: 'Baldivis', label: 'Baldivis (WA)', kind: 'Suburb', path: '/suburbs/wa/baldivis' },
  { term: 'Ellenbrook', label: 'Ellenbrook (WA)', kind: 'Suburb', path: '/suburbs/wa/ellenbrook' },
  { term: 'Alkimos', label: 'Alkimos (WA)', kind: 'Suburb', path: '/suburbs/wa/alkimos' },
  { term: 'Yanchep', label: 'Yanchep (WA)', kind: 'Suburb', path: '/suburbs/wa/yanchep' },
  { term: 'Byford', label: 'Byford (WA)', kind: 'Suburb', path: '/suburbs/wa/byford' },
  { term: 'Caboolture', label: 'Caboolture (QLD)', kind: 'Suburb', path: '/suburbs/qld/caboolture' },
  { term: 'Morayfield', label: 'Morayfield (QLD)', kind: 'Suburb', path: '/suburbs/qld/morayfield' },
  { term: 'Narangba', label: 'Narangba (QLD)', kind: 'Suburb', path: '/suburbs/qld/narangba' },
  { term: 'Kallangur', label: 'Kallangur (QLD)', kind: 'Suburb', path: '/suburbs/qld/kallangur' },
  { term: 'Ripley', label: 'Ripley (QLD)', kind: 'Suburb', path: '/suburbs/qld/ripley' },
  { term: 'Beenleigh', label: 'Beenleigh (QLD)', kind: 'Suburb', path: '/suburbs/qld/beenleigh' },
  { term: 'Pimpama', label: 'Pimpama (QLD)', kind: 'Suburb', path: '/suburbs/qld/pimpama' },
  { term: 'Coomera', label: 'Coomera (QLD)', kind: 'Suburb', path: '/suburbs/qld/coomera' },
  { term: 'Southport', label: 'Southport (QLD)', kind: 'Suburb', path: '/suburbs/qld/southport' },
  { term: 'Robina', label: 'Robina (QLD)', kind: 'Suburb', path: '/suburbs/qld/robina' },
  { term: 'Bargara', label: 'Bargara (QLD)', kind: 'Suburb', path: '/suburbs/qld/bargara' },
  { term: 'Urraween', label: 'Urraween (QLD)', kind: 'Suburb', path: '/suburbs/qld/urraween' },
  { term: 'Kirwan', label: 'Kirwan (QLD)', kind: 'Suburb', path: '/suburbs/qld/kirwan' },
  { term: 'Burdell', label: 'Burdell (QLD)', kind: 'Suburb', path: '/suburbs/qld/burdell' },
  { term: 'Glenvale', label: 'Glenvale (QLD)', kind: 'Suburb', path: '/suburbs/qld/glenvale' },
  { term: 'Harristown', label: 'Harristown (QLD)', kind: 'Suburb', path: '/suburbs/qld/harristown' },
  { term: 'Woolloongabba', label: 'Woolloongabba (QLD)', kind: 'Suburb', path: '/suburbs/qld/woolloongabba' },
  { term: 'Keperra', label: 'Keperra (QLD)', kind: 'Suburb', path: '/suburbs/qld/keperra' },
  { term: 'Leppington', label: 'Leppington (NSW)', kind: 'Suburb', path: '/suburbs/nsw/leppington' },
  { term: 'Austral', label: 'Austral (NSW)', kind: 'Suburb', path: '/suburbs/nsw/austral' },
  { term: 'Kellyville', label: 'Kellyville (NSW)', kind: 'Suburb', path: '/suburbs/nsw/kellyville' },
  { term: 'Schofields', label: 'Schofields (NSW)', kind: 'Suburb', path: '/suburbs/nsw/schofields' },
  { term: 'Campbelltown', label: 'Campbelltown (NSW)', kind: 'Suburb', path: '/suburbs/nsw/campbelltown' },
  { term: 'Charlestown', label: 'Charlestown (NSW)', kind: 'Suburb', path: '/suburbs/nsw/charlestown' },
  { term: 'Rutherford', label: 'Rutherford (NSW)', kind: 'Suburb', path: '/suburbs/nsw/rutherford' },
  { term: 'Thornton', label: 'Thornton (NSW)', kind: 'Suburb', path: '/suburbs/nsw/thornton' },
  { term: 'Mudgee', label: 'Mudgee (NSW)', kind: 'Suburb', path: '/suburbs/nsw/mudgee' },
  { term: 'Craigmore', label: 'Craigmore (SA)', kind: 'Suburb', path: '/suburbs/sa/craigmore' },
  { term: 'Howrah', label: 'Howrah (TAS)', kind: 'Suburb', path: '/suburbs/tas/howrah' },
  { term: 'Lindisfarne', label: 'Lindisfarne (TAS)', kind: 'Suburb', path: '/suburbs/tas/lindisfarne' },
  { term: 'Moonah', label: 'Moonah (TAS)', kind: 'Suburb', path: '/suburbs/tas/moonah' },
  { term: 'Newnham', label: 'Newnham (TAS)', kind: 'Suburb', path: '/suburbs/tas/newnham' },
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
