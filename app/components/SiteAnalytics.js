'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { getVisitorId, captureTouches, setFbCookies } from '../../lib/visitor';
import { trackIrPageview } from '../../lib/ir';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '2200362480052876';
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || 'G-TTGS57HCP5';

export default function SiteAnalytics() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  // First-party tracking on every page view (ports the legacy ir-tracking.js
  // + rha-funnel.js): persist the visitor ID, capture first/last-touch UTMs,
  // set Meta cookies, and post the identity-resolution pageview straight to
  // the dashboard (browser-direct so it captures the visitor's real IP).
  useEffect(() => {
    window.__rha_ir = 1; // legacy guard: stops the old inline ir script double-tracking if ever pasted in via GTM
    getVisitorId();
    captureTouches();
    setFbCookies();
    trackIrPageview();

    // Virtual page views for pixel/GA4 on client-side route changes only
    // (their init snippets handle the initial load).
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.fbq?.('track', 'PageView');
    if (GA4_ID) window.gtag?.('config', GA4_ID, { page_path: pathname });
  }, [pathname]);

  return (
    <>
      {PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.agent='plnextjs';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
        </Script>
      )}
      {GA4_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};window.gtag=gtag;gtag('js',new Date());gtag('config','${GA4_ID}');`}
          </Script>
        </>
      )}
    </>
  );
}
