import { NextResponse } from 'next/server';
import { isBlogAdmin } from '../../../lib/blog-auth';
import { createBlogItem, listBlogItems } from '../../../lib/webflow';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDrafts = searchParams.get('includeDrafts') === 'true' && isBlogAdmin(request);
    const items = await listBlogItems({
      includeDrafts,
      limit: Math.min(Number(searchParams.get('limit')) || 100, 100),
      offset: Math.max(Number(searchParams.get('offset')) || 0, 0),
    });
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Unable to list blog content:', error.message);
    return NextResponse.json({ message: 'Blog content is temporarily unavailable.' }, { status: 503 });
  }
}

export async function POST(request) {
  if (!isBlogAdmin(request)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    if (!body?.name) return NextResponse.json({ message: 'name is required.' }, { status: 400 });
    const item = await createBlogItem(body);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Unable to create blog content:', error.message);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
