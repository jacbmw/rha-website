'use client';

import { useEffect, useState } from 'react';

const fallbackReviews = [
  { reviewerName: 'Jason Burnett', body: 'It did take a while to find the right house. But with the market where it is at the moment NOTHING is easy. The customer service has been excellent — the Ripehouse team helped me every step of the way.', rating: 5 },
  { reviewerName: 'Matthew Elliott', body: 'Ripehouse Advisory truly are the best in the field for property selection and purchase. From the initial consult through to settlement; the service, communication and level of detail was exceptional.', rating: 5 },
  { reviewerName: 'Rhys James', body: 'I have been working with Ripehouse Advisory for the purchasing of two properties in just over 12 months. The team supported me through the whole process with knowledge and confidence.', rating: 5 },
];

export default function ReviewsCarousel() {
  const [reviews, setReviews] = useState(fallbackReviews);
  const [active, setActive] = useState(0);

  useEffect(() => {
    fetch('/api/reviews').then((response) => response.json()).then((data) => {
      if (data.reviews?.length) setReviews(data.reviews);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActive((value) => (value + 1) % reviews.length), 7000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  const visible = [0, 1, 2].map((offset) => reviews[(active + offset) % reviews.length]);
  return <section className="reviews-section section-shell" aria-labelledby="reviews-title">
    <div className="reviews-heading"><div><p className="section-label">The client perspective</p><h2 id="reviews-title">What our clients <i>say.</i></h2></div><div className="reviews-summary"><span className="reviews-stars-row" aria-hidden="true">★★★★★</span><strong>300+</strong><span>five-star Google reviews<br />from investors we&apos;ve helped</span><a href="https://maps.app.goo.gl/bYm2Bi8sfkcjjnCu6" target="_blank" rel="noreferrer">Read more reviews ↗</a></div></div>
    <div className="reviews-grid">{visible.map((review, index) => <article className={`review-card ${index === 0 ? 'review-card-active' : ''}`} key={`${review.reviewerName}-${active}-${index}`}><div className="review-stars" aria-label={`${review.rating || 5} out of 5 stars`}>{'★'.repeat(review.rating || 5)}</div><p className="review-body">“{review.body}”</p><div className="review-footer"><strong>{review.reviewerName || 'Ripehouse client'}</strong><span>Google review</span></div></article>)}</div>
    <div className="reviews-controls"><button aria-label="Previous review" onClick={() => setActive((value) => (value - 1 + reviews.length) % reviews.length)}>←</button><div>{reviews.map((review, index) => <button className={index === active ? 'active' : ''} aria-label={`Show review ${index + 1}`} key={`${review.reviewerName}-${index}`} onClick={() => setActive(index)} />)}</div><button aria-label="Next review" onClick={() => setActive((value) => (value + 1) % reviews.length)}>→</button></div>
  </section>;
}
