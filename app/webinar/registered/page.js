import Link from 'next/link';
import Footer from '../../components/Footer';
import { pageMetadata } from '../../../lib/seo';

const logoUrl = 'https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/00b2dce8-67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';

export const metadata = {
  ...pageMetadata({
    title: 'You\u2019re registered | Ripehouse Advisory Webinar',
    description: 'You\u2019re registered for the live webinar with Jacob Field \u2014 Tuesday 25 August, 7:00pm AEST.',
    path: '/webinar/registered',
  }),
  robots: { index: false, follow: false },
};

// Google Calendar: 7:00pm AEST (UTC+10) on 25 Aug 2026 = 09:00Z, 45 minutes.
const gcalUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
  + '&text=' + encodeURIComponent('Webinar: If I Were Buying an Investment Property in Australia Today \u2014 Jacob Field, Ripehouse Advisory')
  + '&dates=20260825T090000Z/20260825T094500Z'
  + '&details=' + encodeURIComponent('Your unique join link is in your confirmation email from Ripehouse Advisory (via Demio). Join a few minutes early.')
  + '&location=' + encodeURIComponent('Online \u2014 join link in your email');

export default function WebinarRegisteredPage() {
  return (
    <main className="wb-page">
      <header className="site-header book-header">
        <Link className="brand" href="/" aria-label="Ripehouse Advisory home">
          <img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" />
        </Link>
        <span className="book-header-note">Free live webinar &middot; Tuesday 25 August</span>
      </header>

      <section className="wb-registered section-shell">
        <p className="eyebrow"><span /> Registration confirmed</p>
        <h1>You&rsquo;re <i>registered.</i></h1>
        <p className="wb-registered-when">Tuesday 25 August &middot; 7:00pm AEST &middot; 45 minutes &middot; Live online</p>
        <p className="wb-registered-note">
          Your confirmation email is on its way with your unique join link.
          Reminders will follow the day before, one hour before and just before we go live.
        </p>
        <div className="wb-registered-actions">
          <a className="button button-primary" href={gcalUrl} target="_blank" rel="noopener noreferrer">Add to calendar <span>&#8599;</span></a>
          <Link className="text-link dark-link" href="/suburbs">While you wait: get your suburb scored <span>&#8599;</span></Link>
        </div>
        <div className="wb-registered-tips">
          <p className="section-label">Before Tuesday</p>
          <ul>
            <li>Block the 45 minutes &mdash; this session is built to attend live, not replay.</li>
            <li>Have the suburb or market you&rsquo;re currently considering in mind. The process will give you a way to pressure-test it.</li>
            <li>Can&rsquo;t find the email? Check spam for a message from Ripehouse Advisory via Demio.</li>
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}
