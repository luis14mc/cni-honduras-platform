#!/usr/bin/env node
/**
 * READ-ONLY media storage audit for Strapi 5 + PostgreSQL.
 *
 * Inventories the `files` table, classifies each record as R2 vs local/suspect,
 * and (optionally) HEAD-checks every public URL to flag the ones that 404.
 * It NEVER writes to the database, NEVER deletes files, and NEVER alters Strapi.
 *
 * Purpose: identify legacy Media Library entries that were uploaded while Strapi
 * used LOCAL filesystem storage (provider "local", relative "/uploads/..." URLs)
 * whose physical files were lost on a Render redeploy (ephemeral disk), while the
 * PostgreSQL metadata survived.
 *
 * Usage (run from cms-strapi/, with the SAME env the app uses):
 *   node scripts/audit-media.mjs               # inventory only (no network)
 *   node scripts/audit-media.mjs --check-urls  # + HTTP HEAD each URL, flag 404s
 *   node scripts/audit-media.mjs --json        # machine-readable output
 *
 * Connection is resolved exactly like config/database.ts:
 *   DATABASE_URL  (preferred)  OR  DATABASE_HOST/PORT/NAME/USERNAME/PASSWORD
 *   DATABASE_SSL, DATABASE_SCHEMA, DATABASE_SSL_REJECT_UNAUTHORIZED
 */
// Load .env when available; on hosts where env vars are already exported
// (e.g. Render), dotenv is optional and its absence is not an error.
try {
  await import('dotenv/config');
} catch {
  /* dotenv not installed — rely on the already-exported environment */
}
import pg from 'pg';

const R2_PROVIDER = 'strapi-provider-cloudflare-r2-aws';
const args = new Set(process.argv.slice(2));
const CHECK_URLS = args.has('--check-urls');
const AS_JSON = args.has('--json');

function bool(name, fallback = false) {
  const v = process.env[name];
  if (v === undefined || v === '') return fallback;
  return v === 'true' || v === '1';
}

function buildPgConfig() {
  const ssl = bool('DATABASE_SSL', false)
    ? { rejectUnauthorized: bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true) }
    : false;

  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL, ssl };
  }
  return {
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT || 5432),
    database: process.env.DATABASE_NAME || 'cni_strapi',
    user: process.env.DATABASE_USERNAME || 'strapi',
    password: process.env.DATABASE_PASSWORD || 'strapi',
    ssl,
  };
}

function isLocalUrl(url) {
  return typeof url !== 'string' || !/^https?:\/\//i.test(url);
}

/** Collect the file URL plus every format (thumbnail/small/medium/large) URL. */
function collectUrls(row) {
  const urls = [];
  if (row.url) urls.push({ label: 'original', url: row.url });
  const formats = row.formats && typeof row.formats === 'object' ? row.formats : null;
  if (formats) {
    for (const [name, fmt] of Object.entries(formats)) {
      if (fmt && typeof fmt === 'object' && fmt.url) {
        urls.push({ label: name, url: fmt.url });
      }
    }
  }
  return urls;
}

/**
 * Classify a row without any network call.
 * A record stored on R2 has provider === R2_PROVIDER AND an absolute http(s) URL
 * (including all of its format URLs). Anything else is "suspect" (likely local).
 */
function classify(row) {
  const urls = collectUrls(row);
  const problems = [];

  if (row.provider !== R2_PROVIDER) {
    problems.push(`provider=${row.provider ?? 'null'} (not R2)`);
  }
  const relative = urls.filter((u) => isLocalUrl(u.url));
  if (relative.length) {
    problems.push(`relative url: ${relative.map((u) => u.label).join(', ')}`);
  }

  return { urls, problems, suspect: problems.length > 0 };
}

async function headCheck(url) {
  if (isLocalUrl(url)) return { url, ok: false, status: 'RELATIVE_URL (no host to check)' };
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return { url, ok: res.ok, status: res.status };
  } catch (err) {
    return { url, ok: false, status: `NETWORK_ERROR: ${err.message}` };
  }
}

async function main() {
  const schema = process.env.DATABASE_SCHEMA || 'public';
  const client = new pg.Client(buildPgConfig());
  await client.connect();

  // Read EVERY file so we can report accurate totals (r2 vs local vs suspect).
  const { rows } = await client.query(
    `SELECT id, name, mime, size, hash, ext, url, provider, formats
       FROM "${schema}"."files"
      ORDER BY id ASC`
  );

  const items = [];
  let r2Count = 0;
  let localCount = 0;
  let brokenCount = 0;

  for (const row of rows) {
    const { urls, problems, suspect } = classify(row);
    if (suspect) localCount += 1;
    else r2Count += 1;

    const broken = [];
    if (CHECK_URLS) {
      for (const u of urls) {
        const result = await headCheck(u.url);
        if (!result.ok) broken.push({ label: u.label, ...result });
      }
      if (broken.length) brokenCount += 1;
    }

    let status;
    if (CHECK_URLS) status = broken.length ? 'BROKEN' : 'OK';
    else status = suspect ? 'SUSPECT' : 'OK';

    items.push({
      id: row.id,
      name: row.name,
      provider: row.provider,
      url: row.url,
      status,
      problem: problems.length ? problems.join('; ') : '',
      urls,
      broken,
      suspect,
    });
  }

  await client.end();

  const summary = {
    totalFiles: items.length,
    r2Files: r2Count,
    localFiles: localCount,
    suspiciousFiles: localCount,
    brokenUrls: CHECK_URLS ? brokenCount : null,
  };

  if (AS_JSON) {
    console.log(JSON.stringify({ summary, checkedUrls: CHECK_URLS, items }, null, 2));
    return;
  }

  console.log(`\nMedia audit (READ-ONLY) — schema "${schema}"\n`);
  // Only print suspect rows in the detail list; R2-clean rows are counted in the summary.
  const detail = CHECK_URLS ? items.filter((e) => e.suspect || e.broken.length) : items.filter((e) => e.suspect);
  for (const e of detail) {
    console.log(`#${e.id}  ${e.name}`);
    console.log(`     provider: ${e.provider}`);
    console.log(`     url:      ${e.url}`);
    console.log(`     status:   ${e.status}`);
    console.log(`     problem:  ${e.problem || '(url check only)'}`);
    for (const b of e.broken) {
      console.log(`     ✗ ${b.label}: ${b.status}  ${b.url}`);
    }
  }
  if (!detail.length) console.log('(no suspect records)\n');

  console.log('\n──────── Summary ────────');
  console.log(`total files:      ${summary.totalFiles}`);
  console.log(`r2 files:         ${summary.r2Files}`);
  console.log(`local files:      ${summary.localFiles}`);
  console.log(`suspicious files: ${summary.suspiciousFiles}`);
  console.log(`broken urls:      ${summary.brokenUrls === null ? 'not checked (pass --check-urls)' : summary.brokenUrls}`);
  console.log('─────────────────────────\n');
}

main().catch((err) => {
  console.error('audit-media failed:', err);
  process.exit(1);
});
