import type { Core } from '@strapi/strapi';

const editorialRead: Core.Policy = (context) => {
  const request = context as typeof context & {
    request?: { query?: { status?: unknown } };
    state?: { auth?: { strategy?: { name?: string } } };
  };

  const status = request.request?.query?.status;
  return status === undefined || status === 'published' ||
    (status === 'draft' && request.state?.auth?.strategy?.name === 'content-api-token');
};

export default editorialRead;
