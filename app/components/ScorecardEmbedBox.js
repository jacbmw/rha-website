'use client';

import { useState } from 'react';

export default function ScorecardEmbedBox({ title, pageUrl, ogImageUrl, scoreLabel }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState('');

  const htmlSnippet = `<a href="${pageUrl}" target="_blank" rel="noopener" title="${title} — Ripehouse Advisory"><img src="${ogImageUrl}" alt="${title} (${scoreLabel})" style="max-width:100%;height:auto;border-radius:4px;border:1px solid rgba(20,26,50,0.16);" /></a><p style="font-size:12px;color:#687087;margin-top:6px;">Live monthly property data via <a href="${pageUrl}" target="_blank" rel="noopener">Ripehouse Advisory (${title})</a></p>`;

  const markdownSnippet = `[![${title} (${scoreLabel})](${ogImageUrl})](${pageUrl})\n*Source: [Ripehouse Advisory — ${title}](${pageUrl})*`;

  const copyText = (text, kind) => {
    try {
      navigator.clipboard?.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(''), 2500);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <button
          type="button"
          className="loc-state-pill"
          style={{ cursor: 'pointer' }}
          onClick={() => copyText(pageUrl, 'url')}
        >
          {copied === 'url' ? '✓ Link copied' : 'Copy citation link'}
        </button>
        <button
          type="button"
          className="loc-state-pill"
          style={{ cursor: 'pointer' }}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Hide embed scorecard code ↑' : 'Embed live scorecard badge (HTML / Markdown) ↓'}
        </button>
      </div>

      {open && (
        <div
          style={{
            background: '#fff',
            border: '1px solid var(--line)',
            marginTop: '14px',
            padding: '18px 20px',
          }}
        >
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px', color: 'var(--ink)' }}>
            Embed Live {title} Scorecard (Auto-Updates Monthly)
          </p>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', margin: '0 0 12px', lineHeight: 1.5 }}>
            Mortgage brokers, journalists, and property writers can embed this live Ripehouse scorecard card on any website or article with attribution:
          </p>
          <pre
            style={{
              background: 'var(--cream)',
              border: '1px solid var(--line)',
              fontSize: '11.5px',
              overflowX: 'auto',
              padding: '10px 12px',
              margin: '0 0 10px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {htmlSnippet}
          </pre>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="loc-state-pill"
              style={{ cursor: 'pointer' }}
              onClick={() => copyText(htmlSnippet, 'html')}
            >
              {copied === 'html' ? '✓ HTML Embed Copied' : 'Copy HTML Embed Code'}
            </button>
            <button
              type="button"
              className="loc-state-pill"
              style={{ cursor: 'pointer' }}
              onClick={() => copyText(markdownSnippet, 'md')}
            >
              {copied === 'md' ? '✓ Markdown Copied' : 'Copy Markdown Citation'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
