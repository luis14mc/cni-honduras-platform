import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::news-item.news-item', {
  config: {
    find: { policies: ['global::editorial-read'] },
    findOne: { policies: ['global::editorial-read'] },
  },
});
