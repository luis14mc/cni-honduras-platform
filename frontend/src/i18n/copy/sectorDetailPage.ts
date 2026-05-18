import type { Locale } from "@/src/i18n/config";
import type { SectorSlug } from "@/src/data/investmentSectors";

export type SectorPageExtra = {
  heroBadge: string;
  heroTitleBefore: string;
  heroTitleAccent: string;
  heroTitleAfter: string;
  stats: ReadonlyArray<{ value: string; label: string }>;
  valueTitle: string;
  valueLead: string;
  advantages: ReadonlyArray<{ title: string; text: string; wide?: boolean }>;
  analysisEyebrow: string;
  analysisTitle: string;
  analysisIntro: string;
  backToSectors: string;
};

const DETAIL: Record<SectorSlug, Record<Locale, SectorPageExtra>> = {
  agroindustria: {
    es: {
      heroBadge: "Sector económico estratégico",
      heroTitleBefore: "Análisis de agronegocios:",
      heroTitleAccent: "Cultivando el futuro",
      heroTitleAfter: "",
      stats: [
        { value: "$1.2B", label: "IED del sector (referencia)" },
        { value: "2.5M ha", label: "Tierra arable" },
        { value: "12", label: "Microclimas" },
      ],
      valueTitle: "La ventaja soberana",
      valueLead:
        "Panorama de agronegocios con eficiencia, accesibilidad y marco regulatorio orientado a la longevidad institucional.",
      advantages: [
        {
          title: "Exportación estratégica",
          text: "Red logística con acceso a puertos de aguas profundas hacia EE. UU. y la UE, acortando tiempos de tránsito frente a pares regionales.",
        },
        {
          title: "Resiliencia climática",
          text: "Diversidad de microclimas que permiten producción durante todo el año de cultivos de alto valor.",
        },
        {
          title: "Marco de incentivos",
          text: "Exenciones para agroexportación, importación de equipos con arancel cero y acompañamiento LPPI/ZOLI.",
          wide: true,
        },
      ],
      analysisEyebrow: "Referencia de mercado",
      analysisTitle: "Dominio de cultivos clave",
      analysisIntro: "Café, cacao y palma sostenible articulados con certificación y trazabilidad para mercados premium.",
      backToSectors: "← Todos los sectores",
    },
    en: {
      heroBadge: "Strategic economic sector",
      heroTitleBefore: "Agribusiness analysis:",
      heroTitleAccent: "Growing the future",
      heroTitleAfter: "",
      stats: [
        { value: "$1.2B", label: "Sector FDI (reference)" },
        { value: "2.5M ha", label: "Arable land" },
        { value: "12", label: "Microclimates" },
      ],
      valueTitle: "The sovereign edge",
      valueLead:
        "An agribusiness landscape built on efficiency, access, and a regulatory framework designed for institutional longevity.",
      advantages: [
        {
          title: "Strategic exports",
          text: "Logistics network with deep-water port access to the U.S. and EU, shortening transit times versus regional peers.",
        },
        {
          title: "Climate resilience",
          text: "Microclimate diversity enabling year-round production of high-value crops.",
        },
        {
          title: "Incentive framework",
          text: "Agro-export exemptions, zero-duty equipment imports, and LPPI/ZOLI institutional support.",
          wide: true,
        },
      ],
      analysisEyebrow: "Market reference",
      analysisTitle: "Core crop leadership",
      analysisIntro: "Coffee, cocoa, and sustainable palm aligned with certification and traceability for premium markets.",
      backToSectors: "← All sectors",
    },
  },
  manufactura: {
    es: {
      heroBadge: "Nearshoring CAFTA-DR",
      heroTitleBefore: "Manufactura y ensamble:",
      heroTitleAccent: "Hub continental",
      heroTitleAfter: "",
      stats: [
        { value: "48h", label: "Ventana a EE. UU." },
        { value: "ZOLI", label: "Régimen preferencial" },
        { value: "Top 3", label: "Exportación textil regional" },
      ],
      valueTitle: "Eficiencia operativa",
      valueLead: "Ecosistema de zonas libres, talento técnico y cadena de suministro integrada para OEM y confección.",
      advantages: [
        {
          title: "Zero-Duty",
          text: "Acceso preferencial bajo CAFTA-DR para categorías clave de confección y ensamble.",
        },
        {
          title: "Automatización",
          text: "Parques industriales con estándares de clase mundial y servicios 3PL consolidados.",
        },
        {
          title: "Talento técnico",
          text: "Formación en mecatrónica, calidad y normas internacionales de planta.",
          wide: true,
        },
      ],
      analysisEyebrow: "Cadena de valor",
      analysisTitle: "De la materia prima al retail",
      analysisIntro: "Integración con compradores norteamericanos y certificación social para marcas globales.",
      backToSectors: "← Todos los sectores",
    },
    en: {
      heroBadge: "CAFTA-DR nearshoring",
      heroTitleBefore: "Manufacturing & assembly:",
      heroTitleAccent: "Continental hub",
      heroTitleAfter: "",
      stats: [
        { value: "48h", label: "U.S. market window" },
        { value: "ZOLI", label: "Preferential regime" },
        { value: "Top 3", label: "Regional textile exports" },
      ],
      valueTitle: "Operational efficiency",
      valueLead: "Free zones, technical talent, and an integrated supply chain for OEM and apparel.",
      advantages: [
        {
          title: "Zero-Duty",
          text: "Preferential access under CAFTA-DR for key apparel and light assembly categories.",
        },
        {
          title: "Automation",
          text: "Industrial parks with world-class standards and consolidated 3PL services.",
        },
        {
          title: "Technical talent",
          text: "Training in mechatronics, quality, and international plant standards.",
          wide: true,
        },
      ],
      analysisEyebrow: "Value chain",
      analysisTitle: "From raw materials to retail",
      analysisIntro: "Integration with North American buyers and social certification for global brands.",
      backToSectors: "← All sectors",
    },
  },
  turismo: {
    es: {
      heroBadge: "Hospitalidad soberana",
      heroTitleBefore: "Turismo de alto valor:",
      heroTitleAccent: "Naturaleza y cultura",
      heroTitleAfter: "",
      stats: [
        { value: "2M+", label: "Visitantes anuales (referencia)" },
        { value: "UNESCO", label: "Patrimonio Copán" },
        { value: "Top 10", label: "Buceo en Caribe" },
      ],
      valueTitle: "Activos irreplicables",
      valueLead: "Islas, arrecifes y patrimonio vivo con conectividad aérea y producto hotelero en expansión.",
      advantages: [
        {
          title: "Eco-lujo",
          text: "Certificación y operadores boutique con huella medida y experiencias premium.",
        },
        {
          title: "Conectividad",
          text: "Vuelos directos a hubs internacionales y segunda residencia para ejecutivos.",
        },
        {
          title: "Incentivos",
          text: "LPPI y articulación municipal para proyectos hoteleros y marina.",
          wide: true,
        },
      ],
      analysisEyebrow: "Mercados emisores",
      analysisTitle: "Roatán, Copán y corredor continental",
      analysisIntro: "Segmentación por cruceros, turismo de reuniones y naturaleza con datos del CNI.",
      backToSectors: "← Todos los sectores",
    },
    en: {
      heroBadge: "Sovereign hospitality",
      heroTitleBefore: "High-value tourism:",
      heroTitleAccent: "Nature & culture",
      heroTitleAfter: "",
      stats: [
        { value: "2M+", label: "Annual visitors (reference)" },
        { value: "UNESCO", label: "Copán heritage" },
        { value: "Top 10", label: "Caribbean diving" },
      ],
      valueTitle: "Irreplaceable assets",
      valueLead: "Islands, reefs, and living heritage with air connectivity and a growing hotel product.",
      advantages: [
        {
          title: "Eco-luxury",
          text: "Certification and boutique operators with measured footprint and premium experiences.",
        },
        {
          title: "Connectivity",
          text: "Direct flights to international hubs and second-home demand from executives.",
        },
        {
          title: "Incentives",
          text: "LPPI and municipal coordination for hotel and marina projects.",
          wide: true,
        },
      ],
      analysisEyebrow: "Source markets",
      analysisTitle: "Roatán, Copán, and the mainland corridor",
      analysisIntro: "Cruise, MICE, and nature segments with CNI intelligence.",
      backToSectors: "← All sectors",
    },
  },
  energia: {
    es: {
      heroBadge: "Análisis de energía",
      heroTitleBefore: "El poder de la",
      heroTitleAccent: "matriz limpia",
      heroTitleAfter: "",
      stats: [
        { value: "~60%", label: "Renovables (referencia)" },
        { value: "3.5–4%", label: "Demanda anual" },
        { value: "PPA", label: "Contratos largo plazo" },
      ],
      valueTitle: "Mandato de energía limpia",
      valueLead: "Solar, eólico e hidro con marco legal para PPA y expansión de red regional.",
      advantages: [
        {
          title: "Marco legal",
          text: "LPPI y reglas sectoriales para inversión en generación y almacenamiento.",
        },
        {
          title: "Estabilidad de red",
          text: "Proyectos de refuerzo y interconexión para reducir pérdidas técnicas.",
        },
        {
          title: "Recursos",
          text: "Irradiación solar costera y corredores eólicos con recurso comprobado.",
          wide: true,
        },
      ],
      analysisEyebrow: "Transición",
      analysisTitle: "Hidrógeno y almacenamiento",
      analysisIntro: "Ventanas de inversión en baterías y proyectos híbridos bajo supervisión institucional.",
      backToSectors: "← Todos los sectores",
    },
    en: {
      heroBadge: "Energy analysis",
      heroTitleBefore: "The power of a",
      heroTitleAccent: "clean matrix",
      heroTitleAfter: "",
      stats: [
        { value: "~60%", label: "Renewables (reference)" },
        { value: "3.5–4%", label: "Annual demand" },
        { value: "PPA", label: "Long-term contracts" },
      ],
      valueTitle: "The clean-energy mandate",
      valueLead: "Solar, wind, and hydro with legal frameworks for PPAs and regional grid expansion.",
      advantages: [
        {
          title: "Legal framework",
          text: "LPPI and sector rules for generation and storage investment.",
        },
        {
          title: "Grid stability",
          text: "Reinforcement and interconnection projects to reduce technical losses.",
        },
        {
          title: "Resources",
          text: "Coastal solar irradiance and wind corridors with proven resource.",
          wide: true,
        },
      ],
      analysisEyebrow: "Transition",
      analysisTitle: "Hydrogen and storage",
      analysisIntro: "Investment windows in batteries and hybrid projects under institutional oversight.",
      backToSectors: "← All sectors",
    },
  },
  infraestructura: {
    es: {
      heroBadge: "Información primordial",
      heroTitleBefore: "Sector de Infraestructura:",
      heroTitleAccent: "Conectividad Global",
      heroTitleAfter: "",
      stats: [
        { value: "78.6%", label: "Movimiento portuario" },
        { value: "11", label: "Tratados comerciales" },
        { value: "ZOLI", label: "Corredores logísticos" },
      ],
      valueTitle: "Puertos, carreteras y energía",
      valueLead:
        "Honduras articula la inversión productiva con conectividad multimodal: Puerto Cortés, redes eléctricas y proyectos de escala bajo marco LPPI.",
      advantages: [
        {
          title: "Puerto Cortés",
          text: "El puerto más eficiente del Caribe con capacidad de expansión y servicios integrados.",
        },
        {
          title: "Corredor logístico",
          text: "Acceso terrestre a Centroamérica y conexión preferencial con Norteamérica.",
        },
        {
          title: "Alianzas PPP",
          text: "Modelos público-privados con acompañamiento institucional del CNI.",
          wide: true,
        },
      ],
      analysisEyebrow: "Proyectos",
      analysisTitle: "Infraestructura habilitante",
      analysisIntro: "Portafolio de obras y zonas logísticas listas para inversión extranjera directa.",
      backToSectors: "← Todos los sectores",
    },
    en: {
      heroBadge: "Primary intelligence",
      heroTitleBefore: "Infrastructure sector:",
      heroTitleAccent: "Global connectivity",
      heroTitleAfter: "",
      stats: [
        { value: "78.6%", label: "Port throughput" },
        { value: "11", label: "Trade treaties" },
        { value: "ZOLI", label: "Logistics corridors" },
      ],
      valueTitle: "Ports, roads, and energy",
      valueLead:
        "Honduras links productive investment with multimodal connectivity: Puerto Cortés, power grids, and large-scale projects under LPPI.",
      advantages: [
        {
          title: "Puerto Cortés",
          text: "The Caribbean’s most efficient port with expansion capacity and integrated services.",
        },
        {
          title: "Logistics corridor",
          text: "Land access across Central America and preferential links to North America.",
        },
        {
          title: "PPP partnerships",
          text: "Public-private models with institutional support from the CNI.",
          wide: true,
        },
      ],
      analysisEyebrow: "Projects",
      analysisTitle: "Enabling infrastructure",
      analysisIntro: "Portfolio of works and logistics zones ready for foreign direct investment.",
      backToSectors: "← All sectors",
    },
  },
};

export function getSectorPageExtra(slug: SectorSlug, locale: Locale): SectorPageExtra {
  return DETAIL[slug][locale];
}
