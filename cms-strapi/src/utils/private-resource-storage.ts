import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { open } from 'node:fs/promises';
import { extname } from 'node:path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export const MAX_PRIVATE_UPLOAD_BYTES = 25 * 1024 * 1024;
const FILE_TYPES: Record<string, { signature: Buffer; contentType: string }> = {
  '.pdf': { signature: Buffer.from('%PDF-'), contentType: 'application/pdf' },
  '.docx': { signature: Buffer.from('504b0304', 'hex'), contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  '.xlsx': { signature: Buffer.from('504b0304', 'hex'), contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  '.pptx': { signature: Buffer.from('504b0304', 'hex'), contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
  '.zip': { signature: Buffer.from('504b0304', 'hex'), contentType: 'application/zip' },
};

export type PrivateUpload = { filepath: string; originalFilename: string | null; size: number };

export async function inspectPrivateUpload(file: PrivateUpload) {
  const extension = extname(file.originalFilename ?? '').toLowerCase();
  const format = FILE_TYPES[extension];
  if (!format || !Number.isSafeInteger(file.size) || file.size < 1 || file.size > MAX_PRIVATE_UPLOAD_BYTES) {
    return null;
  }
  const handle = await open(file.filepath, 'r');
  try {
    const prefix = Buffer.alloc(format.signature.length);
    const { bytesRead } = await handle.read(prefix, 0, prefix.length, 0);
    return bytesRead === prefix.length && prefix.equals(format.signature)
      ? { extension, contentType: format.contentType }
      : null;
  } finally {
    await handle.close();
  }
}

export async function putPrivateResource(
  file: PrivateUpload,
  format: NonNullable<Awaited<ReturnType<typeof inspectPrivateUpload>>>,
  documentId: string,
  locale: string,
) {
  const bucket = process.env.GATED_RESOURCE_BUCKET;
  const accessKeyId = process.env.GATED_RESOURCE_ACCESS_KEY;
  const secretAccessKey = process.env.GATED_RESOURCE_SECRET_KEY;
  if (!bucket || bucket === process.env.CF_BUCKET || !accessKeyId || !secretAccessKey) {
    throw new Error('Private resource storage is not configured.');
  }
  const key = `documents/${documentId}/${locale}/${randomUUID()}${format.extension}`;
  const storage = new S3Client({
    endpoint: process.env.GATED_RESOURCE_ENDPOINT || undefined,
    region: process.env.GATED_RESOURCE_REGION || 'auto',
    forcePathStyle: true,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    credentials: { accessKeyId, secretAccessKey },
  });
  try {
    await storage.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: createReadStream(file.filepath),
      ContentLength: file.size,
      ContentType: format.contentType,
      ContentDisposition: 'attachment',
      CacheControl: 'private, no-store',
    }), { abortSignal: AbortSignal.timeout(60_000) });
    return key;
  } finally {
    storage.destroy();
  }
}
