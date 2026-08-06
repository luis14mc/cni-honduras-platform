import type { MetadataRoute } from "next";
import { API_BASE_URL, unwrapPage } from "@/src/lib/api";
import { getAllResourceCategorySlugs } from "@/src/data/resourceCategoryMeta";

const LOCALES = ["es", "en"] as const;

const EN_RESOURCE_MIRRORS: Record<string, string> = {
  institucional: "/en/resources/institutional",
  tecnicos: "/en/resources/technical",
  biblioteca: "/en/resources/library",
  estudios: "/en/resources/studies",
};

async function fetchSlugs(path: string): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    const items = unwrapPage<{ slug: string }>(data);
    return items.map((item) => item.slug);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cni.hn";
  const staticPaths = ["/", "/prensa", "/recursos", "/portafolio/casos", "/invertir/sectores"];
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const path of staticPaths) {
      const localized = locale === "es" ? path : `/en${path === "/" ? "" : path}`;
      entries.push({
        url: `${base}${localized}`,
        changeFrequency: "weekly",
        priority: path === "/" ? 1 : 0.7,
      });
    }
  }

  for (const slug of getAllResourceCategorySlugs()) {
    entries.push({
      url: `${base}/recursos/${slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    });
    entries.push({
      url: `${base}${EN_RESOURCE_MIRRORS[slug] ?? `/en/resources/${slug}`}`,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  const newsSlugs = await fetchSlugs("/cms/news/");
  const caseSlugs = await fetchSlugs("/investment/success-stories/");
  const sectorSlugs = await fetchSlugs("/investment/sectors/");

  for (const slug of newsSlugs) {
    entries.push({ url: `${base}/prensa/${slug}`, changeFrequency: "weekly", priority: 0.6 });
    entries.push({ url: `${base}/en/news/${slug}`, changeFrequency: "weekly", priority: 0.6 });
  }
  for (const slug of caseSlugs) {
    entries.push({ url: `${base}/portafolio/casos/${slug}`, changeFrequency: "monthly", priority: 0.6 });
    entries.push({ url: `${base}/en/portfolio/success-stories/${slug}`, changeFrequency: "monthly", priority: 0.6 });
  }
  for (const slug of sectorSlugs) {
    entries.push({ url: `${base}/invertir/sectores/${slug}`, changeFrequency: "monthly", priority: 0.7 });
    entries.push({ url: `${base}/en/invest/sectors/${slug}`, changeFrequency: "monthly", priority: 0.7 });
  }

  return entries;
}
