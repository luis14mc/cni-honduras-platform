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

const MANUFACTURA_ES: SectorContentBody = {
  hero: {
    headline: "El hub de nearshoring en Centroamérica",
    metrics: [
      {
        value: "503.1k",
        label: "Empleados en Manufactura",
      },
      {
        value: "4.5 Millones",
        label: "en exportación (USD)",
      },
      {
        value: "#2",
        label: "a nivel mundial en exportación de arneses a EE.UU.",
      },
    ],
  },
  intro: {
    title: "Manufactura",
    description:
      "Honduras se ha posicionado como un destino clave para la manufactura, ofreciendo una ubicación estratégica en el corazón de las Américas, costos competitivos y una fuerza laboral calificada. La combinación de zonas francas, infraestructura avanzada y acceso preferencial a mercados internacionales convierte al país en un entorno ideal para la manufactura ligera y avanzada. Honduras es el lugar ideal para la producción de textiles, dispositivos electrónicos, autopartes y productos farmacéuticos, atrayendo a empresas globales que buscan eficiencia y calidad.",
    videoUrl: "https://youtu.be/XjbxTvn0Ybs",
  },
  benefits: {
    title: "Beneficios de Invertir en el sector de Manufactura",
    items: [
      {
        title: "Posicionamiento geográfico estratégico",
        description:
          "Honduras tiene una cercanía al principal mercado de la región que se potencia con facilidades logísticas que facilitan la exportación y reducen el tiempo de transición y los costos de transporte.",
        icon: "public",
      },
      {
        title: "Mano de obra altamente capacitada y productiva",
        description:
          "Honduras cuenta con una fuerza laboral joven y especializada, entrenada en procesos industriales de clase mundial, lo que asegura una producción eficiente y de alta calidad.",
        icon: "groups",
      },
      {
        title: "Red de Acuerdos Comerciales",
        description:
          "Honduras cuenta con una red de acuerdos comerciales favorables que proporcionan un acceso preferencial a mercados clave, como Estados Unidos y la Unión Europea, a la vez que amplían las oportunidades de negocios dentro de la región.",
        icon: "handshake",
      },
    ],
  },
  guide: null,
};

const TURISMO_ES: SectorContentBody = {
  hero: {
    headline:
      "Sus playas, biodiversidad y patrimonio cultural hacen de Honduras un destino con vastas oportunidades de inversión",
    metrics: [
      {
        value: "2.7 millones",
        label: "de visitantes en 2024",
      },
      {
        value: "450+",
        label: "cruceros visitan el país anualmente",
      },
      {
        value: "802 millones",
        label: "de ingresos de divisas por turismo",
      },
    ],
  },
  intro: {
    title: "Turismo",
    description:
      "Con paisajes naturales espectaculares, una rica herencia cultural y un creciente enfoque en turismo sostenible, Honduras se posiciona como uno de los destinos más prometedores para la inversión turística en Centroamérica. Desde playas paradisíacas hasta enclaves culturales únicos, el país combina atractivo turístico con un entorno ideal para negocios en expansión.\n\nHonduras se destaca como un destino turístico emergente con un potencial de inversión excepcional. Ofrece una impresionante variedad de atractivos naturales y culturales, desde las paradisíacas playas de Roatán y las exuberantes selvas de La Mosquitia, hasta las ruinas mayas de Copán, Patrimonio de la Humanidad. El país presenta una infraestructura en crecimiento y un entorno favorable para los inversores, con incentivos fiscales y programas de apoyo para el desarrollo turístico. La rica biodiversidad, las experiencias únicas como el buceo en el segundo arrecife de coral más grande del mundo, y el vibrante patrimonio cultural hacen de Honduras una oportunidad atractiva para los inversores.",
    videoUrl: "https://youtu.be/CuF6u-CEdnw",
  },
  benefits: {
    title: "Beneficios de Invertir en el sector de turismo",
    items: [
      {
        title: "Riqueza Natural y Biodiversidad",
        description:
          "Honduras alberga más de 90 áreas protegidas, incluyendo parques nacionales, reservas biológicas y sitios marinos. Islas de la Bahía es el hogar del segundo arrecife de coral más grande del mundo, ofrecen actividades únicas como buceo y snorkel.",
        icon: "forest",
      },
      {
        title: "Herencia Cultural y Arqueológica",
        description:
          "Las ruinas mayas de Copán, declaradas Patrimonio de la Humanidad por la UNESCO, atraen a miles de turistas al año. Tradiciones vivas y auténticas de comunidades garífunas, lencas y mestizas, ideales para experiencias culturales inmersivas.",
        icon: "account_balance",
      },
      {
        title: "Su gente",
        description:
          "Honduras cuenta con una fuerza laboral capacitada en turismo y hospitalidad, con programas de formación en colaboración con instituciones locales e internacionales. Generando 287 mil empleos.",
        icon: "groups",
      },
    ],
  },
  guide: null,
};

const ENERGIA_ES: SectorContentBody = {
  hero: {
    headline: "Energía Limpia para un Futuro Sostenible",
    metrics: [
      {
        value: "53%",
        label: "de la matriz energética de Honduras proviene de renovables",
      },
      {
        value: "3.5–4%",
        label: "Proyección de crecimiento de la demanda eléctrica en los próximos 5-10 años",
      },
      {
        value: "70%",
        label: "del país tiene alto potencial solar (vs. 20% mundial)",
      },
    ],
  },
  intro: {
    title: "Energía",
    description:
      "Honduras se ha convertido en uno de los líderes regionales en generación de energía a partir de fuentes renovables, incluyendo la solar, eólica e hidroeléctrica. La combinación de marcos regulatorios favorables, recursos naturales abundantes y una demanda energética en constante crecimiento hace de este sector una oportunidad inigualable para inversionistas. Además, la integración al Sistema de Interconexión Eléctrica de los Países de América Central (SIEPAC) amplía las posibilidades de exportación de energía a nivel regional.",
    videoUrl: "https://youtu.be/wbBNwUCdkRc",
  },
  benefits: {
    title: "Beneficios de Invertir en el sector de Energía",
    items: [
      {
        title: "Diversidad de Fuentes",
        description:
          "Honduras cuenta con un clima y geografía que favorece la generación de energía solar, eólica e hidroeléctrica, garantizando un abastecimiento energético sostenible.",
        icon: "wb_sunny",
      },
      {
        title: "Marco Regulatorio Sólido",
        description:
          "El gobierno hondureño impulsa la inversión en energías renovables mediante leyes que otorgan exenciones y beneficios fiscales, creando un entorno favorable para el financiamiento y la implementación de proyectos de energía limpia, lo que facilita un retorno de inversión más rápido y atractivo.",
        icon: "gavel",
      },
      {
        title: "Creciente Demanda y Exportación",
        description:
          "La demanda local de energía continúa en ascenso, mientras que el SIEPAC permite la exportación hacia otros países de la región.",
        icon: "bolt",
      },
    ],
  },
  guide: null,
};

const INFRAESTRUCTURA_ES: SectorContentBody = {
  hero: {
    headline: "Conectividad y Desarrollo para Impulsar tu Negocio",
    metrics: [
      {
        value: "8",
        label: "Corredores logísticos que conectan Honduras",
      },
      {
        value: "+19.7 km",
        label: "de carreteras que conectan el país",
      },
      {
        value: "8 horas",
        label: "de conexión entre el Atlántico y el Pacífico",
      },
    ],
  },
  intro: {
    title: "Infraestructura",
    description:
      "Honduras está apostando por la modernización y expansión de su infraestructura, abarcando desde carreteras y puentes, hasta aeropuertos y puertos marítimos. El país busca mejorar la conectividad interna y regional para fortalecer el comercio, el turismo y la competitividad. Gracias a alianzas público-privadas, incentivos gubernamentales y un creciente interés por la región, el sector infraestructura ofrece numerosas oportunidades para inversionistas locales e internacionales.",
    videoUrl: "https://youtu.be/j4IpoLINxt0",
  },
  benefits: {
    title: "Beneficios de Invertir en el sector de infraestructura",
    items: [
      {
        title: "Desarrollo Sostenible y Urbano",
        description:
          "Los planes de expansión consideran la sostenibilidad y el mejoramiento de zonas urbanas, promoviendo infraestructura moderna y resiliente ante desafíos ambientales.",
        icon: "apartment",
      },
      {
        title: "Hub Regional de Transporte",
        description:
          "Honduras, ubicada en el corazón de Centroamérica, es el puente natural entre Norteamérica y Sudamérica, una ventaja geográfica clave para la distribución y el intercambio comercial.",
        icon: "hub",
      },
      {
        title: "Honduras lidera la región en el Índice de Desempeño Logístico, según el Banco Mundial",
        description:
          "Honduras se posiciona como el país líder en la región en el Índice de Desempeño Logístico, alcanzando una calificación de 2.90, según el más reciente informe del Banco Mundial. Este reconocimiento refleja los avances en infraestructura, eficiencia aduanera y conectividad del país, consolidándolo como un destino estratégico para el comercio y la inversión.",
        icon: "emoji_events",
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
  manufactura: {
    es: MANUFACTURA_ES,
  },
  turismo: {
    es: TURISMO_ES,
  },
  energia: {
    es: ENERGIA_ES,
  },
  infraestructura: {
    es: INFRAESTRUCTURA_ES,
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
