import { buildFaqJsonLd } from '../../lib/locations';

// Semantic, LLM-SEO & Google FAQPage structured-data panel shared across
// City, LGA, Suburb, and Street pages. Renders full answers in SSR HTML so
// Googlebot, GPTBot, PerplexityBot, and ClaudeBot index every fact without JS.
export default function LocationFaqSection({ eyebrow = 'Frequently asked questions', heading, intro, faqs = [] }) {
  if (!faqs || !faqs.length) return null;
  const jsonLd = buildFaqJsonLd(faqs);

  return (
    <section className="loc-faq-section section-shell" aria-labelledby="loc-faq-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="loc-faq-header">
        <p className="eyebrow"><span /> {eyebrow}</p>
        <h2 id="loc-faq-heading">{heading}</h2>
        {intro && <p className="suburb-meta">{intro}</p>}
      </div>
      <div className="loc-faq-list" itemScope itemType="https://schema.org/FAQPage">
        {faqs.map((item, idx) => (
          <details
            key={item.question}
            className="loc-faq-item"
            open={idx === 0}
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <summary itemProp="name">
              <span>{item.question}</span>
              <span className="loc-faq-icon" aria-hidden="true">+</span>
            </summary>
            <div
              className="loc-faq-answer"
              itemScope
              itemProp="acceptedAnswer"
              itemType="https://schema.org/Answer"
            >
              <p itemProp="text">{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
