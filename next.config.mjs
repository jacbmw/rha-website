const isDev = process.env.NODE_ENV === 'development';

// Content-Security-Policy sources are derived from what the site actually loads:
// - GA4/gtag (googletagmanager.com, google-analytics.com)
// - Meta pixel (connect.facebook.net, www.facebook.com)
// - Calendly inline widget (assets.calendly.com script/css, calendly.com iframe)
// - YouTube testimonial embeds (youtube-nocookie.com, i.ytimg.com thumbnails)
// - Webflow CDN imagery + blog rich text (img-src stays broad for CMS content)
// - First-party beacons to dashboard.picki.com.au
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://assets.calendly.com`,
  "style-src 'self' 'unsafe-inline' https://assets.calendly.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://assets.calendly.com",
  // NOTE: GA4 beacons go to the BARE hosts analytics.google.com and
  // stats.g.doubleclick.net — CSP wildcards (*.analytics.google.com) do NOT
  // match the apex domain, which silently blocked every GA4 pageview after
  // the cutover (fixed 2026-08-13). Keep the bare hosts listed explicitly.
  "connect-src 'self' https://dashboard.picki.com.au https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://stats.g.doubleclick.net https://*.g.doubleclick.net https://www.google.com https://www.google.com.au https://www.googletagmanager.com https://www.facebook.com https://connect.facebook.net https://*.calendly.com",
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com https://calendly.com https://*.calendly.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Content-Security-Policy', value: csp },
];

// Legacy Webflow-site redirects (audit 2026-08-13). The old site's URL space
// (520 URLs: 60 static pages + 460 CMS items) 404'd after the cutover.
// Query strings are preserved automatically by Next.js redirects.
// NOTE: /lp/* legacy funnels are handled by Amplify custom rules (the /lp/<*>
// Webflow proxy rule intercepts those before they reach Next).
const legacyRedirects = [
  // CMS collections (1:1 where content exists on the new site)
  { source: '/blog', destination: '/resources/blog', permanent: true },
  { source: '/blog/:slug', destination: '/resources/blog/:slug', permanent: true },
  { source: '/podcast', destination: '/resources/blog', permanent: true },
  { source: '/podcast/:path*', destination: '/resources/blog', permanent: true },
  { source: '/videos', destination: '/resources/blog', permanent: true },
  { source: '/videos/:path*', destination: '/resources/blog', permanent: true },
  { source: '/resources/videos', destination: '/resources/blog', permanent: true },
  { source: '/events', destination: '/resources/blog', permanent: true },
  { source: '/events/:path*', destination: '/resources/blog', permanent: true },
  { source: '/resources/events', destination: '/resources/blog', permanent: true },
  { source: '/reviews', destination: '/', permanent: true },
  { source: '/reviews/:path*', destination: '/', permanent: true },
  { source: '/staff/:path*', destination: '/about/story', permanent: true },
  { source: '/featured-in/:path*', destination: '/', permanent: true },
  { source: '/purchases/:path*', destination: '/', permanent: true },
  // Legal + about
  { source: '/privacy-policy', destination: '/legal/privacy-policy', permanent: true },
  { source: '/terms-and-conditions', destination: '/legal/terms-and-conditions', permanent: true },
  { source: '/team', destination: '/about/story', permanent: true },
  { source: '/story', destination: '/about/story', permanent: true },
  { source: '/approach', destination: '/about/approach', permanent: true },
  { source: '/due-diligence', destination: '/about/approach', permanent: true },
  { source: '/about/due-diligence', destination: '/about/approach', permanent: true },
  { source: '/referrals/:path*', destination: '/discovery-call', permanent: true },
  { source: '/book/session', destination: '/discovery-call', permanent: true },
  { source: '/resources/mastermind-questions', destination: '/discovery-call', permanent: true },
  { source: '/referrals', destination: '/discovery-call', permanent: true },
  // Old root-level ad landing pages → discovery call
  { source: '/2025-the-year-you-build-real-wealth', destination: '/discovery-call', permanent: true },
  { source: '/see-what-10-compound-growth-can-do-for-you', destination: '/discovery-call', permanent: true },
  { source: '/break-free-from-the-property-investment-plateau', destination: '/discovery-call', permanent: true },
  { source: '/build-a-portfolio-that-grows-while-you-sleep', destination: '/discovery-call', permanent: true },
  { source: '/property-investing-simplified', destination: '/discovery-call', permanent: true },
  { source: '/property-investing-simplified-for-you', destination: '/discovery-call', permanent: true },
  { source: '/stop-guessing-start-growing', destination: '/discovery-call', permanent: true },
  { source: '/unlock-generational-wealth', destination: '/discovery-call', permanent: true },

  // Bell family campaign pages
  { source: '/lp/25/11/bell-family/freedom', destination: '/bell-family', permanent: true },
  { source: '/lp/25/11/bell-family/book-in', destination: '/bell-family', permanent: true },
];

const nextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
  async redirects() {
    return legacyRedirects;
  },
};

export default nextConfig;
