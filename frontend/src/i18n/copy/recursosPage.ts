import type { Locale } from "@/src/i18n/config";

type Folder = {
  name: string;
  description: string;
  count: string;
  href: string;
  featured?: boolean;
};

type Doc = {
  title: string;
  subtitle: string;
  category: string;
  size: string;
  date: string;
};

const esFolders: ReadonlyArray<Folder> = [
  {
    name: "Guía del Inversionista",
    description:
      "Honduras Investment Guide. Documento maestro con el marco económico, fiscal y operativo para decidir desplegar capital en el país.",
    count: "24 archivos",
    href: "#guia",
    featured: true,
  },
  {
    name: "Boletines Estadísticos",
    description:
      "Series históricas y proyecciones del Banco Central, INE y el CNI con indicadores macro, exportaciones y empleo sectorial.",
    count: "48 archivos",
    href: "#boletines",
  },
  {
    name: "Leyes y Normativas",
    description:
      "Documentación legal vigente: Ley de Promoción y Protección de Inversiones (LPPI), Zonas Libres (ZOLI) y regulaciones sectoriales.",
    count: "62 archivos",
    href: "#leyes",
  },
];

const enFolders: ReadonlyArray<Folder> = [
  {
    name: "Investor guide",
    description:
      "Honduras Investment Guide. Master document covering economic, fiscal, and operating frameworks for capital deployment decisions.",
    count: "24 files",
    href: "#guia",
    featured: true,
  },
  {
    name: "Statistical bulletins",
    description:
      "Historical series and projections from the central bank, statistics office, and the CNI with macro indicators, exports, and sector employment.",
    count: "48 files",
    href: "#boletines",
  },
  {
    name: "Laws & regulations",
    description:
      "Current legal documentation: LPPI, Free Zones (ZOLI), and sector regulations.",
    count: "62 files",
    href: "#leyes",
  },
];

const esDocs: ReadonlyArray<Doc> = [
  {
    title: "Honduras Investment Guide 2024",
    subtitle: "Visión país, marco fiscal y oportunidades sectoriales priorizadas.",
    category: "Guía",
    size: "8.4 MB",
    date: "Oct 2024",
  },
  {
    title: "Boletín Estadístico Trimestral Q3 2024",
    subtitle: "Indicadores macroeconómicos y flujos de IED por sector y región.",
    category: "Boletines",
    size: "3.1 MB",
    date: "Oct 2024",
  },
  {
    title: "Ley de Promoción y Protección de Inversiones (LPPI)",
    subtitle: "Texto vigente y reglamento operativo del régimen LPPI.",
    category: "Legal",
    size: "1.6 MB",
    date: "Vigente",
  },
  {
    title: "Régimen de Zonas Libres (ZOLI)",
    subtitle: "Beneficios fiscales, requisitos y procedimientos para acceder al régimen ZOLI.",
    category: "Legal",
    size: "1.2 MB",
    date: "Vigente",
  },
  {
    title: "Boletín Sector Energía 2024",
    subtitle: "Matriz renovable, demanda futura y oportunidades de generación distribuida.",
    category: "Boletines",
    size: "2.4 MB",
    date: "Sep 2024",
  },
];

const enDocs: ReadonlyArray<Doc> = [
  {
    title: "Honduras Investment Guide 2024",
    subtitle: "Country vision, fiscal framework, and priority sector opportunities.",
    category: "Guide",
    size: "8.4 MB",
    date: "Oct 2024",
  },
  {
    title: "Quarterly statistical bulletin Q3 2024",
    subtitle: "Macro indicators and FDI flows by sector and region.",
    category: "Bulletins",
    size: "3.1 MB",
    date: "Oct 2024",
  },
  {
    title: "Investment Promotion and Protection Law (LPPI)",
    subtitle: "Current text and operating regulations for the LPPI regime.",
    category: "Legal",
    size: "1.6 MB",
    date: "In force",
  },
  {
    title: "Free Zones regime (ZOLI)",
    subtitle: "Tax benefits, requirements, and procedures to access ZOLI.",
    category: "Legal",
    size: "1.2 MB",
    date: "In force",
  },
  {
    title: "Energy sector bulletin 2024",
    subtitle: "Renewable matrix, future demand, and distributed generation opportunities.",
    category: "Bulletins",
    size: "2.4 MB",
    date: "Sep 2024",
  },
];

export const recursosPageCopy: Record<
  Locale,
  {
    heroEyebrow: string;
    heroTitle: string;
    heroDescription: string;
    heroImageAlt: string;
    searchLabel: string;
    searchPlaceholder: string;
    explorerEyebrow: string;
    explorerTitle: string;
    exploreFolder: string;
    recentEyebrow: string;
    recentTitle: string;
    recentDescription: string;
    thResource: string;
    thCategory: string;
    thSize: string;
    thAction: string;
    download: string;
    ctaTitle: string;
    ctaBody: string;
    ctaData: string;
    ctaCni: string;
    folders: ReadonlyArray<Folder>;
    docs: ReadonlyArray<Doc>;
  }
> = {
  es: {
    heroEyebrow: "Portal Institucional",
    heroTitle: "Centro de Recursos para el Inversor",
    heroDescription:
      "Un repositorio central para la debida diligencia institucional: marcos legales, boletines estadísticos y guías de inversión esenciales para el despliegue de capital.",
    heroImageAlt: "Fachada institucional",
    searchLabel: "Buscar recursos",
    searchPlaceholder: "Buscar marcos legales, boletines o guías…",
    explorerEyebrow: "Explorador de Recursos",
    explorerTitle: "Bibliotecas de Documentos",
    exploreFolder: "Explorar carpeta",
    recentEyebrow: "Recursos Institucionales Recientes",
    recentTitle: "Documentos destacados",
    recentDescription: "Selección de descargas frecuentemente consultadas por el ecosistema de inversionistas.",
    thResource: "Recurso",
    thCategory: "Categoría",
    thSize: "Tamaño / Fecha",
    thAction: "Acción",
    download: "Descargar",
    ctaTitle: "¿Necesita datos específicos para su tesis?",
    ctaBody:
      "Nuestros analistas atienden solicitudes personalizadas: modelos de prefactibilidad, perfiles sectoriales y benchmarking.",
    ctaData: "Solicitar dato a medida",
    ctaCni: "Servicios del CNI",
    folders: esFolders,
    docs: esDocs,
  },
  en: {
    heroEyebrow: "Institutional portal",
    heroTitle: "Investor resource center",
    heroDescription:
      "A central repository for institutional due diligence: legal frameworks, statistical bulletins, and essential investment guides for capital deployment.",
    heroImageAlt: "Institutional building facade",
    searchLabel: "Search resources",
    searchPlaceholder: "Search laws, bulletins, or guides…",
    explorerEyebrow: "Resource explorer",
    explorerTitle: "Document libraries",
    exploreFolder: "Open folder",
    recentEyebrow: "Recent institutional resources",
    recentTitle: "Featured documents",
    recentDescription: "Frequently downloaded materials used across the investor ecosystem.",
    thResource: "Resource",
    thCategory: "Category",
    thSize: "Size / Date",
    thAction: "Action",
    download: "Download",
    ctaTitle: "Need bespoke data for your thesis?",
    ctaBody:
      "Our analysts handle tailored requests: pre-feasibility models, sector profiles, and benchmarking.",
    ctaData: "Request custom data",
    ctaCni: "CNI services",
    folders: enFolders,
    docs: enDocs,
  },
};
