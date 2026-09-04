import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';

export const NEWS_COVER_ERROR = 'News cover must be an image.';

const UPLOAD_FILE_UID = 'plugin::upload.file';

/** True when MIME is a non-empty image/* value. */
export function isImageMime(mime: string | null | undefined): boolean {
  return typeof mime === 'string' && mime.trim().toLowerCase().startsWith('image/');
}

/**
 * Normalizes a Strapi media relation write payload.
 * - `undefined` → field omitted (no change)
 * - `null` / disconnect → explicit clear
 * - number / connect → media id to assign
 */
export function extractMediaId(value: unknown): number | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  if (typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;

  if ('disconnect' in record) {
    return null;
  }

  if ('id' in record && typeof record.id === 'number' && Number.isFinite(record.id)) {
    return record.id;
  }

  if ('connect' in record) {
    return extractMediaId(record.connect);
  }

  if ('set' in record) {
    return extractMediaId(record.set);
  }

  return undefined;
}

export async function validateNewsCoverAssignment(
  strapi: Core.Strapi,
  coverValue: unknown
): Promise<void> {
  const mediaId = extractMediaId(coverValue);

  if (mediaId === undefined || mediaId === null) {
    return;
  }

  const file = (await strapi.db.query(UPLOAD_FILE_UID).findOne({
    where: { id: mediaId },
    select: ['id', 'mime'],
  })) as { id: number; mime?: string | null } | null;

  if (!file) {
    throw new errors.ValidationError('News cover media was not found.');
  }

  if (!isImageMime(file.mime)) {
    throw new errors.ValidationError(NEWS_COVER_ERROR);
  }
}
