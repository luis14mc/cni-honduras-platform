#!/usr/bin/env node
/**
 * Poll Strapi GET /api/health until HTTP 200 and
 * { status: "ok", database: "connected", service: "cms-strapi" }.
 * Used by GitHub Actions strapi-ci. Does not print secrets.
 */

const url = process.env.STRAPI_HEALTH_URL || 'http://127.0.0.1:1337/api/health';
const timeoutMs = Number(process.env.STRAPI_HEALTH_TIMEOUT_MS || 180000);
const intervalMs = Number(process.env.STRAPI_HEALTH_INTERVAL_MS || 3000);
const startedAt = Date.now();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function check() {
  const response = await fetch(url);
  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status}`);
  }
  const body = await response.json();
  if (
    body.status !== 'ok' ||
    body.database !== 'connected' ||
    body.service !== 'cms-strapi'
  ) {
    throw new Error('health payload mismatch');
  }
  return body;
}

async function main() {
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const body = await check();
      console.log('strapi health ok', JSON.stringify(body));
      process.exit(0);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      console.log(`waiting for strapi health (${message})`);
      await sleep(intervalMs);
    }
  }
  console.error('strapi health check timed out');
  process.exit(1);
}

main();
