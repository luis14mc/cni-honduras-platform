import type { Locale } from "@/src/i18n/config";

type Prospectus = {
  badge: string;
  category: string;
  title: string;
  location: string;
  description: string;
  capex: string;
  image: string;
};

type Case = {
  company: string;
  sector: string;
  quote: string;
  spokesperson: string;
  role: string;
  highlight: string;
};

const IMG = {
  p1: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmqh6TGWEgXprO0QSQfAMmkyV7rXxADBwFeI4wP9sr5t4Mlkxui0feTVOvLfIdzs5dBMA3lJYSxLYPvMnq4yXfXeLVWeb2oCCT9tNeLSjyKJ-LWyJgbZCvt74qUamH3hUaPc9pRKXFTiqx4uLnyPQzrmCKX_6LneBbTsBae-BLkbMM_JqO0NNonUTr-Dq9IYuHwIrU_yiTu-ULrm4Oy45ZvSnk1xd6lv6pM8XdGhHisp0-ZSORR0TSDBgxwrGaXmPnI9elSUb2nPSu",
  p2: "https://lh3.googleusercontent.com/aida-public/AB6AXuAL5Azjwtd9cUp8U8pkKq9RDzFvWoH-550axPLwUXwKK0c8KivzB20-bK7QBEbUMQs8ddPOTI3yk05eFIXwqGbH__ZZLp25YDsJFW6Il0Ra9OU-NyOVhJ-_I_gJjCtjb9vFy7iABpHbQXHeRu8EVdccOKzfxrWjGq55MJQ7ALwV8914H4Wm7doXdR3vGwsWknhAiXnA2pZ5wyjP5u6BJZrdoTPwXKp5S4FtcAu_QtrBuknpEtBURH8H9GpcHFw4SAccUNkraY35EQG6",
  p3: "https://lh3.googleusercontent.com/aida-public/AB6AXuDIa7Q0bvbjkOaSDpNPGbGsYu3MMsUfLrNg_MQOw3PYntoJADOk8kLbhrCiZd0hj3H-ON0K94sn-9KwxSIXazzHF-RBhcjnTUJeaF4TIw8yU-gWRuqtpM56vIOtVLsk34dgQ5dbRAj7f4ZQEGX3fLVvoAeXVWCCg5W9TBnG3cV_nX7UvdyWPeA2UDh6LfkwAbmWUvdGiUv_xr_Q167gzpdGXEdm-qs1Q5tqyc6AFYrWWD_pG9qXXv4vj1EFtpNbAGzK6jAOK07wDvFe",
} as const;

const esPortfolio: ReadonlyArray<Prospectus> = [
  {
    badge: "Prioridad Alta",
    category: "Infraestructura",
    title: "Corredor Logístico Interoceánico",
    location: "Cortés ↔ Choluteca",
    description:
      "Expansión portuaria y ferroviaria que conecta las costas del Atlántico y el Pacífico a través de nodos económicos especializados.",
    capex: "$2,450,000,000",
    image: IMG.p1,
  },
  {
    badge: "Crecimiento Verde",
    category: "Energía",
    title: "Integración Eólica en el Altiplano Occidental",
    location: "Lempira / La Paz",
    description:
      "Parque eólico de 450MW con baterías de almacenamiento para estabilización de la red regional y exportación de excedentes.",
    capex: "$680,000,000",
    image: IMG.p2,
  },
  {
    badge: "Agroindustria",
    category: "Cadena de frío",
    title: "Hub de Cadena de Frío para Exportación Tropical",
    location: "Puerto Cortés",
    description:
      "50,000 m² de almacenamiento de vanguardia con control de temperatura adyacente a Puerto Cortés para fruta, vegetales y cacao.",
    capex: "$210,000,000",
    image: IMG.p3,
  },
];

const enPortfolio: ReadonlyArray<Prospectus> = [
  {
    badge: "High priority",
    category: "Infrastructure",
    title: "Interoceanic logistics corridor",
    location: "Cortés ↔ Choluteca",
    description:
      "Port and rail expansion connecting Atlantic and Pacific coasts through specialized economic nodes.",
    capex: "$2,450,000,000",
    image: IMG.p1,
  },
  {
    badge: "Green growth",
    category: "Energy",
    title: "Western highlands wind integration",
    location: "Lempira / La Paz",
    description:
      "450MW wind park with battery storage for regional grid stabilization and surplus export.",
    capex: "$680,000,000",
    image: IMG.p2,
  },
  {
    badge: "Agribusiness",
    category: "Cold chain",
    title: "Cold-chain hub for tropical exports",
    location: "Puerto Cortés",
    description:
      "50,000 m² of state-of-the-art temperature-controlled warehousing adjacent to Puerto Cortés for fruit, vegetables, and cocoa.",
    capex: "$210,000,000",
    image: IMG.p3,
  },
];

const esCasos: ReadonlyArray<Case> = [
  {
    company: "Multinacional Textil",
    sector: "Manufactura ligera",
    quote:
      "El acompañamiento del CNI en la fase de incorporación nos permitió arrancar operaciones de exportación a EE.UU. en menos de 6 meses, aprovechando los beneficios Zero-Duty.",
    spokesperson: "Director Regional",
    role: "Operación San Pedro Sula",
    highlight: "+3,500 empleos directos",
  },
  {
    company: "Energía Renovable EU",
    sector: "Energía solar y eólica",
    quote:
      "La articulación interinstitucional facilitó permisos ambientales y certificación de incentivos. Honduras es ahora una pieza clave de nuestra cartera regional.",
    spokesperson: "VP de Inversiones",
    role: "Proyecto Choluteca",
    highlight: "85MW instalados",
  },
  {
    company: "Cadena de Hospitalidad",
    sector: "Turismo de lujo",
    quote:
      "La inteligencia de datos del CNI fue decisiva para validar la ubicación, el mercado meta y el potencial de retorno de nuestra inversión en Roatán.",
    spokesperson: "Head of Latin America",
    role: "Islas de la Bahía",
    highlight: "Apertura en 18 meses",
  },
];

const enCasos: ReadonlyArray<Case> = [
  {
    company: "Textile multinational",
    sector: "Light manufacturing",
    quote:
      "CNI support during incorporation let us launch U.S. export operations in under six months, leveraging Zero-Duty benefits.",
    spokesperson: "Regional Director",
    role: "San Pedro Sula operation",
    highlight: "+3,500 direct jobs",
  },
  {
    company: "EU renewable energy",
    sector: "Solar & wind",
    quote:
      "Inter-agency coordination streamlined environmental permits and incentive certification. Honduras is now a key piece of our regional portfolio.",
    spokesperson: "VP Investments",
    role: "Choluteca project",
    highlight: "85MW installed",
  },
  {
    company: "Hospitality group",
    sector: "Luxury tourism",
    quote:
      "CNI data intelligence was decisive to validate location, target market, and return potential for our Roatán investment.",
    spokesperson: "Head of Latin America",
    role: "Bay Islands",
    highlight: "Opened in 18 months",
  },
];

export const crecerPageCopy: Record<
  Locale,
  {
    heroEyebrow: string;
    heroTitleBefore: string;
    heroTitleAccent: string;
    heroDescription: string;
    heroImageAlt: string;
    ctaPortfolio: string;
    ctaCases: string;
    portfolioEyebrow: string;
    portfolioTitle: string;
    portfolioDescription: string;
    prospectCta: string;
    targetCapital: string;
    downloadProspect: string;
    leversEyebrow: string;
    leversTitle: string;
    levers: ReadonlyArray<{ title: string; text: string }>;
    casesEyebrow: string;
    casesTitle: string;
    casesDescription: string;
    pdiTitle: string;
    pdiBody: string;
    pdiLink: string;
    advisoryCta: string;
    portfolio: ReadonlyArray<Prospectus>;
    cases: ReadonlyArray<Case>;
  }
> = {
  es: {
    heroEyebrow: "Centro de Despliegue de Capital",
    heroTitleBefore: "Crecer en",
    heroTitleAccent: "Honduras",
    heroDescription:
      "Portafolio curado de proyectos Ready to Invest con datos verificados de CAPEX y ubicación, junto a testimonios de multinacionales operando exitosamente en el país.",
    heroImageAlt: "Vista corporativa premium",
    ctaPortfolio: "Ver portafolio",
    ctaCases: "Casos de éxito",
    portfolioEyebrow: "Portafolio de Inversiones",
    portfolioTitle: "Catálogo Ready to Invest",
    portfolioDescription:
      "Proyectos estructurados por el CNI con la institucionalidad pública: CAPEX, ubicación, sector y ventana de oportunidad listos para sindicación institucional.",
    prospectCta: "Solicitar prospectos →",
    targetCapital: "Capital Objetivo",
    downloadProspect: "Descargar prospecto",
    leversEyebrow: "Por qué crecer aquí",
    leversTitle: "Tres palancas estratégicas",
    levers: [
      {
        title: "Marco legal LPPI + ZOLI",
        text: "Protección al capital extranjero, repatriación libre de utilidades y zonas con incentivos fiscales agresivos.",
      },
      {
        title: "Ventanilla Única",
        text: "Un único punto de contacto para permisos, certificaciones ambientales y visas ejecutivas.",
      },
      {
        title: "Acompañamiento gratuito",
        text: "Asesoría completa del CNI durante toda la Ruta del Inversionista, sin costo.",
      },
    ],
    casesEyebrow: "Casos de Éxito",
    casesTitle: "Multinacionales operando en Honduras",
    casesDescription: "Voces de líderes que ya despliegan capital con el acompañamiento del CNI.",
    pdiTitle: "Acceda al Portal Digital de Inversiones",
    pdiBody:
      "El portal oficial del Estado para gestión de proyectos, trazabilidad de trámites y comunicación segura con las instituciones del sector inversiones.",
    pdiLink: "Ir a pdihonduras.gob.hn",
    advisoryCta: "Asesoría dedicada",
    portfolio: esPortfolio,
    cases: esCasos,
  },
  en: {
    heroEyebrow: "Capital deployment center",
    heroTitleBefore: "Grow in",
    heroTitleAccent: "Honduras",
    heroDescription:
      "Curated Ready to Invest projects with verified CAPEX and location data, plus testimonials from multinationals operating successfully in the country.",
    heroImageAlt: "Premium corporate vista",
    ctaPortfolio: "View portfolio",
    ctaCases: "Success stories",
    portfolioEyebrow: "Investment portfolio",
    portfolioTitle: "Ready to Invest catalog",
    portfolioDescription:
      "Projects structured by the CNI with public institutions: CAPEX, location, sector, and opportunity window ready for institutional syndication.",
    prospectCta: "Request prospectuses →",
    targetCapital: "Target capital",
    downloadProspect: "Download prospectus",
    leversEyebrow: "Why grow here",
    leversTitle: "Three strategic levers",
    levers: [
      {
        title: "LPPI + ZOLI legal framework",
        text: "Protection for foreign capital, free profit repatriation, and zones with strong fiscal incentives.",
      },
      {
        title: "One-stop shop",
        text: "A single point of contact for permits, environmental certifications, and executive visas.",
      },
      {
        title: "Free accompaniment",
        text: "Full CNI advisory along the entire Investor Journey, at no cost.",
      },
    ],
    casesEyebrow: "Success stories",
    casesTitle: "Multinationals operating in Honduras",
    casesDescription: "Leaders already deploying capital with CNI support.",
    pdiTitle: "Access the Digital Investment Portal",
    pdiBody:
      "The official government platform for project management, procedure traceability, and secure communication with investment-sector institutions.",
    pdiLink: "Go to pdihonduras.gob.hn",
    advisoryCta: "Dedicated advisory",
    portfolio: enPortfolio,
    cases: enCasos,
  },
};
