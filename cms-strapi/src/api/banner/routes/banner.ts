import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::banner.banner', {
  config: {
    find: { policies: ['global::editorial-read'] },
    findOne: { policies: ['global::editorial-read'] },
  },
});
