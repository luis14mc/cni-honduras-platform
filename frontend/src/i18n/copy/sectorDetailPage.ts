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
      heroBadge: "Agroindustria",
      heroTitleBefore: "El hub de producción agrícola",
      heroTitleAccent: "en Centroamérica",
      heroTitleAfter: "",
      stats: [
        { value: "+3,000 MM", label: "Exportaciones agrícolas, ganaderas, silvícolas y pesqueras" },
        { value: "8.º", label: "Exportador de café a nivel mundial" },
        { value: "807.5 mil", label: "Empleos en agricultura, ganadería, silvicultura y pesca" },
      ],
      valueTitle: "Agroindustria",
      valueLead:
        "Honduras se posiciona como una ubicación destacada y privilegiada para la agroindustria, ofreciendo una combinación única de recursos naturales excepcionales, prácticas sostenibles y acceso a mercados globales. Desde cultivos tradicionales hasta productos de alto valor agregado, el país está listo para ser el aliado estratégico de tu inversión.",
      advantages: [
        {
          title: "Abundancia de Recursos Naturales",
          text: "Honduras cuenta con más de 1.8 millones de hectáreas cultivables y acceso a agua abundante, proporcionando condiciones óptimas para una agroindustria diversa y productiva.",
        },
        {
          title: "Ubicación Estratégica",
          text: "Su proximidad a mercados como Estados Unidos, Europa y Asia permite exportaciones rápidas y competitivas, soportadas por infraestructura de clase mundial como Puerto Cortés, uno de los puertos más grandes y seguros de Centroamérica.",
        },
        {
          title: "Incentivos para Inversionistas",
          text: "Honduras ofrece incentivos atractivos, como exoneraciones fiscales en la importación de maquinaria y equipos agrícolas, así como beneficios comerciales a través de acuerdos como el CAFTA-DR, eliminando aranceles para exportaciones clave.",
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
  logistica: {
    es: {
      heroBadge: "Nodo logístico continental",
      heroTitleBefore: "Logística y Transporte:",
      heroTitleAccent: "Dos costas,",
      heroTitleAfter: "un solo corredor.",
      stats: [
        { value: "78.6%", label: "Movimiento portuario nacional" },
        { value: "48h", label: "Ventana a mercados EE.UU." },
        { value: "2", label: "Costos · Atlántico y Pacífico" },
      ],
      valueTitle: "Conectividad multimodal de clase mundial",
      valueLead:
        "Honduras opera como puente logístico entre los océanos, integrando puertos de aguas profundas, corredores secos, nodos ZOLI y servicios de valor agregado para el comercio regional.",
      advantages: [
        {
          title: "Puerto Cortés",
          text: "Principal puerto del Caribe Centroamericano con capacidad de expansión, dragado profundo y servicios 24/7.",
        },
        {
          title: "Corredor Pacífico",
          text: "Acceso terrestre a puertos del Pacífico y conexión logística con Centroamérica y México.",
        },
        {
          title: "Servicios 3PL y ZOLI",
          text: "Nodos de distribución, empaque, etiquetado y consolidación bajo regímenes aduaneros preferenciales.",
          wide: true,
        },
      ],
      analysisEyebrow: "Operaciones",
      analysisTitle: "Cadena de suministro nearshoring",
      analysisIntro: "Optimización de inventarios, tiempos puerto-a-puerta y servicios de valor agregado para marcas globales.",
      backToSectors: "← Todos los sectores",
    },
    en: {
      heroBadge: "Continental logistics hub",
      heroTitleBefore: "Logistics & Transport:",
      heroTitleAccent: "Two coasts,",
      heroTitleAfter: "one corridor.",
      stats: [
        { value: "78.6%", label: "National port throughput" },
        { value: "48h", label: "Window to U.S. markets" },
        { value: "2", label: "Coasts · Atlantic & Pacific" },
      ],
      valueTitle: "World-class multimodal connectivity",
      valueLead:
        "Honduras operates as a logistics bridge between oceans, integrating deep-water ports, dry corridors, ZOLI nodes and value-added services for regional trade.",
      advantages: [
        {
          title: "Puerto Cortés",
          text: "Central America's leading Caribbean port with expansion capacity, deep dredging and 24/7 services.",
        },
        {
          title: "Pacific corridor",
          text: "Land access to Pacific ports and logistical connection across Central America and Mexico.",
        },
        {
          title: "3PL services and ZOLI",
          text: "Distribution, packaging, labeling and consolidation hubs under preferential customs regimes.",
          wide: true,
        },
      ],
      analysisEyebrow: "Operations",
      analysisTitle: "Nearshoring supply chain",
      analysisIntro: "Inventory optimization, port-to-door transit times, and value-added services for global brands.",
      backToSectors: "← All sectors",
    },
  },
};

export function getSectorPageExtra(slug: SectorSlug, locale: Locale): SectorPageExtra {
  return DETAIL[slug][locale];
}
