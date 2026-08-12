// Hero illustration "B" — Direction A "The Structure" from the v1 creative
// brief (12 Aug 2026). The RH isometric monogram geometry, extended: baseline
// continues into a horizon carrying suburb data markers; one aperture warms.
// Self-contained SVG + CSS animation (see .hero-art--b rules in globals.css),
// no JS. Draw-on sequence uses pathLength="1" strokes; reduced-motion users
// get the completed final frame.
//
// Geometry is pseudo-isometric (true verticals + ~30° diagonals), constructed
// from the logomark's five moves: monoline iso construction, spine + diagonal
// brace, skewed-window apertures, bottom-centre convergence, open forms.

const GOLD = '#c79810';
const GOLD_DARK = '#b27a17';
const NAVY = '#141a32';

// Horizon data markers: [x, stem height]. The second marker carries the
// slow idle shimmer.
const MARKERS = [
  [905, 46],
  [990, 72],
  [1075, 34],
  [1160, 58],
];

export default function HeroArtB() {
  return (
    <div className="hero-art hero-art--b" aria-hidden="true">
      <svg viewBox="0 0 1200 1200" preserveAspectRatio="xMaxYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="habField" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e6ebec" />
            <stop offset="1" stopColor="#dfe6e7" />
          </linearGradient>
        </defs>

        <rect width="1200" height="1200" fill="url(#habField)" />

        <g className="hab-float">
          {/* Structure — outer hexagonal shell, resolving to the low centre vertex */}
          <path
            className="hab-draw hab-shell"
            d="M665 300 L873 420 L873 660 L665 780 L457 660 L457 420 Z"
            pathLength="1"
            stroke={GOLD}
            strokeWidth="13"
            strokeLinejoin="round"
          />

          {/* Top-face ridges converging on the spine head */}
          <path className="hab-draw hab-ridge" d="M457 420 L665 540" pathLength="1" stroke={GOLD} strokeWidth="13" strokeLinecap="round" />
          <path className="hab-draw hab-ridge" d="M873 420 L665 540" pathLength="1" stroke={GOLD} strokeWidth="13" strokeLinecap="round" />

          {/* The spine — central vertical to the bottom vertex */}
          <path className="hab-draw hab-spine" d="M665 540 L665 780" pathLength="1" stroke={GOLD} strokeWidth="13" strokeLinecap="round" />

          {/* Horizon — the research continues beyond the frame */}
          <path className="hab-draw hab-horizon" d="M665 780 H1210" pathLength="1" stroke={GOLD} strokeWidth="4" />
          <path className="hab-draw hab-horizon hab-horizon-faint" d="M285 780 H560" pathLength="1" stroke={GOLD} strokeWidth="4" />

          {/* Apertures — roof diamonds + facade windows (data panels) */}
          <path className="hab-draw hab-aperture hab-ap1" d="M596 391 L646 420 L596 449 L546 420 Z" pathLength="1" stroke={GOLD} strokeWidth="9" strokeLinejoin="round" />
          <path className="hab-draw hab-aperture hab-ap2" d="M734 391 L784 420 L734 449 L684 420 Z" pathLength="1" stroke={GOLD} strokeWidth="9" strokeLinejoin="round" />
          <path className="hab-draw hab-aperture hab-ap3" d="M500 510 L580 556 L580 646 L500 600 Z" pathLength="1" stroke={GOLD} strokeWidth="9" strokeLinejoin="round" />

          {/* The selected opportunity — this aperture warms */}
          <path className="hab-warm-fill" d="M720 545 L800 499 L800 579 L720 625 Z" fill={GOLD} />
          <path className="hab-draw hab-aperture hab-ap4" d="M720 545 L800 499 L800 579 L720 625 Z" pathLength="1" stroke={GOLD} strokeWidth="9" strokeLinejoin="round" />

          {/* The brace — the R's leg, drawn last, slightly heavier */}
          <path className="hab-draw hab-brace" d="M665 575 L780 713" pathLength="1" stroke={GOLD_DARK} strokeWidth="16" strokeLinecap="round" />

          {/* Suburb readings along the horizon */}
          {MARKERS.map(([x, h], i) => (
            <g key={x} className={`hab-marker hab-m${i + 1}`}>
              <path d={`M${x} 780 V${780 - h}`} stroke={GOLD} strokeWidth="3" />
              <path
                d={`M${x} ${780 - h - 22} L${x + 11} ${780 - h - 11} L${x} ${780 - h} L${x - 11} ${780 - h - 11} Z`}
                stroke={GOLD}
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path d={`M${x} 788 V796`} stroke={NAVY} strokeWidth="2" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
