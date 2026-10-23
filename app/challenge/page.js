import TurnstileWidget from './TurnstileWidget';

export const metadata = {
  title: 'Quick check',
  robots: { index: false, follow: false },
};

export default async function ChallengePage({ searchParams }) {
  const { next } = await searchParams;
  const safeNext = typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/';

  return (
    <main style={{ maxWidth: 560, margin: '12vh auto', padding: '0 24px', textAlign: 'center' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>One quick check</h1>
      <p style={{ color: '#555', marginBottom: 32 }}>
        We&apos;re seeing unusual traffic from your network. Confirm you&apos;re human and
        we&apos;ll take you straight through.
      </p>
      <TurnstileWidget next={safeNext} />
    </main>
  );
}
