'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const SECTIONS = [
  ['News', 'The stories moving the market', 'What just changed — and what it means for the block you own or the one you want.'],
  ['Market Analysis', 'The data, decoded', 'Five charts beat fifty headlines. Our research team reads the numbers so you read the signal.'],
  ['Suburb Deep Dives', 'Street-level intelligence', 'Suburb averages lie. We go to the lot level: catchments, overlays, drainage, demand.'],
  ['Strategy', 'Playbooks for the long game', 'Sequencing, structure and timing — the decisions that compound over 30 years.'],
  ['Q&A', 'Real investors, straight answers', 'Questions from readers and clients, answered with evidence instead of opinion.'],
];

function fmtDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

function readMinutes(post) {
  const words = String(post.body || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 220));
}

function Kicker({ post }) {
  return <p className="blog-kicker"><span className="kicker-cat">{post.category || 'Market Intel'}</span><span>{fmtDate(post.publishedDate)}</span><span>{readMinutes(post)} min read</span></p>;
}

function Card({ post, size = 'standard' }) {
  const href = `/resources/blog/${post.slug}`;
  return (
    <article className={`intel-card intel-card-${size}`}>
      <Link className="blog-image" href={href}>
        {post.image ? <img src={post.image} alt={post.imageAlt} loading="lazy" /> : <div className="blog-image-placeholder" />}
      </Link>
      <div className="intel-card-copy">
        <Kicker post={post} />
        <h3><Link href={href}>{post.name}</Link></h3>
        {size !== 'compact' && <p>{post.summary}</p>}
        <Link className="blog-read-link" href={href}>Read the full story <span>↗</span></Link>
      </div>
    </article>
  );
}

function TextRow({ post }) {
  const href = `/resources/blog/${post.slug}`;
  return (
    <article className="intel-text-row">
      <div>
        <Kicker post={post} />
        <h3><Link href={href}>{post.name}</Link></h3>
        <p>{post.summary}</p>
      </div>
      <Link className="blog-read-link" href={href} aria-label={`Read ${post.name}`}>↗</Link>
    </article>
  );
}

export default function BlogGrid({ posts }) {
  const [category, setCategory] = useState('All');

  const sorted = useMemo(
    () => [...posts].sort((a, b) => new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0)),
    [posts],
  );
  const counts = useMemo(() => {
    const map = new Map();
    sorted.forEach((post) => map.set(post.category, (map.get(post.category) || 0) + 1));
    return map;
  }, [sorted]);

  const [lead, second, third, ...rest] = sorted;
  const filtered = category === 'All' ? sorted : sorted.filter((post) => post.category === category);

  return (
    <>
      <div className="blog-filters" aria-label="Filter Market Intel articles">
        <button className={category === 'All' ? 'active' : ''} onClick={() => setCategory('All')}>All stories <em>{sorted.length}</em></button>
        {SECTIONS.filter(([name]) => counts.get(name)).map(([name]) => (
          <button className={category === name ? 'active' : ''} key={name} onClick={() => setCategory(name)}>{name} <em>{counts.get(name)}</em></button>
        ))}
      </div>

      {category !== 'All' && (
        <>
          <div className="blog-grid">{filtered.map((post) => <Card key={post.id} post={post} />)}</div>
          {!filtered.length && <p className="blog-empty">No articles in this category yet.</p>}
        </>
      )}

      {category === 'All' && lead && (
        <>
          <section className="intel-lead">
            <article className="blog-featured">
              <Link className="blog-image blog-image-featured" href={`/resources/blog/${lead.slug}`}>
                {lead.image ? <img src={lead.image} alt={lead.imageAlt} /> : <div className="blog-image-placeholder" />}
              </Link>
              <div className="blog-featured-copy">
                <p className="lead-flag">Today&apos;s lead</p>
                <Kicker post={lead} />
                <h2><Link href={`/resources/blog/${lead.slug}`}>{lead.name}</Link></h2>
                <p>{lead.summary}</p>
                <Link className="blog-read-link" href={`/resources/blog/${lead.slug}`}>Read the full story <span>↗</span></Link>
              </div>
            </article>
            {(second || third) && (
              <div className="intel-lead-side">
                <p className="intel-side-label">Also new this week</p>
                {[second, third].filter(Boolean).map((post) => <Card key={post.id} post={post} size="compact" />)}
              </div>
            )}
          </section>

          {SECTIONS.map(([name, headline, blurb]) => {
            const sectionPosts = sorted.filter((post) => post.category === name && ![lead?.id, second?.id, third?.id].includes(post.id));
            if (!sectionPosts.length) return null;
            const isQa = name === 'Q&A';
            return (
              <section className="intel-section" key={name}>
                <header className="intel-section-head">
                  <div>
                    <p className="section-label">{name}</p>
                    <h2>{headline}</h2>
                  </div>
                  <p>{blurb}</p>
                  <button className="intel-viewall" onClick={() => setCategory(name)}>View all {counts.get(name)} <span>→</span></button>
                </header>
                {isQa
                  ? <div className="intel-qa-list">{sectionPosts.slice(0, 4).map((post) => <TextRow key={post.id} post={post} />)}</div>
                  : <div className="blog-grid">{sectionPosts.slice(0, 3).map((post) => <Card key={post.id} post={post} />)}</div>}
              </section>
            );
          })}

          {rest.length > 0 && (
            <section className="intel-section">
              <header className="intel-section-head"><div><p className="section-label">From the archive</p><h2>Keep digging</h2></div></header>
              <div className="intel-qa-list">{rest.slice(12, 18).map((post) => <TextRow key={post.id} post={post} />)}</div>
            </section>
          )}
        </>
      )}
    </>
  );
}
