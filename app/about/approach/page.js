import Link from 'next/link';
import ApproachChart from './ApproachChart';
import Footer from '../../components/Footer';
import MobileNav from '../../components/MobileNav';
import { pageMetadata } from '../../../lib/seo';

const logoUrl = 'https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/00b2dce8-67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';

export const metadata = pageMetadata({
  title: 'Our Approach | Ripehouse Advisory',
  description: 'You can only optimise what you can measure. Discover the research, human judgement and long-term sequence behind Ripehouse Advisory.',
  path: '/about/approach',
});

const steps = [
  ['01', 'Discovery call', 'We start with where you are, where you want to go, and what needs to be true to get there.'],
  ['02', 'Wealth consultation', 'We map the moving parts of your position and build the first version of your wealth blueprint.'],
  ['03', 'Strategy session', 'Your goals become a purchase brief: clear preferences, constraints and a sequence built around your life.'],
  ['04', 'Property research', 'Our data and research teams identify locations and opportunities that meet the brief, not a sales target.'],
  ['05', 'Asset presentation', 'You see the evidence, the risks and the opportunity clearly before you decide.'],
  ['06', 'Negotiation & settlement', 'Our approved partners manage the transaction while we stay close to the strategy.'],
  ['07', 'Mentorship', 'The relationship continues after the keys: reviews, market context and the next intelligent move.'],
];

export default function ApproachPage() {
  return <main className="approach-page">
    <header className="site-header"><Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link><nav className="desktop-nav" aria-label="Main navigation"><Link href="/about/story">Our story</Link><Link className="active" href="/about/approach">Our approach</Link><Link href="/resources/blog">Market intel</Link><Link href="/#contact">Contact</Link></nav><Link className="header-cta" href="/discovery-call">Book a call <span>↗</span></Link><MobileNav links={[{ label: 'Our story', href: '/about/story' }, { label: 'Our approach', href: '/about/approach' }, { label: 'Market intel', href: '/resources/blog' }, { label: 'Contact', href: '/#contact' }]} /></header>

    <section className="approach-hero section-shell"><div><p className="eyebrow"><span /> The Ripehouse method</p><h1>You can only<br />optimise what<br />you <i>measure.</i></h1><p>Property investment is not a collection of guesses. It is a sequence of decisions — made clearer by data, stronger through judgement, and designed to compound.</p></div><div className="approach-hero-mark"><span>01</span><p>Measure<br /><i>everything.</i></p></div></section>

    <section className="cagr-section"><div className="section-shell"><div className="cagr-heading"><div><p className="eyebrow light"><span /> The proof in the process</p><h2>Compounding Annual<br /><i>Growth Rate by Client</i></h2></div><div><p>Every dot is a client portfolio. Every line is a question: are the decisions we make today creating more choices tomorrow?</p><p className="cagr-note">CAGR annualises portfolio growth from each client&apos;s first purchase. It is a measure of what happened, not a promise of what comes next.</p></div></div><ApproachChart /></div></section>

    <section className="approach-principles section-shell"><p className="section-label">A Legacy Agency</p><div className="principles-hero"><h2>Human judgement.<br /><i>Machine precision.</i></h2><p>We combine the part of investing that technology is brilliant at — finding patterns in enormous amounts of data — with the part it cannot do alone: understanding a person, a property and the risks between the lines.</p></div><div className="approach-principle-grid"><article><span>01</span><h3>The human touch</h3><p>Property is personal. A dedicated team stays with you from strategy to settlement and beyond, translating complexity into confident decisions.</p></article><article><span>02</span><h3>Advanced data analysis</h3><p>Our research evaluates more than 15,000 suburbs across 27 core metrics, then our analysts and valuers apply the scrutiny no algorithm can replace.</p></article><article><span>03</span><h3>The Legacy Sequence</h3><p>Buy with purpose, build equity, use it intelligently, and keep the sequence moving toward the financial life you want.</p></article></div></section>

    <section className="approach-process section-shell"><div className="process-heading"><p className="section-label">How it works</p><h2>A system built<br />to <i>stay with you.</i></h2><p>Not a transaction. Not a handover. A considered process that keeps improving as your circumstances and your portfolio evolve.</p></div><div className="process-list">{steps.map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></section>

    <section className="approach-cta section-shell"><div><p className="eyebrow light"><span /> Make your next move measurable</p><h2>Start with a<br /><i>conversation.</i></h2><p>We&apos;ll talk through where you are, what you want to build and whether Ripehouse is the right fit.</p><Link className="button button-light" href="/discovery-call">Book a free discovery call <span>↗</span></Link></div></section>

    <Footer />
  </main>;
}
