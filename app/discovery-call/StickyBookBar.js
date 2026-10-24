'use client';

import { useEffect, useState } from 'react';

export default function StickyBookBar() {
  const [visible, setVisible] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const target = document.getElementById('book');
    const onMessage = (event) => {
      if (!/https:\/\/([a-z0-9-]+\.)?calendly\.com$/.test(event.origin)) return;
      if (event.data?.event === 'calendly.event_scheduled') setBooked(true);
    };
    window.addEventListener('message', onMessage);
    let observer;
    if (target) {
      observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { threshold: 0.1 });
      observer.observe(target);
    }
    return () => {
      window.removeEventListener('message', onMessage);
      observer?.disconnect();
    };
  }, []);

  if (booked || !visible) return null;

  return (
    <div className="book-sticky-bar">
      <a className="button button-light" href="#book">Book my free review <span aria-hidden="true">↗</span></a>
    </div>
  );
}
