import Link from 'next/link';
import Footer from '../../components/Footer';
import { pageMetadata } from '../../../lib/seo';

const logoUrl = 'https://cdn.prod.website-files.com/6784a240509d2ca9e7e38e06/67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';

export const metadata = pageMetadata({
  title: 'Terms and Conditions | Ripehouse Advisory',
  description: 'Terms and conditions of use for ripehouseadvisory.com.au, including copyright, disclaimers and data notices.',
  path: '/legal/terms-and-conditions',
});

const body = `
<h2>ripehouseadvisory.com.au Copyright</h2>
<p>&copy; 2026 Copyright Ripehouse Advisory. All rights reserved. No reproduction, publication, adaption, modification, public communication, distribution or transmission of the copyrighted materials in this publication is permitted whether in whole or in part. The copyrighted materials in this publication are provided for personal or internal business purposes only unless otherwise agreed in writing.</p>
<h2>ripehouseadvisory.com.au Terms &amp; Conditions</h2>
<p>By agreeing to these Terms &amp; Conditions or by gaining access to a ripehouseadvisory.com.au property investment destination or using a ripehouseadvisory.com.au property investment destination you agree to be bound by these Terms &amp; Conditions of Use and any changes, modifications or additions to these Terms &amp; Conditions of Use or other terms and conditions of use that might replace these Terms &amp; Conditions of Use from time to time.</p>
<p>ripehouseadvisory.com.au may make changes to these Terms &amp; Conditions of Use from time to time as ripehouseadvisory.com.au considers appropriate.</p>
<p>Information is based on historical data and past performance is not necessarily indicative of future results. ripehouseadvisory.com.au does not hold an Australian financial services or credit licence and cannot provide any endorsement, recommendation or suggestion about any information or products displayed on the property investment destination. We strongly recommend that you obtain independent advice before you make any financial decisions using the information or investment tools contained on the property investment destination site, and we make no warranty as to the accuracy, completeness or reliability of the information or investment tools, nor do we accept any liability and responsibility arising in any way from omissions or errors contained on the property investment destination.</p>
<p>In providing this property investment destination, ripehouseadvisory.com.au relies on information from a number of external sources. While ripehouseadvisory.com.au takes every care in the collection of the information contained in the videos, audio, articles and other news items on this site and believes it to be correct at the time of publication, it does not warrant the accuracy or completeness of its analysis and information services.</p>
<p>While ripehouseadvisory.com.au uses commercially reasonable efforts to ensure the Data, Research and Information on this property investment destination is current, ripehouseadvisory.com.au does not warrant the accuracy, currency or completeness of the Data, Research and Information and to the full extent permitted by law excludes all loss or damage howsoever arising (including through negligence) in connection with the Data, Research and Information.</p>
<p>Any time you enter your email address on our website you authorise Ripehouse Advisory to contact you via our regular newsletters, website notifications or advertising messages.</p>
<p>Data, estimates, information and predictions supplied by Ripehouse Advisory trading as Ripehouse Advisory and is subject to the following copyright and notice.</p>
<h2>Ripehouse Advisory Copyright Information</h2>
<p>This information has been obtained by Ripehouse Advisory trading as Ripehouse Advisory and is subject to the following copyright: Ripehouse Advisory trading as Ripehouse Advisory</p>
<p>&copy; 2026 Copyright Ripehouse Advisory trading as Ripehouse Advisory (Ripehouse Advisory). All rights reserved. No reproduction, publication, adaption, modification, public communication, distribution or transmission of the copyrighted materials in this publication is permitted whether in whole or in part. The copyrighted materials in this publication are provided for personal or internal business purposes only unless otherwise agreed in writing.</p>
<h2>Ripehouse Advisory Notice</h2>
<p>The supply data, estimates, information and predictions by Ripehouse Advisory trading as Ripehouse Advisory to ripehouseadvisory.com.au (the property investment destination) is subject to the following disclaimer:</p>
<p>The information provided in this publication is current as at the publication date only. Ripehouse Advisory trading as Ripehouse Advisory does not warrant accuracy or completeness in the information it supplies and to the full extent allowed by law excludes any liability for any loss or damage arising from or in connection with the supply or use of the whole or any part of the information in this publication through any cause whatsoever and limits any liability it may have to the amount paid to Ripehouse Advisory for the supply of such information.</p>
<p>The data, predictions, research, information (including commentary), tools and calculators (including results and outputs) provided in this property investment destination is of a general nature only and does not consider your personal or investment objectives, financial situation or particular needs.</p>
<h2>Estimates</h2>
<p>The supply of an Estimate by Ripehouse Advisory trading as Ripehouse Advisory is made subject to the following disclaimer:</p>
<p>An automated valuation model estimate is a statistically derived estimate of the value or rent of the subject property generated:</p>
<ul>
<li>by a computer driven mathematical model in reliance on available data;</li>
<li>without the physical inspection of the subject property;</li>
<li>without taking into account any market conditions (including building, planning, or economic), and/or</li>
<li>without identifying observable features or risks (including adverse environmental issues, state of repair, improvements, renovations, aesthetics, views or aspect) which may, together or separately, affect the market value (AVM Estimate).</li>
</ul>
<p>An AVM Estimate is current only at the date of publication. An AVM Estimate is a general estimate and must not be relied upon as a professional valuation. Ripehouse Advisory expressly excludes any warranties and representations that an AVM Estimate is an accurate representation as to the market value of the subject property.</p>
<p>To the full extent permitted by law, Ripehouse Advisory excludes all liability for any loss or damage howsoever arising suffered by the recipient, whether as a result of the recipient&rsquo;s reliance on the accuracy of an AVM Estimate or otherwise arising in connection with an AVM Estimate.</p>
<h2>Prediction Data</h2>
<p>The supply of any Prediction Data by Ripehouse Advisory trading as Ripehouse Advisory is made subject to the following disclaimer:</p>
<p>Prediction Data is a computer generated output from a mathematical model using available statistical and property data and must not be relied upon as an accurate prediction of future market performance or construed as advice. Forecast Data does not take into account future market conditions or your individual circumstances. You should exercise your own skill and judgment when considering investment decisions and seek professional advice where appropriate.</p>
<p>Prediction and Forecast Data is current only at the date of publication or supply and may change over time. Ripehouse Advisory trading as Ripehouse Advisory expressly excludes any warranties and representations that Prediction and Forecast Data is an accurate prediction of future market performance.</p>
<p>To the full extent permitted by law, Ripehouse Advisory trading as Ripehouse Advisory excludes all liability for any loss or damage howsoever arising suffered by the recipient, whether as a result of the recipient&rsquo;s reliance on the accuracy of Recommendation and Forecast Data or otherwise arising in connection with Recommendation and Forecast Data.</p>
`;

export default function TermsPage() {
  return (
    <main className="legal-page">
      <header className="site-header"><Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" /></Link><Link className="header-cta" href="/discovery-call">Book a call <span>↗</span></Link></header>
      <article className="article-content">
        <h1>Terms &amp; <i>Conditions.</i></h1>
        <div className="article-body" dangerouslySetInnerHTML={{ __html: body }} />
      </article>
      <Footer />
    </main>
  );
}
