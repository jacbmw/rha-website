import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogItemBySlug } from '../../../../lib/webflow';

export const dynamic = 'force-dynamic';

export default async function BlogArticle({ params }) {
  const post = await getBlogItemBySlug((await params).slug);
  if (!post) notFound();

  return <main className="article-page"><header className="site-header"><Link className="brand" href="/" aria-label="Ripehouse Advisory home"><img className="brand-logo" src="https://cdn.prod.website-files.com/6784a240509d2ca9e7e38e06/67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png" alt="Ripehouse Advisory" /></Link><Link className="header-cta" href="/resources/blog">← Market intel</Link></header><article className="article-content"><p className="eyebrow"><span /> {post.category || 'Market Intel'} · {post.publishedDate ? new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(post.publishedDate)) : ''}</p><h1>{post.name}</h1>{post.summary && <p className="article-summary">{post.summary}</p>}{post.image && <img className="article-image" src={post.image} alt={post.imageAlt} />}<div className="article-body" dangerouslySetInnerHTML={{ __html: post.body }} /></article></main>;
}
