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

/**
 * Cloudflare R2 credentials that MUST all be present to store media off-box.
 * A deployed environment (STRAPI_REQUIRE_R2=true) fails to boot unless every
 * one of these is set; a partial set is treated as a misconfiguration in every
 * environment (fail-fast) rather than silently falling back to local disk.
 */
const REQUIRED_R2_VARS = [
  'CF_ACCESS_KEY_ID',
  'CF_ACCESS_SECRET',
  'CF_ENDPOINT',
  'CF_BUCKET',
  'CF_PUBLIC_ACCESS_URL',
] as const;

type R2VarState = {
  present: string[];
  missing: string[];
  fullyConfigured: boolean;
  partiallyConfigured: boolean;
};

/** Classify the R2 variables into present/missing (empty/whitespace counts as missing). */
const inspectR2Vars = (env: Core.Config.Shared.ConfigParams['env']): R2VarState => {
  const present: string[] = [];
  const missing: string[] = [];

  for (const name of REQUIRED_R2_VARS) {
    const value = (env(name, '') ?? '').trim();
    if (value) {
      present.push(name);
    } else {
      missing.push(name);
    }
  }

  return {
    present,
    missing,
    fullyConfigured: missing.length === 0,
    partiallyConfigured: present.length > 0 && missing.length > 0,
  };
};

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
  // The decision to require R2 is driven by an explicit project signal, not by
  // NODE_ENV. NODE_ENV is only complementary context in the error/warning text.
  const requireR2 = env.bool('STRAPI_REQUIRE_R2', false);
  const nodeEnv = env('NODE_ENV', 'development');
  const r2 = inspectR2Vars(env);

  if (requireR2) {
    // Deployed environment: every R2 variable is mandatory. Never boot on local disk.
    if (!r2.fullyConfigured) {
      throw new Error(
        `STRAPI_REQUIRE_R2=true but the following Cloudflare R2 variables are missing or empty: ` +
          `${r2.missing.join(', ')}. Deployed environments (NODE_ENV=${nodeEnv}) must not store ` +
          `media on the local filesystem, which is ephemeral on Render. Set all of ` +
          `${REQUIRED_R2_VARS.join(', ')} or set STRAPI_REQUIRE_R2=false for local development.`
      );
    }
  } else if (r2.partiallyConfigured) {
    // Not required, but a half-configured R2 would silently fall back to local disk
    // and only fail at upload time. Fail fast instead.
    throw new Error(
      `Partial Cloudflare R2 configuration detected. Present: ${r2.present.join(', ')}; ` +
        `missing: ${r2.missing.join(', ')}. Provide all of ${REQUIRED_R2_VARS.join(', ')} to ` +
        `enable R2, or none of them to use local filesystem storage.`
    );
  }

  const useR2 = r2.fullyConfigured;

  if (!useR2) {
    // Only reachable when STRAPI_REQUIRE_R2 is false/unset and no R2 vars are present.
    // eslint-disable-next-line no-console
    console.warn(
      '[cms-strapi] WARNING: Strapi media storage is using local filesystem. ' +
        'This is intended only for local development.'
    );
  }

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
