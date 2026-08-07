'use client';

import { useEffect, useState } from 'react';
import NewsletterSignup from './NewsletterSignup';

const STORAGE_KEY = 'rha_exit_intent_shown';

export default function ExitIntentModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const armedAt = Date.now();
    const onLeave = (event) => {
      // Fire only on a genuine upward exit toward the browser chrome,
      // after the reader has actually spent time on the page.
      if (event.clientY > 8 || Date.now() - armedAt < 6000) return;
      if (sessionStorage.getItem(STORAGE_KEY)) return;
      sessionStorage.setItem(STORAGE_KEY, '1');
      setOpen(true);
    };
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => document.documentElement.removeEventListener('mouseleave', onLeave);
  }, []);

  if (!open) return null;

  return (
    <div className="exit-overlay" role="dialog" aria-modal="true" aria-label="Newsletter invitation" onClick={() => setOpen(false)}>
      <div className="exit-modal" onClick={(event) => event.stopPropagation()}>
        <button className="exit-close" aria-label="Close" onClick={() => setOpen(false)}>×</button>
        <p className="eyebrow"><span /> Before you go</p>
        <h3>The market moves weekly.<br /><i>Most investors find out monthly.</i></h3>
        <p className="exit-copy">Join thousands of Australian investors getting our research-first Market Intel briefing — data, suburbs and strategy, no fluff.</p>
        <NewsletterSignup source="exit-intent" cta="Join free" />
        <button className="exit-dismiss" onClick={() => setOpen(false)}>No thanks, I&apos;ll keep guessing</button>
      </div>
    </div>
  );
}
