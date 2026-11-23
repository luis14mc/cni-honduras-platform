import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::success-story.success-story', {
  config: {
    find: { policies: ['global::editorial-read'] },
    findOne: { policies: ['global::editorial-read'] },
  },
});
