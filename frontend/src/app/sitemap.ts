import type { MetadataRoute } from "next";
import { API_BASE_URL } from "@/src/lib/api";
import { unwrapPage } from "@/src/lib/api";

const LOCALES = ["es", "en"] as const;

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

  const newsSlugs = await fetchSlugs("/cms/news/");
  const docSlugs = await fetchSlugs("/cms/documents/");
  const caseSlugs = await fetchSlugs("/investment/success-stories/");
  const sectorSlugs = await fetchSlugs("/investment/sectors/");

  for (const slug of newsSlugs) {
    entries.push({ url: `${base}/prensa/${slug}`, changeFrequency: "weekly", priority: 0.6 });
    entries.push({ url: `${base}/en/prensa/${slug}`, changeFrequency: "weekly", priority: 0.6 });
  }
  for (const slug of docSlugs) {
    entries.push({ url: `${base}/recursos/${slug}`, changeFrequency: "monthly", priority: 0.5 });
    entries.push({ url: `${base}/en/resources/${slug}`, changeFrequency: "monthly", priority: 0.5 });
  }
  for (const slug of caseSlugs) {
    entries.push({ url: `${base}/portafolio/casos/${slug}`, changeFrequency: "monthly", priority: 0.6 });
    entries.push({ url: `${base}/en/portafolio/casos/${slug}`, changeFrequency: "monthly", priority: 0.6 });
  }
  for (const slug of sectorSlugs) {
    entries.push({ url: `${base}/invertir/sectores/${slug}`, changeFrequency: "monthly", priority: 0.7 });
    entries.push({ url: `${base}/en/invest/sectors/${slug}`, changeFrequency: "monthly", priority: 0.7 });
  }

  return entries;
}
