// Server-side guest activity events (campaign link clicks, gate outcomes).
// Same dashboard endpoint as the browser tracker; the shared lead API key
// lets the dashboard trust the forwarded client IP. Fire-and-forget — never
// blocks or fails the request that triggered it.

const IR_BASE = process.env.NEXT_PUBLIC_RHA_IR_URL || 'https://dashboard.picki.com.au';

export function postActivityServer(event, request) {
  try {
    const ip = String(request?.headers.get('x-forwarded-for') || '').split(',')[0].trim() || null;
    fetch(`${IR_BASE}/api/ir/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': process.env.RHA_LEADS_API_KEY || '' },
      body: JSON.stringify({ events: [{ ...event, occurred_at: new Date().toISOString(), client_ip: ip, user_agent: request?.headers.get('user-agent') || null }] }),
      cache: 'no-store',
    }).catch(() => {});
  } catch {}
}
