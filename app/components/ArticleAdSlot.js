'use client';

import { useId, useRef } from 'react';
import { useAdSlot } from './AdMixProvider';
import StreetRailPanel from './panels/StreetRailPanel';
import StreetInlinePanel from './panels/StreetInlinePanel';
import StreetFooterPanel from './panels/StreetFooterPanel';
import StreetCardPanel from './panels/StreetCardPanel';

const COMPONENTS = {
  'panel-street-rail': StreetRailPanel,
  'panel-street-inline': StreetInlinePanel,
  'panel-street-footer': StreetFooterPanel,
  'panel-street-card': StreetCardPanel,
};

export default function ArticleAdSlot({ className = '', excludeWebinarOnDesktop = false }) {
  const slot = useAdSlot({ excludeOnDesktop: excludeWebinarOnDesktop });
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
