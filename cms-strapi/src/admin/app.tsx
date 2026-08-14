import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: ['es', 'en'],
  },
  bootstrap(_app: StrapiApp) {},
};
