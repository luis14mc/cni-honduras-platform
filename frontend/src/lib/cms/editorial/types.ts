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
  content_blocks_es: unknown[];
  content_blocks_en: unknown[];
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
  language: "es" | "en";
  resource_key: string;
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
  sibling_languages?: string[];
  sibling_id?: number | null;
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
  name_es?: string;
  name_en?: string;
  slug: string;
  is_active?: boolean;
}

export interface SectorItem {
  id: number;
  name: string;
  name_es: string;
  name_en: string;
  slug: string;
  short_description: string;
  short_description_es: string;
  short_description_en: string;
  description: string;
  description_es: string;
  description_en: string;
  icon: string;
  image: string | null;
  image_url: string | null;
  color_hex: string;
  is_featured: boolean;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export type OpportunityLifecycleStatus = "open" | "in_progress" | "closed";

/** @deprecated Use OpportunityLifecycleStatus for deal state; PublishStatus for editorial. */
export type OpportunityStatus = OpportunityLifecycleStatus;

export interface OpportunityMetricItem {
  id?: number | null;
  label: string;
  label_es: string;
  label_en: string;
  value: string;
  value_es: string;
  value_en: string;
  note: string;
  note_es: string;
  note_en: string;
  icon: string;
  order: number;
}

export interface OpportunityFundUseItem {
  id?: number | null;
  component: string;
  component_es: string;
  component_en: string;
  amount: string | null;
  description: string;
  description_es: string;
  description_en: string;
  order: number;
}

export interface OpportunityItem extends EditorialAudit {
  id: number;
  code: string;
  title: string;
  title_es: string;
  title_en: string;
  slug: string;
  summary: string;
  summary_es: string;
  summary_en: string;
  description: string;
  description_es: string;
  description_en: string;
  target_customer: string;
  target_customer_es: string;
  target_customer_en: string;
  market_demand: string;
  market_demand_es: string;
  market_demand_en: string;
  value_proposition: string;
  value_proposition_es: string;
  value_proposition_en: string;
  sector: number | null;
  sector_detail: SectorRef | null;
  department: number | null;
  region: number | null;
  estimated_investment: string | null;
  estimated_jobs: number | null;
  lifecycle_status: OpportunityLifecycleStatus;
  status: PublishStatus;
  published_at: string | null;
  is_public: boolean;
  is_featured: boolean;
  order: number;
  metrics: OpportunityMetricItem[];
  fund_uses: OpportunityFundUseItem[];
}

export interface PageItem extends EditorialAudit {
  id: number;
  title: string;
  title_es: string;
  title_en: string;
  slug: string;
  content: string;
  content_es: string;
  content_en: string;
  excerpt: string;
  excerpt_es: string;
  excerpt_en: string;
  featured_image: number | null;
  featured_image_detail: MediaAsset | null;
  seo_title: string;
  seo_title_es: string;
  seo_title_en: string;
  seo_description: string;
  seo_description_es: string;
  seo_description_en: string;
  status: PublishStatus;
  published_at: string | null;
  is_protected: boolean;
}

export interface InstitutionalLinkItem {
  id: number;
  section: string;
  title: string;
  title_es: string;
  title_en: string;
  description: string;
  description_es: string;
  description_en: string;
  url: string;
  is_external: boolean;
  icon: string;
  accent_color: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CmsStaffUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  groups: string[];
  last_login: string | null;
  date_joined: string;
}

export interface CmsGroup {
  id: number;
  name: string;
  permissions: { id: number; codename: string; name: string; content_type: number }[];
  user_count: number;
}

export interface PermissionCatalogModel {
  app_label: string;
  model: string;
  label: string;
  permissions: { id: number; codename: string; action: string; name: string }[];
  publish_permission: { id: number; codename: string; action: string; name: string } | null;
}

export interface SearchResultItem {
  id: number;
  label: string;
  status: string | null;
  updated_at: string;
}

export interface SearchResults {
  news: SearchResultItem[];
  documents: SearchResultItem[];
  banners: SearchResultItem[];
  success_stories: SearchResultItem[];
  sectors: SearchResultItem[];
  opportunities: SearchResultItem[];
  pages: SearchResultItem[];
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
  featured_image: number | null;
  featured_image_detail: MediaAsset | null;
  person_photo: number | null;
  person_photo_detail: MediaAsset | null;
  person_name: string;
  person_role: string;
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
  status?: PublishStatus | OpportunityStatus | "";
  media_type?: MediaType | "";
  category?: string;
  placement?: string;
  language?: "es" | "en" | "";
  resource_key?: string;
  date_from?: string;
  date_to?: string;
  is_active?: boolean | "";
  is_featured?: boolean | "";
  is_public?: boolean | "";
  sector?: number | string;
  section?: string;
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
  if (params.language) qs.set("language", params.language);
  if (params.resource_key) qs.set("resource_key", params.resource_key);
  if (params.date_from) qs.set("date_from", params.date_from);
  if (params.date_to) qs.set("date_to", params.date_to);
  if (params.is_active === true) qs.set("is_active", "true");
  if (params.is_active === false) qs.set("is_active", "false");
  if (params.is_featured === true) qs.set("is_featured", "true");
  if (params.is_featured === false) qs.set("is_featured", "false");
  if (params.is_public === true) qs.set("is_public", "true");
  if (params.is_public === false) qs.set("is_public", "false");
  if (params.sector) qs.set("sector", String(params.sector));
  if (params.section) qs.set("section", params.section);
  const str = qs.toString();
  return str ? `?${str}` : "";
}
