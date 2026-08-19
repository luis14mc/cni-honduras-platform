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

const AGROINDUSTRIA_EN: SectorContentBody = {
  hero: {
    headline: "Central America’s agricultural production hub",
    metrics: [
      {
        value: "+3,000 MM",
        label:
          "US dollars in exports of agricultural, livestock, forestry, and fisheries products",
      },
      {
        value: "8th",
        label: "coffee exporter worldwide",
      },
      {
        value: "807.5 thousand",
        label: "employees in agriculture, livestock, forestry, and fisheries",
      },
    ],
  },
  intro: {
    title: "Agribusiness",
    description:
      "Honduras stands out as a privileged location for agribusiness, offering a unique combination of exceptional natural resources, sustainable practices, and access to global markets. From traditional crops to high-value-added products, the country is ready to be the strategic partner for your investment.",
    videoUrl: "https://youtu.be/gzplb3I4X98",
  },
  benefits: {
    title: "Benefits of Investing in the Agribusiness Sector",
    items: [
      {
        title: "Abundance of Natural Resources",
        description:
          "Honduras has more than 1.8 million hectares of arable land and abundant water, providing optimal conditions for a diverse and productive agribusiness sector.",
        icon: "water_drop",
      },
      {
        title: "Strategic Location",
        description:
          "Proximity to markets in the United States, Europe, and Asia enables fast, competitive exports, supported by world-class infrastructure such as Puerto Cortés, one of the largest and safest ports in Central America.",
        icon: "public",
      },
      {
        title: "Incentives for Investors",
        description:
          "Honduras offers attractive incentives, including tax exemptions on imports of agricultural machinery and equipment, as well as trade benefits under agreements such as CAFTA-DR, eliminating tariffs on key exports.",
        icon: "handshake",
      },
    ],
  },
  guide: null,
};

const MANUFACTURA_EN: SectorContentBody = {
  hero: {
    headline: "Central America’s nearshoring hub",
    metrics: [
      {
        value: "503.1k",
        label: "employees in manufacturing",
      },
      {
        value: "4.5 million",
        label: "in exports (USD)",
      },
      {
        value: "#2",
        label: "worldwide in harness exports to the United States",
      },
    ],
  },
  intro: {
    title: "Manufacturing",
    description:
      "Honduras has become a key destination for manufacturing, offering a strategic location in the heart of the Americas, competitive costs, and a skilled workforce. Free zones, advanced infrastructure, and preferential access to international markets make the country an ideal setting for light and advanced manufacturing. Honduras is the right place to produce textiles, electronic devices, auto parts, and pharmaceuticals, attracting global companies that seek efficiency and quality.",
    videoUrl: "https://youtu.be/XjbxTvn0Ybs",
  },
  benefits: {
    title: "Benefits of Investing in the Manufacturing Sector",
    items: [
      {
        title: "Strategic geographic position",
        description:
          "Honduras is close to the region’s main market, strengthened by logistics that make exporting easier and reduce transit time and transportation costs.",
        icon: "public",
      },
      {
        title: "Highly skilled and productive workforce",
        description:
          "Honduras has a young, specialized labor force trained in world-class industrial processes, supporting efficient, high-quality production.",
        icon: "groups",
      },
      {
        title: "Network of trade agreements",
        description:
          "Honduras has a favorable network of trade agreements that provide preferential access to key markets such as the United States and the European Union, while expanding business opportunities within the region.",
        icon: "handshake",
      },
    ],
  },
  guide: null,
};

const TURISMO_EN: SectorContentBody = {
  hero: {
    headline:
      "Its beaches, biodiversity, and cultural heritage make Honduras a destination with vast investment opportunities",
    metrics: [
      {
        value: "2.7 million",
        label: "visitors in 2024",
      },
      {
        value: "450+",
        label: "cruise ships visit the country each year",
      },
      {
        value: "802 million",
        label: "in tourism foreign-exchange earnings",
      },
    ],
  },
  intro: {
    title: "Tourism",
    description:
      "With spectacular natural landscapes, a rich cultural heritage, and a growing focus on sustainable tourism, Honduras is one of the most promising destinations for tourism investment in Central America. From paradise beaches to unique cultural enclaves, the country combines visitor appeal with a setting built for expanding businesses.\n\nHonduras stands out as an emerging tourism destination with exceptional investment potential. It offers an impressive range of natural and cultural attractions, from the beaches of Roatán and the rainforests of La Mosquitia to the Maya ruins of Copán, a World Heritage Site. The country has growing infrastructure and a favorable environment for investors, with tax incentives and support programs for tourism development. Rich biodiversity, unique experiences such as diving on the world’s second-largest coral reef, and a vibrant cultural heritage make Honduras an attractive opportunity for investors.",
    videoUrl: "https://youtu.be/CuF6u-CEdnw",
  },
  benefits: {
    title: "Benefits of Investing in the Tourism Sector",
    items: [
      {
        title: "Natural wealth and biodiversity",
        description:
          "Honduras is home to more than 90 protected areas, including national parks, biological reserves, and marine sites. The Bay Islands host the world’s second-largest coral reef and offer unique diving and snorkeling.",
        icon: "forest",
      },
      {
        title: "Cultural and archaeological heritage",
        description:
          "The Maya ruins of Copán, a UNESCO World Heritage Site, attract thousands of visitors each year. Living traditions of Garifuna, Lenca, and mestizo communities are well suited to immersive cultural experiences.",
        icon: "account_balance",
      },
      {
        title: "Its people",
        description:
          "Honduras has a workforce trained in tourism and hospitality, with programs developed alongside local and international institutions, generating 287 thousand jobs.",
        icon: "groups",
      },
    ],
  },
  guide: null,
};

const ENERGIA_EN: SectorContentBody = {
  hero: {
    headline: "Clean Energy for a Sustainable Future",
    metrics: [
      {
        value: "53%",
        label: "of Honduras’s energy matrix comes from renewables",
      },
      {
        value: "3.5–4%",
        label: "projected growth in electricity demand over the next 5–10 years",
      },
      {
        value: "70%",
        label: "of the country has high solar potential (vs. 20% worldwide)",
      },
    ],
  },
  intro: {
    title: "Energy",
    description:
      "Honduras has become a regional leader in renewable power generation, including solar, wind, and hydroelectric sources. Favorable regulatory frameworks, abundant natural resources, and steadily growing energy demand make this sector an unmatched opportunity for investors. Integration into the Central American Electrical Interconnection System (SIEPAC) also expands the potential to export energy across the region.",
    videoUrl: "https://youtu.be/wbBNwUCdkRc",
  },
  benefits: {
    title: "Benefits of Investing in the Energy Sector",
    items: [
      {
        title: "Diversity of sources",
        description:
          "Honduras has a climate and geography that favor solar, wind, and hydroelectric generation, supporting a sustainable energy supply.",
        icon: "wb_sunny",
      },
      {
        title: "Solid regulatory framework",
        description:
          "The Honduran government promotes investment in renewables through laws that grant tax exemptions and benefits, creating favorable conditions to finance and implement clean-energy projects and a faster, more attractive return on investment.",
        icon: "gavel",
      },
      {
        title: "Growing demand and exports",
        description:
          "Local energy demand continues to rise, while SIEPAC enables exports to other countries in the region.",
        icon: "bolt",
      },
    ],
  },
  guide: null,
};

const INFRAESTRUCTURA_EN: SectorContentBody = {
  hero: {
    headline: "Connectivity and Development to Power Your Business",
    metrics: [
      {
        value: "8",
        label: "logistics corridors connecting Honduras",
      },
      {
        value: "+19.7 km",
        label: "of roads connecting the country",
      },
      {
        value: "8 hours",
        label: "connecting the Atlantic and the Pacific",
      },
    ],
  },
  intro: {
    title: "Infrastructure",
    description:
      "Honduras is investing in the modernization and expansion of its infrastructure, from roads and bridges to airports and seaports. The country aims to improve internal and regional connectivity to strengthen trade, tourism, and competitiveness. Public-private partnerships, government incentives, and growing interest in the region give the infrastructure sector numerous opportunities for local and international investors.",
    videoUrl: "https://youtu.be/j4IpoLINxt0",
  },
  benefits: {
    title: "Benefits of Investing in the Infrastructure Sector",
    items: [
      {
        title: "Sustainable and urban development",
        description:
          "Expansion plans consider sustainability and the improvement of urban areas, promoting modern infrastructure that is resilient to environmental challenges.",
        icon: "apartment",
      },
      {
        title: "Regional transport hub",
        description:
          "Located in the heart of Central America, Honduras is the natural bridge between North and South America, a key geographic advantage for distribution and trade.",
        icon: "hub",
      },
      {
        title: "Honduras leads the region in the World Bank Logistics Performance Index",
        description:
          "Honduras ranks as the regional leader in the Logistics Performance Index, with a score of 2.90 in the World Bank’s latest report. This recognition reflects progress in infrastructure, customs efficiency, and connectivity, consolidating the country as a strategic destination for trade and investment.",
        icon: "emoji_events",
      },
    ],
  },
  guide: null,
};

/** Missing locales fall back to Spanish. Logística still uses legacy extras until a brief is approved. */
const SECTOR_PAGE_BODIES: Partial<Record<SectorSlug, Partial<Record<Locale, SectorContentBody>>>> = {
  agroindustria: {
    es: AGROINDUSTRIA_ES,
    en: AGROINDUSTRIA_EN,
  },
  manufactura: {
    es: MANUFACTURA_ES,
    en: MANUFACTURA_EN,
  },
  turismo: {
    es: TURISMO_ES,
    en: TURISMO_EN,
  },
  energia: {
    es: ENERGIA_ES,
    en: ENERGIA_EN,
  },
  infraestructura: {
    es: INFRAESTRUCTURA_ES,
    en: INFRAESTRUCTURA_EN,
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
