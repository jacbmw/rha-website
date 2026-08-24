'use client';

import { useId, useRef } from 'react';
import { useAdSlot } from './AdMixProvider';
import WebinarBanner from './WebinarBanner';
import ArticleEbookPanel from './panels/ArticleEbookPanel';
import ArticleFooterPanel from './panels/ArticleFooterPanel';
import ArticleInlinePanel from './panels/ArticleInlinePanel';
import SuburbScoreWidget from './SuburbScoreWidget';

const COMPONENTS = {
  'panel-webinar-banner': WebinarBanner,
  'panel-article-ebook': ArticleEbookPanel,
  'panel-article-footer': ArticleFooterPanel,
  'panel-article-inline': ArticleInlinePanel,
  'panel-suburb-score': SuburbScoreWidget,
};

export default function ArticleAdSlot({ className = '' }) {
  const slot = useAdSlot();
  const trackKey = useId();
  const clickedRef = useRef(false);
  const convertedRef = useRef(false);

  if (!slot) return <div className={`article-ad-slot ${className}`} aria-hidden="true" />;

  const { panel, variants, recordClick, recordConversion } = slot;
  const Panel = COMPONENTS[panel.key];
  const variant = variants[panel.key];
  if (!Panel || !variant) return <div className={`article-ad-slot ${className}`} aria-hidden="true" />;

  const handleClick = () => {
    if (clickedRef.current) return;
    clickedRef.current = true;
    recordClick(panel.key);
  };
  const handleConversion = () => {
    if (convertedRef.current) return;
    convertedRef.current = true;
    recordConversion(panel.key);
  };

  return (
    <div className={`article-ad-slot ${className}`}>
      <Panel {...(panel.defaultProps || {})} variant={variant} trackKey={trackKey} onClick={handleClick} onConversion={handleConversion} />
    </div>
  );
}
