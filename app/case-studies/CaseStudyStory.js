function StoryCard({ label, text, index }) {
  return (
    <article className="case-story-card">
      <span className="case-story-step">{String(index + 1).padStart(2, '0')}</span>
      <p className="case-story-label">{label}</p>
      <p className="case-story-text">{text}</p>
    </article>
  );
}

export default function CaseStudyStory({ study }) {
  const storyItems = [
    { key: 'painPoint', label: 'The starting point', text: study.painPoint },
    { key: 'ahaMoment', label: 'The turning point', text: study.ahaMoment },
    { key: 'lifeChange', label: 'What changed', text: study.lifeChange },
  ].filter((item) => item.text);

  if (!storyItems.length && !study.review) return null;

  return (
    <section className="case-story section-shell">
      <div className="case-section-heading">
        <div>
          <p className="case-eyebrow">The client journey</p>
          <h2>
            From hesitation
            <br />
            <i>to outcome.</i>
          </h2>
        </div>
      </div>

      {storyItems.length > 0 && (
        <div className="case-story-grid">
          {storyItems.map((item, index) => (
            <StoryCard key={item.key} label={item.label} text={item.text} index={index} />
          ))}
        </div>
      )}

      {study.review && (
        <div className="case-story-review">
          <p className="case-eyebrow">In the client&apos;s words</p>
          <blockquote>&ldquo;{study.review.body}&rdquo;</blockquote>
          <strong>{study.review.name}</strong>
        </div>
      )}
    </section>
  );
}
