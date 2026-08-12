// Browser-side panel variant resolution, for panels that must not count a
// display on every pageview (the exit-intent modal resolves its variant only
// when it actually fires). Same semantics as lib/panelVariants: sticky
// per-visitor cookie, weighted pick, preview cookie override, caller-supplied
// fallback props.

const BASE = process.env.NEXT_PUBLIC_RHA_IR_URL || 'https://dashboard.picki.com.au';

const getCookie = (name) => document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`)?.pop() || '';

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

export async function resolvePanelClient(panelKey, defaultProps = {}) {
  const fallback = { id: null, props: defaultProps, preview: false };

  const previewId = getCookie(`rha_prev_${panelKey}`);
  if (previewId) {
    try {
      const res = await fetch(`${BASE}/api/public/pages/${panelKey}?variant=${encodeURIComponent(previewId)}`, { signal: AbortSignal.timeout(4000) });
      const data = await res.json();
      const variant = data.variants?.[0];
      if (variant?.content?.props) return { id: variant.id, props: { ...defaultProps, ...variant.content.props }, preview: true };
    } catch {}
    return { ...fallback, preview: true };
  }

  try {
    const res = await fetch(`${BASE}/api/public/pages/${panelKey}`, { signal: AbortSignal.timeout(4000) });
    const data = await res.json();
    const variants = (data.variants || []).filter((v) => v?.content?.props);
    if (!variants.length) return fallback;
    const sticky = getCookie(`rha_ab_${panelKey}`);
    const chosen = (sticky && variants.find((v) => String(v.id) === sticky)) || weightedPick(variants);
    return { id: chosen.id, props: { ...defaultProps, ...chosen.content.props }, preview: false };
  } catch {
    return fallback;
  }
}
