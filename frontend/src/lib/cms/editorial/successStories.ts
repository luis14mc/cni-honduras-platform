import { cmsDelete, cmsGet, cmsPatch, cmsPost } from "@/src/lib/cms/api";
import type { ListParams, PaginatedResponse, SuccessStoryItem } from "@/src/lib/cms/editorial/types";
import { buildListQuery } from "@/src/lib/cms/editorial/types";

export type SuccessStoryWritePayload = Partial<
  Pick<
    SuccessStoryItem,
    | "title"
    | "title_es"
    | "title_en"
    | "slug"
    | "company_name"
    | "sector"
    | "summary"
    | "summary_es"
    | "summary_en"
    | "content"
    | "content_es"
    | "content_en"
    | "logo"
    | "featured_image"
    | "person_photo"
    | "person_name"
    | "person_role"
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

/** Never force draft on published stories — publish is a separate action. */
export function successStoryFormToPayload(form: {
  title_es: string;
  title_en: string;
  slug: string;
  company_name: string;
  sector: number | null;
  summary_es: string;
  summary_en: string;
  content_es: string;
  content_en: string;
  country_origin: string;
  investment_amount: string;
  jobs_generated: number | null;
  testimonial_quote_es: string;
  testimonial_quote_en: string;
  testimonial_author_es: string;
  testimonial_author_en: string;
  is_featured: boolean;
  logo: number | null;
  featured_image: number | null;
  person_photo: number | null;
  person_name: string;
  person_role: string;
  status: SuccessStoryItem["status"];
}): SuccessStoryWritePayload {
  const payload: SuccessStoryWritePayload = {
    title_es: form.title_es,
    title_en: form.title_en,
    title: form.title_es || form.title_en,
    slug: form.slug || undefined,
    company_name: form.company_name,
    sector: form.sector,
    summary_es: form.summary_es,
    summary_en: form.summary_en,
    content_es: form.content_es,
    content_en: form.content_en,
    country_origin: form.country_origin,
    investment_amount: form.investment_amount,
    jobs_generated: form.jobs_generated,
    testimonial_quote_es: form.testimonial_quote_es,
    testimonial_quote_en: form.testimonial_quote_en,
    testimonial_author_es: form.testimonial_author_es,
    testimonial_author_en: form.testimonial_author_en,
    is_featured: form.is_featured,
    logo: form.logo,
    featured_image: form.featured_image,
    person_photo: form.person_photo,
    person_name: form.person_name,
    person_role: form.person_role,
  };
  if (form.status !== "published") {
    payload.status = "draft";
  }
  return payload;
}
