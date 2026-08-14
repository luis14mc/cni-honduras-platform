import type { Core } from '@strapi/strapi';
import { bootstrapStrapi } from './bootstrap';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.server.routes([
      {
        method: 'GET',
        path: '/api/health',
        handler: async (ctx) => {
          try {
            await strapi.db.connection.raw('select 1');
            ctx.body = {
              status: 'ok',
              database: 'connected',
              service: 'cms-strapi',
            };
          } catch (error) {
            strapi.log.error('health: database check failed', error);
            ctx.status = 503;
            ctx.body = {
              status: 'error',
              database: 'disconnected',
              service: 'cms-strapi',
            };
          }
        },
        config: {
          auth: false,
        },
      },
    ]);
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await bootstrapStrapi({ strapi });
  },
};
