import type { Locale } from "@/src/i18n/config";
import type { DocumentCategory } from "@/src/types/cms";
import type { PageSeo } from "@/src/lib/seo";

export type ResourceCategoryMeta = {
  slug: DocumentCategory;
  seo: PageSeo;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  heroAlt: Record<Locale, string>;
  directoryTitle: Record<Locale, string>;
};

const CATEGORY_SLUGS: DocumentCategory[] = [
  "institucional",
  "tecnicos",
  "biblioteca",
  "estudios",
];

export const RESOURCE_CATEGORY_META: ResourceCategoryMeta[] = [
  {
    slug: "institucional",
    seo: {
      canonical: "/recursos/institucional",
      enMirror: "/en/resources/institutional",
      title: { es: "Recursos Institucionales", en: "Institutional Resources" },
      description: {
        es: "Documentación oficial del Consejo Nacional de Inversiones de Honduras.",
        en: "Official documentation from the National Investment Council of Honduras.",
      },
    },
    title: { es: "Recursos Institucionales", en: "Institutional Resources" },
    description: {
      es: "Documentación institucional del Consejo Nacional de Inversiones de Honduras.",
      en: "Institutional documentation from the National Investment Council of Honduras.",
    },
    heroAlt: { es: "Recursos institucionales CNI", en: "CNI institutional resources" },
    directoryTitle: {
      es: "Directorio de Documentos Institucionales",
      en: "Institutional Document Directory",
    },
  },
  {
    slug: "tecnicos",
    seo: {
      canonical: "/recursos/tecnicos",
      enMirror: "/en/resources/technical",
      title: { es: "Recursos Técnicos", en: "Technical Resources" },
      description: {
        es: "Guías técnicas y manuales para facilitar la inversión en Honduras.",
        en: "Technical guides and manuals to facilitate investment in Honduras.",
      },
    },
    title: { es: "Recursos para la Inversión", en: "Investment Resources" },
    description: {
      es: "Guías técnicas y manuales de procedimientos para facilitar el aterrizaje de capital.",
      en: "Technical guides and procedure manuals to facilitate capital landing.",
    },
    heroAlt: { es: "Recursos técnicos CNI", en: "CNI technical resources" },
    directoryTitle: { es: "Biblioteca Técnica", en: "Technical Library" },
  },
  {
    slug: "biblioteca",
    seo: {
      canonical: "/recursos/biblioteca",
      enMirror: "/en/resources/library",
      title: { es: "Biblioteca de Documentos", en: "Document Library" },
      description: {
        es: "Formularios, plantillas y material de consulta general.",
        en: "Forms, templates and general consultation material.",
      },
    },
    title: { es: "Otros Documentos", en: "Other Documents" },
    description: {
      es: "Formularios diversos, plantillas y material de consulta general.",
      en: "Various forms, templates and general consultation material.",
    },
    heroAlt: { es: "Biblioteca CNI", en: "CNI library" },
    directoryTitle: { es: "Biblioteca General de Documentos", en: "General Document Library" },
  },
  {
    slug: "estudios",
    seo: {
      canonical: "/recursos/estudios",
      enMirror: "/en/resources/studies",
      title: { es: "Estudios Sectoriales", en: "Sector Studies" },
      description: {
        es: "Estudios de mercado y análisis sectoriales del CNI.",
        en: "Market studies and sector analyses from the CNI.",
      },
    },
    title: { es: "Estudios CNI", en: "CNI Studies" },
    description: {
      es: "Estudios sectoriales y análisis de mercado para inversionistas.",
      en: "Sector studies and market analysis for investors.",
    },
    heroAlt: { es: "Estudios CNI", en: "CNI studies" },
    directoryTitle: { es: "Estudios Disponibles", en: "Available Studies" },
  },
];

export function getAllResourceCategorySlugs(): string[] {
  return CATEGORY_SLUGS;
}

export function getResourceCategoryMeta(slug: string): ResourceCategoryMeta | undefined {
  return RESOURCE_CATEGORY_META.find((item) => item.slug === slug);
}

export const resourceCategoryUi = {
  es: {
    backToList: "Volver a Recursos",
    eyebrow: "Repositorio Digital",
    directoryEyebrow: "Repositorio Digital",
    search: "Buscar documentos...",
    download: "Descargar",
    view: "Ver Documento",
    helpTitle: "¿Necesita asistencia personalizada?",
    helpText:
      "Nuestro equipo de expertos en inversión está disponible para guiarle a través de los requisitos técnicos y legales.",
    helpPrimary: "Contactar Asesor",
    helpSecondary: "Preguntas Frecuentes",
    empty: "No hay documentos publicados en esta categoría por el momento.",
  },
  en: {
    backToList: "Back to Resources",
    eyebrow: "Digital Repository",
    directoryEyebrow: "Digital Repository",
    search: "Search documents...",
    download: "Download",
    view: "View Document",
    helpTitle: "Need personalized assistance?",
    helpText:
      "Our investment experts team is available to guide you through technical and legal requirements.",
    helpPrimary: "Contact Advisor",
    helpSecondary: "FAQ",
    empty: "There are no published documents in this category yet.",
  },
} as const;
