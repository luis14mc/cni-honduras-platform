import type { Locale } from "@/src/i18n/config";
import type { PageSeo } from "@/src/lib/seo";

export type ResourceDoc = {
  icon: string;
  title: string;
  text: string;
  featured: boolean;
};

export type ResourceCategory = {
  slug: string;
  seo: PageSeo;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  heroAlt: Record<Locale, string>;
  directoryTitle: Record<Locale, string>;
  docs: Record<Locale, ResourceDoc[]>;
  master: Record<
    Locale,
    {
      tag: string;
      title: string;
      text: string;
      primary: string;
      secondary: string;
    }
  >;
};

const sharedUi = {
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
      "Our team of investment experts is available to guide you through the technical and legal requirements.",
    helpPrimary: "Contact Advisor",
    helpSecondary: "FAQ",
  },
} as const;

export function getResourceCategoryUi(locale: Locale) {
  return sharedUi[locale];
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    slug: "institucional",
    seo: {
      canonical: "/recursos/institucional",
      enMirror: "/en/resources/institutional",
      title: {
        es: "Recursos Institucionales · Documentación Oficial CNI",
        en: "Institutional Resources · Official CNI Documentation",
      },
      description: {
        es: "Memorias anuales, reportes institucionales, marcos de gobernanza y documentación oficial del Consejo Nacional de Inversiones de Honduras.",
        en: "Annual reports, institutional reports, governance frameworks and official documentation from Honduras's National Investment Council.",
      },
      keywords: ["Recursos Institucionales CNI", "Memorias CNI", "Documentación oficial Honduras"],
    },
    title: {
      es: "Recursos Institucionales",
      en: "Institutional Resources",
    },
    description: {
      es: "Compromiso con la transparencia soberana. Acceda a la documentación oficial, marcos legales y reportes técnicos que rigen la inversión estratégica en Honduras.",
      en: "Commitment to sovereign transparency. Access the official documentation, legal frameworks and technical reports that govern strategic investment in Honduras.",
    },
    heroAlt: {
      es: "Documentación institucional del Consejo Nacional de Inversiones de Honduras",
      en: "Institutional documentation of Honduras National Investment Council",
    },
    directoryTitle: {
      es: "Directorio de Documentos Institucionales",
      en: "Institutional Document Directory",
    },
    docs: {
      es: [
        {
          icon: "picture_as_pdf",
          title: "Beneficios de la Ley",
          text: "Análisis detallado de los incentivos fiscales y garantías legales para proyectos de inversión a gran escala.",
          featured: false,
        },
        {
          icon: "picture_as_pdf",
          title: "Servicios Priorizados",
          text: "Catálogo actualizado de sectores estratégicos y servicios estatales con vía rápida para inversores.",
          featured: false,
        },
        {
          icon: "insights",
          title: "Inteligencia de Datos",
          text: "Indicadores macroeconómicos y proyecciones de crecimiento sectorial validadas por el CNI.",
          featured: true,
        },
        {
          icon: "gavel",
          title: "Asesoría Legal",
          text: "Marco normativo integral y procedimientos para la estructuración jurídica de inversiones.",
          featured: false,
        },
        {
          icon: "engineering",
          title: "Asesoría Técnica",
          text: "Guías de implementación técnica y estándares de infraestructura para proyectos nacionales.",
          featured: false,
        },
        {
          icon: "hub",
          title: "Red del Inversionista",
          text: "Protocolos de conexión con socios locales y redes de colaboración público-privada.",
          featured: false,
        },
      ],
      en: [
        {
          icon: "picture_as_pdf",
          title: "Law Benefits",
          text: "Detailed analysis of tax incentives and legal guarantees for large-scale investment projects.",
          featured: false,
        },
        {
          icon: "picture_as_pdf",
          title: "Priority Services",
          text: "Updated catalog of strategic sectors and state services with fast-track for investors.",
          featured: false,
        },
        {
          icon: "insights",
          title: "Data Intelligence",
          text: "Macroeconomic indicators and sector growth projections validated by the CNI.",
          featured: true,
        },
        {
          icon: "gavel",
          title: "Legal Advisory",
          text: "Comprehensive regulatory framework and procedures for legal structuring of investments.",
          featured: false,
        },
        {
          icon: "engineering",
          title: "Technical Advisory",
          text: "Technical implementation guides and infrastructure standards for national projects.",
          featured: false,
        },
        {
          icon: "hub",
          title: "Investor Network",
          text: "Protocols for connecting with local partners and public-private collaboration networks.",
          featured: false,
        },
      ],
    },
    master: {
      es: {
        tag: "Documento Maestro",
        title: "Guía Integral CNI 2024",
        text: "El manual definitivo para navegar el ecosistema de inversión en Honduras. Incluye pasos administrativos, marcos regulatorios y contactos institucionales clave.",
        primary: "Descargar Guía Completa",
        secondary: "Vista Previa Interactiva",
      },
      en: {
        tag: "Master Document",
        title: "CNI Comprehensive Guide 2024",
        text: "The definitive manual for navigating the investment ecosystem in Honduras. Includes administrative steps, regulatory frameworks and key institutional contacts.",
        primary: "Download Full Guide",
        secondary: "Interactive Preview",
      },
    },
  },
  {
    slug: "tecnicos",
    seo: {
      canonical: "/recursos/tecnicos",
      enMirror: "/en/resources/technical",
      title: {
        es: "Recursos para la Inversión · Guías Técnicas y Manuales CNI",
        en: "Investment Resources · CNI Technical Guides and Manuals",
      },
      description: {
        es: "Guías técnicas, manuales de procedimientos y documentos operativos para facilitar el aterrizaje de capital extranjero en Honduras.",
        en: "Technical guides, procedure manuals and operational documents to facilitate foreign capital landing in Honduras.",
      },
      keywords: ["Guías inversión Honduras", "Manuales técnicos CNI", "Procedimientos inversión"],
    },
    title: {
      es: "Recursos para la Inversión",
      en: "Investment Resources",
    },
    description: {
      es: "Herramientas técnicas y manuales operativos para estructurar, implementar y escalar proyectos de inversión con respaldo del CNI en Honduras.",
      en: "Technical tools and operational manuals to structure, implement and scale investment projects with CNI backing in Honduras.",
    },
    heroAlt: {
      es: "Guías técnicas y manuales de inversión del CNI Honduras",
      en: "CNI Honduras technical guides and investment manuals",
    },
    directoryTitle: {
      es: "Directorio de Guías Técnicas",
      en: "Technical Guides Directory",
    },
    docs: {
      es: [
        {
          icon: "menu_book",
          title: "Guía del Inversionista 2024",
          text: "Manual integral para establecer operaciones: registro societario, obligaciones laborales y ventanilla única.",
          featured: true,
        },
        {
          icon: "fact_check",
          title: "Checklist de Prefactibilidad",
          text: "Lista verificable de requisitos técnicos, ambientales y operativos antes del despliegue de capital.",
          featured: false,
        },
        {
          icon: "precision_manufacturing",
          title: "Manual de Nearshoring",
          text: "Procedimientos para manufactura, zonas francas y exportación bajo tratados comerciales vigentes.",
          featured: false,
        },
        {
          icon: "energy_savings_leaf",
          title: "Guía de Energía Renovable",
          text: "Estándares técnicos, permisos y matrices de costo para proyectos solares, eólicos e hidroeléctricos.",
          featured: false,
        },
        {
          icon: "agriculture",
          title: "Protocolo Agroindustrial",
          text: "Requisitos fitosanitarios, trazabilidad y certificaciones para exportación agroindustrial premium.",
          featured: false,
        },
        {
          icon: "domain",
          title: "Manual de Infraestructura",
          text: "Lineamientos para proyectos logísticos, portuarios y de conectividad con acompañamiento del CNI.",
          featured: false,
        },
      ],
      en: [
        {
          icon: "menu_book",
          title: "Investor Guide 2024",
          text: "Comprehensive manual for establishing operations: corporate registration, labor obligations and one-stop desk.",
          featured: true,
        },
        {
          icon: "fact_check",
          title: "Pre-feasibility Checklist",
          text: "Verifiable list of technical, environmental and operational requirements before capital deployment.",
          featured: false,
        },
        {
          icon: "precision_manufacturing",
          title: "Nearshoring Manual",
          text: "Procedures for manufacturing, free zones and export under current trade agreements.",
          featured: false,
        },
        {
          icon: "energy_savings_leaf",
          title: "Renewable Energy Guide",
          text: "Technical standards, permits and cost matrices for solar, wind and hydroelectric projects.",
          featured: false,
        },
        {
          icon: "agriculture",
          title: "Agroindustrial Protocol",
          text: "Phytosanitary requirements, traceability and certifications for premium agroindustrial export.",
          featured: false,
        },
        {
          icon: "domain",
          title: "Infrastructure Manual",
          text: "Guidelines for logistics, port and connectivity projects with CNI support.",
          featured: false,
        },
      ],
    },
    master: {
      es: {
        tag: "Guía Esencial",
        title: "Honduras Investment Guide",
        text: "Documento maestro con marco económico, fiscal y operativo para decidir el despliegue de capital en el país.",
        primary: "Descargar Guía Completa",
        secondary: "Vista Previa Interactiva",
      },
      en: {
        tag: "Essential Guide",
        title: "Honduras Investment Guide",
        text: "Master document with economic, fiscal and operating framework for capital deployment decisions in the country.",
        primary: "Download Full Guide",
        secondary: "Interactive Preview",
      },
    },
  },
  {
    slug: "biblioteca",
    seo: {
      canonical: "/recursos/biblioteca",
      enMirror: "/en/resources/library",
      title: {
        es: "Biblioteca de Documentos · Formularios y Plantillas CNI",
        en: "Document Library · CNI Forms and Templates",
      },
      description: {
        es: "Formularios oficiales, plantillas, boletines trimestrales y material de consulta general para inversionistas en Honduras.",
        en: "Official forms, templates, quarterly bulletins and general reference material for investors in Honduras.",
      },
      keywords: ["Biblioteca CNI", "Formularios inversión Honduras", "Boletines económicos"],
    },
    title: {
      es: "Otros Documentos",
      en: "Other Documents",
    },
    description: {
      es: "Repositorio complementario con formularios diversos, plantillas descargables, boletines económicos y material de consulta general.",
      en: "Complementary repository with various forms, downloadable templates, economic bulletins and general reference material.",
    },
    heroAlt: {
      es: "Biblioteca de documentos y formularios del CNI Honduras",
      en: "CNI Honduras document library and forms",
    },
    directoryTitle: {
      es: "Biblioteca General de Documentos",
      en: "General Document Library",
    },
    docs: {
      es: [
        {
          icon: "description",
          title: "Formulario de Solicitud LPPI",
          text: "Plantilla oficial para solicitar beneficios bajo la Ley de Promoción y Protección de Inversiones.",
          featured: false,
        },
        {
          icon: "description",
          title: "Solicitud de Régimen ZOLI",
          text: "Formato estandarizado para acceder a beneficios fiscales en zonas francas e industriales.",
          featured: false,
        },
        {
          icon: "monitoring",
          title: "Boletín Económico Q3 2024",
          text: "Indicadores macroeconómicos, flujos de IED y análisis sectorial del tercer trimestre.",
          featured: true,
        },
        {
          icon: "monitoring",
          title: "Boletín Sector Energía 2024",
          text: "Matriz renovable, demanda futura y oportunidades de generación distribuida.",
          featured: false,
        },
        {
          icon: "article",
          title: "Plantillas de Due Diligence",
          text: "Formatos para evaluación legal, fiscal y operativa de proyectos de inversión.",
          featured: false,
        },
        {
          icon: "folder_open",
          title: "Archivo Histórico de Prensa",
          text: "Comunicados, misiones comerciales y reportes de promoción internacional archivados.",
          featured: false,
        },
      ],
      en: [
        {
          icon: "description",
          title: "LPPI Application Form",
          text: "Official template to request benefits under the Investment Promotion and Protection Law.",
          featured: false,
        },
        {
          icon: "description",
          title: "ZOLI Regime Application",
          text: "Standardized format to access tax benefits in free and industrial zones.",
          featured: false,
        },
        {
          icon: "monitoring",
          title: "Economic Bulletin Q3 2024",
          text: "Macroeconomic indicators, FDI flows and third-quarter sector analysis.",
          featured: true,
        },
        {
          icon: "monitoring",
          title: "Energy Sector Bulletin 2024",
          text: "Renewable matrix, future demand and distributed generation opportunities.",
          featured: false,
        },
        {
          icon: "article",
          title: "Due Diligence Templates",
          text: "Formats for legal, tax and operational evaluation of investment projects.",
          featured: false,
        },
        {
          icon: "folder_open",
          title: "Press Archive",
          text: "Archived press releases, trade missions and international promotion reports.",
          featured: false,
        },
      ],
    },
    master: {
      es: {
        tag: "Compendio Legal",
        title: "Leyes y Normativas de Inversión 2024",
        text: "Compendio actualizado de leyes, decretos y marcos regulatorios vigentes para inversionistas en Honduras.",
        primary: "Descargar Compendio",
        secondary: "Consultar en Línea",
      },
      en: {
        tag: "Legal Compendium",
        title: "Investment Laws and Regulations 2024",
        text: "Updated compendium of laws, decrees and current regulatory frameworks for investors in Honduras.",
        primary: "Download Compendium",
        secondary: "Browse Online",
      },
    },
  },
];

const categoryMap = new Map(RESOURCE_CATEGORIES.map((c) => [c.slug, c]));

export function getResourceCategory(slug: string): ResourceCategory | undefined {
  return categoryMap.get(slug);
}

export function getAllResourceCategorySlugs(): string[] {
  return RESOURCE_CATEGORIES.map((c) => c.slug);
}
