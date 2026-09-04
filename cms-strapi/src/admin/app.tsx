import type { StrapiApp } from '@strapi/strapi/admin';

import newsAdminEs from './extensions/translations/es.json';

export default {
  config: {
    // Native Strapi admin locales (built-in es.json + extensions below).
    locales: ['es', 'en'],
    translations: {
      es: newsAdminEs,
    },
  },
  bootstrap(_app: StrapiApp) {},
};
