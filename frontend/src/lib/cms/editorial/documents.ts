import { CmsApiError, CMS_API_BASE, clearInMemoryCsrfToken, cmsDelete, cmsGet, cmsPatch, cmsPost, ensureCsrfToken } from "@/src/lib/cms/api";
import { parseCmsErrorBody } from "@/src/lib/cms/errors";
import type { DocumentItem, ListParams, PaginatedResponse } from "@/src/lib/cms/editorial/types";
import { buildListQuery } from "@/src/lib/cms/editorial/types";

export type DocumentWritePayload = Partial<
  Pick<
    DocumentItem,
    | "title"
    | "title_es"
    | "title_en"
    | "slug"
    | "external_url_es"
    | "external_url_en"
    | "description"
    | "description_es"
    | "description_en"
    | "category"
    | "is_featured"
    | "order"
    | "document_date"
    | "cover_image_es"
    | "cover_image_en"
    | "seo_title"
    | "seo_title_es"
    | "seo_title_en"
    | "seo_description"
    | "seo_description_es"
    | "seo_description_en"
    | "status"
  >
>;

export type DocumentUploadFiles = {
  file_es?: File;
  file_en?: File;
};

export async function listDocuments(
  params: ListParams = {},
): Promise<PaginatedResponse<DocumentItem>> {
  return cmsGet<PaginatedResponse<DocumentItem>>(`/documents/${buildListQuery(params)}`);
}

export async function getDocument(id: number): Promise<DocumentItem> {
  return cmsGet<DocumentItem>(`/documents/${id}/`);
}

export async function createDocument(
  payload: DocumentWritePayload,
  files: DocumentUploadFiles = {},
): Promise<DocumentItem> {
  if (files.file_es || files.file_en) {
    return uploadDocumentMultipart("POST", "/documents/", payload, files);
  }
  return cmsPost<DocumentItem>("/documents/", { status: "draft", ...payload });
}

export async function updateDocument(
  id: number,
  payload: DocumentWritePayload,
  files: DocumentUploadFiles = {},
): Promise<DocumentItem> {
  if (files.file_es || files.file_en) {
    return uploadDocumentMultipart("PATCH", `/documents/${id}/`, payload, files);
  }
  return cmsPatch<DocumentItem>(`/documents/${id}/`, payload);
}

async function uploadDocumentMultipart(
  method: "POST" | "PATCH",
  path: string,
  payload: DocumentWritePayload,
  files: DocumentUploadFiles,
): Promise<DocumentItem> {
  const csrf = await ensureCsrfToken();
  const form = new FormData();
  if (files.file_es) form.append("file_es", files.file_es);
  if (files.file_en) form.append("file_en", files.file_en);
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null) {
      form.append(key, String(value));
    }
  }
  if (!payload.status) form.append("status", "draft");

  const response = await fetch(`${CMS_API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: { Accept: "application/json", "X-CSRFToken": csrf },
    body: form,
  });

  if (!response.ok) {
    if (response.status === 403) clearInMemoryCsrfToken();
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      // ignore
    }
    const parsed = parseCmsErrorBody(body, response.status);
    throw new CmsApiError(parsed.message, response.status, parsed.fieldErrors);
  }
  return response.json() as Promise<DocumentItem>;
}

export async function deleteDocument(id: number): Promise<void> {
  return cmsDelete(`/documents/${id}/`);
}

export async function publishDocument(id: number): Promise<DocumentItem> {
  return cmsPost<DocumentItem>(`/documents/${id}/publish/`, {});
}

export async function archiveDocument(id: number): Promise<DocumentItem> {
  return cmsPost<DocumentItem>(`/documents/${id}/archive/`, {});
}

export async function unpublishDocument(id: number): Promise<DocumentItem> {
  return cmsPost<DocumentItem>(`/documents/${id}/unpublish/`, {});
}
