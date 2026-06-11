import { apiGet } from "@/src/lib/api";
import type { NewsArticle, NewsCategory } from "@/src/types/cms";

const BASE = "/cms";

export function getNews(): Promise<NewsArticle[]> {
  return apiGet<NewsArticle[]>(`${BASE}/news/`);
}

export function getFeaturedNews(): Promise<NewsArticle[]> {
  return apiGet<NewsArticle[]>(`${BASE}/news/?featured=true`);
}

export function getNewsByCategory(category: NewsCategory): Promise<NewsArticle[]> {
  return apiGet<NewsArticle[]>(`${BASE}/news/?category=${encodeURIComponent(category)}`);
}

export function getNewsArticle(slug: string): Promise<NewsArticle> {
  return apiGet<NewsArticle>(`${BASE}/news/${slug}/`);
}
