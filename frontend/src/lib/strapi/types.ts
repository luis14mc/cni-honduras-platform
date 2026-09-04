export type StrapiLocale = "es" | "en";

export interface StrapiMediaFormat {
  url: string;
  width?: number;
  height?: number;
  size?: number;
  mime?: string;
}

export interface StrapiMedia {
  id?: number;
  documentId?: string;
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
  mime?: string | null;
  width?: number | null;
  height?: number | null;
  formats?: Record<string, StrapiMediaFormat> | null;
}

export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiListResponse<T> {
  data: T[];
  meta: {
    pagination?: StrapiPagination;
  };
}

export interface StrapiEntityResponse<T> {
  data: T | null;
  meta: Record<string, unknown>;
}

export interface StrapiPublicMetric {
  id?: number;
  label: string;
  value: string;
}

export interface StrapiNews {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  /** Current Strapi field (replaces legacy `summary`). */
  excerpt?: string | null;
  /** @deprecated Legacy alias — prefer `excerpt`. */
  summary?: string | null;
  content?: unknown;
  /** Current Strapi media field (replaces legacy `featured_image`). */
  cover?: StrapiMedia | null;
  /** @deprecated Legacy alias — prefer `cover`. */
  featured_image?: StrapiMedia | null;
  lead_points?: Array<{ id?: number; text?: string | null }> | null;
  location_date?: string | null;
  published_date?: string | null;
  category?: string | null;
  featured?: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  locale?: StrapiLocale;
  publishedAt?: string | null;
}

export interface StrapiDocument {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description?: string | null;
  file?: StrapiMedia | null;
  cover?: StrapiMedia | null;
  category?: string | null;
  resource_key?: string | null;
  featured?: boolean;
  document_type?: "project_sheet" | "opportunity_card" | "sector_portfolio" | "opportunity_portfolio" | null;
  sector?: string | null;
  order?: number | null;
  locale?: StrapiLocale;
  publishedAt?: string | null;
}

export interface StrapiSuccessStory {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  company_name?: string | null;
  summary?: string | null;
  content?: unknown;
  logo?: StrapiMedia | null;
  featured_image?: StrapiMedia | null;
  person_photo?: StrapiMedia | null;
  person_name?: string | null;
  person_role?: string | null;
  testimonial?: string | null;
  sector?: string | null;
  featured?: boolean;
  locale?: StrapiLocale;
  publishedAt?: string | null;
}

/** Public teaser fields only. Do not add internal_notes or other editorial-only fields. */
export interface StrapiInvestmentOpportunity {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  summary?: string | null;
  sector?: string | null;
  code?: string | null;
  featured_image?: StrapiMedia | null;
  public_metrics?: StrapiPublicMetric[] | null;
  contact_cta?: string | null;
  locale?: StrapiLocale;
  publishedAt?: string | null;
}

export const STRAPI_COLLECTION_PATHS = {
  news: "/api/news",
  documents: "/api/documents",
  successStories: "/api/success-stories",
  investmentOpportunities: "/api/investment-opportunities",
} as const;
