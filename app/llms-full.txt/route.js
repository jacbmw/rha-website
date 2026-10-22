import { buildLlmsTxt } from '../../lib/llms';

export const revalidate = 86400;

export async function GET() {
  const body = await buildLlmsTxt({ full: true });
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
      'X-Robots-Tag': 'all',
    },
  });
}
