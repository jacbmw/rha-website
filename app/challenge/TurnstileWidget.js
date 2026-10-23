'use client';

import { useEffect, useRef, useState } from 'react';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function TurnstileWidget({ next }) {
  const container = useRef(null);
  const [state, setState] = useState(SITE_KEY ? 'loading' : 'unavailable');

  useEffect(() => {
    if (!SITE_KEY) return;

    const render = () => {
      if (!window.turnstile || !container.current || container.current.dataset.rendered) return;
      container.current.dataset.rendered = '1';
      window.turnstile.render(container.current, {
        sitekey: SITE_KEY,
        callback: async (token) => {
          setState('verifying');
          try {
            const res = await fetch('/api/challenge', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token }),
            });
            if (res.ok) {
              setState('done');
              window.location.assign(next);
            } else {
              setState('failed');
            }
          } catch {
            setState('failed');
          }
        },
        'error-callback': () => setState('failed'),
        'expired-callback': () => setState('loading'),
      });
    };

    if (window.turnstile) {
      render();
    } else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = render;
      script.onerror = () => setState('failed');
      document.head.appendChild(script);
    }
  }, [next]);

  return (
    <div>
      {state === 'unavailable' ? (
        <p style={{ color: '#555' }}>The check isn&apos;t configured yet — please try again shortly.</p>
      ) : (
        <div ref={container} style={{ display: 'inline-block', minHeight: 65 }} />
      )}
      {state === 'verifying' && <p style={{ color: '#555' }}>Verifying…</p>}
      {state === 'done' && <p style={{ color: '#555' }}>Done — taking you through…</p>}
      {state === 'failed' && (
        <p style={{ color: '#a33' }}>That didn&apos;t work — please refresh and try again.</p>
      )}
    </div>
  );
}
