import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::investment-opportunity.investment-opportunity', {
  config: {
    find: { policies: ['global::editorial-read'] },
    findOne: { policies: ['global::editorial-read'] },
  },
});
