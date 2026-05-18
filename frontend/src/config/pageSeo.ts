import type { PageSeo } from "@/src/lib/seo";

/**
 * Catálogo central de metadatos SEO por ruta canónica ES.
 * El template global ("· CNI Honduras") se añade automáticamente
 * desde el root layout vía `metadata.title.template`.
 */
export const PAGE_SEO: Record<string, PageSeo> = {
  home: {
    canonical: "/",
    enMirror: "/en",
    title: {
      es: "CNI Honduras · Invierte, Crece y Vive en Honduras",
      en: "CNI Honduras · Invest, Grow and Live in Honduras",
    },
    description: {
      es: "Portal oficial del Consejo Nacional de Inversiones de Honduras. Sectores estratégicos, ventajas competitivas y acompañamiento institucional gratuito para Inversión Extranjera Directa.",
      en: "Official portal of Honduras's National Investment Council. Strategic sectors, competitive advantages and free institutional support for Foreign Direct Investment.",
    },
    keywords: [
      "Invertir en Honduras",
      "FDI Honduras",
      "Nearshoring",
      "CNI Honduras",
      "Inversión Extranjera Directa",
      "Honduras Investment",
    ],
  },
  invertir: {
    canonical: "/invertir",
    enMirror: "/en/invest",
    title: {
      es: "Invertir en Honduras · Sectores Estratégicos y Ventajas Competitivas",
      en: "Invest in Honduras · Strategic Sectors and Competitive Advantages",
    },
    description: {
      es: "Conozca los cinco sectores estratégicos de inversión en Honduras: agroindustria premium, manufactura textil nearshoring, turismo sustentable, energía renovable y BPO multilingüe.",
      en: "Discover Honduras's five strategic investment sectors: premium agroindustry, nearshoring textile manufacturing, sustainable tourism, renewable energy and multilingual BPO.",
    },
    keywords: [
      "Sectores Honduras",
      "Nearshoring Honduras",
      "Agroindustria Honduras",
      "Manufactura Honduras",
      "Turismo Roatán",
      "Energía Renovable Honduras",
    ],
  },
  "invertir-por-que-honduras": {
    canonical: "/invertir/por-que-honduras",
    enMirror: "/en/invest/why-honduras",
    title: {
      es: "¿Por qué Honduras? · Ventajas Geoestratégicas para Inversión",
      en: "Why Honduras? · Geo-strategic Advantages for Investment",
    },
    description: {
      es: "Ubicación geoestratégica en Centroamérica, acceso preferencial a EE.UU. vía CAFTA-DR, fuerza laboral joven y matriz energética 60% limpia. Razones reales para invertir.",
      en: "Geo-strategic location in Central America, preferential US access via CAFTA-DR, young workforce and 60% clean energy matrix. Real reasons to invest.",
    },
    keywords: ["CAFTA-DR Honduras", "Ubicación geoestratégica Honduras", "Workforce Honduras", "Ventajas Honduras"],
  },
  "invertir-sectores": {
    canonical: "/invertir/sectores",
    enMirror: "/en/invest/sectors",
    title: {
      es: "Sectores de Inversión en Honduras · Catálogo Estratégico",
      en: "Investment Sectors in Honduras · Strategic Catalog",
    },
    description: {
      es: "Explore el catálogo completo de sectores priorizados por el CNI: agroindustria, manufactura, turismo, energía renovable e infraestructura, con métricas y casos de éxito.",
      en: "Explore the complete catalog of CNI-prioritized sectors: agroindustry, manufacturing, tourism, renewable energy and infrastructure, with metrics and success stories.",
    },
  },
  crecer: {
    canonical: "/crecer",
    enMirror: "/en/grow",
    title: {
      es: "Crecer en Honduras · Portafolio y Casos de Éxito",
      en: "Grow in Honduras · Portfolio and Success Stories",
    },
    description: {
      es: "Catálogo interactivo de proyectos Ready-to-Invest con CAPEX, proyecciones de empleo y ubicación geográfica. Conozca casos de éxito de multinacionales reinvirtiendo en Honduras.",
      en: "Interactive catalog of Ready-to-Invest projects with CAPEX, employment projections and geo-location. Discover success stories of multinationals reinvesting in Honduras.",
    },
    keywords: ["Ready to Invest Honduras", "Portafolio CNI", "Casos de éxito Honduras"],
  },
  "crecer-oportunidades": {
    canonical: "/crecer/oportunidades",
    enMirror: "/en/grow/opportunities",
    title: {
      es: "Oportunidades de Crecimiento · Inversión en Honduras",
      en: "Growth Opportunities · Investment in Honduras",
    },
    description: {
      es: "Ventanas de oportunidad sectoriales identificadas por el CNI para inversión, expansión y reinversión en Honduras.",
      en: "CNI-identified sector opportunity windows for investment, expansion and reinvestment in Honduras.",
    },
  },
  "crecer-acompanamiento": {
    canonical: "/crecer/acompanamiento",
    enMirror: "/en/grow/aftercare",
    title: {
      es: "Aftercare · Acompañamiento Post-Inversión del CNI",
      en: "Aftercare · Post-Investment Support from CNI",
    },
    description: {
      es: "Programa institucional de aftercare del CNI para asegurar la operación, expansión y reinversión continua de capital nacional y extranjero en Honduras.",
      en: "CNI's institutional aftercare program ensuring ongoing operations, expansion and reinvestment of national and foreign capital in Honduras.",
    },
  },
  vivir: {
    canonical: "/vivir",
    enMirror: "/en/live",
    title: {
      es: "Vivir en Honduras · Calidad de Vida para Ejecutivos Internacionales",
      en: "Live in Honduras · Quality of Life for International Executives",
    },
    description: {
      es: "Infraestructura médica moderna, red bilingüe internacional, zonas residenciales exclusivas, conectividad aérea y entorno cultural acogedor para ejecutivos y familias expatriadas.",
      en: "Modern medical infrastructure, international bilingual network, exclusive residential zones, air connectivity and welcoming cultural environment for executives and expat families.",
    },
    keywords: ["Vivir Honduras", "Expatriados Honduras", "Roatán residencial", "Educación bilingüe Honduras"],
  },
  "vivir-calidad-de-vida": {
    canonical: "/vivir/calidad-de-vida",
    enMirror: "/en/live/quality-of-life",
    title: {
      es: "Calidad de Vida en Honduras · Salud, Educación y Seguridad",
      en: "Quality of Life in Honduras · Health, Education and Security",
    },
    description: {
      es: "Detalle de servicios médicos, escolaridad internacional, seguridad corporativa y zonas residenciales exclusivas en Honduras.",
      en: "Detailed view of medical services, international schooling, corporate security and exclusive residential zones in Honduras.",
    },
  },
  cni: {
    canonical: "/cni",
    enMirror: "/en/cni",
    title: {
      es: "CNI · Servicios al Inversionista (Legal, Técnico, Datos)",
      en: "CNI · Investor Services (Legal, Technical, Data)",
    },
    description: {
      es: "Servicios institucionales del CNI: asesoría legal LPPI/ZOLI, acompañamiento técnico en permisos y aduanas, e inteligencia de datos sectoriales.",
      en: "CNI institutional services: LPPI/ZOLI legal advisory, technical support for permits and customs, and sector data intelligence.",
    },
  },
  "cni-servicios-legales": {
    canonical: "/cni/servicios-legales",
    enMirror: "/en/cni/legal-services",
    title: {
      es: "Servicios Legales CNI · LPPI, ZOLI y Estructuración Fiscal",
      en: "CNI Legal Services · LPPI, ZOLI and Tax Structuring",
    },
    description: {
      es: "Asesoría jurídica especializada sobre la Ley de Promoción y Protección de Inversiones (LPPI), zonas francas (ZOLI) y estructuración fiscal corporativa en Honduras.",
      en: "Specialized legal advisory on the Investment Promotion and Protection Law (LPPI), free trade zones (ZOLI) and corporate tax structuring in Honduras.",
    },
    keywords: ["LPPI Honduras", "ZOLI", "Estructuración fiscal Honduras", "Asesoría legal inversión"],
  },
  "cni-servicios-tecnicos": {
    canonical: "/cni/servicios-tecnicos",
    enMirror: "/en/cni/technical-services",
    title: {
      es: "Servicios Técnicos CNI · Permisos, Aduanas y Licencias",
      en: "CNI Technical Services · Permits, Customs and Licensing",
    },
    description: {
      es: "Acompañamiento técnico del CNI en permisos ambientales, trámites aduaneros, licencias sanitarias y mitigación de cuellos de botella burocráticos.",
      en: "CNI technical support for environmental permits, customs procedures, sanitary licensing and bureaucratic bottleneck mitigation.",
    },
  },
  "cni-inteligencia-datos": {
    canonical: "/cni/inteligencia-de-datos",
    enMirror: "/en/cni/data-intelligence",
    title: {
      es: "Inteligencia de Datos · Estudios y Reportes de Mercado CNI",
      en: "Data Intelligence · CNI Studies and Market Reports",
    },
    description: {
      es: "Estudios de pre-factibilidad, matrices de costos operativos (energía, salarios, tierra) y reportes de mercado a medida para inversionistas en Honduras.",
      en: "Pre-feasibility studies, operating cost matrices (energy, wages, land) and tailor-made market reports for investors in Honduras.",
    },
  },
  recursos: {
    canonical: "/recursos",
    enMirror: "/en/resources",
    title: {
      es: "Recursos · Guía del Inversionista de Honduras y Centro de Descargas",
      en: "Resources · Honduras Investment Guide and Download Center",
    },
    description: {
      es: "Repositorio oficial del CNI con la Honduras Investment Guide, boletines económicos trimestrales y compendios de leyes y normativas vigentes en PDF.",
      en: "Official CNI repository with the Honduras Investment Guide, quarterly economic bulletins and compendiums of current laws and regulations in PDF.",
    },
    keywords: ["Honduras Investment Guide", "Guía Inversionista Honduras", "Boletines económicos Honduras"],
  },
  prensa: {
    canonical: "/prensa",
    enMirror: "/en/news",
    title: {
      es: "Sala de Prensa CNI · Noticias y Comunicados Oficiales",
      en: "CNI Newsroom · Press Releases and Official Communications",
    },
    description: {
      es: "Comunicados oficiales del CNI, reportes de misiones comerciales, eventos internacionales de promoción y noticias económicas relevantes para inversionistas.",
      en: "Official CNI press releases, trade mission reports, international promotion events and economic news relevant to investors.",
    },
  },
  portafolio: {
    canonical: "/portafolio",
    enMirror: "/en/portfolio",
    title: {
      es: "Portafolio de Inversiones Honduras · Proyectos Ready-to-Invest",
      en: "Honduras Investment Portfolio · Ready-to-Invest Projects",
    },
    description: {
      es: "Catálogo estructurado de proyectos de inversión en Honduras con CAPEX, proyecciones de empleo, ubicación y métricas de viabilidad por sector.",
      en: "Structured catalog of investment projects in Honduras with CAPEX, employment projections, location and viability metrics by sector.",
    },
  },
  "portafolio-casos": {
    canonical: "/portafolio/casos",
    enMirror: "/en/portfolio/success-stories",
    title: {
      es: "Casos de Éxito · Inversiones Reales en Honduras",
      en: "Success Stories · Real Investments in Honduras",
    },
    description: {
      es: "Galería de corporaciones multinacionales que han expandido y reinvertido con éxito en Honduras: Kimpton, Sinclair, Dinant, Copantl, entre otras.",
      en: "Gallery of multinational corporations that have successfully expanded and reinvested in Honduras: Kimpton, Sinclair, Dinant, Copantl, among others.",
    },
  },
  "portafolio-postulacion": {
    canonical: "/portafolio/postulacion",
    enMirror: "/en/portfolio/submit",
    title: {
      es: "Postular Proyecto · Sumar al Portafolio Oficial del CNI",
      en: "Submit Project · Join the Official CNI Portfolio",
    },
    description: {
      es: "Postule su proyecto al Portafolio Oficial del CNI. Acceso a inversionistas globales, validación institucional y acompañamiento estructurado.",
      en: "Submit your project to the Official CNI Portfolio. Access to global investors, institutional validation and structured support.",
    },
  },
  "portafolio-mapa": {
    canonical: "/portafolio/mapa",
    enMirror: "/en/portfolio/map",
    title: {
      es: "Mapa de Inversión Honduras · Visualización Geoespacial",
      en: "Honduras Investment Map · Geo-spatial Visualization",
    },
    description: {
      es: "Mapa interactivo georreferenciado del portafolio de proyectos del CNI con clusters sectoriales, infraestructura y datos socioeconómicos.",
      en: "Interactive geo-referenced map of the CNI project portfolio with sector clusters, infrastructure and socioeconomic data.",
    },
  },
  asesoria: {
    canonical: "/asesoria",
    enMirror: "/en/advisory",
    title: {
      es: "Asesoría Gratuita · Oficiales de Inversión CNI",
      en: "Free Advisory · CNI Investment Officers",
    },
    description: {
      es: "Canal directo, gratuito y confidencial con oficiales de inversión del CNI para evaluar, estructurar y desplegar capital en Honduras.",
      en: "Direct, free and confidential channel with CNI investment officers to evaluate, structure and deploy capital in Honduras.",
    },
  },
  tramites: {
    canonical: "/tramites",
    enMirror: "/en/procedures",
    title: {
      es: "Trámites en Línea · Ventanilla Única del Inversionista",
      en: "Online Procedures · Investor One-Stop Shop",
    },
    description: {
      es: "Directorio centralizado de enlaces gubernamentales y herramientas digitales para constitución de empresas y gestiones administrativas de proyectos.",
      en: "Centralized directory of government links and digital tools for company formation and administrative project procedures.",
    },
  },
  "quienes-somos": {
    canonical: "/quienes-somos",
    enMirror: "/en/about-us",
    title: {
      es: "Quiénes Somos · Misión, Visión y Equipo del CNI",
      en: "About Us · CNI Mission, Vision and Team",
    },
    description: {
      es: "Conozca al Consejo Nacional de Inversiones de Honduras: misión, visión, valores institucionales, equipo directivo y la ruta del inversionista.",
      en: "Meet Honduras's National Investment Council: mission, vision, institutional values, leadership team and the investor journey.",
    },
  },
  contacto: {
    canonical: "/contacto",
    enMirror: "/en/contact",
    title: {
      es: "Contacto CNI Honduras · Centro Cívico Gubernamental",
      en: "Contact CNI Honduras · Government Civic Center",
    },
    description: {
      es: "Contacte al Consejo Nacional de Inversiones de Honduras. Oficinas en el Centro Cívico Gubernamental (CCG), Torre 1, Piso 12, Tegucigalpa.",
      en: "Contact Honduras's National Investment Council. Offices at the Government Civic Center (CCG), Tower 1, Floor 12, Tegucigalpa.",
    },
  },
};
