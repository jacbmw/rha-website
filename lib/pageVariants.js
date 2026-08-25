// A/B page-variant resolution for the conversion pages (/discovery-call, /review,
// /five-markets). Variants live in the dashboard (rha_page_variants) and are
// fetched with a 60s revalidate cache so a dashboard outage can never break
// the pages — the bundled content JSON is the permanent fallback and is also
// the seed for each page's "A" (control) variant.
//
// Assignment is sticky per visitor via the `rha_ab_<pageKey>` cookie (set
// client-side by VariantTracker); the first request does a weighted pick.
// Preview: `?rha_variant=<id>` forces a variant (even paused) and suppresses
// tracking.

import { cookies } from 'next/headers';
import discoveryCallDefault from '../content/pages/discovery-call.json';
import fiveMarketsDefault from '../content/pages/five-markets.json';

const DEFAULT_CONTENT = {
  'discovery-call': discoveryCallDefault,
  review: discoveryCallDefault,
  'five-markets': fiveMarketsDefault,
};

const BASE = process.env.RHA_BACKEND_URL || 'https://dashboard.picki.com.au';
const DISCOVERY_LABEL = 'Property Investment Discovery Call';
const REVIEW_LABEL = 'Investor Decision Review';

function replaceDiscoveryLabel(value) {
  if (typeof value === 'string') return value.replaceAll(DISCOVERY_LABEL, REVIEW_LABEL);
  if (Array.isArray(value)) return value.map(replaceDiscoveryLabel);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, replaceDiscoveryLabel(entry)]));
  }
  return value;
}

function normalizeVariant(pageKey, variant) {
  if (pageKey !== 'discovery-call' && pageKey !== 'review') return variant;
  return { ...variant, content: replaceDiscoveryLabel(variant.content) };
}

async function fetchActiveVariants(pageKey) {
  const res = await fetch(`${BASE}/api/public/pages/${pageKey}`, {
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`variants fetch ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.variants) ? data.variants.filter((v) => v?.content?.sections) : [];
}

async function fetchVariantById(pageKey, variantId) {
  const res = await fetch(`${BASE}/api/public/pages/${pageKey}?variant=${encodeURIComponent(variantId)}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`variant fetch ${res.status}`);
  const data = await res.json();
  return data.variants?.[0]?.content?.sections ? data.variants[0] : null;
}

function weightedPick(variants) {
  const weights = variants.map((v) => Math.max(Number(v.weight) || 0, 0));
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total <= 0) return variants[0];
  let roll = Math.random() * total;
  for (let i = 0; i < variants.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return variants[i];
  }
  return variants[variants.length - 1];
}

export async function resolveVariant(pageKey, searchParams) {
  const fallback = { variant: { id: null, label: 'A', content: DEFAULT_CONTENT[pageKey] }, preview: false };

  const previewId = searchParams?.rha_variant;
  if (previewId) {
    try {
      const variant = await fetchVariantById(pageKey, previewId);
      if (variant) return { variant: normalizeVariant(pageKey, variant), preview: true };
    } catch {}
    return { ...fallback, preview: true };
  }

  let variants = [];
  try {
    variants = await fetchActiveVariants(pageKey);
  } catch {}
  if (!variants.length) return fallback;

  try {
    const store = await cookies();
    const sticky = store.get(`rha_ab_${pageKey}`)?.value;
    const stuck = sticky && variants.find((v) => String(v.id) === sticky);
    if (stuck) return { variant: normalizeVariant(pageKey, stuck), preview: false };
  } catch {}

  return { variant: normalizeVariant(pageKey, weightedPick(variants)), preview: false };
}
