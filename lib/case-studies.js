import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.RIPEHOUSE_DB_HOST,
      port: Number(process.env.RIPEHOUSE_DB_PORT || 3306),
      user: process.env.RIPEHOUSE_DB_USER,
      password: process.env.RIPEHOUSE_DB_PASSWORD,
      database: process.env.RHA_CASE_STUDIES_DB_NAME || 'jacobclaw',
      ssl: { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 3,
      connectTimeout: 15000,
    });
  }
  return pool;
}

export function youtubeId(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    if (url.hostname.includes('youtu.be')) return url.pathname.slice(1).split('/')[0];
    if (url.hostname.includes('youtube.com')) return url.searchParams.get('v') || url.pathname.split('/').pop();
  } catch {
    return String(value).match(/[\w-]{11}/)?.[0] || '';
  }
  return '';
}

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-AU', { month: 'short', year: 'numeric' }).format(new Date(value));
}

function cleanPropertyName(cardName, description, index) {
  const address = String(cardName || '').replace(/^.*?#\d+\s*/i, '').trim();
  if (address && !/^\d+x?$/i.test(address)) return address;
  const match = String(description || '').match(/(?:Address:\s*|Purchase:\s*|Purchase\s+\d+:\s*)([^\n]+)/i);
  return match?.[1]?.replace(/\s*\(.*$/, '').trim() || `Portfolio acquisition ${index + 1}`;
}

function generateSlug(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function displayName(name) {
  const value = String(name || '').trim();
  const words = value.split(/\s+/);
  if (words.length < 2) return value;
  return `${words.slice(0, -1).join(' ')} ${words[words.length - 1][0].toUpperCase()}.`;
}

export function validProperties(properties) {
  return (properties || []).filter((property) => String(property.suburb || '').trim());
}

export function assignSlugs(caseStudies) {
  const seen = new Map();
  return (caseStudies || []).map((study) => {
    const baseSlug = study.slug || generateSlug(study.name || study.title || study.fullname);
    let slug = baseSlug || `case-study-${study.id}`;
    const count = seen.get(slug) || 0;
    seen.set(slug, count + 1);
    if (count > 0) slug = `${slug}-${study.id}`;
    return { ...study, slug };
  });
}

function normaliseStudy(row, transactions) {
  const properties = transactions.map((transaction, index) => ({
    label: `Acquisition ${String(index + 1).padStart(2, '0')}`,
    value: cleanPropertyName(transaction.card_name, transaction.description, index),
  }));
  const timeline = transactions.map((transaction, index) => ({
    label: formatDate(transaction.offer_accepted_date || transaction.unconditional_date || transaction.dynamics_createdon) || `Stage ${index + 1}`,
    value: cleanPropertyName(transaction.card_name, transaction.description, index),
  }));

  return {
    id: row.id,
    slug: row.slug || generateSlug(row.name || row.title || row.fullname) || `case-study-${row.id}`,
    title: row.title || row.fullname || 'A considered investment, measured over time',
    subtitle: row.subtitle || '',
    summary: row.description || '',
    location: properties[0]?.value?.split(',').slice(-2).join(',').trim() || '',
    videoId: youtubeId(row.video_url),
    properties,
    timeline,
  };
}

export async function listPublicCaseStudies() {
  const source = process.env.RHA_CASE_STUDIES_API_URL || 'https://dashboard.picki.com.au/api/public/case-studies';
  try {
    const response = await fetch(source, { headers: { Accept: 'application/json' }, next: { revalidate: 900, tags: ['case-studies'] } });
    if (!response.ok) return [];
    const payload = await response.json();
    return assignSlugs(payload.caseStudies);
  } catch (error) {
    console.error('Unable to load public case studies:', error.message);
    return [];
  }
}

export async function getRandomCaseStudy() {
  if (!process.env.RIPEHOUSE_DB_HOST || !process.env.RIPEHOUSE_DB_USER) return null;
  try {
    const connection = getPool();
    const [rows] = await connection.query(`
      SELECT cs.id, cs.lead_id, cs.video_url, cs.title, cs.subtitle, cs.description, l.fullname
      FROM rha_case_studies cs
      LEFT JOIN rha_leads l ON l.lead_id = cs.lead_id
      WHERE cs.video_url IS NOT NULL AND cs.video_url <> ''
      ORDER BY RAND()
      LIMIT 1
    `);
    if (!rows.length) return null;

    const [transactions] = await connection.query(`
      SELECT card_name, description, offer_accepted_date, unconditional_date, dynamics_createdon
      FROM rha_client_transactions
      WHERE lead_id = ?
      ORDER BY COALESCE(offer_accepted_date, unconditional_date, dynamics_createdon)
    `, [rows[0].lead_id]);
    return normaliseStudy(rows[0], transactions);
  } catch (error) {
    console.error('Unable to load case study:', error.message);
    return null;
  }
}
