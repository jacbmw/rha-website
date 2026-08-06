import { NextResponse } from 'next/server';
import { forwardToRha } from '../../../lib/rha-api';

export async function POST(request) {
  const body = await request.json();
  const { name, email, phone, message } = body || {};

  if (!name || !email) {
    return NextResponse.json({ message: 'Name and email are required.' }, { status: 400 });
  }

  try {
    const result = await forwardToRha(process.env.RHA_PUBLIC_LEAD_PATH || '/api/public/leads', {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.RHA_LEADS_API_KEY || '',
      },
      body: JSON.stringify({ name, email, phone, message, source: 'rha-website' }),
    });
    return NextResponse.json(result.payload, { status: result.status });
  } catch (error) {
    console.error('Unable to forward public contact request:', error.message);
    return NextResponse.json({ message: 'Contact service is temporarily unavailable.' }, { status: 503 });
  }
}
