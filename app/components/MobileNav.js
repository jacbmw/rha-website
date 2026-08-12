'use client';

import { useState } from 'react';

// Hamburger navigation for <=800px viewports, where .desktop-nav is hidden.
// Rendered inside each page's .site-header alongside the desktop nav.
export default function MobileNav({ links }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav id="mobile-nav-panel" className={`mobile-nav${open ? ' mobile-nav-open' : ''}`} aria-label="Mobile navigation">
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
        ))}
      </nav>
    </>
  );
}
