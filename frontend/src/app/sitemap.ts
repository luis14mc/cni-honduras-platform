import type { MetadataRoute } from "next";
import { API_BASE_URL, unwrapPage } from "@/src/lib/api";
import { getAllResourceCategorySlugs } from "@/src/data/resourceCategoryMeta";
import { getNews, getSuccessStories } from "@/src/lib/strapi/editorial";
import { getOpportunities } from "@/src/services/investment";
import { resolveHref } from "@/src/config/siteNavigation";
import type { Locale } from "@/src/i18n/config";

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

// Noticias y casos de éxito los renderiza el sitio desde Strapi (capa editorial),
// no desde Django. El sitemap debe leer de la MISMA fuente y por locale, porque
// los slugs de Strapi están localizados (ES y EN pueden diferir). Si se leyera de
// Django se publicarían URLs que las páginas (Strapi) devuelven como 404.
async function fetchStrapiSlugs(
  loader: (locale: Locale) => Promise<Array<{ slug: string }>>,
  locale: Locale,
): Promise<string[]> {
  try {
    const items = await loader(locale);
    return items.map((item) => item.slug).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cni.hn";
  const staticPaths = [
    "/",
    "/prensa",
    "/recursos",
    "/portafolio/casos",
    "/portafolio/oportunidades",
    "/portafolio/mapa",
    "/invertir/sectores",
  ];
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const path of staticPaths) {
      // URL pública canónica del idioma (p. ej. /prensa -> /en/news), no `/en` + ruta en español.
      const localized = resolveHref(locale, path);
      entries.push({
        url: `${base}${localized}`,
        changeFrequency: "weekly",
        priority: path === "/" ? 1 : 0.7,
      });
    }
  }

  entries.push({ url: `${base}/postula-tu-proyecto`, changeFrequency: "monthly", priority: 0.8 });
  entries.push({ url: `${base}/en/submit-your-project`, changeFrequency: "monthly", priority: 0.8 });

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

  // Noticias y casos: desde Strapi, por locale (fuente real de las páginas).
  for (const locale of LOCALES) {
    const newsPrefix = locale === "es" ? "/prensa" : "/en/news";
    const casePrefix = locale === "es" ? "/portafolio/casos" : "/en/portfolio/success-stories";

    const newsSlugs = await fetchStrapiSlugs(getNews, locale);
    for (const slug of newsSlugs) {
      entries.push({ url: `${base}${newsPrefix}/${slug}`, changeFrequency: "weekly", priority: 0.6 });
    }

    const caseSlugs = await fetchStrapiSlugs(getSuccessStories, locale);
    for (const slug of caseSlugs) {
      entries.push({ url: `${base}${casePrefix}/${slug}`, changeFrequency: "monthly", priority: 0.6 });
    }
  }

  // Oportunidades: desde Django (fuente única; un registro bilingüe con el mismo slug).
  let opportunitySlugs: string[] = [];
  try {
    opportunitySlugs = (await getOpportunities({ locale: "es" })).map((o) => o.slug).filter(Boolean);
  } catch {
    opportunitySlugs = [];
  }
  for (const slug of opportunitySlugs) {
    entries.push({ url: `${base}/portafolio/oportunidades/${slug}`, changeFrequency: "monthly", priority: 0.6 });
    entries.push({ url: `${base}/en/portfolio/opportunities/${slug}`, changeFrequency: "monthly", priority: 0.6 });
  }

  // Sectores: se mantienen desde Django (las páginas de sectores se alimentan de Django).
  const sectorSlugs = await fetchSlugs("/investment/sectors/");
  for (const slug of sectorSlugs) {
    entries.push({ url: `${base}/invertir/sectores/${slug}`, changeFrequency: "monthly", priority: 0.7 });
    entries.push({ url: `${base}/en/invest/sectors/${slug}`, changeFrequency: "monthly", priority: 0.7 });
  }

  return entries;
}
