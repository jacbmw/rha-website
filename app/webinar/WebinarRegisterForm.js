'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getVisitorId, getAttribution } from '../../lib/visitor';
import { irIdentify } from '../../lib/ir';
import { creditPanelReferral } from '../../lib/abTracking';

export default function WebinarRegisterForm({ compact = false }) {
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
      const response = await fetch('/api/webinar/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          email: data.email,
          phone: data.phone,
          visitorId: getVisitorId(),
          attribution: getAttribution(),
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || 'Something went wrong. Please try again.');
      }
      irIdentify({ email: data.email, phone: data.phone || '', firstName: data.firstName || '', formSource: 'website_webinar_how-id-buy_2026-08' });
      window.fbq?.('track', 'CompleteRegistration');
      window.gtag?.('event', 'generate_lead', { event_category: 'conversion', event_label: 'webinar-how-id-buy' });
      creditPanelReferral('webinar_registration');
      router.push('/webinar/registered');
    } catch (err) {
      setStatus('idle');
      setError(err.message);
    }
  };

  return (
    <form className={compact ? 'wb-form wb-form-compact' : 'wb-form'} onSubmit={onSubmit}>
      <input name="firstName" type="text" placeholder="First name" autoComplete="given-name" required aria-label="First name" />
      <input name="email" type="email" placeholder="Email address" autoComplete="email" required aria-label="Email address" />
      <input name="phone" type="tel" placeholder="Mobile number" autoComplete="tel" required aria-label="Mobile number" />
      <input className="wb-hp" name="company" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button className="wb-submit" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Reserving\u2026' : 'RESERVE MY SEAT'}
      </button>
      {error && <p className="wb-form-error" role="alert">{error}</p>}
      <p className="wb-form-note">Free · Live · 45 minutes. Your confirmation and unique join link arrive by email straight away.</p>
    </form>
  );
}
