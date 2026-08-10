import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

function isAuthorized(request) {
  const configured = process.env.REVALIDATE_SECRET;
  if (!configured) return false;
  const authorization = request.headers.get('authorization') || '';
  const bearer = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  return bearer === configured || request.headers.get('x-revalidate-secret') === configured;
}

// On-demand cache purge, called by rha-dashboard right after a case study or
// property AVM save so edits show up on the site immediately instead of
// waiting out the normal fetch revalidate window. Body: { tag }.
export async function POST(request) {
  if (!isAuthorized(request)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const tag = String(body?.tag || 'case-studies').trim();
  revalidateTag(tag);
  return NextResponse.json({ revalidated: true, tag, now: Date.now() });
}
