'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import WebinarBanner from './WebinarBanner';
import ArticleEbookPanel from './panels/ArticleEbookPanel';
import ArticleFooterPanel from './panels/ArticleFooterPanel';
import { trackIrPageview } from '../../lib/ir';

const STORAGE_KEY = 'rha_seen_articles';
const MAX_AGE_MS = 60 * 24 * 60 * 60 * 1000;
const MOBILE_MAX_WIDTH = 768;
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || 'G-TTGS57HCP5';
const MEDIA_QUERY = `(max-width: ${MOBILE_MAX_WIDTH}px)`;

function readSeen() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    const now = Date.now();
    return (list || []).filter((x) => now - (x.at || 0) < MAX_AGE_MS);
  } catch { return []; }
}

function writeSeen(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

function addSeen(list, slug) {
  if (!slug) return list;
  const next = list.filter((x) => x.slug !== slug).concat({ slug, at: Date.now() });
  if (next.length > 200) next.shift();
  return next;
}

function hasVideoEmbed(body) {
  return /data-rt-type="video"|<iframe[^>]*(youtube\.com|youtu\.be|vimeo\.com)|<video\b/i.test(String(body || ''));
}

function fmtDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
}

function isMobile() {
  return typeof window !== 'undefined' && window.matchMedia(MEDIA_QUERY).matches;
}

function subscribeMobile(cb) {
  if (typeof window === 'undefined') return () => {};
  const mql = window.matchMedia(MEDIA_QUERY);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}

export default function EndlessScroll({ startSlug }) {
  const enabled = useSyncExternalStore(subscribeMobile, isMobile, () => false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const loaderRef = useRef(null);
  const loadedRef = useRef(new Set());
  const viewedRef = useRef(new Set());
  const loadingRef = useRef(false);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const seen = addSeen(readSeen(), startSlug);
    writeSeen(seen);
    loadedRef.current = new Set([startSlug, ...seen.map((x) => x.slug)]);
    viewedRef.current = new Set([startSlug]);
  }, [enabled, startSlug]);

  const loadNext = useCallback(async () => {
    if (loadingRef.current || doneRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    const slugs = Array.from(loadedRef.current);
    const params = new URLSearchParams({ current: startSlug });
    slugs.forEach((s) => params.append('seen', s));
    try {
      const res = await fetch(`/api/blog/recommended?${params.toString()}`);
      const data = await res.json();
      if (data.done || !data.post) {
        doneRef.current = true;
        setDone(true);
      } else if (!loadedRef.current.has(data.post.slug)) {
        const slug = data.post.slug;
        loadedRef.current.add(slug);
        const seen = addSeen(readSeen(), slug);
        writeSeen(seen);
        setItems((prev) => [...prev, data]);
      } else {
        doneRef.current = true;
        setDone(true);
      }
    } catch {
      doneRef.current = true;
      setDone(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [startSlug]);

  useEffect(() => {
    if (!enabled || doneRef.current) return;
    const el = loaderRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadNext();
    }, { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, loadNext]);

  useEffect(() => {
    if (!enabled) return;
    const sections = document.querySelectorAll('[data-feed-article]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
        const slug = entry.target.dataset.slug;
        const title = entry.target.dataset.title;
        const newPath = `/resources/blog/${slug}`;
        if (window.location.pathname !== newPath) {
          document.title = title;
          history.replaceState({ feed: true }, '', newPath);
        }
        if (!viewedRef.current.has(slug)) {
          viewedRef.current.add(slug);
          trackIrPageview();
          if (window.fbq) window.fbq('track', 'PageView');
          if (window.gtag && GA4_ID) window.gtag('config', GA4_ID, { page_path: newPath });
        }
      });
    }, { threshold: [0.5] });
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [enabled, items.length]);

  if (!enabled) return null;

  return (
    <div className="endless-feed">
      {items.map((item, i) => (
        <article
          key={item.post.id}
          className="article-content article-content--feed"
          data-feed-article
          data-slug={item.post.slug}
          data-title={`${item.post.seoTitle || item.post.name} | Ripehouse Advisory`}
        >
          <p className="eyebrow"><span /> {item.post.category || 'Market Intel'} · {fmtDate(item.post.publishedDate)}</p>
          <h2>{item.post.name}</h2>
          {item.post.image && !hasVideoEmbed(item.post.body) && <img className="article-image" src={item.post.image} alt={item.post.imageAlt} loading="lazy" />}
          <div className="article-body" dangerouslySetInnerHTML={{ __html: item.post.body }} />
          {i === 0 && <WebinarBanner variant={item.panels.webinar} placement="inline" trackKey={`feed-${item.post.slug}`} />}
          {i === 1 && <ArticleEbookPanel variant={item.panels.ebook} trackKey={`feed-${item.post.slug}`} />}
          {i === 2 && <ArticleFooterPanel variant={item.panels.footer} trackKey={`feed-${item.post.slug}`} />}
        </article>
      ))}
      {!done && <div ref={loaderRef} className="endless-loader" style={{ minHeight: 1 }} aria-hidden="true" />}
      {done && (
        <div className="endless-terminus">
          <p>You&apos;re up to date.</p>
          <Link href="/resources/blog">Explore more Market Intel <span>↗</span></Link>
        </div>
      )}
    </div>
  );
}
