import { NextResponse } from 'next/server';
import { isBlogAdmin } from '../../../../lib/blog-auth';
import { deleteBlogItem, getBlogItem, updateBlogItem } from '../../../../lib/blog-store';

export async function GET(request, { params }) {
  try {
    const item = await getBlogItem((await params).id);
    if (!item || item.isDraft || item.isArchived) {
      if (!isBlogAdmin(request)) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (error) {
    console.error('Unable to load blog content:', error.message);
    return NextResponse.json({ message: 'Blog content is temporarily unavailable.' }, { status: 503 });
  }
}

export async function PATCH(request, { params }) {
  if (!isBlogAdmin(request)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const item = await updateBlogItem((await params).id, await request.json());
    return NextResponse.json({ item });
  } catch (error) {
    console.error('Unable to update blog content:', error.message);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  if (!isBlogAdmin(request)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const result = await deleteBlogItem((await params).id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Unable to delete blog content:', error.message);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
