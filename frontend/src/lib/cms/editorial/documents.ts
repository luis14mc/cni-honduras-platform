import { CmsApiError, CMS_API_BASE, clearInMemoryCsrfToken, cmsDelete, cmsGet, cmsPatch, cmsPost, ensureCsrfToken } from "@/src/lib/cms/api";
import { parseCmsErrorBody } from "@/src/lib/cms/errors";
import type { DocumentItem, ListParams, PaginatedResponse } from "@/src/lib/cms/editorial/types";
import { buildListQuery } from "@/src/lib/cms/editorial/types";

export type DocumentWritePayload = Partial<
  Pick<
    DocumentItem,
    | "language"
    | "resource_key"
    | "title"
    | "slug"
    | "external_url"
    | "description"
    | "category"
    | "is_featured"
    | "order"
    | "document_date"
    | "cover_image"
    | "seo_title"
    | "seo_description"
    | "status"
  >
>;

export type DocumentUploadFiles = {
  file?: File;
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
  if (files.file) {
    return uploadDocumentMultipart("POST", "/documents/", payload, files);
  }
  return cmsPost<DocumentItem>("/documents/", { status: "draft", language: "es", ...payload });
}

export async function updateDocument(
  id: number,
  payload: DocumentWritePayload,
  files: DocumentUploadFiles = {},
): Promise<DocumentItem> {
  if (files.file) {
    return uploadDocumentMultipart("PATCH", `/documents/${id}/`, payload, files);
  }
  return cmsPatch<DocumentItem>(`/documents/${id}/`, payload);
}

export async function createEnglishDocumentVersion(id: number): Promise<DocumentItem> {
  return cmsPost<DocumentItem>(`/documents/${id}/create-english-version/`, {});
}

async function uploadDocumentMultipart(
  method: "POST" | "PATCH",
  path: string,
  payload: DocumentWritePayload,
  files: DocumentUploadFiles,
): Promise<DocumentItem> {
  const csrf = await ensureCsrfToken();
  const form = new FormData();
  if (files.file) form.append("file", files.file);
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;
    form.append(key, typeof value === "boolean" || typeof value === "number" ? String(value) : String(value));
  }
  const response = await fetch(`${CMS_API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: { "X-CSRFToken": csrf },
    body: form,
  });
  if (!response.ok) {
    if (response.status === 403) clearInMemoryCsrfToken();
    const body = await response.json().catch(() => ({}));
    const parsed = parseCmsErrorBody(body, response.status);
    throw new CmsApiError(parsed.message, response.status, parsed.fieldErrors);
  }
  return response.json();
}

export async function deleteDocument(id: number): Promise<void> {
  return cmsDelete(`/documents/${id}/`);
}

export async function publishDocument(id: number): Promise<DocumentItem> {
  return cmsPost<DocumentItem>(`/documents/${id}/publish/`, {});
}

export async function unpublishDocument(id: number): Promise<DocumentItem> {
  return cmsPost<DocumentItem>(`/documents/${id}/unpublish/`, {});
}
