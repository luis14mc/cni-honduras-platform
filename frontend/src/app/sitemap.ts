import type { MetadataRoute } from "next";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { SECTOR_SLUGS } from "@/src/data/investmentSectors";
import { getAllResourceCategorySlugs, resourceCategoryHref } from "@/src/data/resourceCategoryMeta";
import { editorialCollections, editorialIndex, editorialPath } from "@/src/lib/editorialSeo";
import { alternateLanguages, siteUrl } from "@/src/lib/seo";
import { getResourceCategories } from "@/src/lib/strapi/editorial";
import { getOpportunities, getProjects } from "@/src/services/investment";
import type { Locale } from "@/src/i18n/config";

const LOCALES = ["es", "en"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = new Map<string, MetadataRoute.Sitemap[number]>();

  function add(paths: Partial<Record<Locale, string>>) {
    const urls = Object.fromEntries(
      Object.entries(paths).map(([locale, path]) => [locale, siteUrl(path)]),
    );
    for (const url of Object.values(urls)) {
      entries.set(url, { url, alternates: { languages: alternateLanguages(urls) } });
    }
  }

  for (const [key, seo] of Object.entries(PAGE_SEO)) {
    if (["portafolio-oportunidades", "portafolio-fichas-proyectos", "vivir-calidad-de-vida"].includes(key)) continue;
    add({ es: seo.canonical, en: seo.enMirror });
  }
  add({ es: "/postula-tu-proyecto", en: "/en/submit-your-project" });

  const [resourcesEs, resourcesEn, projects, opportunities] = await Promise.all([
    getResourceCategories("es").catch(() => []),
    getResourceCategories("en").catch(() => []),
    getProjects({ locale: "es" }).catch(() => []),
    getOpportunities({ locale: "es" }).catch(() => []),
  ]);
  const staticCategories = new Set(getAllResourceCategorySlugs());
  const categoryEs = new Set(resourcesEs.map(({ slug }) => slug));
  const categoryEn = new Set(resourcesEn.map(({ slug }) => slug));
  for (const slug of new Set([...staticCategories, ...categoryEs, ...categoryEn])) {
    const paths: Partial<Record<Locale, string>> = {};
    if (staticCategories.has(slug) || categoryEs.has(slug)) paths.es = resourceCategoryHref(slug, "es");
    if (staticCategories.has(slug) || categoryEn.has(slug)) paths.en = resourceCategoryHref(slug, "en");
    add(paths);
  }

  await Promise.all(editorialCollections.map(async (collection) => {
    const documents = new Map<string, Partial<Record<Locale, string>>>();
    for (const locale of LOCALES) {
      for (const entry of await editorialIndex(collection, locale)) {
        const paths = documents.get(entry.documentId) ?? {};
        paths[locale] = editorialPath(collection, locale, entry.slug);
        documents.set(entry.documentId, paths);
      }
    }
    for (const paths of documents.values()) add(paths);
  }));

  for (const { slug } of projects) {
    add({ es: `/portafolio/fichas-proyectos/${slug}`, en: `/en/portfolio/project-sheets/${slug}` });
  }
  for (const { slug } of opportunities) {
    add({ es: `/portafolio/oportunidades/${slug}`, en: `/en/portfolio/opportunities/${slug}` });
  }
  for (const slug of SECTOR_SLUGS) {
    add({ es: `/invertir/sectores/${slug}`, en: `/en/invest/sectors/${slug}` });
  }
  return [...entries.values()];
}
