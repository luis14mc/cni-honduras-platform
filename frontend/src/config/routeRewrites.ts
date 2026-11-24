import type { Locale } from "@/src/i18n/config";
import { homePaths, normalizePath, siteNavigation, type SiteNavNode } from "@/src/config/siteNavigation";

function internalSlugFromPublic(publicPath: string, locale: Locale): string {
  if (locale === "es") return publicPath;
  if (publicPath === "/en") return "";
  if (!publicPath.startsWith("/en/")) return publicPath;
  const enTail = publicPath.slice(3);
  const map: Record<string, string> = {
    "/about-us": "/quienes-somos",
    "/cni": "/cni",
    "/cni/legal-services": "/cni/servicios-legales",
    "/cni/technical-services": "/cni/servicios-tecnicos",
    "/cni/data-intelligence": "/cni/inteligencia-de-datos",
    "/procedures": "/tramites",
    "/migratory-facilities": "/facilidades-migratorias",
    "/advisory": "/asesoria",
    "/invest": "/invertir",
    "/invest/why-honduras": "/invertir/por-que-honduras",
    "/invest/sectors": "/invertir/sectores",
    "/grow": "/crecer",
    "/grow/aftercare": "/crecer/acompanamiento",
    "/live": "/vivir",
    "/live/quality-of-life": "/vivir/calidad-de-vida",
    "/portfolio": "/portafolio",
    "/portfolio/project-sheets": "/portafolio/fichas-proyectos",
    "/portfolio/opportunities": "/portafolio/oportunidades",
    "/portfolio/success-stories": "/portafolio/casos",
    "/submit-your-project": "/postulacion",
    "/portfolio/map": "/portafolio/mapa",
    "/resources": "/recursos",
    "/resources/institutional": "/recursos/institucional",
    "/resources/technical": "/recursos/tecnicos",
    "/resources/library": "/recursos/biblioteca",
    "/resources/studies": "/recursos/estudios",
    "/news": "/prensa",
    "/contact": "/contacto",
  };
  if (map[enTail]) return map[enTail];
  const sector = enTail.match(/^\/invest\/sectors\/([^/]+)$/);
  if (sector) return `/invertir/sectores/${sector[1]}`;
  const institutional = enTail.match(/^\/institutional\/([^/]+)$/);
  if (institutional) return `/institucional/${institutional[1]}`;
  const story = enTail.match(/^\/portfolio\/success-stories\/([^/]+)$/);
  if (story) return `/portafolio/casos/${story[1]}`;
  const opportunity = enTail.match(/^\/portfolio\/opportunities\/([^/]+)$/);
  if (opportunity) return `/portafolio/oportunidades/${opportunity[1]}`;
  const projectSheet = enTail.match(/^\/portfolio\/project-sheets\/([^/]+)$/);
  if (projectSheet) return `/portafolio/fichas-proyectos/${projectSheet[1]}`;
  const news = enTail.match(/^\/news\/([^/]+)$/);
  if (news) return `/prensa/${news[1]}`;
  const resource = enTail.match(/^\/resources\/([^/]+)$/);
  if (resource) return `/recursos/${resource[1]}`;
  return enTail;
}

function walk(nodes: SiteNavNode[], locale: Locale, acc: Map<string, string>, localePrefix: string) {
  for (const node of nodes) {
    if (node.external) {
      if (node.children?.length) walk(node.children, locale, acc, localePrefix);
      continue;
    }
    const publicPath = normalizePath(node.path[locale]);
    const slug = internalSlugFromPublic(publicPath, locale);
    const internal = slug === "" ? localePrefix : `${localePrefix}${slug}`;
    acc.set(publicPath, internal);
    if (node.children?.length) walk(node.children, locale, acc, localePrefix);
  }
}

function buildMaps() {
  const es = new Map<string, string>();
  const en = new Map<string, string>();
  walk(siteNavigation, "es", es, "/es");
  walk(siteNavigation, "en", en, "/en");
  es.set(homePaths.es, "/es");
  en.set(homePaths.en, "/en");
  // Top-bar additions (no están en el menú principal pero son rutas públicas):
  es.set("/asesoria", "/es/asesoria");
  es.set("/tramites", "/es/tramites");
  es.set("/facilidades-migratorias", "/es/facilidades-migratorias");
  es.set("/prensa", "/es/prensa");
  es.set("/postula-tu-proyecto", "/es/postulacion");
  en.set("/en/advisory", "/en/asesoria");
  en.set("/en/procedures", "/en/tramites");
  en.set("/en/migratory-facilities", "/en/facilidades-migratorias");
  en.set("/en/news", "/en/prensa");
  en.set("/en/submit-your-project", "/en/postulacion");
  // Categorías de recursos
  es.set("/recursos/institucional", "/es/recursos/institucional");
  es.set("/recursos/tecnicos", "/es/recursos/tecnicos");
  es.set("/recursos/biblioteca", "/es/recursos/biblioteca");
  es.set("/recursos/estudios", "/es/recursos/estudios");
  en.set("/en/resources/institutional", "/en/recursos/institucional");
  en.set("/en/resources/technical", "/en/recursos/tecnicos");
  en.set("/en/resources/library", "/en/recursos/biblioteca");
  en.set("/en/resources/studies", "/en/recursos/estudios");
  return { es, en };
}

const maps = buildMaps();

export function resolveInternalPath(pathname: string): string | null {
  const normalized = normalizePath(pathname);

  if (normalized === "/en" || normalized.startsWith("/en/")) {
    const slug = internalSlugFromPublic(normalized, "en");
    return slug === "" ? "/en" : `/en${slug}`;
  }

  if (/^\/es(\/|$)/.test(normalized)) {
    return normalized;
  }

  if (normalized === "/en" || normalized.startsWith("/en/")) {
    return maps.en.get(normalized) ?? null;
  }

  if (normalized === "/") return "/es";

  const mapped = maps.es.get(normalized);
  if (mapped) return mapped;

  const sector = normalized.match(/^\/invertir\/sectores\/([^/]+)$/);
  if (sector) return `/es/invertir/sectores/${sector[1]}`;

  const story = normalized.match(/^\/portafolio\/casos\/([^/]+)$/);
  if (story) return `/es/portafolio/casos/${story[1]}`;

  const newsItem = normalized.match(/^\/prensa\/([^/]+)$/);
  if (newsItem) return `/es/prensa/${newsItem[1]}`;

  const resource = normalized.match(/^\/recursos\/([^/]+)$/);
  if (resource) return `/es/recursos/${resource[1]}`;

  return `/es${normalized}`;
}
