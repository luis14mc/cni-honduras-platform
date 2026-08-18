import type { Locale } from "@/src/i18n/config";
import type { SectorSlug } from "@/src/data/investmentSectors";
import { getSectorDisplayName } from "@/src/data/investmentSectors";
import { getSectorPageExtra } from "@/src/i18n/copy/sectorDetailPage";
import { SECTOR_ACCENTS, type SectorAccentPalette } from "@/src/i18n/copy/invertirPage";

export type SectorMetric = {
  value: string;
  label: string;
};

export type SectorBenefit = {
  title: string;
  description: string;
  icon: string;
};

export type SectorGuideContent = {
  title: string;
  description?: string;
  image: string;
  fileUrl: string;
};

export type SectorPageContent = {
  slug: SectorSlug;
  name: string;
  color: string;
  palette: SectorAccentPalette;
  hero: {
    headline: string;
    metrics: readonly SectorMetric[];
  };
  intro: {
    title: string;
    description: string;
    videoUrl: string | null;
  };
  benefits: {
    title: string;
    items: readonly SectorBenefit[];
  };
  guide: SectorGuideContent | null;
};

const BENEFIT_ICONS = ["water_drop", "public", "handshake"] as const;

type SectorContentBody = Pick<SectorPageContent, "hero" | "intro" | "benefits" | "guide">;

const AGROINDUSTRIA_ES: SectorContentBody = {
  hero: {
    headline: "El hub de producción agrícola en Centroamérica",
    metrics: [
      {
        value: "+3,000 MM",
        label:
          "de dólares en exportaciones en productos de origen agrícola, ganadero, silvicultura y pesca",
      },
      {
        value: "8.º",
        label: "Exportador de café a nivel mundial",
      },
      {
        value: "807.5 mil",
        label: "empleados en agricultura, ganadería, silvicultura y pesca",
      },
    ],
  },
  intro: {
    title: "Agroindustria",
    description:
      "Honduras se posiciona como una ubicación destacada y privilegiada para la agroindustria, ofreciendo una combinación única de recursos naturales excepcionales, prácticas sostenibles y acceso a mercados globales. Desde cultivos tradicionales hasta productos de alto valor agregado, el país está listo para ser el aliado estratégico de tu inversión.",
    videoUrl: "https://youtu.be/gzplb3I4X98",
  },
  benefits: {
    title: "Beneficios de Invertir en el sector de Agroindustria",
    items: [
      {
        title: "Abundancia de Recursos Naturales",
        description:
          "Honduras cuenta con más de 1.8 millones de hectáreas cultivables y acceso a agua abundante, proporcionando condiciones óptimas para una agroindustria diversa y productiva.",
        icon: "water_drop",
      },
      {
        title: "Ubicación Estratégica",
        description:
          "Su proximidad a mercados como Estados Unidos, Europa y Asia permite exportaciones rápidas y competitivas, soportadas por infraestructura de clase mundial como Puerto Cortés, uno de los puertos más grandes y seguros de Centroamérica.",
        icon: "public",
      },
      {
        title: "Incentivos para Inversionistas",
        description:
          "Honduras ofrece incentivos atractivos, como exoneraciones fiscales en la importación de maquinaria y equipos agrícolas, así como beneficios comerciales a través de acuerdos como el CAFTA-DR, eliminando aranceles para exportaciones clave.",
        icon: "handshake",
      },
    ],
  },
  guide: null,
};

/** Locale-specific bodies. Missing locales fall back to Spanish (no invented EN copy). */
const SECTOR_PAGE_BODIES: Partial<Record<SectorSlug, Partial<Record<Locale, SectorContentBody>>>> = {
  agroindustria: {
    es: AGROINDUSTRIA_ES,
  },
};

function fromLegacyExtra(slug: SectorSlug, locale: Locale, name: string): SectorContentBody {
  const extra = getSectorPageExtra(slug, locale);
  const headline = [extra.heroTitleBefore, extra.heroTitleAccent, extra.heroTitleAfter]
    .filter(Boolean)
    .join(" ");
  return {
    hero: {
      headline,
      metrics: extra.stats,
    },
    intro: {
      title: extra.valueTitle,
      description: extra.valueLead,
      videoUrl: null,
    },
    benefits: {
      title:
        locale === "es"
          ? `Beneficios de invertir en el sector de ${name}`
          : `Benefits of investing in ${name}`,
      items: extra.advantages.map((item, index) => ({
        title: item.title,
        description: item.text,
        icon: BENEFIT_ICONS[index % BENEFIT_ICONS.length],
      })),
    },
    guide: null,
  };
}

export function getSectorPageContent(slug: SectorSlug, locale: Locale): SectorPageContent {
  const palette = SECTOR_ACCENTS[slug] ?? SECTOR_ACCENTS.agroindustria;
  const name = getSectorDisplayName(locale, slug);
  const localized = SECTOR_PAGE_BODIES[slug]?.[locale] ?? SECTOR_PAGE_BODIES[slug]?.es;
  const body = localized ?? fromLegacyExtra(slug, locale, name);
  return {
    slug,
    name,
    color: palette.accent,
    palette,
    ...body,
  };
}

export const sectorTemplateChrome = {
  es: {
    backToSectors: "Todos los sectores",
    opportunitiesEyebrow: "Cartera de inversión",
    opportunitiesTitle: "Oportunidades de inversión",
    opportunitiesLead: "Oportunidades públicas asociadas a este sector estratégico.",
    opportunitiesEmpty: "Todavía no hay oportunidades publicadas para este sector.",
    opportunitiesError: "No pudimos cargar las oportunidades. Intente de nuevo más tarde.",
    opportunitiesCta: "Ver oportunidad",
    storiesEyebrow: "Resultados de inversión",
    storiesTitle: "Casos de éxito",
    storiesLead: "Empresas e inversiones vinculadas a este sector estratégico.",
    storiesEmpty: "Todavía no hay casos de éxito publicados para este sector.",
    storiesError: "No pudimos cargar los casos de éxito. Intente de nuevo más tarde.",
    projectsEyebrow: "Portafolio activo",
    projectsTitle: "Proyectos de inversión",
    projectsLead: "Proyectos públicos asociados a este sector estratégico.",
    projectsEmpty: "Todavía no hay proyectos publicados para este sector.",
    projectsError: "No pudimos cargar los proyectos. Intente de nuevo más tarde.",
    guideEyebrow: "Recursos",
    guideFallbackTitle: "Guía de inversión",
    guideCta: "Descargar guía",
    videoTitle: "Video del sector",
    otherSectorsEyebrow: "Sigue explorando",
    otherSectorsTitle: "Otros sectores estratégicos",
    catalogCta: "Catálogo completo",
  },
  en: {
    backToSectors: "All sectors",
    opportunitiesEyebrow: "Investment pipeline",
    opportunitiesTitle: "Investment opportunities",
    opportunitiesLead: "Public opportunities associated with this strategic sector.",
    opportunitiesEmpty: "There are no published opportunities for this sector yet.",
    opportunitiesError: "We could not load opportunities right now. Please try again later.",
    opportunitiesCta: "View opportunity",
    storiesEyebrow: "Investor outcomes",
    storiesTitle: "Success stories",
    storiesLead: "Companies and investments connected to this strategic sector.",
    storiesEmpty: "There are no published success stories for this sector yet.",
    storiesError: "We could not load success stories right now. Please try again later.",
    projectsEyebrow: "Active portfolio",
    projectsTitle: "Investment projects",
    projectsLead: "Public projects associated with this strategic sector.",
    projectsEmpty: "There are no published projects for this sector yet.",
    projectsError: "We could not load projects right now. Please try again later.",
    guideEyebrow: "Resources",
    guideFallbackTitle: "Investment guide",
    guideCta: "Download guide",
    videoTitle: "Sector video",
    otherSectorsEyebrow: "Keep exploring",
    otherSectorsTitle: "Other strategic sectors",
    catalogCta: "Full catalog",
  },
} as const;
