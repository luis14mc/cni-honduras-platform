import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::resource-category.resource-category', {
  config: {
    find: { policies: ['global::editorial-read'] },
    findOne: { policies: ['global::editorial-read'] },
  },
});
