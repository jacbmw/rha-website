'use client';

import { useState } from 'react';
import { getVisitorId } from '../../../../../lib/visitor';
import { trackActivity } from '../../../../../lib/activity';
import { PROFILE_PER_VISIT, PROFILE_QUESTIONS } from '../../../../../lib/streetShared';

const ANSWERED_KEY = 'rha_profile_answered';
const VISIT_KEY = 'rha_profile_visit_count';

const ORDER = {
  curious: ['goal', 'timeframe'],
  rent: ['goal', 'timeframe', 'onTrack', 'why', 'portfolio', 'risk', 'dream'],
  default: ['goal', 'timeframe', 'portfolio', 'risk', 'onTrack', 'why', 'dream'],
};

const read = (store, key, fallback) => { try { return JSON.parse(store.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (store, key, value) => { try { store.setItem(key, JSON.stringify(value)); } catch {} };

// Progressive profiling — "help us tailor your Street Review". One question
// per screen, at most PROFILE_PER_VISIT per visit, every one skippable. Each
// answer is saved immediately (POST /api/streets/profile) so a half-finished
// set still lands on the lead; goal / timeframe / risk / why / dream feed the
// lead's Investor Motivation fields on the dashboard.
//
// Only ever rendered after the report is unlocked (client-side), so reading
// storage in the lazy initialisers is hydration-safe.
export default function StreetProfile({ snapshot, segment, heading }) {
  const [queue] = useState(() => {
    const answered = read(localStorage, ANSWERED_KEY, []);
    const asked = read(sessionStorage, VISIT_KEY, 0);
    const keys = (ORDER[segment] || ORDER.default).filter((k) => !answered.includes(k));
    return keys.slice(0, Math.max(0, (segment === 'curious' ? 2 : PROFILE_PER_VISIT) - asked)).map((k) => PROFILE_QUESTIONS.find((q) => q.key === k));
  });
  const [index, setIndex] = useState(0);
  const [other, setOther] = useState('');
  const [saving, setSaving] = useState(false);

  if (!queue.length) return null;
  const question = queue[index];
  const ctx = { pageKey: 'street-score', streetKey: snapshot.key, suburbId: snapshot.suburb.id, segment, question: question?.key };

  const advance = () => {
    write(sessionStorage, VISIT_KEY, read(sessionStorage, VISIT_KEY, 0) + 1);
    setOther('');
    setIndex((i) => i + 1);
  };

  const answer = async (value) => {
    if (saving) return;
    setSaving(true);
    trackActivity('profile_answer', { ...ctx, value: question.allowText ? undefined : value });
    try {
      await fetch('/api/streets/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: { [question.key]: value }, segment, streetKey: snapshot.key, visitorId: getVisitorId() }),
      });
      write(localStorage, ANSWERED_KEY, [...new Set([...read(localStorage, ANSWERED_KEY, []), question.key])]);
    } catch {}
    setSaving(false);
    advance();
  };

  const skip = () => {
    trackActivity('profile_skip', ctx);
    advance();
  };

  if (index >= queue.length) {
    return (
      <div className="street-profile done" role="status">
        <p>Thanks — that&apos;s exactly what we need to make the Review useful.</p>
      </div>
    );
  }

  return (
    <div className="street-profile">
      <p className="street-profile-heading">{heading}</p>
      <p className="street-profile-step">Question {index + 1} of {queue.length}</p>
      <p className="street-profile-question">{question.question}</p>
      <div className="street-profile-options">
        {question.options.map((option) => (
          <button type="button" key={option.value} disabled={saving} onClick={() => answer(option.value)}>{option.label}</button>
        ))}
      </div>
      {question.allowText && (
        <form className="street-profile-other" onSubmit={(event) => { event.preventDefault(); if (other.trim().length >= 3) answer(other.trim()); }}>
          <input type="text" value={other} maxLength={300} placeholder="Or in your own words…" onChange={(event) => setOther(event.target.value)} />
          <button type="submit" disabled={saving || other.trim().length < 3}>Save</button>
        </form>
      )}
      <button type="button" className="street-profile-skip" onClick={skip}>Skip</button>
    </div>
  );
}
