// Native blog data source. Replaces lib/webflow.js.
//
// Blog content now lives in the dashboard's MySQL (jacobclaw.rha_blog_*) and is
// served over the dashboard API. This module keeps the exact same exported
// signatures the Webflow module had, so page/route code is unchanged apart from
// the import path.
//
//   Reads  -> GET  {BASE}/api/public/blog...      (no auth, published only)
//   Writes -> POST/PATCH/DELETE {BASE}/api/blog   (admin token)
//
// ISR behaviour is preserved: revalidate 300 + the 'webflow-blog' cache tag
// (tag name kept so existing revalidateTag callers keep working).

import { revalidateTag } from 'next/cache';

const BASE = (process.env.RHA_BACKEND_URL || 'https://dashboard.picki.com.au').replace(/\/$/, '');
const CACHE_TAG = 'webflow-blog';
const REVALIDATE = 300;
const TIMEOUT_MS = 15000;

// Retained so existing imports of these ids keep resolving after the Webflow cutover.
const SITE_ID = process.env.WEBFLOW_SITE_ID || '6784a240509d2ca9e7e38e06';
const BLOG_COLLECTION_ID = process.env.WEBFLOW_BLOG_COLLECTION_ID || '678b03cab43dc836bed9f0bd';

async function blogFetch(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const { fresh, auth, ...fetchOptions } = options;
  const method = (fetchOptions.method || 'GET').toUpperCase();
  const cacheOptions = method === 'GET' && !fresh
    ? { next: { revalidate: REVALIDATE, tags: [CACHE_TAG] } }
    : { cache: 'no-store' };

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'rha-website/1.0',
    ...(options.headers || {}),
  };
  if (auth) {
    const token = process.env.BLOG_ADMIN_TOKEN || '';
    if (!token) throw new Error('BLOG_ADMIN_TOKEN is not configured');
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE}${path}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers,
      ...cacheOptions,
    });
    const text = await response.text();
    let payload = null;
    try { payload = text ? JSON.parse(text) : null; } catch { payload = { message: text }; }
    if (!response.ok) {
      throw new Error(payload?.message || payload?.error || `Blog request failed (${response.status})`);
    }
    return payload;
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('Blog request timed out');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

// The API already returns the normalised shape; this guards against nulls and
// keeps the contract stable for consumers.
function normaliseItem(item) {
  if (!item) return null;
  return {
    id: item.id,
    name: item.name || '',
    slug: item.slug || '',
    summary: item.summary || '',
    body: item.body || '',
    seoTitle: item.seoTitle || '',
    seoDescription: item.seoDescription || '',
    category: item.category || '',
    categoryId: item.categoryId || '',
    author: item.author || '',
    authorId: item.authorId || '',
    image: item.image || '',
    imageAlt: item.imageAlt || item.name || '',
    publishedDate: item.publishedDate || null,
    isDraft: Boolean(item.isDraft),
    isArchived: Boolean(item.isArchived),
    url: item.url || `https://www.ripehouseadvisory.com.au/resources/blog/${item.slug || ''}`,
  };
}

export async function listBlogItems({ includeDrafts = false, limit = 100, offset = 0 } = {}) {
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  // Drafts are only exposed through the authenticated dashboard route.
  const payload = includeDrafts
    ? await blogFetch(`/api/blog?includeDrafts=true&${query}`, { auth: true, fresh: true })
    : await blogFetch(`/api/public/blog?${query}`);
  return (payload?.items || []).map(normaliseItem).filter(Boolean);
}

export async function getBlogItem(id, { fresh = false } = {}) {
  const payload = await blogFetch(`/api/blog/${encodeURIComponent(id)}`, { auth: true, fresh: true });
  return normaliseItem(payload?.item);
}

export async function getBlogItemBySlug(slug) {
  try {
    const payload = await blogFetch(`/api/public/blog/slug/${encodeURIComponent(slug)}`);
    return normaliseItem(payload?.item);
  } catch {
    return null;
  }
}

export async function listStaff() {
  try {
    const payload = await blogFetch('/api/public/blog/authors');
    return payload?.authors || [];
  } catch {
    return [];
  }
}

export async function listCategories() {
  try {
    const payload = await blogFetch('/api/public/blog/categories');
    return payload?.categories || [];
  } catch {
    return [];
  }
}

export async function createBlogItem(input) {
  const payload = await blogFetch('/api/blog', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ ...input, publishedDate: input.publishedDate || new Date().toISOString() }),
  });
  revalidateTag(CACHE_TAG);
  return normaliseItem(payload?.item);
}

export async function updateBlogItem(id, input) {
  const payload = await blogFetch(`/api/blog/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(input),
  });
  revalidateTag(CACHE_TAG);
  return normaliseItem(payload?.item);
}

export async function deleteBlogItem(id) {
  const payload = await blogFetch(`/api/blog/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true });
  revalidateTag(CACHE_TAG);
  return payload || { id, deleted: true };
}

export { BLOG_COLLECTION_ID, SITE_ID, CACHE_TAG };
