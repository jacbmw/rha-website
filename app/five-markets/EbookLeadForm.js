'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getVisitorId, getAttribution } from '../../lib/visitor';
import { irIdentify } from '../../lib/ir';
import { trackVariantClick, trackVariantConversion, creditPanelReferral } from '../../lib/abTracking';

export default function EbookLeadForm() {
  const router = useRouter();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    if (status === 'sending') return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if (data.company) return; // honeypot — silently drop bot submissions
    setStatus('sending');
    setError('');
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          name: data.firstName || '',
          phone: data.phone || undefined,
          source: 'ebook',
          formSource: 'website_five-markets_2026',
          visitorId: getVisitorId(),
          attribution: getAttribution(),
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || 'Something went wrong. Please try again.');
      }
      irIdentify({ email: data.email, phone: data.phone || '', firstName: data.firstName || '', formSource: 'website_five-markets_2026' });
      trackVariantConversion('ebook_lead');
      creditPanelReferral('ebook_lead');
      window.fbq?.('track', 'Lead');
      window.gtag?.('event', 'generate_lead', { event_category: 'conversion', event_label: 'five-markets-report' });
      router.push('/five-markets/on-its-way');
    } catch (err) {
      setStatus('idle');
      setError(err.message);
    }
  };

  return (
    <form className="ebook-form" onSubmit={onSubmit} onFocus={trackVariantClick}>
      <input name="firstName" type="text" placeholder="First name" autoComplete="given-name" required aria-label="First name" />
      <input name="email" type="email" placeholder="Email address" autoComplete="email" required aria-label="Email address" />
      <input name="phone" type="tel" placeholder="Phone (optional)" autoComplete="tel" aria-label="Phone (optional)" />
      <input className="ebook-hp" name="company" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button className="button button-light ebook-submit" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send Me the Report'}
      </button>
      {error && <p className="ebook-form-error" role="alert">{error}</p>}
      <p className="ebook-form-note">We&apos;ll email the report straight away. No spam — unsubscribe any time.</p>
    </form>
  );
}
