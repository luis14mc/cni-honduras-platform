import type { Core } from '@strapi/strapi';
import { validateNewsCoverAssignment } from '../utils/media-validation';

const NEWS_UID = 'api::news-item.news-item';
const WRITE_ACTIONS = new Set(['create', 'update']);

/**
 * Strapi 5 Document Service middleware — validates News.cover MIME on write paths
 * (Content Manager API, Document Service, REST admin) before persistence.
 */
export function registerNewsCoverDocumentMiddleware(strapi: Core.Strapi): void {
  strapi.documents.use(async (context, next) => {
    if (context.uid !== NEWS_UID || !WRITE_ACTIONS.has(context.action)) {
      return next();
    }

    const params = context.params as { data?: { cover?: unknown } };
    await validateNewsCoverAssignment(strapi, params.data?.cover);

    return next();
  });
}
