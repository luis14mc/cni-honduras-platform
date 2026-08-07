import { cmsDelete, cmsGet, cmsPatch, cmsPost } from "@/src/lib/cms/api";
import type { BannerItem, ListParams, PaginatedResponse } from "@/src/lib/cms/editorial/types";
import { buildListQuery } from "@/src/lib/cms/editorial/types";

export type BannerWritePayload = Partial<
  Pick<
    BannerItem,
    | "placement"
    | "title"
    | "title_es"
    | "title_en"
    | "body"
    | "body_es"
    | "body_en"
    | "cta_label"
    | "cta_label_es"
    | "cta_label_en"
    | "starts_at"
    | "ends_at"
    | "priority"
    | "link_url"
    | "link_external"
    | "dismissible"
    | "background_color"
    | "text_color"
    | "image"
    | "mobile_image"
    | "status"
  >
>;

export async function listBanners(
  params: ListParams = {},
): Promise<PaginatedResponse<BannerItem>> {
  return cmsGet<PaginatedResponse<BannerItem>>(`/banners/${buildListQuery(params)}`);
}

export async function getBanner(id: number): Promise<BannerItem> {
  return cmsGet<BannerItem>(`/banners/${id}/`);
}

export async function createBanner(payload: BannerWritePayload): Promise<BannerItem> {
  return cmsPost<BannerItem>("/banners/", { status: "draft", ...payload });
}

export async function updateBanner(id: number, payload: BannerWritePayload): Promise<BannerItem> {
  return cmsPatch<BannerItem>(`/banners/${id}/`, payload);
}

export async function deleteBanner(id: number): Promise<void> {
  return cmsDelete(`/banners/${id}/`);
}

export async function publishBanner(id: number): Promise<BannerItem> {
  return cmsPost<BannerItem>(`/banners/${id}/publish/`, {});
}

export async function archiveBanner(id: number): Promise<BannerItem> {
  return cmsPost<BannerItem>(`/banners/${id}/archive/`, {});
}

export async function unpublishBanner(id: number): Promise<BannerItem> {
  return cmsPost<BannerItem>(`/banners/${id}/unpublish/`, {});
}

export interface BannerReorderItem {
  id: number;
  priority: number;
}

export async function reorderBanners(
  items: BannerReorderItem[],
): Promise<PaginatedResponse<BannerItem>> {
  return cmsPost<PaginatedResponse<BannerItem>>("/banners/reorder/", { items });
}
