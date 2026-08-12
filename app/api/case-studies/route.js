import { NextResponse } from 'next/server';
import { getPool, youtubeId } from '../../../lib/case-studies';

const source = process.env.RHA_CASE_STUDIES_API_URL || 'https://dashboard.picki.com.au/api/public/case-studies';

function generateSlug(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function assignSlugs(caseStudies) {
  const seen = new Map();
  return (caseStudies || []).map((study) => {
    const baseSlug = study.slug || generateSlug(study.name || study.title || study.fullname);
    let slug = baseSlug || `case-study-${study.id}`;
    const count = seen.get(slug) || 0;
    seen.set(slug, count + 1);
    if (count > 0) slug = `${slug}-${study.id}`;
    return { ...study, slug };
  });
}

async function attachVideoUrls(caseStudies) {
  if (!process.env.RIPEHOUSE_DB_HOST || !process.env.RIPEHOUSE_DB_USER || !caseStudies?.length) return caseStudies;
  try {
    const pool = getPool();
    const ids = caseStudies.map((study) => study.id);
    const [rows] = await pool.query('SELECT id, video_url FROM rha_case_studies WHERE id IN (?)', [ids]);
    const videoMap = new Map(rows.map((row) => [row.id, row.video_url]));
    return caseStudies.map((study) => ({
      ...study,
      videoId: study.videoId || youtubeId(videoMap.get(study.id)) || '',
    }));
  } catch (error) {
    console.error('Unable to attach case study videos:', error.message);
    return caseStudies;
  }
}

export async function GET() {
  try {
    const response = await fetch(source, { headers: { Accept: 'application/json' }, next: { revalidate: 900, tags: ['case-studies'] } });
    const payload = await response.json();
    if (!response.ok) return NextResponse.json({ status: 'unavailable', caseStudies: [] }, { status: 200 });
    let caseStudies = assignSlugs(payload.caseStudies);
    caseStudies = await attachVideoUrls(caseStudies);
    return NextResponse.json({ ...payload, caseStudies }, { headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600' } });
  } catch (error) {
    console.error('Unable to load public case studies:', error.message);
    return NextResponse.json({ status: 'unavailable', caseStudies: [] }, { status: 200 });
  }
}
