import type { Locale } from "@/src/i18n/config";

export type HomeCopy = {
  hero: {
    badge: string;
    titleLine1: string;
    titleGrow: string;
    titleLine2: string;
    subtitle: string;
    ctaExplore: string;
    ctaProject: string;
    imageAlt: string;
    imageCaption: string;
  };
  postulacion: {
    eyebrow: string;
    title: string;
    description: string;
    bullets: [string, string, string];
    labels: { name: string; company: string; email: string; sector: string; summary: string };
    sectors: [string, string, string, string, string, string];
    submit: string;
    fullForm: string;
  };
  porque: { eyebrow: string; title: string; description: string; cards: ReadonlyArray<{ title: string; text: string }> };
  clima: {
    eyebrow: string;
    title: string;
    description: string;
    orientative: string;
    iedTitle: string;
    iedHint: string;
    factorsTitle: string;
    factorsHint: string;
    factors: ReadonlyArray<{ name: string; hint: string }>;
  };
  cifras: {
    eyebrow: string;
    title: string;
    description: string;
    cards: ReadonlyArray<{ label: string; delta: string; hint: string }>;
    extra: ReadonlyArray<{ value: string; label: string }>;
  };
  mapaTerritorial: {
    titleLine1: string;
    titleLine2: string;
    description: string;
    cortesTitle: string;
    cortesSubtitle: string;
    stats: { projects: string; fdi: string; growth: string };
    mapAlt: string;
  };
  sectores: {
    title: string;
    description: string;
    cta: string;
    teasers: ReadonlyArray<{ name: string; tagline: string }>;
    more: string;
  };
  mapaGeo: {
    cluster: string;
    energy: string;
    fm: string;
    cortes: string;
    eyebrow: string;
    title: string;
    description: string;
    cta: string;
    mapAlt: string;
  };
  aliados: { eyebrow: string; title: string; description: string; items: ReadonlyArray<{ name: string; role: string }> };
  prensa: {
    eyebrow: string;
    title: string;
    description: string;
    cta: string;
    readMore: string;
    items: ReadonlyArray<{ date: string; title: string; excerpt: string }>;
  };
  newsletter: { title: string; description: string; placeholder: string; button: string };
};

const CIFRAS_VALUES = [
  { value: "$1.24B", deltaEs: "+8.4%", deltaEn: "+8.4%" },
  { value: "3.8%", deltaEs: "Estable", deltaEn: "Stable" },
  { value: "142", deltaEs: "Total", deltaEn: "Total" },
  { value: "~60%", deltaEs: "Limpia", deltaEn: "Clean" },
] as const;

export const homeCopy: Record<Locale, HomeCopy> = {
  es: {
    hero: {
      badge: "Centro estratégico de las Américas",
      titleLine1: "Invierte,",
      titleGrow: "Crece",
      titleLine2: "y Vive en Honduras",
      subtitle:
        "La puerta de entrada a los mercados globales. Explore un panorama de crecimiento sin precedentes, estabilidad legal e infraestructura estratégica al servicio del inversionista institucional.",
      ctaExplore: "Explorar oportunidades",
      ctaProject: "Postular proyecto",
      imageAlt:
        "Equipo directivo analizando estrategia de inversión y crecimiento empresarial en un entorno corporativo moderno.",
      imageCaption: "Perspectiva de inversión",
    },
    postulacion: {
      eyebrow: "Ventanilla de proyectos",
      title: "Postule su proyecto de inversión",
      description:
        "Registre su iniciativa para que un ejecutivo del CNI la evalúe, la oriente hacia incentivos LPPI o ZOLI y coordine con las instituciones del Estado. Asesoría gratuita en todas las etapas de la Ruta del Inversionista.",
      bullets: [
        "Prefactibilidad y encaje sectorial",
        "Articulación con ambiente, energía y municipalidades",
        "Seguimiento institucional hasta operación",
      ],
      labels: {
        name: "Nombre completo",
        company: "Empresa",
        email: "Correo profesional",
        sector: "Sector",
        summary: "Resumen del proyecto (CAPEX estimado, ubicación, plazo)",
      },
      sectors: [
        "Agroindustria",
        "Manufactura y textil",
        "Turismo",
        "Energía",
        "BPO / servicios",
        "Otro",
      ],
      submit: "Enviar postulación",
      fullForm: "Formulario completo en Asesoría",
    },
    porque: {
      eyebrow: "Ventaja competitiva",
      title: "¿Por qué Honduras?",
      description:
        "Cuatro razones que explican por qué capitales regionales y globales eligen el país como hub de manufactura, servicios y energía.",
      cards: [
        {
          title: "Ubicación geoestratégica",
          text: "Puente entre Norteamérica, Centroamérica y Sudamérica, con corredores logísticos hacia Puerto Cortés y la Franja Transístmica.",
        },
        {
          title: "Marco legal para el capital",
          text: "Ley de Promoción y Protección de Inversiones (LPPI), régimen de Zonas Libres (ZOLI) y acompañamiento gratuito del CNI en la Ruta del Inversionista.",
        },
        {
          title: "Talento y nearshoring",
          text: "Población joven, servicios bilingües en expansión y costos competitivos para manufactura ligera, BPO y tecnología.",
        },
        {
          title: "Tratados y mercados",
          text: "CAFTA-DR y red de acuerdos comerciales que facilitan la inserción exportadora de bienes y servicios hondureños.",
        },
      ],
    },
    clima: {
      eyebrow: "Analítica",
      title: "Clima de inversión",
      description:
        "Visualización ilustrativa de tendencias y percepción del entorno para inversión (referencia de mercado; no constituye pronóstico oficial del BCH).",
      orientative: "Datos orientativos",
      iedTitle: "IED anual (referencia, USD)",
      iedHint: "Escala relativa; valores etiquetados en miles de millones.",
      factorsTitle: "Factores del clima de inversión",
      factorsHint: "Índice ilustrativo 0–100 por dimensión.",
      factors: [
        { name: "Estabilidad macro", hint: "Inflación, tipo de cambio y finanzas públicas" },
        { name: "Marco regulatorio", hint: "LPPI, ZOLI y ventanilla única" },
        { name: "Infraestructura", hint: "Puertos, carreteras y energía" },
        { name: "Talento disponible", hint: "Educación técnica y bilingüismo" },
      ],
    },
    cifras: {
      eyebrow: "Indicadores",
      title: "Honduras en cifras",
      description: "Una instantánea del entorno macro y logístico que respalda decisiones de inversión.",
      cards: [
        {
          label: "IED proyectada (referencia)",
          delta: CIFRAS_VALUES[0].deltaEs,
          hint: "Flujo anual de inversión extranjera directa (referencia de mercado).",
        },
        {
          label: "Crecimiento PIB",
          delta: CIFRAS_VALUES[1].deltaEs,
          hint: "Tasa promedio de expansión del producto interno bruto.",
        },
        {
          label: "Proyectos activos (referencia)",
          delta: CIFRAS_VALUES[2].deltaEs,
          hint: "Desarrollos industriales y de infraestructura en cartera institucional.",
        },
        {
          label: "Matriz renovable (referencia)",
          delta: CIFRAS_VALUES[3].deltaEs,
          hint: "Participación de fuentes renovables en la matriz eléctrica.",
        },
      ],
      extra: [
        { value: "~10.5 M", label: "Habitantes y mercado interno en crecimiento" },
        { value: "CAFTA-DR", label: "Acceso preferencial a EE. UU. y la región" },
        { value: "2 costas", label: "Atlántico y Pacífico para logística y exportación" },
        { value: "LPPI + ZOLI", label: "Marco legal e incentivos para inversión y zonas libres" },
      ],
    },
    mapaTerritorial: {
      titleLine1: "Riqueza Territorial",
      titleLine2: "& Estrategia",
      description:
        "Honduras está dividida en zonas estratégicas adaptadas a industrias específicas. Desde los parques industriales de San Pedro Sula hasta el centro logístico de Comayagua.",
      cortesTitle: "Región de Cortés",
      cortesSubtitle: "Potencia Industrial",
      stats: { projects: "Proyectos Activos", fdi: "Flujo IED (2023)", growth: "Índice de Crecimiento" },
      mapAlt: "Mapa topográfico estilizado de las regiones de Honduras",
    },
    sectores: {
      title: "Principales sectores de inversión",
      description:
        "Cinco motores priorizados por el CNI para canalizar capital extranjero con respaldo legal LPPI y ZOLI.",
      cta: "Ficha sectorial completa →",
      teasers: [
        { name: "Agroindustria", tagline: "Café, cacao y tabaco premium." },
        { name: "Manufactura", tagline: "Nearshoring con beneficios Zero-Duty." },
        { name: "Turismo", tagline: "Islas de la Bahía y arqueología Maya." },
        { name: "Energía", tagline: "Solar, eólica e hidroeléctrica." },
        { name: "BPO", tagline: "Talento joven y bilingüe." },
      ],
      more: "Saber más",
    },
    mapaGeo: {
      cluster: "Clúster Tecnológico",
      energy: "Red Energética",
      fm: "Francisco Morazán",
      cortes: "Región de Cortés",
      eyebrow: "Mapa Geoespacial interactivo",
      title: "Inteligencia territorial en tiempo real",
      description:
        "Datos institucionales sobre conectividad, densidad de inversión y disponibilidad logística en los 18 departamentos. Optimice su cadena de suministro con precisión.",
      cta: "Abrir mapa",
      mapAlt: "Mapa interactivo de Honduras",
    },
    aliados: {
      eyebrow: "Ecosistema",
      title: "Aliados estratégicos",
      description:
        "El CNI articula esfuerzos con organismos públicos, multilaterales y gremios para acelerar la inversión y la transparencia.",
      items: [
        { name: "Banco Central de Honduras (BCH)", role: "Estadística oficial, política monetaria y estabilidad financiera." },
        { name: "Unión Europea", role: "Plan Maestro de Inversión Privada y cooperación técnica con el CNI." },
        { name: "BID y Banco Mundial", role: "Financiamiento y proyectos de infraestructura sostenible." },
        { name: "Cámaras empresariales", role: "CCIC, ANDI y redes sectoriales para articulación público-privada." },
        { name: "WAIPA", role: "Red mundial de agencias de promoción de inversiones." },
        { name: "Portal Digital de Inversiones (PDI)", role: "Ventanilla estatal para trazabilidad de trámites." },
      ],
    },
    prensa: {
      eyebrow: "Prensa",
      title: "CNI al día",
      description: "Noticias, eventos y comunicados oficiales del Consejo Nacional de Inversiones.",
      cta: "Ver sala de prensa →",
      readMore: "Leer más",
      items: [
        {
          date: "Mar 2025",
          title: "Honduras consolida su presencia global con más de $58 millones en nuevas inversiones",
          excerpt:
            "Resultados del primer trimestre y priorización de sectores estratégicos bajo la Estrategia de Inversiones 2024.",
        },
        {
          date: "Mar 2025",
          title: "Foro Honduras Investment Summit — Tegucigalpa",
          excerpt:
            "Diálogo entre Estado, sector privado y socios multilaterales para acelerar proyectos Ready to Invest.",
        },
        {
          date: "Abr 2025",
          title: "CNI presenta avances de la Estrategia de Inversiones ante la junta directiva",
          excerpt:
            "Informar, promocionar, acompañar, articular e incidir: resultados operativos del Consejo Nacional de Inversiones.",
        },
      ],
    },
    newsletter: {
      title: "Manténgase a la vanguardia",
      description:
        "Suscríbase a nuestras perspectivas de inversión trimestrales y actualizaciones de políticas del CNI.",
      placeholder: "Dirección de correo profesional",
      button: "Unirse a la Red",
    },
  },
  en: {
    hero: {
      badge: "Strategic hub of the Americas",
      titleLine1: "Invest,",
      titleGrow: "Grow",
      titleLine2: "and Live in Honduras",
      subtitle:
        "Your gateway to global markets. Explore strong growth potential, legal stability, and strategic infrastructure built for institutional investors.",
      ctaExplore: "Explore opportunities",
      ctaProject: "Submit a project",
      imageAlt:
        "Leadership team reviewing investment strategy and business growth in a modern corporate setting.",
      imageCaption: "Investment outlook",
    },
    postulacion: {
      eyebrow: "Project desk",
      title: "Submit your investment project",
      description:
        "Register your initiative so a CNI executive can assess it, guide you on LPPI or ZOLI incentives, and coordinate with government agencies. Free advisory across the Investor Journey.",
      bullets: [
        "Prefeasibility and sector fit",
        "Coordination with environment, energy, and municipalities",
        "Institutional follow-through to operations",
      ],
      labels: {
        name: "Full name",
        company: "Company",
        email: "Work email",
        sector: "Sector",
        summary: "Project summary (estimated CAPEX, location, timeline)",
      },
      sectors: [
        "Agribusiness",
        "Manufacturing & textiles",
        "Tourism",
        "Energy",
        "BPO / services",
        "Other",
      ],
      submit: "Send application",
      fullForm: "Full form on Advisory",
    },
    porque: {
      eyebrow: "Competitive edge",
      title: "Why Honduras?",
      description:
        "Four reasons regional and global capital choose the country as a hub for manufacturing, services, and energy.",
      cards: [
        {
          title: "Geostrategic location",
          text: "Bridge between North, Central, and South America, with logistics corridors to Puerto Cortés and the interoceanic route.",
        },
        {
          title: "Legal framework for capital",
          text: "Investment Promotion and Protection Law (LPPI), Free Zones (ZOLI), and free CNI support along the Investor Journey.",
        },
        {
          title: "Talent & nearshoring",
          text: "Young population, growing bilingual services, and competitive costs for light manufacturing, BPO, and technology.",
        },
        {
          title: "Treaties & markets",
          text: "CAFTA-DR and a network of trade agreements supporting export integration for Honduran goods and services.",
        },
      ],
    },
    clima: {
      eyebrow: "Analytics",
      title: "Investment climate",
      description:
        "Illustrative view of trends and perceptions of the investment environment (market reference; not an official BCH forecast).",
      orientative: "Indicative data",
      iedTitle: "Annual FDI (reference, USD)",
      iedHint: "Relative scale; values labeled in billions.",
      factorsTitle: "Investment climate factors",
      factorsHint: "Illustrative 0–100 index by dimension.",
      factors: [
        { name: "Macro stability", hint: "Inflation, exchange rate, and public finances" },
        { name: "Regulatory framework", hint: "LPPI, ZOLI, and one-stop shop" },
        { name: "Infrastructure", hint: "Ports, roads, and power" },
        { name: "Available talent", hint: "Technical education and bilingual skills" },
      ],
    },
    cifras: {
      eyebrow: "Indicators",
      title: "Honduras in figures",
      description: "A snapshot of the macro and logistics environment that supports investment decisions.",
      cards: [
        {
          label: "FDI projected (reference)",
          delta: CIFRAS_VALUES[0].deltaEn,
          hint: "Annual foreign direct investment flow (market reference).",
        },
        {
          label: "GDP growth",
          delta: CIFRAS_VALUES[1].deltaEn,
          hint: "Average gross domestic product expansion rate.",
        },
        {
          label: "Active projects (reference)",
          delta: CIFRAS_VALUES[2].deltaEn,
          hint: "Industrial and infrastructure developments in the institutional pipeline.",
        },
        {
          label: "Renewable matrix (reference)",
          delta: CIFRAS_VALUES[3].deltaEn,
          hint: "Share of renewable sources in the power mix.",
        },
      ],
      extra: [
        { value: "~10.5 M", label: "Population and a growing domestic market" },
        { value: "CAFTA-DR", label: "Preferential access to the U.S. and the region" },
        { value: "Two coasts", label: "Atlantic and Pacific for logistics and exports" },
        { value: "LPPI + ZOLI", label: "Legal framework and incentives for investment & free zones" },
      ],
    },
    mapaTerritorial: {
      titleLine1: "Territorial richness",
      titleLine2: "& strategy",
      description:
        "Honduras is organized into strategic zones suited to specific industries—from San Pedro Sula industrial parks to Comayagua’s logistics hub.",
      cortesTitle: "Cortés region",
      cortesSubtitle: "Industrial powerhouse",
      stats: { projects: "Active projects", fdi: "FDI flow (2023)", growth: "Growth index" },
      mapAlt: "Stylized topographic map of Honduras regions",
    },
    sectores: {
      title: "Main investment sectors",
      description:
        "Five priority engines promoted by the CNI to channel foreign capital with LPPI and ZOLI legal backing.",
      cta: "Full sector brief →",
      teasers: [
        { name: "Agribusiness", tagline: "Coffee, cocoa, and premium tobacco." },
        { name: "Manufacturing", tagline: "Nearshoring with Zero-Duty benefits." },
        { name: "Tourism", tagline: "Bay Islands and Maya archaeology." },
        { name: "Energy", tagline: "Solar, wind, and hydro." },
        { name: "BPO", tagline: "Young bilingual talent." },
      ],
      more: "Learn more",
    },
    mapaGeo: {
      cluster: "Technology cluster",
      energy: "Power grid",
      fm: "Francisco Morazán",
      cortes: "Cortés region",
      eyebrow: "Interactive geospatial map",
      title: "Territorial intelligence in real time",
      description:
        "Institutional data on connectivity, investment density, and logistics availability across 18 departments. Optimize your supply chain with precision.",
      cta: "Open map",
      mapAlt: "Interactive map of Honduras",
    },
    aliados: {
      eyebrow: "Ecosystem",
      title: "Strategic partners",
      description:
        "The CNI coordinates with public agencies, multilateral bodies, and business associations to accelerate investment and transparency.",
      items: [
        { name: "Central Bank of Honduras (BCH)", role: "Official statistics, monetary policy, and financial stability." },
        { name: "European Union", role: "Master Plan for Private Investment and technical cooperation with the CNI." },
        { name: "IDB & World Bank", role: "Financing and sustainable infrastructure projects." },
        { name: "Chambers of commerce", role: "CCIC, ANDI, and sector networks for public-private coordination." },
        { name: "WAIPA", role: "World association of investment promotion agencies." },
        { name: "Digital Investment Portal (PDI)", role: "Government one-stop shop for procedure traceability." },
      ],
    },
    prensa: {
      eyebrow: "Press",
      title: "CNI newsroom",
      description: "News, events, and official releases from the National Investment Council.",
      cta: "Go to press room →",
      readMore: "Read more",
      items: [
        {
          date: "Mar 2025",
          title: "Honduras strengthens its global footprint with over $58M in new investment",
          excerpt: "First-quarter results and strategic sector focus under the 2024 Investment Strategy.",
        },
        {
          date: "Mar 2025",
          title: "Honduras Investment Summit forum — Tegucigalpa",
          excerpt: "Dialogue among government, private sector, and multilateral partners to accelerate Ready to Invest projects.",
        },
        {
          date: "Apr 2025",
          title: "CNI reports progress on the Investment Strategy to its board",
          excerpt: "Inform, promote, accompany, coordinate, and influence—operational results of the National Investment Council.",
        },
      ],
    },
    newsletter: {
      title: "Stay ahead",
      description: "Subscribe to our quarterly investment outlook and CNI policy updates.",
      placeholder: "Work email address",
      button: "Join the network",
    },
  },
};
