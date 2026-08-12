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

const nextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
