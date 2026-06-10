import type { Locale } from "@/src/i18n/config";

export type HomeCopy = {
  hero: {
    badge: string;
    titleLine1: string;
    titleGrow: string;
    titleLine2: string;
    subtitle: string;
    ctaExplore: string;
    ctaGrow: string;
    ctaProject: string;
    imageAlt: string;
    imageCaption: string;
  };
  bento: {
    port: { title: string; text: string };
    talent: { title: string; text: string; rank: string };
    export: { label: string; value: string; hint: string };
    maquila: { label: string; value: string; hint: string };
  };
  enlacesRapidos: {
    sectionTitle: string;
    guia: string;
    memoria: string;
    portal: string;
    estudios: string;
  };
  testimonials: {
    title: string;
    cta: string;
    items: ReadonlyArray<{ quote: string; name: string; role: string; initials: string }>;
  };
  postulacion: {
    eyebrow: string;
    title: string;
    description: string;
    bullets: [string, string, string];
    labels: { name: string; company: string; email: string; sector: string; summary: string };
    sectors: [string, string, string, string, string, string, string];
    submit: string;
    fullForm: string;
  };
  porque: { eyebrow: string; title: string; description: string; cards: ReadonlyArray<{ title: string; text: string }> };
  graficos: {
    title: string;
    ied: { label: string; value: string; desc: string };
    negocios: { label: string; value: string; desc: string };
    pib: { label: string; value: string; desc: string };
  };
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
    stats: ReadonlyArray<{ value: string; label: string; hint: string }>;
    cards: ReadonlyArray<{ label: string; delta: string; hint: string; backText: string }>;
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
    items: ReadonlyArray<{ date: string; title: string; excerpt: string; imageAlt?: string }>;
  };
  newsletter: { title: string; description: string; placeholder: string; button: string };
  actionCards?: {
    investTitle: string;
    investDesc: string;
    growTitle: string;
    growDesc: string;
    moreInfo: string;
  };
  postulacionExtra?: {
    advisoryTitle: string;
    advisoryDesc: string;
    ctaProject: string;
  };
  graficosDashboard?: {
    eyebrow: string;
    title: string;
    downloadBtn: string;
    sources: string;
    ied: { label: string; title: string; desc: string; value: string; insight: string; source: string };
    pib: { label: string; title: string; desc: string; value: string; insight: string; source: string };
    clima: { label: string; title: string; desc: string; value: string; insight: string; source: string };
  };
};

const CIFRAS_VALUES = [
  { value: "$1.24B", deltaEs: "+8.4%", deltaEn: "+8.4%" },
  { value: "3.8%", deltaEs: "Estable", deltaEn: "Stable" },
  { value: "142", deltaEs: "Total", deltaEn: "Total" },
  { value: "~60%", deltaEs: "Limpia", deltaEn: "Clean" },
  { value: "$5.0B", deltaEs: "+5.1%", deltaEn: "+5.1%" },
  { value: "4M+", deltaEs: "Activa", deltaEn: "Active" },
] as const;

export const homeCopy: Record<Locale, HomeCopy> = {
  es: {
    hero: {
      badge: "Destino Global de Inversión",
      titleLine1: "HONDURAS: UN PAÍS PARA",
      titleGrow: "INVERTIR, CRECER Y VIVIR",
      titleLine2: "",
      subtitle:
        "Facilitamos su entrada al mercado de mayor crecimiento en Centroamérica con transparencia, seguridad jurídica y talento excepcional.",
      ctaExplore: "Invertir",
      ctaGrow: "Crecer",
      ctaProject: "Postular proyecto",
      imageAlt: "Costa hondureña al atardecer — panorama de inversión y desarrollo.",
      imageCaption: "Perspectiva de inversión",
    },
    bento: {
      port: {
        title: "Eficiencia Portuaria Estratégica",
        text: "Puerto Cortés se posiciona como el más eficiente del Mar Caribe, manejando el 78.6% del movimiento nacional con una carga de 12,548 TM en 2024.",
      },
      talent: {
        title: "Capital Humano Bilingüe",
        text: "Líderes en Centroamérica y 3º en LatAm en dominio del inglés (EF EPI 2024), con más de 824 centros de educación bilingüe.",
        rank: "En Centroamérica",
      },
      export: {
        label: "Exportación de Manufactura",
        value: "USD 4,212.7 M",
        hint: "Cifras destacadas a Noviembre 2024",
      },
      maquila: {
        label: "Maquila y Bienes",
        value: "USD 5,014.1 M",
        hint: "Liderazgo regional indiscutible",
      },
    },
    enlacesRapidos: {
      sectionTitle: "Enlaces de Interés",
      guia: "Guía Invierte en Honduras",
      memoria: "Memoria Institucional",
      portal: "Portal Digital de Inversiones",
      estudios: "Vista de Estudios CNI",
    },
    testimonials: {
      title: "Casos de Éxito",
      cta: "Ver todos los casos",
      items: [
        {
          quote:
            "Nuestro país tiene gente trabajadora, tierra fértil y una ubicación privilegiada. Invertir aquí es invertir en un modelo de crecimiento sostenible con rostro humano.",
          name: "Naman Antonio Sánchez",
          role: "Gerente General - Sinclair",
          initials: "NS",
        },
        {
          quote:
            "Honduras tiene un potencial increíble para los inversionistas que buscan más que un retorno financiero; aquí se puede generar un impacto real y construir un futuro sostenible.",
          name: "David Dachner",
          role: "Gerente Propietario - Kimpton Grand Hotel",
          initials: "DD",
        },
      ],
    },
    postulacion: {
      eyebrow: "Ventanilla de proyectos",
      title: "¿TIENES UN PROYECTO DE INVERSIÓN?",
      description:
        "Un proyecto de inversión es una iniciativa lista para desarrollarse, que ya cuenta con estudios técnicos, financieros y de mercado, y que permite a un inversionista conocer con claridad qué se va a ejecutar, cuánto debe invertir y qué beneficios puede esperar.",
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
        "Manufactura",
        "Turismo",
        "Energía",
        "Infraestructura",
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
        "Razones principales por las que capitales regionales y globales eligen el país como hub de manufactura, servicios y energía.",
      cards: [
        {
          title: "Ubicación Estratégica",
          text: "Corazón de las Américas con acceso a ambos océanos y conectividad global privilegiada para el comercio transatlántico y pacífico.",
        },
        {
          title: "Marco Legal Robusto",
          text: "Leyes modernas de protección a la inversión y regímenes especiales que garantizan seguridad jurídica y estabilidad fiscal a largo plazo.",
        },
        {
          title: "Talento Humano",
          text: "Fuerza laboral joven, altamente capacitada en manufactura avanzada, bilingüe y con una fuerte ética de trabajo competitiva regional.",
        },
      ],
    },
    graficos: {
      title: "Desempeño y Clima de Negocios",
      ied: { label: "Flujo IED", value: "$1.24B", desc: "Atracción de Inversión Extranjera Directa constante en sectores estratégicos." },
      negocios: { label: "Facilidad Negocios", value: "Mejora", desc: "Optimización de procesos gubernamentales y ventanillas únicas operativas." },
      pib: { label: "Crecimiento PIB", value: "3.8%", desc: "Expansión económica respaldada por exportaciones y consumo interno." },
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
      title: "Honduras en Cifras",
      description: "Una instantánea del entorno macro y logístico que respalda decisiones de inversión.",
      stats: [
        { value: "112,777 km²", label: "Extensión Territorial", hint: "Ubicación estratégica en el corazón de América." },
        { value: "58.6%", label: "Energía Renovable", hint: "Matriz diversificada con 10 fuentes energéticas." },
        { value: "9.89M", label: "Habitantes", hint: "Fuerza laboral joven con promedio de 31 años." },
        { value: "11 TLCs", label: "Tratados Comerciales", hint: "Acceso preferencial a más de 45 naciones." },
      ],
      cards: [
        {
          label: "IED proyectada",
          delta: CIFRAS_VALUES[0].deltaEs,
          hint: "Flujo anual de inversión extranjera directa.",
          backText: "Honduras mantiene un flujo de IED sólido, atrayendo capitales a los sectores de energía, maquila y telecomunicaciones.",
        },
        {
          label: "Crecimiento PIB",
          delta: CIFRAS_VALUES[1].deltaEs,
          hint: "Tasa promedio de expansión.",
          backText: "El desempeño macroeconómico es resiliente, impulsado por el consumo, las remesas y la recuperación de exportaciones agroindustriales.",
        },
        {
          label: "Proyectos activos",
          delta: CIFRAS_VALUES[2].deltaEs,
          hint: "Desarrollos en cartera institucional.",
          backText: "El CNI brinda acompañamiento integral a múltiples iniciativas privadas y público-privadas a lo largo de la Ruta del Inversionista.",
        },
        {
          label: "Matriz renovable",
          delta: CIFRAS_VALUES[3].deltaEs,
          hint: "Participación de fuentes limpias.",
          backText: "El país avanza en su transición energética, aprovechando su vasta red de recursos solares, eólicos e hidroeléctricos.",
        },
        {
          label: "Exportaciones de bienes",
          delta: CIFRAS_VALUES[4].deltaEs,
          hint: "Crecimiento anual en comercio exterior.",
          backText: "Los productos agrícolas premium (café, cacao, puros) y las prendas de vestir mantienen a Honduras competitiva a nivel global.",
        },
        {
          label: "Fuerza laboral joven",
          delta: CIFRAS_VALUES[5].deltaEs,
          hint: "Población económicamente activa.",
          backText: "La juventud hondureña provee un bono demográfico clave, cada vez más orientada hacia carreras STEM y bilingüismo.",
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
      titleLine1: "Visualización de Departamentos",
      titleLine2: "",
      description: "Interactúe con los 18 departamentos para ver data específica.",
      cortesTitle: "Región de Cortés",
      cortesSubtitle: "Potencia Industrial",
      stats: { projects: "Proyectos Activos", fdi: "Flujo IED (2023)", growth: "Índice de Crecimiento" },
      mapAlt: "Mapa topográfico estilizado de las regiones de Honduras",
    },
    sectores: {
      title: "Sectores Estratégicos",
      description:
        "Cinco motores priorizados por el CNI para canalizar capital extranjero con respaldo legal LPPI y ZOLI.",
      cta: "Ficha sectorial completa →",
      teasers: [
        { name: "Agroindustria", tagline: "Café, cacao y tabaco premium." },
        { name: "Manufactura", tagline: "Nearshoring con beneficios Zero-Duty." },
        { name: "Turismo", tagline: "Islas de la Bahía y arqueología Maya." },
        { name: "Energía", tagline: "Solar, eólica e hidroeléctrica." },
        { name: "Infraestructura", tagline: "Puertos, carreteras y conectividad." },
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
          imageAlt: "Reunión de inversores",
        },
        {
          date: "Mar 2025",
          title: "Foro Honduras Investment Summit — Tegucigalpa",
          excerpt:
            "Diálogo entre Estado, sector privado y socios multilaterales para acelerar proyectos Ready to Invest.",
          imageAlt: "Foro de inversión",
        },
        {
          date: "Abr 2025",
          title: "CNI presenta avances de la Estrategia de Inversiones ante la junta directiva",
          excerpt:
            "Informar, promocionar, acompañar, articular e incidir: resultados operativos del Consejo Nacional de Inversiones.",
          imageAlt: "Junta directiva CNI",
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
    actionCards: {
      investTitle: "Invertir en Honduras",
      investDesc: "Forma parte de nuestra red de inversionista",
      growTitle: "Crecer en Honduras",
      growDesc: "Conoce las oportunidades y proyectos de inversión para expandir tus operaciones en Honduras",
      moreInfo: "Más información",
    },
    postulacionExtra: {
      advisoryTitle: "Asesoría Técnica",
      advisoryDesc: "Conoce las oportunidades y proyectos de inversión para expandir tus operaciones en Honduras",
      ctaProject: "Postular Mi Proyecto",
    },
    graficosDashboard: {
      eyebrow: "Dashboard Inteligente",
      title: "Comparativa Regional",
      downloadBtn: "Descargar Reporte Completo",
      sources: "Fuentes: Banco Central de Honduras, GCBI Index 2025, Proyecciones FMI.",
      ied: {
        label: "Reporte 2020-2025",
        title: "Inversión Extranjera Directa (Millones de Dólares)",
        desc: "La IED al cierre del 2024 fue de USD 993.9 millones y al cierre del I semestre 2025 fue de USD 500.4 millones siendo este semestre el mayor receptor de inversión extranjera en los últimos años.",
        value: "$500.4M",
        insight: "El primer semestre del 2025 reporta un comportamiento sumamente dinámico en atracción de capitales.",
        source: "Fuente: Sección de Balanza de Pagos, Departamento de Sector Externo, BCH",
      },
      pib: {
        label: "Proyección 2024-2029",
        title: "Crecimiento proyectado del PIB",
        desc: "En 2023 Honduras fue la tercer económia que reportó mayor crecimiento en Centramérica y la cuarta en la región. Las proyecciones indican que el crecimiento se mantendrá para este 2024 y 2025 encabezando la lista de los países de la región solo por debajo de Costa Rica.",
        value: "3.85%",
        insight: "Las proyecciones indican que el dinamismo económico de Honduras se mantendrá estable en los próximos años.",
        source: "Elaboración propia con datos del Informe Proyecciones 2024-2025, Banco Central de Honduras; CEPAL, Balance Preiminar de las Económias de ALC 2023 (dic. 2023).",
      },
      clima: {
        label: "GCBI Index 2025",
        title: "Facilidad para hacer negocios",
        desc: "Honduras es el país más confiable para hacer negocios en Centroamérica según el índice de Complejidad Corporativa (GCBI) 2025, publicado en 12.º informe e anual de TMF Group",
        value: "60 Pts",
        insight: "La reducción de la complejidad corporativa y simplificación de trámites impulsa la confianza país.",
        source: "Elaboración propia con datos de TMF group, 2025.",
      },
    },
  },
  en: {
    hero: {
      badge: "Global investment destination",
      titleLine1: "HONDURAS: A COUNTRY TO",
      titleGrow: "INVEST, GROW AND LIVE",
      titleLine2: "",
      subtitle:
        "We facilitate your entry into Central America's fastest-growing market with transparency, legal certainty, and exceptional talent.",
      ctaExplore: "Invest",
      ctaGrow: "Grow",
      ctaProject: "Submit a project",
      imageAlt: "Honduran coastline at sunset — investment and development panorama.",
      imageCaption: "Investment outlook",
    },
    bento: {
      port: {
        title: "Strategic port efficiency",
        text: "Puerto Cortés ranks as the Caribbean's most efficient port, handling 78.6% of national traffic with 12,548 TM in 2024.",
      },
      talent: {
        title: "Bilingual human capital",
        text: "Leaders in Central America and 3rd in Latin America in English proficiency (EF EPI 2024), with 824+ bilingual education centers.",
        rank: "In Central America",
      },
      export: {
        label: "Manufacturing exports",
        value: "USD 4,212.7 M",
        hint: "Figures through November 2024",
      },
      maquila: {
        label: "Maquila & goods",
        value: "USD 5,014.1 M",
        hint: "Undisputed regional leadership",
      },
    },
    enlacesRapidos: {
      sectionTitle: "Links of Interest",
      guia: "Invest in Honduras Guide",
      memoria: "Institutional Report",
      portal: "Digital Investment Portal",
      estudios: "CNI Studies View",
    },
    testimonials: {
      title: "Success stories",
      cta: "View all cases",
      items: [
        {
          quote:
            "Our country has hardworking people, fertile land, and a privileged location. Investing here means investing in sustainable growth with a human face.",
          name: "Naman Antonio Sánchez",
          role: "General Manager - Sinclair",
          initials: "NS",
        },
        {
          quote:
            "Honduras has incredible potential for investors seeking more than financial return; here you can generate real impact and build a sustainable future.",
          name: "David Dachner",
          role: "Owner Manager - Kimpton Grand Hotel",
          initials: "DD",
        },
      ],
    },
    postulacion: {
      eyebrow: "Project Desk",
      title: "DO YOU HAVE AN INVESTMENT PROJECT?",
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
        "Agroindustry",
        "Manufacturing",
        "Tourism",
        "Energy",
        "Infrastructure",
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
        "Key reasons regional and global capital choose the country as a hub for manufacturing, services, and energy.",
      cards: [
        {
          title: "Strategic Location",
          text: "Heart of the Americas with access to both oceans and privileged global connectivity for transatlantic and Pacific trade.",
        },
        {
          title: "Robust Legal Framework",
          text: "Modern investment protection laws and special regimes that guarantee legal certainty and long-term fiscal stability.",
        },
        {
          title: "Human Talent",
          text: "Young workforce, highly trained in advanced manufacturing, bilingual, and with a strong regional competitive work ethic.",
        },
      ],
    },
    graficos: {
      title: "Performance & Business Climate",
      ied: { label: "FDI Flow", value: "$1.24B", desc: "Constant Foreign Direct Investment attraction in strategic sectors." },
      negocios: { label: "Ease of Doing Business", value: "Improved", desc: "Optimization of government processes and operational single windows." },
      pib: { label: "GDP Growth", value: "3.8%", desc: "Economic expansion supported by exports and domestic consumption." },
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
      stats: [
        { value: "112,777 km²", label: "Territorial extension", hint: "Strategic location at the heart of the Americas." },
        { value: "58.6%", label: "Renewable energy", hint: "Diversified matrix with 10 energy sources." },
        { value: "9.89M", label: "Population", hint: "Young workforce with an average age of 31." },
        { value: "11 FTAs", label: "Trade treaties", hint: "Preferential access to 45+ nations." },
      ],
      cards: [
        {
          label: "FDI projected",
          delta: CIFRAS_VALUES[0].deltaEn,
          hint: "Annual foreign direct investment flow.",
          backText: "Honduras maintains a solid FDI flow, attracting capital to the energy, maquila, and telecommunications sectors.",
        },
        {
          label: "GDP growth",
          delta: CIFRAS_VALUES[1].deltaEn,
          hint: "Average gross domestic product expansion rate.",
          backText: "Macroeconomic performance is resilient, driven by consumption, remittances, and the recovery of agribusiness exports.",
        },
        {
          label: "Active projects",
          delta: CIFRAS_VALUES[2].deltaEn,
          hint: "Developments in the institutional pipeline.",
          backText: "The CNI provides comprehensive support to multiple private and public-private initiatives throughout the Investor Journey.",
        },
        {
          label: "Renewable matrix",
          delta: CIFRAS_VALUES[3].deltaEn,
          hint: "Share of renewable sources in the power mix.",
          backText: "The country is advancing its energy transition, leveraging its vast network of solar, wind, and hydroelectric resources.",
        },
        {
          label: "Goods exports",
          delta: CIFRAS_VALUES[4].deltaEn,
          hint: "Annual growth in foreign trade.",
          backText: "Premium agricultural products (coffee, cocoa, cigars) and apparel keep Honduras globally competitive.",
        },
        {
          label: "Young workforce",
          delta: CIFRAS_VALUES[5].deltaEn,
          hint: "Economically active population.",
          backText: "Honduran youth provide a key demographic dividend, increasingly oriented toward STEM careers and bilingualism.",
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
      title: "Strategic sectors",
      description:
        "Five priority engines promoted by the CNI to channel foreign capital with LPPI and ZOLI legal backing.",
      cta: "Full sector brief →",
      teasers: [
        { name: "Agroindustry", tagline: "Coffee, cocoa, and premium tobacco." },
        { name: "Manufacturing", tagline: "Nearshoring with Zero-Duty benefits." },
        { name: "Tourism", tagline: "Bay Islands and Maya archaeology." },
        { name: "Energy", tagline: "Solar, wind, and hydro." },
        { name: "Infrastructure", tagline: "Ports, roads, and connectivity." },
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
          imageAlt: "Investors meeting",
        },
        {
          date: "Mar 2025",
          title: "Honduras Investment Summit forum — Tegucigalpa",
          excerpt: "Dialogue among government, private sector, and multilateral partners to accelerate Ready to Invest projects.",
          imageAlt: "Investment forum",
        },
        {
          date: "Apr 2025",
          title: "CNI reports progress on the Investment Strategy to its board",
          excerpt: "Inform, promote, accompany, coordinate, and influence—operational results of the National Investment Council.",
          imageAlt: "CNI board meeting",
        },
      ],
    },
    newsletter: {
      title: "Stay ahead",
      description: "Subscribe to our quarterly investment outlook and CNI policy updates.",
      placeholder: "Work email address",
      button: "Join the network",
    },
    actionCards: {
      investTitle: "Invest in Honduras",
      investDesc: "Join our network of investors",
      growTitle: "Grow in Honduras",
      growDesc: "Learn about opportunities and investment projects to expand your operations in Honduras",
      moreInfo: "More information",
    },
    postulacionExtra: {
      advisoryTitle: "Technical Advisory",
      advisoryDesc: "Learn about opportunities and investment projects to expand your operations in Honduras",
      ctaProject: "Submit My Project",
    },
    graficosDashboard: {
      eyebrow: "Smart Dashboard",
      title: "Regional Comparison",
      downloadBtn: "Download Full Report",
      sources: "Sources: Central Bank of Honduras, GCBI Index 2025, IMF Projections.",
      ied: {
        label: "Report 2020-2025",
        title: "Foreign Direct Investment (USD Millions)",
        desc: "FDI at the end of 2024 was USD 993.9 million and at the end of the first half of 2025 it was USD 500.4 million, making this semester the largest recipient of foreign investment in recent years.",
        value: "$500.4M",
        insight: "The first half of 2025 reports a highly dynamic behavior in capital attraction.",
        source: "Source: Balance of Payments Section, External Sector Department, BCH",
      },
      pib: {
        label: "Projection 2024-2029",
        title: "Projected GDP Growth",
        desc: "In 2023 Honduras was the third economy with the highest growth in Central America and the fourth in the region. Projections indicate that growth will remain steady for 2024 and 2025, leading the region's countries, only behind Costa Rica.",
        value: "3.85%",
        insight: "Projections indicate that Honduras's economic dynamism will remain stable in the coming years.",
        source: "Own elaboration with data from the Projections Report 2024-2025, Central Bank of Honduras; ECLAC, Preliminary Overview of the Economies of LAC 2023 (Dec. 2023).",
      },
      clima: {
        label: "GCBI Index 2025",
        title: "Ease of doing business",
        desc: "Honduras is the most reliable country for doing business in Central America according to the Global Complexity Business Index (GCBI) 2025, published in the 12th annual report of TMF Group",
        value: "60 Pts",
        insight: "Reducing corporate complexity and simplifying procedures drives country confidence.",
        source: "Own elaboration with data from TMF Group, 2025.",
      },
    },
  },
};
