import { cmsDelete, cmsGet, cmsPatch, cmsPost } from "@/src/lib/cms/api";
import type { ListParams, PageItem, PaginatedResponse, PublishStatus } from "@/src/lib/cms/editorial/types";
import { buildListQuery } from "@/src/lib/cms/editorial/types";

export type PageWritePayload = Partial<
  Pick<
    PageItem,
    | "title"
    | "title_es"
    | "title_en"
    | "slug"
    | "content"
    | "content_es"
    | "content_en"
    | "excerpt"
    | "excerpt_es"
    | "excerpt_en"
    | "featured_image"
    | "seo_title"
    | "seo_title_es"
    | "seo_title_en"
    | "seo_description"
    | "seo_description_es"
    | "seo_description_en"
    | "status"
  >
>;

export async function listPages(params: ListParams = {}): Promise<PaginatedResponse<PageItem>> {
  return cmsGet<PaginatedResponse<PageItem>>(`/pages/${buildListQuery(params)}`);
}

export async function getPage(id: number): Promise<PageItem> {
  return cmsGet<PageItem>(`/pages/${id}/`);
}

export async function createPage(payload: PageWritePayload): Promise<PageItem> {
  return cmsPost<PageItem>("/pages/", { status: "draft" as PublishStatus, ...payload });
}

export async function updatePage(id: number, payload: PageWritePayload): Promise<PageItem> {
  return cmsPatch<PageItem>(`/pages/${id}/`, payload);
}

export async function deletePage(id: number): Promise<void> {
  return cmsDelete(`/pages/${id}/`);
}

export async function publishPage(id: number): Promise<PageItem> {
  return cmsPost<PageItem>(`/pages/${id}/publish/`, {});
}

export async function archivePage(id: number): Promise<PageItem> {
  return cmsPost<PageItem>(`/pages/${id}/archive/`, {});
}

export async function unpublishPage(id: number): Promise<PageItem> {
  return cmsPost<PageItem>(`/pages/${id}/unpublish/`, {});
}
