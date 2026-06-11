import siteNavigationJson from "@/src/config/siteNavigation.json";
import topBarNavigationJson from "@/src/config/topBarNavigation.json";
import type { Locale } from "@/src/i18n/config";
import { getSectors } from "@/src/data/investmentSectors";
import { slugify } from "@/src/lib/slugify";

export type LocalizedString = Record<Locale, string>;

export type SiteNavNode = {
  id: string;
  label: LocalizedString;
  path: LocalizedString;
  external?: boolean;
  children?: SiteNavNode[];
};

const SECTOR_PATH_PREFIX: LocalizedString = {
  es: "/invertir/sectores",
  en: "/en/invest/sectors",
};

const NEWS_PATH_PREFIX: LocalizedString = {
  es: "/prensa",
  en: "/en/news",
};

function buildSectorChildren(): SiteNavNode[] {
  return getSectors("es").map((sector) => ({
    id: `sector-${sector.slug}`,
    label: {
      es: sector.name,
      en: getSectors("en").find((s) => s.slug === sector.slug)?.name ?? sector.name,
    },
    path: {
      es: `${SECTOR_PATH_PREFIX.es}/${sector.slug}`,
      en: `${SECTOR_PATH_PREFIX.en}/${sector.slug}`,
    },
  }));
}

function injectSectorChildren(nodes: SiteNavNode[]): SiteNavNode[] {
  return nodes.map((node) => {
    if (node.id !== "invertir") {
      return node.children ? { ...node, children: injectSectorChildren(node.children) } : node;
    }
    const children = (node.children ?? []).map((child) => {
      if (child.id !== "invertir-sectores") return child;
      return { ...child, children: buildSectorChildren() };
    });
    return { ...node, children };
  });
}

const baseNavigation = siteNavigationJson as SiteNavNode[];

/** Top bar (Sala de Prensa, Asesoría Gratuita, Trámites en Línea). */
export const topBarNavigation: SiteNavNode[] = topBarNavigationJson as SiteNavNode[];

/** Árbol de navegación con fichas sectoriales bajo Sectores Clave. */
export const siteNavigation: SiteNavNode[] = injectSectorChildren(baseNavigation);

export const homePaths: LocalizedString = { es: "/", en: "/en" };

type PathEntry = { id: string; node: SiteNavNode };

function walkNodes(
  nodes: SiteNavNode[],
  locale: Locale,
  acc: Map<string, PathEntry>,
): void {
  for (const node of nodes) {
    if (node.external) {
      if (node.children?.length) walkNodes(node.children, locale, acc);
      continue;
    }
    const path = normalizePath(node.path[locale]);
    acc.set(path, { id: node.id, node });
    if (node.children?.length) walkNodes(node.children, locale, acc);
  }
}

function buildPathIndex(): Record<Locale, Map<string, PathEntry>> {
  const es = new Map<string, PathEntry>();
  const en = new Map<string, PathEntry>();
  walkNodes(siteNavigation, "es", es);
  walkNodes(siteNavigation, "en", en);
  walkNodes(topBarNavigation, "es", es);
  walkNodes(topBarNavigation, "en", en);
  // Rutas secundarias no presentes en el menú principal
  const extra: SiteNavNode[] = [
    {
      id: "quienes-somos",
      label: { es: "Quiénes Somos", en: "About Us" },
      path: { es: "/quienes-somos", en: "/en/about-us" },
    },
    {
      id: "contacto",
      label: { es: "Contacto", en: "Contact" },
      path: { es: "/contacto", en: "/en/contact" },
    },
    {
      id: "postulacion",
      label: { es: "Postulación de Proyectos", en: "Project Application" },
      path: { es: "/postulacion", en: "/en/application" },
    },
    {
      id: "recursos-institucional",
      label: { es: "Recursos Institucionales", en: "Institutional Resources" },
      path: { es: "/recursos/institucional", en: "/en/resources/institutional" },
    },
    {
      id: "recursos-tecnicos",
      label: { es: "Recursos para la Inversión", en: "Investment Resources" },
      path: { es: "/recursos/tecnicos", en: "/en/resources/technical" },
    },
    {
      id: "recursos-biblioteca",
      label: { es: "Otros Documentos", en: "Other Documents" },
      path: { es: "/recursos/biblioteca", en: "/en/resources/library" },
    },
  ];
  walkNodes(extra, "es", es);
  walkNodes(extra, "en", en);
  es.set("/", { id: "home", node: { id: "home", label: { es: "Inicio", en: "Home" }, path: homePaths } });
  en.set("/en", { id: "home", node: { id: "home", label: { es: "Inicio", en: "Home" }, path: homePaths } });
  return { es, en };
}

export const pathIndex = buildPathIndex();

export function normalizePath(pathname: string): string {
  const withoutHash = pathname.split("#")[0] ?? pathname;
  const normalized = withoutHash.replace(/\/+$/, "") || "/";
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

export function getLocaleFromPathname(pathname: string): Locale {
  const normalized = normalizePath(pathname);
  if (normalized === "/en" || normalized.startsWith("/en/")) return "en";
  return "es";
}

export function stripLocalePrefix(pathname: string): string {
  const normalized = normalizePath(pathname);
  if (normalized === "/en") return "/";
  if (normalized.startsWith("/en/")) return normalized.slice(3) || "/";
  return normalized;
}

/** Ruta pública para un id de navegación. */
export function getPathById(id: string, locale: Locale): string | undefined {
  if (id === "home") return homePaths[locale];
  const find = (nodes: SiteNavNode[]): string | undefined => {
    for (const node of nodes) {
      if (node.id === id) return node.path[locale];
      if (node.children) {
        const found = find(node.children);
        if (found) return found;
      }
    }
    return undefined;
  };
  return find(siteNavigation);
}

/** Ruta espejo al cambiar de idioma (misma página lógica). */
export function getMirrorPath(pathname: string, targetLocale: Locale): string {
  const normalized = normalizePath(pathname);
  const currentLocale = getLocaleFromPathname(normalized);
  const index = pathIndex[currentLocale];
  const entry = index.get(normalized);

  if (entry) {
    const hash = pathname.includes("#") ? pathname.slice(pathname.indexOf("#")) : "";
    return `${entry.node.path[targetLocale]}${hash}`;
  }

  const sectorMatch = normalized.match(
    currentLocale === "es"
      ? /^\/invertir\/sectores\/([^/]+)$/
      : /^\/en\/invest\/sectors\/([^/]+)$/,
  );
  if (sectorMatch) {
    const slug = sectorMatch[1]!;
    const base = targetLocale === "es" ? SECTOR_PATH_PREFIX.es : SECTOR_PATH_PREFIX.en;
    const hash = pathname.includes("#") ? pathname.slice(pathname.indexOf("#")) : "";
    return `${base}/${slug}${hash}`;
  }

  const newsMatch = normalized.match(
    currentLocale === "es"
      ? /^\/prensa\/([^/]+)$/
      : /^\/en\/news\/([^/]+)$/,
  );
  if (newsMatch) {
    const slug = newsMatch[1]!;
    const base = targetLocale === "es" ? NEWS_PATH_PREFIX.es : NEWS_PATH_PREFIX.en;
    const hash = pathname.includes("#") ? pathname.slice(pathname.indexOf("#")) : "";
    return `${base}/${slug}${hash}`;
  }

  return targetLocale === "es" ? "/" : "/en";
}

/** Enlaces del menú principal (orden del JSON). */
export function getMainNavNodes(_locale: Locale): SiteNavNode[] {
  return siteNavigation;
}

export function getTopBarNavNodes(_locale: Locale): SiteNavNode[] {
  return topBarNavigation;
}

export function getNavLabel(node: SiteNavNode, locale: Locale): string {
  return node.label[locale];
}

export function getNavHref(node: SiteNavNode, locale: Locale): string {
  return node.path[locale];
}

/** Todos los nodos hoja para el footer. */
export function getFooterNavLinks(locale: Locale): { label: string; href: string }[] {
  const links: { label: string; href: string }[] = [];
  const walk = (nodes: SiteNavNode[]) => {
    for (const node of nodes) {
      if (node.children?.length) {
        walk(node.children);
      } else {
        links.push({ label: node.label[locale], href: node.path[locale] });
      }
    }
  };
  walk(siteNavigation);
  return links;
}

export function pathIsActive(pathname: string, href: string): boolean {
  const current = normalizePath(pathname);
  const target = normalizePath(href.split("#")[0] ?? href);
  if (target === "/" || target === "/en") {
    return current === target;
  }
  return current === target || current.startsWith(`${target}/`);
}

const LEGACY_ES_PATHS: Record<string, string> = {
  "/servicios": "/cni",
  "/servicios/asistencia-legal": "/cni/servicios-legales",
  "/servicios/asistencia-tecnica": "/cni/servicios-tecnicos",
  "/servicios/inteligencia-de-datos": "/cni/inteligencia-de-datos",
  "/servicios/tramites": "/tramites",
};

/** Resuelve un path canónico (ES) o path público al href del locale activo. */
export function resolveHref(locale: Locale, path: string): string {
  const [rawPath, hash] = path.split("#");
  const normalized = normalizePath(rawPath ?? path);
  const suffix = hash ? `#${hash}` : "";

  const legacy = LEGACY_ES_PATHS[normalized];
  if (legacy) return resolveHref(locale, legacy) + suffix;

  for (const loc of ["es", "en"] as const) {
    const entry = pathIndex[loc].get(normalized);
    if (entry) return `${entry.node.path[locale]}${suffix}`;
  }

  const sectorMatch = normalized.match(/^\/invertir\/sectores\/([^/]+)$/);
  if (sectorMatch) {
    const slug = sectorMatch[1]!;
    const base = locale === "es" ? SECTOR_PATH_PREFIX.es : SECTOR_PATH_PREFIX.en;
    return `${base}/${slug}${suffix}`;
  }

  const newsMatch = normalized.match(/^\/prensa\/([^/]+)$/);
  if (newsMatch) {
    const slug = newsMatch[1]!;
    const base = locale === "es" ? NEWS_PATH_PREFIX.es : NEWS_PATH_PREFIX.en;
    return `${base}/${slug}${suffix}`;
  }

  if (locale === "en" && !normalized.startsWith("/en")) {
    return `${getMirrorPath(normalized, "en")}${suffix}`;
  }

  return `${normalized}${suffix}`;
}

export function getSectorHref(locale: Locale, slug: string): string {
  return locale === "es"
    ? `${SECTOR_PATH_PREFIX.es}/${slug}`
    : `${SECTOR_PATH_PREFIX.en}/${slug}`;
}

/** @deprecated Usar resolveHref. */
export function withLocale(locale: Locale, path: string): string {
  return resolveHref(locale, path);
}

/** Slug para artículos de prensa, proyectos, etc. */
export { slugify };
