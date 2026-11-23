import { createHmac } from 'node:crypto';
import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => {
  const publicUrl = env('STRAPI_PUBLIC_URL', '').replace(/\/+$/, '');

  const previewOrigin = env('STRAPI_PREVIEW_ORIGIN', '').replace(/\/+$/, '');
  const previewSecret = env('STRAPI_PREVIEW_SECRET', '').trim();
  return {
    preview: {
      enabled: Boolean(previewOrigin && previewSecret),
      config: {
        allowedOrigins: [previewOrigin],
        async handler(uid, { documentId, locale, status }) {
          if (uid !== 'api::page.page' && uid !== 'api::banner.banner' && uid !== 'api::news-item.news-item') return null;
          if (locale !== 'es' && locale !== 'en') return null;
          const collection = uid === 'api::page.page' ? 'pages' : uid === 'api::banner.banner' ? 'banners' : 'news';
          const version = status === 'published' ? 'published' : 'draft';
          const instance = (globalThis as typeof globalThis & { strapi: Core.Strapi }).strapi;
          const state = instance.requestContext.get()?.state;
          const roles = state?.user?.roles as Array<{ code: string }> | undefined;
          if (!state?.userAbility || !roles?.some(({ code }) =>
            ['cni-editor', 'cni-publisher', 'strapi-super-admin'].includes(code),
          )) return null;

          const checker = instance.plugin('content-manager').service('permission-checker')
            .create({ userAbility: state.userAbility, model: uid });
          if (checker.cannot.read()) return null;
          const record = await instance.documents(uid).findOne({ documentId, locale, status: version });
          if (!record || checker.cannot.read(record)) return null;

          const expires = String(Date.now() + 5 * 60 * 1000);
          const signature = createHmac('sha256', previewSecret)
            .update(`${collection}:${documentId}:${locale}:${version}:${expires}`)
            .digest('hex');
          const query = new URLSearchParams({ collection, documentId, status: version, expires, signature });
          return `${previewOrigin}${locale === 'en' ? '/en' : ''}/editorial-preview?${query}`;
        },
      },
    },
    url: env('ADMIN_PATH', '/admin'),
    auth: {
      secret: env('ADMIN_JWT_SECRET')!,
      ...(publicUrl
        ? {
            cookie: {
              path: '/',
              sameSite: 'lax' as const,
              secure: publicUrl.startsWith('https://'),
            },
          }
        : {}),
    },
    apiToken: {
      salt: env('API_TOKEN_SALT')!,
    },
    transfer: {
      token: {
        salt: env('TRANSFER_TOKEN_SALT')!,
      },
    },
    secrets: {
      encryptionKey: env('ENCRYPTION_KEY')!,
    },
    flags: {
      nps: env.bool('FLAG_NPS', true),
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
      docLinks: env.bool('FLAG_DOC_LINKS', true),
    },
  };
};

export default config;
