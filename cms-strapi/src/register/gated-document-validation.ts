import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';

export function registerGatedDocumentValidation(strapi: Core.Strapi) {
  strapi.documents.use(async (context, next) => {
    if (context.uid !== 'api::document.document') return next();
    const params = context.params as { status?: string };
    if (context.action !== 'publish' && params.status !== 'published') return next();
    if (!['publish', 'create', 'update'].includes(context.action)) return next();

    return strapi.db.transaction(async () => {
      const result = await next();
      if (!result || typeof result !== 'object') return result;
      const records = 'entries' in result && Array.isArray(result.entries) ? result.entries : [result];

      for (const record of records) {
        if (!('documentId' in record) || !('locale' in record)) {
          throw new errors.ValidationError('Cannot validate the published document.');
        }
        const published = await strapi.documents('api::document.document').findOne({
          documentId: record.documentId, locale: record.locale, status: 'published', populate: ['file'],
        });
        if (published?.access === 'gated' &&
            (!published.gated_object_key?.trim() || published.file || published.external_url?.trim())) {
          throw new errors.ValidationError(
            'A gated document requires a private object key and cannot have a public file or external URL.',
          );
        }
      }
      return result;
    });
  });
}
