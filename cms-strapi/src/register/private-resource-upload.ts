import type { Core } from '@strapi/strapi';
import { inspectPrivateUpload, putPrivateResource, type PrivateUpload } from '../utils/private-resource-storage';

const model = 'api::document.document';

export function registerPrivateResourceUpload(strapi: Core.Strapi) {
  strapi.customFields.register({ name: 'private-resource-file', type: 'string' });
  strapi.server.routes({
    type: 'admin',
    routes: [{
      method: 'POST',
      info: { type: 'admin' },
      path: '/content-manager/cni-private-upload/:documentId',
      config: { policies: ['admin::isAuthenticatedAdmin'] },
      handler: async (ctx) => {
        const { documentId } = ctx.params;
        const { locale } = ctx.query;
        if (!/^[a-z0-9]{1,64}$/.test(documentId ?? '') || (locale !== 'es' && locale !== 'en')) {
          return ctx.badRequest('Invalid document or locale.');
        }

        const checker = strapi.plugin('content-manager').service('permission-checker')
          .create({ userAbility: ctx.state.userAbility, model });
        if (checker.cannot.update()) return ctx.forbidden();
        const draft = await strapi.documents(model).findOne({ documentId, locale, status: 'draft' });
        if (!draft) return ctx.notFound();
        if (checker.cannot.update(draft, 'gated_object_key')) return ctx.forbidden();
        if (draft.access !== 'gated') return ctx.badRequest('Save the draft with gated access first.');

        const file = ctx.request.files?.file as PrivateUpload | PrivateUpload[] | undefined;
        if (!file || Array.isArray(file)) return ctx.badRequest('Select one file.');
        try {
          const format = await inspectPrivateUpload(file);
          if (!format) return ctx.badRequest('Unsupported file or file exceeds 25 MB.');
          const key = await putPrivateResource(file, format, documentId, locale);
          ctx.set('Cache-Control', 'private, no-store');
          ctx.body = { key };
        } catch {
          strapi.log.error('private-resource-upload: bucket write failed');
          ctx.status = 503;
          ctx.body = { error: { message: 'Private storage is temporarily unavailable.' } };
        }
      },
    }],
  });
}
