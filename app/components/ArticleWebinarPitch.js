'use client';

import Link from 'next/link';
import { getVisitorId } from '../../lib/visitor';

const IR_BASE = process.env.NEXT_PUBLIC_RHA_IR_URL || 'https://dashboard.picki.com.au';

export default function ArticleWebinarPitch({ pitch, post }) {
  if (!pitch?.before || !pitch.linkText) return null;

  // Pitch copy is stored as separate before/link/after fields. Older source
  // records do not consistently include trailing whitespace in `before`, so
  // concatenating directly can render "...question:the webinar". Normalize
  // the boundary here once for every blog placement (article + endless feed).
  const before = /\s$/.test(pitch.before) ? pitch.before : `${pitch.before} `;
  const after = /^\s/.test(pitch.after || '') || /^[\u2014\u2013,.;:!?)]/.test(pitch.after || '')
    ? (pitch.after || '')
    : (pitch.after ? ` ${pitch.after}` : '');

  const handleClick = () => {
    try {
      fetch(`${IR_BASE}/api/ir/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_id: getVisitorId(),
          event_type: 'click',
          page_key: 'article-webinar-pitch',
          post_id: post.id,
          post_slug: post.slug,
          href: pitch.href,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  };

  return (
    <p className="article-webinar-pitch">
      {before}
      <Link href={pitch.href} onClick={handleClick}>{pitch.linkText}</Link>
      {after}
    </p>
  );
}
