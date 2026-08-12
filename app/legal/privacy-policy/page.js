import Link from 'next/link';
import Footer from '../../components/Footer';
import { pageMetadata } from '../../../lib/seo';

const logoUrl = 'https://cdn.prod.website-files.com/6784a240509d2ca9e7e38e06/67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';

export const metadata = pageMetadata({
  title: 'Privacy Policy | Ripehouse Advisory',
  description: 'How Ripehouse Advisory collects, uses and safeguards your personal information.',
  path: '/legal/privacy-policy',
});

const body = `
<p>Ripehouse Advisory recognises the importance of your privacy and understands your concerns about the security of your personal information. We are committed to protecting any personal information about you that we hold. This privacy policy details how we generally manage your personal information and safeguard your privacy.</p>
<p>These guidelines are subject to change. Any such changes will be made to this page.</p>
<h2>The National Privacy Principles</h2>
<p>From 21 December 2001 most private sector organisations in Australia must by law comply with the National Privacy Principles subject to the Privacy Act 1988 (Cth) (&ldquo;NPPs&rdquo;).</p>
<h3>The kinds of personal information we hold:</h3>
<p>We only collect personal information that is necessary for us to perform our functions.</p>
<p>The kinds of personal information we collect and hold will depend upon the services you request from us. However, it may include:</p>
<p>&mdash; Information you give us when you subscribe to Ripehouse Advisory<br>&mdash; Information you give us when you complete a Reader Survey, competition, online form on our websites or other activity which requests that you provide such information<br>&mdash; Information you give us when you communicate with or place an order from Ripehouse Advisory.</p>
<p>We also collect some information from you when you use www.ripehouseadvisory.com.au. Your use of the facilities and services available through our websites will determine the amount and type of information which we collect about you. Some of this information will not be personal information because it will not reveal your identity.</p>
<p>The only personal information which we collect about you when you use our websites is what you tell us about yourself (for example, by completing an online form, subscribing to an online newsletter or placing an order), or information you provide to us when you send us an email. We may record your email address if you send us an email.</p>
<p>For security purposes we do not retain credit card details after orders have been processed. If you place orders with us more than once, you will need to provide your credit card details each time you place an order.</p>
<p>Emails you receive from us regarding publications, products, events, education and third-party advertising</p>
<p>As a matter of policy, we do not sell, rent or otherwise disclose lists of Ripehouse Advisory subscribers or other customers of Ripehouse Advisory.</p>
<p>If you subscribe to our email newsletter, we may from time to time send you emails containing third-party advertisements. These advertisers will not have access to your email address or other personal information.</p>
<h3>Collection of anonymous information</h3>
<p>As most websites do, we track usage patterns on our website on an anonymous aggregate basis. Your identity cannot reasonably be ascertained from this information. Each time you visit our website a web server makes a record of your visit.</p>
<h3>Using and disclosing your personal information</h3>
<p>We respect your privacy. Any personal information which we collect about you will be used to provide the goods and services we normally provide in the course of our business. We do not sell or rent contact lists of our customers (including Ripehouse Advisory subscribers).</p>
<p>We may use your personal information to contact you to discuss other matters relating to Ripehouse Advisory as well; for example, to conduct a reader survey or to interview you for an article.</p>
<p>We may also use your personal information to provide you with information about other products and services offered by us. If you would prefer not to receive this information, please let us know by email to <a href="mailto:info@ripehouseadvisory.com.au">info@ripehouseadvisory.com.au</a> (attn: Privacy Officer) or in writing to the address at the bottom of this page and we will respect your request.</p>
<h3>Contracting out services and disclosures</h3>
<p>We may disclose your personal information to our service entities and contract out some of our functions (such as bulk mailing of Ripehouse Advisory subscriptions and telemarketing of subscription renewals) to external service providers. We may disclose your personal information to these external service providers but only so that they can provide the services that we have contracted out to them.</p>
<h3>Credit accounts</h3>
<p>If you have applied for a Commercial Credit Account and we have approved your application, to the extent permitted by law we may share information about the status of your account with other credit providers and credit reporting agencies.</p>
<h3>How we collect personal information from you</h3>
<p>If you provide us or have provided us with your email address, we may send emails to you containing Ripehouse Advisory publications, such as newsletters. We may use an &ldquo;email management system&rdquo; to automate the management and dispatch of these emails. The system operates by inserting tracking codes in the emails that we send to you.</p>
<h3>The kind of personal information we collect about you</h3>
<p>The tracking code allows us to collect personal information about you, such as whether you received and opened an email, and whether you clicked through to any links to our website. This information that we collect about you will be stored by our email management system.</p>
<h3>The purpose for which we collect the information about you</h3>
<p>The personal information that the email management system collects about you is used by us to:</p>
<p>&mdash; ensure that you only receive correspondence that you have informed us that you wish to receive<br>&mdash; determine whether the information that we send to you is suitable for your interests, information needs and profile<br>&mdash; ensure that the email address that you have provided us is still operational<br>&mdash; determine whether emails that we send to you are received by you<br>&mdash; update a request that you make to us to unsubscribe from a publication that we send to you<br>&mdash; review the effectiveness and relevance of our emails to you by collecting other statistical information</p>
<h3>Access to your personal information</h3>
<p>In most cases, you can gain access to personal information that we hold about you. We will handle requests for access to your personal information in accordance with the NPPs.</p>
<p>We encourage all requests for access to your personal information to be directed to the Privacy Officer by email or by writing to the address below.</p>
<p>We will deal with all requests for access to personal information as quickly as possible. Requests for a large amount of information, or information which is not currently in use, may require further time before a response can be given.</p>
<p>If you would like to access details of the personal information held by Ripehouse Advisory about you, please contact us in writing at the following address:</p>
<p>Attn: Privacy Officer<br>Ripehouse Advisory<br>127&ndash;131 Macquarie St, Hobart TAS<br><a href="mailto:info@ripehouseadvisory.com.au">info@ripehouseadvisory.com.au</a></p>
`;

export default function PrivacyPolicyPage() {
  return (
    <main className="legal-page">
      <header className="site-header"><Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link><Link className="header-cta" href="/discovery-call">Book a call <span>↗</span></Link></header>
      <article className="article-content">
        <h1>Privacy <i>Policy.</i></h1>
        <div className="article-body" dangerouslySetInnerHTML={{ __html: body }} />
      </article>
      <Footer />
    </main>
  );
}
