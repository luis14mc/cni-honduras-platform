import type { Locale } from "@/src/i18n/config";

export const cniPageCopy: Record<
  Locale,
  {
    heroEyebrow: string;
    heroTitleBefore: string;
    heroTitleAccent: string;
    heroDescription: string;
    heroImageAlt: string;
    legalEyebrow: string;
    legalTitle: string;
    legalDescription: string;
    legalCardTitle: string;
    legalCardBody: string;
    repatTitle: string;
    repatBody: string;
    fiscal: ReadonlyArray<{ title: string; text: string }>;
    techEyebrow: string;
    techTitle: string;
    techDescription: string;
    techItems: ReadonlyArray<{ title: string; text: string }>;
    roadmapTitle: string;
    roadmapDescription: string;
    steps: ReadonlyArray<{ code: string; title: string; text: string }>;
    dataEyebrow: string;
    dataTitle: string;
    dataDescription: string;
    dataCta: string;
    dataCards: ReadonlyArray<{ title: string; text: string }>;
    oneStopTitle: string;
    oneStopBody: string;
    oneStopBullets: readonly string[];
    oneStopCta: string;
    freeLabel: string;
    freeTagline: string;
    freeList: readonly string[];
  }
> = {
  es: {
    heroEyebrow: "Servicios del Consejo Nacional de Inversiones",
    heroTitleBefore: "Un Marco para el",
    heroTitleAccent: "Crecimiento",
    heroDescription:
      "Honduras ofrece una arquitectura legal sólida diseñada para garantizar seguridad total al inversor, predictibilidad fiscal y protección de capital de clase mundial — todo gestionado por el CNI sin costo.",
    heroImageAlt: "Arquitectura institucional moderna",
    legalEyebrow: "01 — Servicios Legales",
    legalTitle: "Asesoría LPPI, ZOLI y estructuración corporativa",
    legalDescription:
      "Acompañamiento jurídico institucional, gratuito, para que cada decisión cuente con el respaldo del marco normativo hondureño.",
    legalCardTitle: "Arbitraje Internacional y Garantías Soberanas",
    legalCardBody:
      "Acceso a mecanismos internacionales de resolución de disputas, protección constitucional contra expropiación y trato no discriminatorio para entidades extranjeras.",
    repatTitle: "Repatriación de capital",
    repatBody:
      "Plena libertad para transferir utilidades, dividendos y capital inicial al país de origen en monedas convertibles.",
    fiscal: [
      {
        title: "Ley de Promoción y Protección de Inversiones (LPPI)",
        text: "Igualdad de trato, protección al capital, libertad de repatriación y arbitraje internacional como mecanismo de resolución.",
      },
      {
        title: "Zonas Libres (ZOLI)",
        text: "Exoneraciones fiscales, importación con cero aranceles para maquinaria y materias primas, y régimen aduanero especial.",
      },
      {
        title: "Estructuración Corporativa",
        text: "Diseño de vehículos legales, fideicomisos, joint ventures y planificación de gobierno corporativo a la medida.",
      },
    ],
    techEyebrow: "02 — Servicios Técnicos",
    techTitle: "Acompañamiento operativo en cada permiso",
    techDescription:
      "Coordinación interinstitucional para que su proyecto pase del expediente al terreno: ambiente, aduanas, municipalidades y servicios públicos.",
    techItems: [
      {
        title: "Permisos ambientales",
        text: "Licenciamiento ambiental consolidado y acompañamiento técnico ante SERNA y demás reguladores.",
      },
      {
        title: "Aduanas y comercio",
        text: "Optimización aduanera, regímenes especiales, certificación de origen CAFTA-DR y trazabilidad logística.",
      },
      {
        title: "Trámites operativos",
        text: "Pasarela unificada para licencias municipales, registros tributarios y visas de trabajo ejecutivas.",
      },
    ],
    roadmapTitle: "Hoja de Ruta Regulatoria",
    roadmapDescription:
      "Un viaje optimizado desde la consulta inicial hasta el estado operativo, supervisado por nuestra división de cumplimiento.",
    steps: [
      { code: "01", title: "Descubrimiento Legal", text: "Consulta inicial y desarrollo de un informe legal específico por sector." },
      { code: "02", title: "Registro de Entidad", text: "Incorporación expedita en 48 horas y emisión de identificación fiscal." },
      { code: "03", title: "Aprobación de Incentivos", text: "Solicitud formal y certificación para regímenes de exención bajo LPPI y ZOLI." },
      { code: "04", title: "Activación del Proyecto", text: "Autorización total de cumplimiento legal e inicio de operaciones." },
    ],
    dataEyebrow: "03 — Inteligencia de Datos",
    dataTitle: "Estudios y analítica para decidir con evidencia",
    dataDescription:
      "El CNI provee estudios de pre-factibilidad, benchmarking de costos energéticos, salarios sectoriales y análisis logístico para reducir el riesgo de su tesis.",
    dataCta: "Repositorio de datos →",
    dataCards: [
      { title: "Pre-factibilidad", text: "Diagnóstico de viabilidad por sector y región." },
      { title: "Costos energéticos", text: "Tarifas, perfiles de consumo y proyecciones." },
      { title: "Salarios y talento", text: "Bandas salariales, productividad y disponibilidad." },
      { title: "Logística", text: "Costos de transporte, tiempos puerto-a-puerta y nodos." },
    ],
    oneStopTitle: "Ventanilla Única para el Inversor",
    oneStopBody:
      "Eliminamos la burocracia con un único punto de contacto. Nuestro equipo coordina con las instituciones del Estado, gestiona permisos y certificaciones ambientales en su nombre.",
    oneStopBullets: [
      "Licenciamiento Ambiental Consolidado",
      "Visas de Trabajo de Vía Rápida para Ejecutivos",
      "Pasarela Unificada de Licencias Municipales",
    ],
    oneStopCta: "Consultar a un experto",
    freeLabel: "Sin costo",
    freeTagline: "Toda la Ruta del Inversionista, gestionada por el CNI.",
    freeList: ["· Informar", "· Promocionar", "· Acompañar", "· Articular", "· Incidir"],
  },
  en: {
    heroEyebrow: "National Investment Council services",
    heroTitleBefore: "A framework for",
    heroTitleAccent: "growth",
    heroDescription:
      "Honduras offers a solid legal architecture designed for full investor security, fiscal predictability, and world-class capital protection—managed by the CNI at no cost.",
    heroImageAlt: "Modern institutional architecture",
    legalEyebrow: "01 — Legal services",
    legalTitle: "LPPI, ZOLI, and corporate structuring advisory",
    legalDescription:
      "Free institutional legal support so every decision is backed by the Honduran regulatory framework.",
    legalCardTitle: "International arbitration & sovereign guarantees",
    legalCardBody:
      "Access to international dispute mechanisms, constitutional protection against expropriation, and non-discriminatory treatment for foreign entities.",
    repatTitle: "Capital repatriation",
    repatBody: "Full freedom to transfer profits, dividends, and initial capital to the country of origin in convertible currencies.",
    fiscal: [
      {
        title: "Investment Promotion and Protection Law (LPPI)",
        text: "Equal treatment, capital protection, free repatriation, and international arbitration as a dispute resolution mechanism.",
      },
      {
        title: "Free Zones (ZOLI)",
        text: "Tax exemptions, zero-duty imports for machinery and raw materials, and a special customs regime.",
      },
      {
        title: "Corporate structuring",
        text: "Design of legal vehicles, trusts, joint ventures, and tailored corporate governance planning.",
      },
    ],
    techEyebrow: "02 — Technical services",
    techTitle: "Operational support for every permit",
    techDescription:
      "Inter-agency coordination so your project moves from paperwork to ground-breaking: environment, customs, municipalities, and public utilities.",
    techItems: [
      {
        title: "Environmental permits",
        text: "Consolidated environmental licensing and technical support before SERNA and other regulators.",
      },
      {
        title: "Customs & trade",
        text: "Customs optimization, special regimes, CAFTA-DR origin certification, and logistics traceability.",
      },
      {
        title: "Operational procedures",
        text: "Unified pathway for municipal licenses, tax registrations, and executive work visas.",
      },
    ],
    roadmapTitle: "Regulatory roadmap",
    roadmapDescription:
      "An optimized journey from initial consultation to operational status, supervised by our compliance division.",
    steps: [
      { code: "01", title: "Legal discovery", text: "Initial consultation and sector-specific legal memorandum." },
      { code: "02", title: "Entity registration", text: "Fast-track incorporation within 48 hours and tax ID issuance." },
      { code: "03", title: "Incentive approval", text: "Formal application and certification for LPPI and ZOLI exemption regimes." },
      { code: "04", title: "Project activation", text: "Full legal compliance authorization and start of operations." },
    ],
    dataEyebrow: "03 — Data intelligence",
    dataTitle: "Studies and analytics for evidence-based decisions",
    dataDescription:
      "The CNI provides pre-feasibility studies, energy cost benchmarking, sector salary bands, and logistics analysis to reduce thesis risk.",
    dataCta: "Data repository →",
    dataCards: [
      { title: "Pre-feasibility", text: "Viability diagnostics by sector and region." },
      { title: "Energy costs", text: "Tariffs, consumption profiles, and projections." },
      { title: "Salaries & talent", text: "Salary bands, productivity, and availability." },
      { title: "Logistics", text: "Transport costs, port-to-port times, and nodes." },
    ],
    oneStopTitle: "Investor one-stop shop",
    oneStopBody:
      "We cut bureaucracy with a single point of contact. Our team coordinates with government agencies and manages permits and environmental certifications on your behalf.",
    oneStopBullets: [
      "Consolidated environmental licensing",
      "Fast-track executive work visas",
      "Unified municipal licensing gateway",
    ],
    oneStopCta: "Speak with an expert",
    freeLabel: "Free of charge",
    freeTagline: "The full Investor Journey, managed by the CNI.",
    freeList: ["· Inform", "· Promote", "· Accompany", "· Coordinate", "· Influence"],
  },
};
