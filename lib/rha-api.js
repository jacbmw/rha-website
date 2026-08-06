const backendUrl = process.env.RHA_BACKEND_URL;

export async function forwardToRha(path, init) {
  if (!backendUrl) {
    throw new Error('RHA_BACKEND_URL is not configured');
  }

  const response = await fetch(`${backendUrl.replace(/\/$/, '')}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { message: text };
  }

  return { payload, ok: response.ok, status: response.status };
}
