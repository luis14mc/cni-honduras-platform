import type { Core } from '@strapi/strapi';

const REQUIRED_LOCALES = [
  { code: 'es', name: 'Spanish (es)' },
  { code: 'en', name: 'English (en)' },
] as const;

const PUBLIC_READ_CONTROLLERS = [
  { type: 'api::news-item', controller: 'news-item' },
  { type: 'api::document', controller: 'document' },
  { type: 'api::success-story', controller: 'success-story' },
  { type: 'api::investment-opportunity', controller: 'investment-opportunity' },
] as const;

const WRITE_ACTIONS = ['create', 'update', 'delete'] as const;

type PermissionAction = { enabled: boolean; policy: string };
type RolePermissions = Record<
  string,
  { controllers?: Record<string, Record<string, PermissionAction>> }
>;

function bootstrapErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'unknown error';
}

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

function grantPublicReadOnly(permissions: RolePermissions) {
  for (const { type, controller } of PUBLIC_READ_CONTROLLERS) {
    if (!permissions[type]) {
      permissions[type] = { controllers: {} };
    }
    if (!permissions[type].controllers) {
      permissions[type].controllers = {};
    }
    const controllers = permissions[type].controllers!;
    if (!controllers[controller]) {
      controllers[controller] = {};
    }
    const actions = controllers[controller];
    actions.find = { enabled: true, policy: '' };
    actions.findOne = { enabled: true, policy: '' };
    for (const write of WRITE_ACTIONS) {
      if (actions[write]) {
        actions[write] = { enabled: false, policy: '' };
      }
    }
  }
}

/**
 * Grant Public find/findOne via the users-permissions role service.
 * Failures are logged and swallowed so an RBAC mismatch cannot take Strapi down.
 */
async function ensurePublicReadPermissions(strapi: Core.Strapi) {
  const roleService = strapi.plugin('users-permissions').service('role');
  const roles = await roleService.find();
  const publicMeta = (Array.isArray(roles) ? roles : []).find(
    (role: { type?: string }) => role.type === 'public'
  );

  if (!publicMeta?.id) {
    strapi.log.warn('users-permissions: public role not found; skip REST grants');
    return;
  }

  const publicRole = await roleService.findOne(publicMeta.id);
  const permissions = (publicRole.permissions ?? {}) as RolePermissions;
  grantPublicReadOnly(permissions);

  await roleService.updateRole(publicMeta.id, {
    name: publicRole.name,
    description: publicRole.description,
    permissions,
  });
  strapi.log.info('users-permissions: public read-only grants synced for editorial types');
}

export async function bootstrapStrapi({ strapi }: { strapi: Core.Strapi }) {
  await ensureLocales(strapi);

  try {
    await ensurePublicReadPermissions(strapi);
  } catch (error) {
    strapi.log.error(
      `users-permissions: public read grant failed (${bootstrapErrorMessage(error)}); continuing startup`
    );
  }
}
