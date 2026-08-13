import { cmsDelete, cmsGet, cmsPatch, cmsUpload } from "@/src/lib/cms/api";
import { CmsApiError, MEDIA_STORAGE_ERROR_CODE, MEDIA_STORAGE_ERROR_MESSAGE } from "@/src/lib/cms/errors";
import type { ListParams, MediaAsset, PaginatedResponse } from "@/src/lib/cms/editorial/types";
import { buildListQuery } from "@/src/lib/cms/editorial/types";

export async function listMedia(
  params: ListParams = {},
): Promise<PaginatedResponse<MediaAsset>> {
  return cmsGet<PaginatedResponse<MediaAsset>>(`/media/${buildListQuery(params)}`);
}

export async function getMedia(id: number): Promise<MediaAsset> {
  return cmsGet<MediaAsset>(`/media/${id}/`);
}

export interface UploadMediaInput {
  file: File;
  title?: string;
  alt_text?: string;
  caption?: string;
}

export async function uploadMedia(input: UploadMediaInput): Promise<MediaAsset> {
  const form = new FormData();
  form.append("file", input.file);
  if (input.title) form.append("title", input.title);
  if (input.alt_text) form.append("alt_text", input.alt_text);
  if (input.caption) form.append("caption", input.caption);
  return cmsUpload<MediaAsset>("/media/", form);
}

export interface UpdateMediaInput {
  title?: string;
  alt_text?: string;
  caption?: string;
}

export async function updateMedia(id: number, input: UpdateMediaInput): Promise<MediaAsset> {
  return cmsPatch<MediaAsset>(`/media/${id}/`, input);
}

export async function deleteMedia(id: number): Promise<void> {
  return cmsDelete(`/media/${id}/`);
}

export function mediaUploadErrorMessage(error: unknown): string {
  if (error instanceof CmsApiError) {
    if (error.code === MEDIA_STORAGE_ERROR_CODE || error.status === 503) {
      return MEDIA_STORAGE_ERROR_MESSAGE;
    }
    return error.message;
  }
  return "Error al subir el archivo.";
}
