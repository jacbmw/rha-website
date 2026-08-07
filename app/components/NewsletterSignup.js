'use client';

import { useState } from 'react';

export default function NewsletterSignup({ source = 'newsletter', cta = 'Get Market Intel', placeholder = 'Your email address', onSuccess }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const submit = async (event) => {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      if (!response.ok) throw new Error('failed');
      setStatus('done');
      onSuccess?.();
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return <p className="signup-success">You&apos;re in. Watch your inbox for the next edition.</p>;
  }

  return (
    <form className="signup-form" onSubmit={submit}>
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder={placeholder}
        aria-label="Email address"
      />
      <button type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Joining…' : cta}</button>
      {status === 'error' && <p className="signup-error">Something went wrong — please try again.</p>}
    </form>
  );
}
