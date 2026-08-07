import { cmsDelete, cmsGet, cmsPatch, cmsPost } from "@/src/lib/cms/api";
import type { ListParams, PaginatedResponse, SuccessStoryItem } from "@/src/lib/cms/editorial/types";
import { buildListQuery } from "@/src/lib/cms/editorial/types";

export type SuccessStoryWritePayload = Partial<
  Pick<
    SuccessStoryItem,
    | "title"
    | "title_es"
    | "title_en"
    | "company_name"
    | "sector"
    | "summary"
    | "summary_es"
    | "summary_en"
    | "content"
    | "content_es"
    | "content_en"
    | "logo"
    | "country_origin"
    | "investment_amount"
    | "jobs_generated"
    | "testimonial_quote"
    | "testimonial_quote_es"
    | "testimonial_quote_en"
    | "testimonial_author"
    | "testimonial_author_es"
    | "testimonial_author_en"
    | "is_featured"
    | "order"
    | "status"
  >
>;

export async function listSuccessStories(
  params: ListParams = {},
): Promise<PaginatedResponse<SuccessStoryItem>> {
  return cmsGet<PaginatedResponse<SuccessStoryItem>>(
    `/success-stories/${buildListQuery(params)}`,
  );
}

export async function getSuccessStory(id: number): Promise<SuccessStoryItem> {
  return cmsGet<SuccessStoryItem>(`/success-stories/${id}/`);
}

export async function createSuccessStory(
  payload: SuccessStoryWritePayload,
): Promise<SuccessStoryItem> {
  return cmsPost<SuccessStoryItem>("/success-stories/", { status: "draft", ...payload });
}

export async function updateSuccessStory(
  id: number,
  payload: SuccessStoryWritePayload,
): Promise<SuccessStoryItem> {
  return cmsPatch<SuccessStoryItem>(`/success-stories/${id}/`, payload);
}

export async function deleteSuccessStory(id: number): Promise<void> {
  return cmsDelete(`/success-stories/${id}/`);
}

export async function publishSuccessStory(id: number): Promise<SuccessStoryItem> {
  return cmsPost<SuccessStoryItem>(`/success-stories/${id}/publish/`, {});
}

export async function archiveSuccessStory(id: number): Promise<SuccessStoryItem> {
  return cmsPost<SuccessStoryItem>(`/success-stories/${id}/archive/`, {});
}

export async function unpublishSuccessStory(id: number): Promise<SuccessStoryItem> {
  return cmsPost<SuccessStoryItem>(`/success-stories/${id}/unpublish/`, {});
}
