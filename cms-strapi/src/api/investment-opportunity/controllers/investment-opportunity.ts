import { factories } from '@strapi/strapi';

const PRIVATE_FIELDS = ['internal_notes'] as const;

function omitPrivateFields<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => omitPrivateFields(item)) as T;
  }
  if (value && typeof value === 'object') {
    const clone: Record<string, unknown> = { ...(value as Record<string, unknown>) };
    for (const field of PRIVATE_FIELDS) {
      delete clone[field];
    }
    if (clone.attributes && typeof clone.attributes === 'object') {
      clone.attributes = omitPrivateFields(clone.attributes);
    }
    return clone as T;
  }
  return value;
}

export default factories.createCoreController(
  'api::investment-opportunity.investment-opportunity',
  () => ({
    async find(ctx) {
      const response = await super.find(ctx);
      return {
        ...response,
        data: omitPrivateFields(response.data),
      };
    },

    async findOne(ctx) {
      const response = await super.findOne(ctx);
      if (!response) {
        return response;
      }
      return {
        ...response,
        data: omitPrivateFields(response.data),
      };
    },
  })
);
