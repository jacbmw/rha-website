'use client';

import Link from 'next/link';
import usePanelTracking from './usePanelTracking';
import { useAdMixVariant } from '../AdMixProvider';
import { storePanelReferral } from '../../../lib/abTracking';
import { trackActivity } from '../../../lib/activity';

const KEY = 'panel-street-pitch';
const PLACEMENT = 'pitch';

// Inline sentence pitch after the article body. The variant comes from the
// AdMix context so the endless feed can render it per article without
// plumbing props through the fetched feed items.
export default function ArticleStreetPitch({ post }) {
  const variant = useAdMixVariant(KEY);
  const { id, props, preview } = variant || { props: {} };
  const { trackClick } = usePanelTracking(KEY, id, preview);
  if (!props.before || !props.linkText) return null;
  const href = `${props.href || '/streets'}?int_ref=blog-${PLACEMENT}`;

  const handleClick = () => {
    trackClick();
    if (id && !preview) storePanelReferral(KEY, id);
    trackActivity('street_cta_click', {
      pageKey: KEY,
      placement: PLACEMENT,
      postId: post?.id,
      postSlug: post?.slug,
    });
  };

  return (
    <p className="article-street-pitch">
      {props.before}
      <Link href={href} onClick={handleClick}>{props.linkText}</Link>
      {props.after}
    </p>
  );
}
