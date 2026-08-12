'use client';

import { useEffect, useState } from 'react';

export default function StickyBookBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById('book');
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { threshold: 0.1 });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div className="book-sticky-bar">
      <a className="button button-light" href="#book">Book your discovery call <span aria-hidden="true">↗</span></a>
    </div>
  );
}
