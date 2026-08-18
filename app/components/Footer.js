import Link from 'next/link';

const logoUrl = 'https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/00b2dce8-67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png';
const ripeholdLogoUrl = 'https://ripehold.com.au/img/ripehold_logo_full_white.png';

export default function Footer({ backHref = '/', backLabel = 'Back home ↑' }) {
  return (
    <footer className="site-footer">
      <div className="footer-row">
        <Link className="brand footer-brand" href="/">
          <img className="brand-logo" src={logoUrl} alt="Ripehouse Advisory" />
        </Link>
        <p>© 2026 Ripehouse Advisory. All rights reserved.</p>
        <div>
          <Link href="/legal/privacy-policy">Privacy</Link>
          <Link href="/legal/terms-and-conditions">Terms</Link>
          <Link href={backHref}>{backLabel}</Link>
        </div>
      </div>
      <div className="footer-ripehold">
        <a href="https://ripehold.com.au" target="_blank" rel="noreferrer" aria-label="Ripehold — opens in a new tab">
          <span>For Commercial Property Advisory</span>
          <span aria-hidden="true">—</span>
          <img src={ripeholdLogoUrl} alt="Ripehold" />
        </a>
      </div>
    </footer>
  );
}
