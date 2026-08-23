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

function Kicker({ post }) {
  return <p className="blog-kicker"><span className="kicker-cat">{post.category || 'Market Intel'}</span><span>{fmtDate(post.publishedDate)}</span><span>{post.readMinutes} min read</span></p>;
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
    () => [...new Map(posts.map((post) => [post.id, post])).values()]
      .sort((a, b) => new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0)),
    [posts],
  );
  const counts = useMemo(() => {
    const map = new Map();
    sorted.forEach((post) => map.set(post.category, (map.get(post.category) || 0) + 1));
    return map;
  }, [sorted]);

  const content = useMemo(() => {
    const used = new Set();
    const take = (matches, limit = Infinity) => {
      const selected = sorted.filter((post) => !used.has(post.id) && matches(post)).slice(0, limit);
      selected.forEach((post) => used.add(post.id));
      return selected;
    };
    const [lead] = take(() => true, 1);
    const side = take(() => true, 2);
    const categorySections = SECTIONS.slice(0, 4).map(([name]) => ({
      name,
      posts: take((post) => post.category === name, 3),
    }));
    const qaPosts = take((post) => post.category === 'Q&A');
    const archivePosts = take(() => true);

    return { lead, side, categorySections, qaPosts, archivePosts };
  }, [sorted]);

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

      {category === 'All' && content.lead && (
        <>
          <section className="intel-lead">
            <article className="blog-featured">
              <Link className="blog-image blog-image-featured" href={`/resources/blog/${content.lead.slug}`}>
                {content.lead.image ? <img src={content.lead.image} alt={content.lead.imageAlt} /> : <div className="blog-image-placeholder" />}
              </Link>
              <div className="blog-featured-copy">
                <p className="lead-flag">Today&apos;s lead</p>
                <Kicker post={content.lead} />
                <h2><Link href={`/resources/blog/${content.lead.slug}`}>{content.lead.name}</Link></h2>
                <p>{content.lead.summary}</p>
                <Link className="blog-read-link" href={`/resources/blog/${content.lead.slug}`}>Read the full story <span>↗</span></Link>
              </div>
            </article>
            {content.side.length > 0 && (
              <div className="intel-lead-side">
                <p className="intel-side-label">Also new this week</p>
                {content.side.map((post) => <Card key={post.id} post={post} size="compact" />)}
              </div>
            )}
          </section>

          {content.categorySections.map(({ name, posts: sectionPosts }) => {
            const section = SECTIONS.find(([sectionName]) => sectionName === name);
            const [, headline, blurb] = section;
            if (!sectionPosts.length) return null;
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
                <div className="blog-grid">{sectionPosts.map((post) => <Card key={post.id} post={post} />)}</div>
              </section>
            );
          })}

          {content.qaPosts.length > 0 && (
            <section className="intel-section">
              <header className="intel-section-head">
                <div><p className="section-label">Q&amp;A</p><h2>Real investors, straight answers</h2></div>
                <p>Questions from readers and clients, answered with evidence instead of opinion.</p>
                <button className="intel-viewall" onClick={() => setCategory('Q&A')}>View all {counts.get('Q&A')} <span>→</span></button>
              </header>
              <div className="intel-qa-list">{content.qaPosts.map((post) => <TextRow key={post.id} post={post} />)}</div>
            </section>
          )}

          {content.archivePosts.length > 0 && (
            <section className="intel-section">
              <header className="intel-section-head"><div><p className="section-label">From the archive</p><h2>Keep digging</h2></div></header>
              <div className="intel-qa-list">{content.archivePosts.map((post) => <TextRow key={post.id} post={post} />)}</div>
            </section>
          )}
        </>
      )}
    </>
  );
}
