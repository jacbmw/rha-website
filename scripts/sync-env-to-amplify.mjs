#!/usr/bin/env node
// Reads the local .env file and pushes every KEY=VALUE pair to the AWS Amplify
// branch environment variables, then triggers a rebuild.
//
// Usage:
//   node scripts/sync-env-to-amplify.mjs [path-to-env-file]
//
// AWS credentials must come from the standard AWS credential chain
// (aws configure, AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY env vars, SSO, etc.)
// — they are NOT read from .env.

import { readFileSync, writeFileSync, unlinkSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { spawnSync } from 'child_process';

const APP_ID = 'd6ddvqy1r2nlw';
const BRANCH = 'develop';
const REGION = 'ap-southeast-2';
const DRY_RUN = process.argv.includes('--dry-run');
const args = process.argv.slice(2);
const ENV_FILE = args.find((arg) => !arg.startsWith('--')) || '.env';

// Load .env into process.env using Node's built-in loader (Node >= 20).
if (typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(ENV_FILE);
} else {
  console.error('Node >= 20 is required for process.loadEnvFile().');
  process.exit(1);
}

function parseEnvKeys(content) {
  const keys = [];
  for (const raw of content.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    if (!key || key.startsWith('#')) continue;
    keys.push(key);
  }
  return keys;
}

const keys = parseEnvKeys(readFileSync(ENV_FILE, 'utf8'));
const vars = {};
for (const key of keys) {
  if (key in process.env) vars[key] = process.env[key];
}

if (!Object.keys(vars).length) {
  console.error(`No variables found in ${ENV_FILE}`);
  process.exit(1);
}

console.log(`Syncing ${Object.keys(vars).length} variables from ${ENV_FILE} to Amplify branch "${BRANCH}"...`);

if (DRY_RUN) {
  console.log('\nDry run — variables that would be sent:');
  for (const key of Object.keys(vars).sort()) {
    const value = vars[key];
    const masked = value.length > 8 ? value.slice(0, 3) + '...' + value.slice(-3) : '***';
    console.log(`  ${key}=${masked}`);
  }
  process.exit(0);
}

const tmpDir = mkdtempSync(join(tmpdir(), 'amplify-env-'));
const tmpFile = join(tmpDir, 'input.json');
const payload = {
  appId: APP_ID,
  branchName: BRANCH,
  environmentVariables: vars,
};

writeFileSync(tmpFile, JSON.stringify(payload), { mode: 0o600 });

const result = spawnSync(
  'aws',
  ['amplify', 'update-branch', '--cli-input-json', `file://${tmpFile}`, '--region', REGION],
  { stdio: 'inherit' }
);

try {
  unlinkSync(tmpFile);
} catch {}

if (result.status !== 0) {
  console.error('AWS update-branch failed. No rebuild was triggered.');
  process.exit(result.status ?? 1);
}

console.log('Environment variables updated. Starting a new Amplify release...');

const release = spawnSync(
  'aws',
  [
    'amplify', 'start-job',
    '--app-id', APP_ID,
    '--branch-name', BRANCH,
    '--job-type', 'RELEASE',
    '--region', REGION,
  ],
  { stdio: 'inherit' }
);

process.exit(release.status ?? 1);
