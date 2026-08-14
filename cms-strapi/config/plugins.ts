import type { Core } from '@strapi/strapi';

const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedExecutableTypes = [
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const r2UploadConfig = (env: Core.Config.Shared.ConfigParams['env']) => ({
  provider: 'strapi-provider-cloudflare-r2-aws',
  providerOptions: {
    credentials: {
      accessKeyId: env('CF_ACCESS_KEY_ID'),
      secretAccessKey: env('CF_ACCESS_SECRET'),
    },
    endpoint: env('CF_ENDPOINT'),
    params: {
      Bucket: env('CF_BUCKET'),
    },
    cloudflarePublicAccessUrl: env('CF_PUBLIC_ACCESS_URL'),
    pool: false,
  },
  actionOptions: {
    upload: {},
    uploadStream: {},
    delete: {},
  },
});

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  const useR2 = Boolean(env('CF_BUCKET'));

  return {
    i18n: {
      enabled: true,
    },
    'users-permissions': {
      config: {
        jwtManagement: 'refresh',
        sessions: {
          httpOnly: true,
        },
      },
    },
    upload: {
      config: {
        security: {
          allowedTypes: allowedMediaTypes,
          deniedTypes: deniedExecutableTypes,
        },
        ...(useR2 ? r2UploadConfig(env) : {}),
      },
    },
  };
};

export default config;
