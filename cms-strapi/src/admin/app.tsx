import type { ComponentType } from 'react';
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
  register(app: StrapiApp) {
    app.customFields.register({
      name: 'private-resource-file',
      type: 'string',
      intlLabel: { id: 'cni.private-resource.label', defaultMessage: 'Private resource file' },
      intlDescription: { id: 'cni.private-resource.description', defaultMessage: 'Upload a document to private storage.' },
      components: {
        Input: async () => {
          const { default: Input } = await import('./PrivateResourceInput');
          return { default: Input as ComponentType };
        },
      },
    });
  },
};
