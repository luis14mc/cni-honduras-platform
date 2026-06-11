export interface MediaAssetLite {
  id: number;
  title: string;
  file: string;
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
