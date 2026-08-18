import Link from 'next/link';
import Footer from '../../components/Footer';
import MobileNav from '../../components/MobileNav';
import { pageMetadata } from '../../../lib/seo';

const logoUrl = 'https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/00b2dce8-67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';
const jacobImage = 'https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/92b44b8f-67907563bbfb3b1b418dc748_ripehouse-advisory-story-jacob-field.webp';
const annaImage = 'https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/f010372f-679075638cde3eadaf17850f_ripehouse-advisory-story-anna-cooper.webp';
const suburbImage = 'https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/57344d7e-67884a3c70c47a84b0078be8_320921e68139df0b67c312548e43580b_australia-suburb.webp';

export const metadata = pageMetadata({
  title: 'Our Story | Ripehouse Advisory',
  description: 'Meet Jacob Field and Anna Cooper, the founders behind Ripehouse Advisory and a more considered way to invest in property.',
  path: '/about/story',
  image: { url: jacobImage, alt: 'Jacob Field, founder and CEO of Ripehouse Advisory' },
});

export default function StoryPage() {
  return (
    <main className="story-page">
      <header className="site-header"><Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link><nav className="desktop-nav" aria-label="Main navigation"><Link className="active" href="/about/story">Our story</Link><Link href="/#approach">Our approach</Link><Link href="/resources/blog">Market intel</Link><Link href="/#contact">Contact</Link></nav><Link className="header-cta" href="/discovery-call">Book a call <span>↗</span></Link><MobileNav links={[{ label: 'Our story', href: '/about/story' }, { label: 'Our approach', href: '/#approach' }, { label: 'Market intel', href: '/resources/blog' }, { label: 'Contact', href: '/#contact' }]} /></header>

      <section className="story-hero section-shell"><div className="story-hero-copy"><p className="eyebrow"><span /> The people behind the plan</p><h1>Property advice<br />with <i>a point of view.</i></h1><p>Ripehouse Advisory exists because the property industry had a problem: too much noise, too little accountability, and no real system for helping everyday Australians build a future.</p></div><div className="story-hero-art"><video autoPlay muted loop playsInline poster="/authority-website-video-poster.jpg" aria-label="Aerial view of an Australian suburban street"><source src="/authority-website-video.mp4" type="video/mp4" /></video><span className="story-hero-stamp">Built for<br /><i>the long game.</i></span></div></section>

      <section className="story-intro section-shell"><p className="section-label">Our story</p><div className="story-intro-grid"><h2>We didn&apos;t set out to build another property company.</h2><div><p>We set out to fix the parts of property investing that kept letting people down.</p><p>Ripehouse was born from years spent inside the industry — seeing the same mistakes repeat, the same shortcuts sold as strategy, and the same investors left to make life-changing decisions with half the picture.</p><p>So we built a different way: research first, advice without the sales pitch, and a team that stays with you beyond the purchase.</p></div></div></section>

      <section className="founders section-shell"><div className="founders-heading"><p className="section-label">The founders</p><p>Two distinct perspectives. One shared belief: property should create more choices for your life, not become your life.</p></div><div className="founder-grid"><article className="founder-card"><div className="founder-photo"><img src={jacobImage} alt="Jacob Field, co-founder of Ripehouse Advisory" /></div><div className="founder-content"><p className="founder-role">Chief Executive Officer</p><h2>Jacob<br /><i>Field</i></h2><p>Jacob exited the 9–5 through property investment at 32. With a background in software engineering and a deep understanding of how data can change a decision, he founded Ripehouse Advisory in 2011.</p><p>His focus is simple: turn an overwhelming market into a system people can actually use — one that helps investors avoid expensive mistakes and build with intention.</p><Link className="text-link dark-link" href="/resources/blog">Read Jacob&apos;s thinking <span>↗</span></Link></div></article><article className="founder-card founder-card-anna"><div className="founder-photo"><img src={annaImage} alt="Anna Cooper, co-founder of Ripehouse Advisory" /></div><div className="founder-content"><p className="founder-role">Chief Operations Officer</p><h2>Anna<br /><i>Cooper</i></h2><p>Anna brings more than a decade of experience in property research, communications and personal investment. As former Managing Editor at Australian Property Investor Magazine, she knows the difference between a headline and an insight.</p><p>She makes sure the thinking becomes useful — clear guidance, honest context and an experience that treats every client&apos;s goals as genuinely personal.</p><Link className="text-link dark-link" href="/resources/blog">Explore Market Intel <span>↗</span></Link></div></article></div></section>

      <section className="story-belief"><div className="section-shell"><p className="eyebrow light"><span /> What we believe</p><blockquote>“The right property is not the goal.<br /><i>The life it makes possible is.</i>”</blockquote><p className="story-belief-caption">— Jacob Field &amp; Anna Cooper</p></div></section>

      <section className="story-method section-shell"><div className="story-method-image"><img src={suburbImage} alt="Australian suburb viewed through trees" /></div><div className="story-method-copy"><p className="section-label">The work behind the advice</p><h2>Curiosity became a <i>system.</i></h2><p>Since 2015, our research process has evaluated more than 15,000 Australian suburbs across 27 core metrics. We look at the details broad market averages miss: supply, demand, infrastructure, liveability, flood risk, block slope, overlays and the signals that shape a street&apos;s future.</p><p>It is deliberately demanding. Quality over quantity. Evidence before excitement. A shortlist only earns its place when it can stand up to scrutiny.</p><Link className="button button-primary" href="/five-markets">See our latest research <span>↗</span></Link></div></section>

      <section className="story-cta section-shell"><div><p className="eyebrow light"><span /> Your next chapter</p><h2>Good advice starts<br />with a <i>good conversation.</i></h2><p>Tell us where you are now. We&apos;ll help you think clearly about where you could go next.</p><Link className="button button-light" href="/discovery-call">Book a free discovery call <span>↗</span></Link></div></section>

      <Footer />
    </main>
  );
}
