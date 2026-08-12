import { revalidateTag } from 'next/cache';

const API_BASE = 'https://api.webflow.com/v2';
const CACHE_TAG = 'webflow-blog';
const SITE_ID = process.env.WEBFLOW_SITE_ID || '6784a240509d2ca9e7e38e06';
const BLOG_COLLECTION_ID = process.env.WEBFLOW_BLOG_COLLECTION_ID || '678b03cab43dc836bed9f0bd';
const STAFF_COLLECTION_ID = process.env.WEBFLOW_STAFF_COLLECTION_ID || '6786e1e7f29f7f1a8d017d04';

function assertConfigured() {
  if (!process.env.WEBFLOW_API_KEY) throw new Error('WEBFLOW_API_KEY is not configured');
}

async function webflowFetch(path, options = {}) {
  assertConfigured();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const { fresh, ...fetchOptions } = options;
  const method = (fetchOptions.method || 'GET').toUpperCase();
  const cacheOptions = method === 'GET' && !fresh
    ? { next: { revalidate: 300, tags: [CACHE_TAG] } }
    : { cache: 'no-store' };
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.WEBFLOW_API_KEY}`,
        'Content-Type': 'application/json',
        accept: 'application/json',
        'User-Agent': 'rha-website/1.0',
        ...(options.headers || {}),
      },
      ...cacheOptions,
    });
    const text = await response.text();
    let payload = null;
    try { payload = text ? JSON.parse(text) : null; } catch { payload = { message: text }; }
    if (!response.ok) {
      throw new Error(payload?.message || payload?.err || `Webflow request failed (${response.status})`);
    }
    return payload;
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('Webflow request timed out');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function categoryName(field, categories) {
  if (!field) return '';
  if (typeof field === 'string') return categories.get(field) || field;
  return field.name || field.id || '';
}

function normaliseItem(item, categories = new Map(), authors = new Map()) {
  const fields = item?.fieldData || {};
  const image = fields.image || {};
  const authorId = typeof fields.author === 'string' ? fields.author : fields.author?.id;
  return {
    id: item.id,
    name: fields.name || '',
    slug: fields.slug || '',
    summary: fields.summary || '',
    body: fields['post-body'] || '',
    seoTitle: fields['seo-title'] || '',
    seoDescription: fields['seo-description'] || '',
    category: categoryName(fields.category, categories),
    categoryId: typeof fields.category === 'string' ? fields.category : fields.category?.id || '',
    author: authors.get(authorId) || '',
    authorId: authorId || '',
    image: typeof image === 'string' ? image : image.url || '',
    imageAlt: typeof image === 'string' ? fields.name || '' : image.alt || fields.name || '',
    publishedDate: fields['published-date'] || item.createdOn || null,
    isDraft: Boolean(item.isDraft),
    isArchived: Boolean(item.isArchived),
    url: `https://www.ripehouseadvisory.com.au/resources/blog/${fields.slug || ''}`,
  };
}

async function getCollectionMetadata() {
  return webflowFetch(`/collections/${BLOG_COLLECTION_ID}`);
}

async function getLookups() {
  const [metadata, staff] = await Promise.all([
    getCollectionMetadata(),
    webflowFetch(`/collections/${STAFF_COLLECTION_ID}/items?limit=100`),
  ]);
  const categoryField = metadata.fields?.find((field) => field.slug === 'category');
  const categories = new Map((categoryField?.validations?.options || []).map((option) => [option.id, option.name]));
  const authors = new Map((staff.items || []).map((item) => [item.id, item.fieldData?.name || '']));
  return { categories, authors };
}

export async function listBlogItems({ includeDrafts = false, limit = 100, offset = 0 } = {}) {
  const response = await webflowFetch(`/collections/${BLOG_COLLECTION_ID}/items?limit=${limit}&offset=${offset}`);
  const { categories, authors } = await getLookups().catch(() => ({ categories: new Map(), authors: new Map() }));
  return (response.items || [])
    .filter((item) => includeDrafts || (!item.isDraft && !item.isArchived))
    .map((item) => normaliseItem(item, categories, authors));
}

export async function getBlogItem(id, { fresh = false } = {}) {
  const item = await webflowFetch(`/collections/${BLOG_COLLECTION_ID}/items/${encodeURIComponent(id)}`, { fresh });
  const lookups = await getLookups().catch(() => ({ categories: new Map(), authors: new Map() }));
  return normaliseItem(item, lookups.categories, lookups.authors);
}

export async function getBlogItemBySlug(slug) {
  const items = await listBlogItems({ limit: 100 });
  return items.find((item) => item.slug === slug) || null;
}

function fieldDataFromInput(input, existing = {}) {
  const fields = { ...existing };
  const map = {
    name: 'name', slug: 'slug', summary: 'summary', body: 'post-body',
    seoTitle: 'seo-title', seoDescription: 'seo-description', publishedDate: 'published-date',
  };
  Object.entries(map).forEach(([key, webflowKey]) => {
    if (input[key] !== undefined) fields[webflowKey] = String(input[key] ?? '');
  });
  if (input.image !== undefined) fields.image = input.image ? { url: String(input.image), alt: String(input.imageAlt || input.name || '') } : null;
  if (input.categoryId !== undefined) fields.category = input.categoryId || null;
  if (input.authorId !== undefined) fields.author = input.authorId || null;
  return fields;
}

export async function createBlogItem(input) {
  const fieldData = fieldDataFromInput({ ...input, publishedDate: input.publishedDate || new Date().toISOString() });
  const item = await webflowFetch(`/collections/${BLOG_COLLECTION_ID}/items`, {
    method: 'POST',
    body: JSON.stringify({ isArchived: false, isDraft: input.status !== 'live', fieldData }),
  });
  revalidateTag(CACHE_TAG);
  return getBlogItem(item.id, { fresh: true });
}

export async function updateBlogItem(id, input) {
  const existing = await webflowFetch(`/collections/${BLOG_COLLECTION_ID}/items/${encodeURIComponent(id)}`, { fresh: true });
  const item = await webflowFetch(`/collections/${BLOG_COLLECTION_ID}/items/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      isArchived: input.status === 'archived' ? true : input.status === 'live' ? false : existing.isArchived,
      isDraft: input.status === 'draft' ? true : input.status === 'live' ? false : existing.isDraft,
      fieldData: fieldDataFromInput(input, existing.fieldData || {}),
    }),
  });
  revalidateTag(CACHE_TAG);
  return getBlogItem(item.id || id, { fresh: true });
}

export async function deleteBlogItem(id) {
  await webflowFetch(`/collections/${BLOG_COLLECTION_ID}/items/${encodeURIComponent(id)}`, { method: 'DELETE' });
  revalidateTag(CACHE_TAG);
  return { id, deleted: true };
}

export { BLOG_COLLECTION_ID, SITE_ID };
