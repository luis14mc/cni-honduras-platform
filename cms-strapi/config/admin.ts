import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => {
  const publicUrl = env('STRAPI_PUBLIC_URL', '').replace(/\/+$/, '');

  return {
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
