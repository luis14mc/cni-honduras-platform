export interface MediaAssetLite {
  id: number;
  title: string;
  file: string;
  file_url?: string | null;
  alt_text: string;
  caption: string;
  media_type: string;
  created_at: string;
}

export type NewsCategory = "news" | "press_release" | "event" | "announcement" | "article";

export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  content_blocks?: import("@/src/lib/newsBlocks").NewsBlock[];
  /** Strapi 5 Blocks JSON mapped for public render (optional). */
  rich_content?: import("@/src/lib/strapi/blocks").StrapiBlock[] | null;
  featured_image: MediaAssetLite | null;
  category: NewsCategory;
  author_name: string;
  source: string;
  external_url: string;
  is_featured: boolean;
  published_at: string;
  seo_title: string;
  seo_description: string;
}

export type DocumentCategory = "institucional" | "tecnicos" | "biblioteca" | "estudios";

export interface CmsDocument {
  id: number;
  language?: "es" | "en";
  resource_key?: string;
  title: string;
  slug: string;
  file: string;
  file_url?: string | null;
  external_url: string;
  description: string;
  category: DocumentCategory;
  is_featured: boolean;
  order: number;
  cover_image: MediaAssetLite | null;
  file_type: string;
  file_size_bytes: number | null;
  published_at: string;
  document_date: string | null;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
  has_resource?: boolean;
}

export type LinkSection = "home_interest" | "footer_external" | "tramites" | "top_bar";

export interface InstitutionalLink {
  id: number;
  section: LinkSection;
  title: string;
  description: string;
  url: string;
  is_external: boolean;
  icon: string;
  accent_color: string;
  order: number;
}

export type BannerPlacement = "site_top" | "home_hero" | "footer";

export interface SiteBanner {
  id: number;
  placement: BannerPlacement;
  title: string;
  body: string;
  cta_label: string;
  starts_at: string | null;
  ends_at: string | null;
  priority: number;
  order?: number;
  link_url: string;
  cta_url?: string;
  link_external: boolean;
  open_in_new_tab?: boolean;
  dismissible: boolean;
  background_color: string;
  text_color: string;
  image: MediaAssetLite | null;
  mobile_image: MediaAssetLite | null;
  published_at: string;
}
