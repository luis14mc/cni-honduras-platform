import { cmsGet } from "@/src/lib/cms/api";
import type { SearchResults } from "@/src/lib/cms/editorial/types";

export async function cmsSearch(query: string): Promise<SearchResults> {
  const qs = new URLSearchParams();
  if (query.trim()) qs.set("q", query.trim());
  const str = qs.toString();
  return cmsGet<SearchResults>(str ? `/search/?${str}` : "/search/");
}

export type SearchResultType = keyof SearchResults;

export function searchResultHref(type: SearchResultType, id: number): string {
  switch (type) {
    case "news":
      return `/cms/noticias/${id}`;
    case "documents":
      return `/cms/documentos/${id}`;
    case "banners":
      return `/cms/banners/${id}`;
    case "success_stories":
      return `/cms/casos-exito/${id}`;
    case "sectors":
      return `/cms/sectores/${id}`;
    case "opportunities":
      return `/cms/oportunidades/${id}`;
    case "pages":
      return `/cms/paginas/${id}`;
    default:
      return "/cms";
  }
}

export const SEARCH_TYPE_LABELS: Record<SearchResultType, string> = {
  news: "Noticias",
  documents: "Documentos",
  banners: "Banners",
  success_stories: "Casos de éxito",
  sectors: "Sectores",
  opportunities: "Oportunidades",
  pages: "Páginas",
};
