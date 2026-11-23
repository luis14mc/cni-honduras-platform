import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::document.document', {
  config: {
    find: { policies: ['global::editorial-read'] },
    findOne: { policies: ['global::editorial-read'] },
  },
});
