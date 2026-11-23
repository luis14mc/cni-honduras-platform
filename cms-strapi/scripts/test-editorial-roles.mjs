import assert from 'node:assert/strict';
import { test } from 'node:test';

import { bootstrapStrapi } from '../dist/src/bootstrap.js';

const collections = [
  'news-item', 'document', 'success-story', 'investment-opportunity', 'banner', 'page', 'resource-category',
].map((name) => `api::${name}.${name}`);
const actions = ['create', 'read', 'update', 'delete', 'publish'];

test('editorial role bootstrap assigns exact permissions in ES and EN on every start', async () => {
  const assignments = new Map();
  const logs = [];
  const services = {
    'admin::role': {
      findOne: async ({ code }) => ({ id: code }),
      assignPermissions: async (id, permissions) => assignments.set(id, permissions),
    },
    'admin::permission': {
      actionProvider: {
        values: () => actions.map((action) => ({
          actionId: `plugin::content-manager.explorer.${action}`,
          subjects: [...collections, 'api::unrelated.unrelated'],
        })),
      },
    },
    'admin::content-type': {
      getPermissionsWithNestedFields: (entries) => entries.flatMap(({ actionId, subjects }) =>
        subjects.map((subject) => ({ action: actionId, subject, properties: { fields: ['title'] } })),
      ),
    },
  };
  const strapi = {
    service: (name) => services[name],
    plugin: (name) => ({
      service: () => name === 'i18n'
        ? { findByCode: async () => true, getDefaultLocale: async () => 'es' }
        : { find: async () => [] },
    }),
    log: {
      info: (message) => logs.push(message),
      warn: () => {},
      error: (message) => assert.fail(message),
    },
  };

  for (let start = 0; start < 2; start++) {
    // On restart the bootstrap must replace permissions edited in the admin panel.
    assignments.set('cni-editor', [{ action: 'plugin::content-manager.explorer.publish' }]);
    await bootstrapStrapi({ strapi });

    for (const [role, allowed] of [
      ['cni-editor', ['create', 'read', 'update']],
      ['cni-publisher', actions],
    ]) {
      const contentPermissions = assignments.get(role).filter(({ subject }) => subject);
      const expected = allowed.flatMap((action) => collections.map((subject) => ({
        action: `plugin::content-manager.explorer.${action}`,
        subject,
        properties: { fields: ['title'], locales: ['es', 'en'] },
      })));
      assert.deepEqual(contentPermissions, expected);
    }
  }

  for (const role of ['cni-editor', 'cni-publisher']) {
    assert.equal(logs.filter((message) => message.includes(role)).length, 2);
  }
});
