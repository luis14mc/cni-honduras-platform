#!/usr/bin/env node
/**
 * Unit + optional integration tests for News.cover image-only validation.
 *
 * Usage:
 *   node scripts/test-news-cover-media.mjs            # unit tests only
 *   node scripts/test-news-cover-media.mjs --integration  # + live Strapi (port 1337)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distModule = join(root, 'dist/src/utils/media-validation.js');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function loadValidationModule() {
  if (!existsSync(distModule)) {
    throw new Error(
      `Missing ${distModule}. Run "npm run build" before test:news-cover-media.`
    );
  }
  return import(distModule);
}

function runUnitTests({ isImageMime, extractMediaId, NEWS_COVER_ERROR }) {
  assert(isImageMime('image/jpeg'), 'jpeg must pass');
  assert(isImageMime('image/png'), 'png must pass');
  assert(isImageMime('image/webp'), 'webp must pass');
  assert(isImageMime('IMAGE/GIF'), 'case-insensitive image/* must pass');
  assert(!isImageMime('application/pdf'), 'pdf must fail');
  assert(!isImageMime('video/mp4'), 'video must fail');
  assert(!isImageMime('audio/mpeg'), 'audio must fail');
  assert(!isImageMime(''), 'empty mime must fail');
  assert(!isImageMime(null), 'null mime must fail');

  assert(extractMediaId(undefined) === undefined, 'undefined → unchanged');
  assert(extractMediaId(null) === null, 'null → clear');
  assert(extractMediaId(42) === 42, 'numeric id');
  assert(extractMediaId('7') === 7, 'string id');
  assert(extractMediaId({ id: 3 }) === 3, 'object id');
  assert(extractMediaId({ connect: 5 }) === 5, 'connect id');
  assert(extractMediaId({ connect: { id: 8 } }) === 8, 'connect object id');
  assert(extractMediaId({ disconnect: true }) === null, 'disconnect → clear');
  assert(extractMediaId({ set: null }) === null, 'set null → clear');

  assert(NEWS_COVER_ERROR === 'News cover must be an image.', 'error message constant');
}

async function jsonRequest(url, { method = 'GET', headers = {}, body } = {}) {
  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: response.status, data };
}

async function multipartUpload(baseUrl, jwt, filePath, fileName, mimeType) {
  const form = new FormData();
  const buffer = readFileSync(filePath);
  form.append('files', new Blob([buffer], { type: mimeType }), fileName);

  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
    body: form,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Upload failed (${response.status}): ${JSON.stringify(data)}`);
  }
  return data[0];
}

async function ensureAdmin(baseUrl) {
  const login = await jsonRequest(`${baseUrl}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email: 'cover-test@test.local', password: 'CoverTest123!' },
  });

  if (login.status === 200 && login.data?.data?.token) {
    return login.data.data.token;
  }

  const register = await jsonRequest(`${baseUrl}/admin/register-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      firstname: 'Cover',
      lastname: 'Test',
      email: 'cover-test@test.local',
      password: 'CoverTest123!',
    },
  });

  if (register.status !== 200) {
    throw new Error(`Admin bootstrap failed: ${JSON.stringify(register.data)}`);
  }

  return register.data.data.token;
}

async function createNewsDraft(baseUrl, jwt, payload) {
  return jsonRequest(
    `${baseUrl}/content-manager/collection-types/api::news-item.news-item?locale=es&status=draft`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: payload,
    }
  );
}

async function updateNewsDraft(baseUrl, jwt, documentId, payload) {
  return jsonRequest(
    `${baseUrl}/content-manager/collection-types/api::news-item.news-item/${documentId}?locale=es&status=draft`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: payload,
    }
  );
}

async function deleteNews(baseUrl, jwt, documentId) {
  await jsonRequest(
    `${baseUrl}/content-manager/collection-types/api::news-item.news-item/${documentId}?locale=es`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${jwt}` },
    }
  );
}

function writeTempPdf(path) {
  writeFileSync(path, '%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');
}

async function runIntegrationTests(baseUrl, { isImageMime }) {
  const health = await jsonRequest(`${baseUrl}/api/health`);
  assert(health.status === 200, `Strapi health expected 200, got ${health.status}`);

  const jwt = await ensureAdmin(baseUrl);

  const pngPath = join(root, '../frontend/public/brand/pdi-logo.png');
  const webpPath = join(root, '../frontend/public/brand/logo-cni.webp');
  const pdfPath = '/tmp/cover-test.pdf';
  writeTempPdf(pdfPath);

  const png = await multipartUpload(baseUrl, jwt, pngPath, 'cover-test.png', 'image/png');
  const webp = await multipartUpload(baseUrl, jwt, webpPath, 'cover-test.webp', 'image/webp');
  const pdf = await multipartUpload(baseUrl, jwt, pdfPath, 'cover-test.pdf', 'application/pdf');

  assert(isImageMime(png.mime), 'uploaded png must be image/*');
  assert(isImageMime(webp.mime), 'uploaded webp must be image/*');
  assert(!isImageMime(pdf.mime), 'uploaded pdf must not be image/*');

  const created = [];
  const slugBase = `cover-validation-${Date.now()}`;

  try {
    // Test 1 — no cover
    const t1 = await createNewsDraft(baseUrl, jwt, {
      title: 'Cover test no cover',
      slug: `${slugBase}-no-cover`,
    });
    assert(t1.status === 201, `Test 1 expected 201, got ${t1.status}: ${JSON.stringify(t1.data)}`);
    created.push(t1.data.data.documentId);

    // Test 2 — JPEG/PNG (png upload)
    const t2 = await createNewsDraft(baseUrl, jwt, {
      title: 'Cover test png',
      slug: `${slugBase}-png`,
      cover: png.id,
    });
    assert(t2.status === 201, `Test 2 expected 201, got ${t2.status}: ${JSON.stringify(t2.data)}`);
    created.push(t2.data.data.documentId);

    // Test 3 — WebP
    const t3 = await createNewsDraft(baseUrl, jwt, {
      title: 'Cover test webp',
      slug: `${slugBase}-webp`,
      cover: webp.id,
    });
    assert(t3.status === 201, `Test 3 expected 201, got ${t3.status}: ${JSON.stringify(t3.data)}`);
    created.push(t3.data.data.documentId);

    // Test 4 — PDF cover on create
    const t4 = await createNewsDraft(baseUrl, jwt, {
      title: 'Cover test pdf',
      slug: `${slugBase}-pdf`,
      cover: pdf.id,
    });
    assert(t4.status === 400, `Test 4 expected 400, got ${t4.status}`);
    const t4msg = JSON.stringify(t4.data);
    assert(t4msg.includes('News cover must be an image'), `Test 4 message missing: ${t4msg}`);

    // Test 5 — update image → PDF
    const t5a = await createNewsDraft(baseUrl, jwt, {
      title: 'Cover test update',
      slug: `${slugBase}-update`,
      cover: png.id,
    });
    assert(t5a.status === 201, `Test 5 setup expected 201, got ${t5a.status}`);
    const updateDocId = t5a.data.data.documentId;
    created.push(updateDocId);

    const t5b = await updateNewsDraft(baseUrl, jwt, updateDocId, { cover: pdf.id });
    assert(t5b.status === 400, `Test 5 expected 400, got ${t5b.status}`);
    const t5msg = JSON.stringify(t5b.data);
    assert(t5msg.includes('News cover must be an image'), `Test 5 message missing: ${t5msg}`);

    // Test 6 — remove cover
    const t6 = await updateNewsDraft(baseUrl, jwt, updateDocId, { cover: null });
    assert(t6.status === 200, `Test 6 expected 200, got ${t6.status}: ${JSON.stringify(t6.data)}`);
    assert(t6.data?.data?.cover == null, 'Test 6 cover should be null');
  } finally {
    for (const documentId of created) {
      try {
        await deleteNews(baseUrl, jwt, documentId);
      } catch {
        // best-effort cleanup
      }
    }
  }
}

async function main() {
  const runIntegration = process.argv.includes('--integration');
  const { isImageMime, extractMediaId, NEWS_COVER_ERROR } = await loadValidationModule();

  runUnitTests({ isImageMime, extractMediaId, NEWS_COVER_ERROR });
  console.log('News cover media unit tests passed.');

  if (runIntegration) {
    const baseUrl = (process.env.STRAPI_TEST_URL ?? 'http://127.0.0.1:1337').replace(/\/+$/, '');
    await runIntegrationTests(baseUrl, { isImageMime });
    console.log(`News cover media integration tests passed (${baseUrl}).`);
  } else {
    console.log('Skipped integration tests (pass --integration to run against live Strapi).');
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
