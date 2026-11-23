import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::document.document', ({ strapi }) => ({
  async gatedFile(ctx) {
    if (ctx.state.auth?.strategy?.name !== 'content-api-token') {
      return ctx.forbidden();
    }
    const { documentId } = ctx.params;
    const { locale } = ctx.query;
    if (typeof documentId !== 'string' || !/^[a-z0-9]{1,64}$/.test(documentId) ||
        (locale !== 'es' && locale !== 'en')) {
      return ctx.badRequest('Invalid resource or locale.');
    }
    const resource = await strapi.documents('api::document.document').findOne({
      documentId, locale, status: 'published',
    });
    if (!resource || resource.access !== 'gated' || !resource.gated_object_key) {
      return ctx.notFound();
    }
    ctx.set('Cache-Control', 'private, no-store');
    ctx.body = { title: resource.title, objectKey: resource.gated_object_key };
  },
}));
