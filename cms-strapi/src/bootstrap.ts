import type { Core } from '@strapi/strapi';

const REQUIRED_LOCALES = [
  { code: 'es', name: 'Spanish (es)' },
  { code: 'en', name: 'English (en)' },
] as const;

const PUBLIC_READ_ACTIONS = [
  'api::news.news.find',
  'api::news.news.findOne',
  'api::document.document.find',
  'api::document.document.findOne',
  'api::success-story.success-story.find',
  'api::success-story.success-story.findOne',
  'api::investment-opportunity.investment-opportunity.find',
  'api::investment-opportunity.investment-opportunity.findOne',
] as const;

async function ensureLocales(strapi: Core.Strapi) {
  const locales = strapi.plugin('i18n').service('locales');

  for (const locale of REQUIRED_LOCALES) {
    const existing = await locales.findByCode(locale.code);
    if (!existing) {
      await locales.create(locale);
      strapi.log.info(`i18n: created locale ${locale.code}`);
    }
  }

  const currentDefault = await locales.getDefaultLocale();
  if (currentDefault !== 'es') {
    await locales.setDefaultLocale({ code: 'es' });
    strapi.log.info('i18n: default locale set to es');
  }
}

async function ensurePublicReadPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
    populate: ['permissions'],
  });

  if (!publicRole) {
    strapi.log.warn('users-permissions: public role not found; skip REST grants');
    return;
  }

  const existing = new Set(
    (publicRole.permissions ?? []).map((permission: { action: string }) => permission.action)
  );

  for (const action of PUBLIC_READ_ACTIONS) {
    if (existing.has(action)) {
      continue;
    }
    await strapi.db.query('plugin::users-permissions.permission').create({
      data: {
        action,
        role: publicRole.id,
      },
    });
    strapi.log.info(`users-permissions: granted public ${action}`);
  }

  const editorialUids = [
    'api::news.news',
    'api::document.document',
    'api::success-story.success-story',
    'api::investment-opportunity.investment-opportunity',
  ];
  const writeSuffixes = new Set(['create', 'update', 'delete']);

  for (const permission of publicRole.permissions ?? []) {
    const parts = String(permission.action).split('.');
    const verb = parts[parts.length - 1];
    const uid = parts.slice(0, -1).join('.');
    if (!editorialUids.includes(uid) || !writeSuffixes.has(verb)) {
      continue;
    }
    await strapi.db.query('plugin::users-permissions.permission').delete({
      where: { id: permission.id },
    });
    strapi.log.warn(`users-permissions: removed public write ${permission.action}`);
  }
}

export async function bootstrapStrapi({ strapi }: { strapi: Core.Strapi }) {
  await ensureLocales(strapi);
  await ensurePublicReadPermissions(strapi);
}
