'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const categories = ['All', 'News', 'Market Analysis', 'Suburb Deep Dives', 'Strategy', 'Q&A'];

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

export default function BlogGrid({ posts }) {
  const [category, setCategory] = useState('All');
  const filtered = useMemo(() => category === 'All' ? posts : posts.filter((post) => post.category === category), [category, posts]);
  const [featured, ...rest] = filtered;

  return (
    <>
      <div className="blog-filters" aria-label="Filter Market Intel articles">
        {categories.map((item) => <button className={category === item ? 'active' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>)}
      </div>
      {featured && <article className="blog-featured">
        <Link className="blog-image blog-image-featured" href={`/resources/blog/${featured.slug}`}>
          {featured.image ? <img src={featured.image} alt={featured.imageAlt} /> : <div className="blog-image-placeholder" />}
        </Link>
        <div className="blog-featured-copy"><p className="blog-kicker">{featured.category || 'Market Intel'} <span>{formatDate(featured.publishedDate)}</span></p><h2><Link href={`/resources/blog/${featured.slug}`}>{featured.name}</Link></h2><p>{featured.summary}</p><Link className="blog-read-link" href={`/resources/blog/${featured.slug}`}>Read more <span>↗</span></Link></div>
      </article>}
      <div className="blog-grid">{rest.map((post) => <article className="blog-card" key={post.id}><Link className="blog-image" href={`/resources/blog/${post.slug}`}>{post.image ? <img src={post.image} alt={post.imageAlt} /> : <div className="blog-image-placeholder" />}</Link><div className="blog-card-copy"><p className="blog-kicker">{post.category || 'Market Intel'} <span>{formatDate(post.publishedDate)}</span></p><h3><Link href={`/resources/blog/${post.slug}`}>{post.name}</Link></h3><p>{post.summary}</p><Link className="blog-read-link" href={`/resources/blog/${post.slug}`}>Read more <span>↗</span></Link></div></article>)}</div>
      {!filtered.length && <p className="blog-empty">No articles in this category yet.</p>}
    </>
  );
}
