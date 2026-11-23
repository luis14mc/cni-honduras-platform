import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const base = new URL(process.env.STRAPI_TEST_ORIGIN ?? 'http://127.0.0.1:1337');
assert(['localhost', '127.0.0.1'].includes(base.hostname), 'Run only against a local test Strapi instance.');

async function call(path, { method = 'GET', token, body, status } = {}) {
  const response = await fetch(new URL(path, base), {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json();
  if (status) assert.equal(response.status, status, path);
  else assert(response.ok, `${path}: ${response.status} ${payload.error?.message ?? ''}`);
  return payload;
}

const email = process.env.STRAPI_TEST_ADMIN_EMAIL ?? 'resource-test@example.test';
const password = process.env.STRAPI_TEST_ADMIN_PASSWORD ?? 'LocalTestOnly123!';
const { data: init } = await call('/admin/init');
const { data: admin } = await call(init.hasAdmin ? '/admin/login' : '/admin/register-admin', {
  method: 'POST',
  body: init.hasAdmin ? { email, password } : { firstname: 'Resource', lastname: 'Test', email, password },
});
const { data: scoped } = await call('/admin/api-tokens', {
  method: 'POST',
  token: admin.token,
  body: {
    name: `gated-resources-${randomUUID()}`, description: 'Local integration test', type: 'custom',
    lifespan: 604800000, permissions: ['api::document.document.gatedFile'],
  },
});
const { data: publicReader } = await call('/admin/api-tokens', {
  method: 'POST',
  token: admin.token,
  body: { name: `public-resources-${randomUUID()}`, type: 'read-only', lifespan: 604800000 },
});

const contentManager = '/content-manager/collection-types/api::document.document';
const key = 'guides/private-test.pdf';
const slug = `resource-${randomUUID()}`;
const { data: draft } = await call(`${contentManager}?locale=es`, {
  method: 'POST',
  token: admin.token,
  body: { title: 'Gated test fixture', slug, access: 'gated', gated_object_key: key },
});
const path = `/api/gated-resources/${draft.documentId}?locale=es`;
await call(path, { token: scoped.accessKey, status: 404 });
await call(`${contentManager}/${draft.documentId}/actions/publish?locale=es`, {
  method: 'POST', token: admin.token, body: {},
});

await call(path, { status: 403 });
await call(path, { token: publicReader.accessKey, status: 403 });
const privateResource = await call(path, { token: scoped.accessKey });
assert.equal(privateResource.objectKey, key);
assert.equal(privateResource.title, 'Gated test fixture');

const { data: publicResource } = await call(`/api/documents/${draft.documentId}?locale=es&populate=file`);
assert.equal(publicResource.access, 'gated');
assert(!('gated_object_key' in publicResource));
assert.equal(publicResource.file, null);

const { data: invalid } = await call(`${contentManager}?locale=es`, {
  method: 'POST',
  token: admin.token,
  body: { title: 'Invalid test fixture', slug: `${slug}-invalid`, access: 'gated',
    gated_object_key: key, external_url: 'https://example.test/public.pdf' },
});
await call(`${contentManager}/${invalid.documentId}/actions/publish?locale=es`, {
  method: 'POST', token: admin.token, body: {}, status: 400,
});
await call(`/api/documents/${invalid.documentId}?locale=es`, { status: 404 });
console.log('Scoped access, protection of the private key and rejection of public URLs passed.');
