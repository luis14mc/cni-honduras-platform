import { cmsDelete, cmsGet, cmsPatch, cmsPost } from "@/src/lib/cms/api";
import type { ListParams, NewsItem, PaginatedResponse, PublishStatus } from "@/src/lib/cms/editorial/types";
import { buildListQuery } from "@/src/lib/cms/editorial/types";

export type NewsWritePayload = Partial<
  Pick<
    NewsItem,
    | "title"
    | "title_es"
    | "title_en"
    | "slug"
    | "summary"
    | "summary_es"
    | "summary_en"
    | "content"
    | "content_es"
    | "content_en"
    | "content_blocks_es"
    | "content_blocks_en"
    | "featured_image"
    | "category"
    | "author_name"
    | "source"
    | "external_url"
    | "is_featured"
    | "seo_title"
    | "seo_title_es"
    | "seo_title_en"
    | "seo_description"
    | "seo_description_es"
    | "seo_description_en"
    | "status"
  >
>;

export async function listNews(params: ListParams = {}): Promise<PaginatedResponse<NewsItem>> {
  return cmsGet<PaginatedResponse<NewsItem>>(`/news/${buildListQuery(params)}`);
}

export async function getNews(id: number): Promise<NewsItem> {
  return cmsGet<NewsItem>(`/news/${id}/`);
}

export async function createNews(payload: NewsWritePayload): Promise<NewsItem> {
  return cmsPost<NewsItem>("/news/", { status: "draft" as PublishStatus, ...payload });
}

export async function updateNews(id: number, payload: NewsWritePayload): Promise<NewsItem> {
  return cmsPatch<NewsItem>(`/news/${id}/`, payload);
}

export async function deleteNews(id: number): Promise<void> {
  return cmsDelete(`/news/${id}/`);
}

export async function publishNews(id: number, publishedAt?: string): Promise<NewsItem> {
  return cmsPost<NewsItem>(`/news/${id}/publish/`, publishedAt ? { published_at: publishedAt } : {});
}

export async function archiveNews(id: number): Promise<NewsItem> {
  return cmsPost<NewsItem>(`/news/${id}/archive/`, {});
}

export async function unpublishNews(id: number): Promise<NewsItem> {
  return cmsPost<NewsItem>(`/news/${id}/unpublish/`, {});
}
