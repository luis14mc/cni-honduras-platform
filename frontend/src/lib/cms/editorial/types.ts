export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type PublishStatus = "draft" | "published" | "archived";

export type MediaType = "image" | "video" | "file";

export interface MediaAsset {
  id: number;
  title: string;
  file: string | null;
  file_url: string | null;
  alt_text: string;
  caption: string;
  media_type: MediaType;
  file_size_bytes: number | null;
  mime_type: string | null;
  created_at: string;
  uploaded_by?: number | null;
  uploaded_by_name?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface EditorialAudit {
  created_at: string;
  updated_at: string;
  created_by: number | null;
  created_by_name: string | null;
  updated_by: number | null;
  updated_by_name: string | null;
}

export interface NewsItem extends EditorialAudit {
  id: number;
  title: string;
  title_es: string;
  title_en: string;
  slug: string;
  summary: string;
  summary_es: string;
  summary_en: string;
  content: string;
  content_es: string;
  content_en: string;
  featured_image: number | null;
  featured_image_detail: MediaAsset | null;
  category: string;
  author_name: string;
  source: string;
  external_url: string;
  is_featured: boolean;
  seo_title: string;
  seo_title_es: string;
  seo_title_en: string;
  seo_description: string;
  seo_description_es: string;
  seo_description_en: string;
  status: PublishStatus;
  published_at: string | null;
}

export interface DocumentItem extends EditorialAudit {
  id: number;
  title: string;
  title_es: string;
  title_en: string;
  slug: string;
  file: string | null;
  file_url: string | null;
  external_url: string;
  description: string;
  description_es: string;
  description_en: string;
  category: string;
  is_featured: boolean;
  order: number;
  document_date: string | null;
  cover_image: number | null;
  cover_image_detail: MediaAsset | null;
  file_type: string;
  file_size_bytes: number | null;
  seo_title: string;
  seo_title_es: string;
  seo_title_en: string;
  seo_description: string;
  seo_description_es: string;
  seo_description_en: string;
  status: PublishStatus;
  published_at: string | null;
}

export interface BannerItem extends EditorialAudit {
  id: number;
  placement: string;
  title: string;
  title_es: string;
  title_en: string;
  body: string;
  body_es: string;
  body_en: string;
  cta_label: string;
  cta_label_es: string;
  cta_label_en: string;
  starts_at: string | null;
  ends_at: string | null;
  priority: number;
  link_url: string;
  link_external: boolean;
  dismissible: boolean;
  background_color: string;
  text_color: string;
  image: number | null;
  image_detail: MediaAsset | null;
  mobile_image: number | null;
  mobile_image_detail: MediaAsset | null;
  status: PublishStatus;
  published_at: string | null;
}

export interface SectorRef {
  id: number;
  name: string;
  slug: string;
}

export interface SuccessStoryItem extends EditorialAudit {
  id: number;
  title: string;
  title_es: string;
  title_en: string;
  slug: string;
  company_name: string;
  sector: number | null;
  sector_detail: SectorRef | null;
  summary: string;
  summary_es: string;
  summary_en: string;
  content: string;
  content_es: string;
  content_en: string;
  image: string | null;
  image_url: string | null;
  logo: number | null;
  logo_detail: MediaAsset | null;
  country_origin: string;
  investment_amount: string;
  jobs_generated: number | null;
  testimonial_quote: string;
  testimonial_quote_es: string;
  testimonial_quote_en: string;
  testimonial_author: string;
  testimonial_author_es: string;
  testimonial_author_en: string;
  is_featured: boolean;
  order: number;
  status: PublishStatus;
  published_at: string | null;
}

export interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: PublishStatus | "";
  media_type?: MediaType | "";
  category?: string;
  placement?: string;
  date_from?: string;
  date_to?: string;
}

/** Build a query string from list/filter params. */
export function buildListQuery(params: ListParams): string {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.media_type) qs.set("media_type", params.media_type);
  if (params.category) qs.set("category", params.category);
  if (params.placement) qs.set("placement", params.placement);
  if (params.date_from) qs.set("date_from", params.date_from);
  if (params.date_to) qs.set("date_to", params.date_to);
  const str = qs.toString();
  return str ? `?${str}` : "";
}
