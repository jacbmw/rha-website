import { ImageResponse } from 'next/og';
import { findSuburbById, getSuburbSnapshot } from '../../../../../lib/suburbs';
import { rateLimited, requestIp } from '../../../../../lib/rateLimit';

// Dynamic OG share card — suburb name + score dial on the navy/gold card.
// "My suburb scored 87" is inherently shareable; this makes the pasted link
// carry the score instead of a logo on transparent.
export const revalidate = 86400;

const NAVY = '#141a32';
const GOLD = '#c79810';

export async function GET(request, { params }) {
  if (rateLimited(`og:${requestIp(request)}`, { limit: 30, windowMs: 60000 })) {
    return new Response('Too many requests', { status: 429 });
  }
  const { id } = await params;
  const entry = await findSuburbById(id).catch(() => null);
  const snapshot = entry ? await getSuburbSnapshot(entry).catch(() => null) : null;
  if (!snapshot) return new Response('Not found', { status: 404 });

  const score = snapshot.score;
  const circumference = 2 * Math.PI * 84;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: NAVY, color: '#f9f7f0', fontFamily: 'Georgia, serif', padding: 64, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 660 }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 20, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', fontFamily: 'Arial' }}>
            <div style={{ width: 12, height: 12, borderRadius: 12, background: GOLD, marginRight: 14, display: 'flex' }} />
            Your suburb, scored · {snapshot.asOf}
          </div>
          <div style={{ display: 'flex', fontSize: 84, lineHeight: 1.02, letterSpacing: -4, marginTop: 28 }}>
            {snapshot.name}, {snapshot.state}
          </div>
          <div style={{ display: 'flex', fontSize: 26, color: 'rgba(255,255,255,.7)', marginTop: 26, fontFamily: 'Arial', lineHeight: 1.4 }}>
            {snapshot.rank && snapshot.total
              ? `Ranked #${snapshot.rank.toLocaleString('en-AU')} of ${snapshot.total.toLocaleString('en-AU')} suburbs on the Ripehouse R-Score`
              : 'Measured monthly across 27 indicators by Ripehouse Advisory'}
          </div>
          <div style={{ display: 'flex', fontSize: 20, color: GOLD, marginTop: 30, fontFamily: 'Arial', letterSpacing: 2, textTransform: 'uppercase' }}>
            Ripehouse Advisory · ripehouseadvisory.com.au
          </div>
        </div>
        <div style={{ display: 'flex', position: 'relative', width: 300, height: 300, alignItems: 'center', justifyContent: 'center' }}>
          <svg width="300" height="300" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="84" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="11" />
            {score !== null && (
              <circle
                cx="100" cy="100" r="84" fill="none" stroke={GOLD} strokeWidth="11" strokeLinecap="round"
                strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
                transform="rotate(-90 100 100)"
              />
            )}
          </svg>
          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: 84, letterSpacing: -3 }}>{score ?? '—'}</div>
            <div style={{ display: 'flex', fontSize: 22, color: 'rgba(255,255,255,.6)', fontFamily: 'Arial' }}>/ 100</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' },
    }
  );
}
