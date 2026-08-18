import { NextResponse } from 'next/server';
import { PANEL_KEYS } from '../../../lib/panelVariants';
import { listBlogItems } from '../../../lib/blog-store';
import { listSuburbSlugs } from '../../../lib/suburbs';

// GET /api/panel-preview?panel=<panelKey>&variant=<id>
// Sets a short-lived preview cookie forcing that panel variant (even paused,
// tracking suppressed) and redirects to a page that shows the panel — the
// blog index for the hero panel, the latest article for the article panels,
// a real suburb page for the scorecard gate (which only renders there).
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const panel = searchParams.get('panel') || '';
  const variant = searchParams.get('variant') || '';
  if (!PANEL_KEYS.includes(panel) || !/^\d+$/.test(variant)) {
    return NextResponse.json({ error: 'panel and variant required' }, { status: 400 });
  }

  let target = '/resources/blog';
  if (panel === 'panel-suburb-scorecard') {
    try {
      const slugs = await listSuburbSlugs();
      if (slugs[0]) target = `/suburbs/${slugs[0].state}/${slugs[0].slug}`;
    } catch {}
  } else if (panel !== 'panel-blog-hero') {
    try {
      const posts = await listBlogItems({ limit: 1 });
      if (posts[0]?.slug) target = `/resources/blog/${posts[0].slug}`;
    } catch {}
  }

  const response = NextResponse.redirect(new URL(target, origin));
  response.cookies.set(`rha_prev_${panel}`, variant, { maxAge: 600, path: '/', sameSite: 'lax' });
  return response;
}
