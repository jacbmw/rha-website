import Link from 'next/link';

// High-contrast webinar promo banner. Two variants:
//  - "inline": injected ~50% of the way down the article body (mobile/tablet;
//    hidden on wide desktop where the rail takes over)
//  - "rail": sticky right-hand column beside the post content (desktop only)
// Session details are kept in one place here — update WEBINAR below when the
// next Demio session is scheduled.
const WEBINAR = {
  when: 'Tuesday 25 August · 7:00pm AEST',
  length: '45 minutes · Live · Free',
  href: '/webinar',
};

export default function WebinarBanner({ variant = 'inline' }) {
  return (
    <aside className={`webinar-banner webinar-banner--${variant}`} aria-label="Free live webinar">
      <p className="webinar-banner-kicker">Free live webinar</p>
      <h3>If I were buying an investment property in Australia <i>today,</i> this is how I&rsquo;d do it.</h3>
      <p className="webinar-banner-when">{WEBINAR.when}</p>
      <p className="webinar-banner-copy">
        Join Ripehouse Advisory founder Jacob Field for a live working session on
        the tests a property has to pass before he&rsquo;d buy it. {WEBINAR.length}.
      </p>
      <Link className="button button-light webinar-banner-cta" href={WEBINAR.href}>
        Reserve my seat <span>&#8599;</span>
      </Link>
    </aside>
  );
}
