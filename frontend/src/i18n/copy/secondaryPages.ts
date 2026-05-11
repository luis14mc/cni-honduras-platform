import type { Locale } from "@/src/i18n/config";

export type PrensaItem = {
  typeKey: "news" | "event" | "release";
  date: string;
  title: string;
  summary: string;
};

export const prensaCopy: Record<
  Locale,
  {
    heroEyebrow: string;
    heroTitle: string;
    heroDescription: string;
    sectionEyebrow: string;
    sectionTitle: string;
    contactCta: string;
    readMore: string;
    types: { news: string; event: string; release: string };
    newsroomTitle: string;
    newsroomBody: string;
    items: ReadonlyArray<PrensaItem>;
  }
> = {
  es: {
    heroEyebrow: "Comunicación Institucional",
    heroTitle: "Sala de Prensa",
    heroDescription: "Noticias institucionales, eventos y comunicados oficiales del Consejo Nacional de Inversiones.",
    sectionEyebrow: "Actualidad",
    sectionTitle: "Lo más reciente",
    contactCta: "Contactar a comunicación →",
    readMore: "Leer más",
    types: { news: "Noticia", event: "Evento", release: "Comunicado" },
    newsroomTitle: "Newsroom para medios",
    newsroomBody: "Solicite voceros, agendas de prensa y materiales gráficos institucionales del CNI.",
    items: [
      {
        typeKey: "news",
        date: "12 Mar 2025",
        title: "Honduras consolida su presencia global con más de $58 millones en nuevas inversiones",
        summary:
          "El primer trimestre cerró con anuncios estratégicos en energía, agroindustria y servicios tecnológicos, articulados con el CNI.",
      },
      {
        typeKey: "event",
        date: "28 Mar 2025",
        title: "Foro Honduras Investment Summit — Tegucigalpa",
        summary:
          "Espacio de diálogo entre Estado, sector privado y multilaterales para presentar el Plan Maestro de Inversión Privada.",
      },
      {
        typeKey: "release",
        date: "05 Abr 2025",
        title: "El CNI presenta los primeros resultados de la Estrategia de Inversiones 2024",
        summary:
          "Cinco objetivos institucionales — informar, promocionar, acompañar, articular e incidir — guían la nueva ruta del inversionista.",
      },
    ],
  },
  en: {
    heroEyebrow: "Institutional communications",
    heroTitle: "Press room",
    heroDescription: "Institutional news, events, and official releases from the National Investment Council.",
    sectionEyebrow: "Latest",
    sectionTitle: "Most recent",
    contactCta: "Contact communications →",
    readMore: "Read more",
    types: { news: "News", event: "Event", release: "Release" },
    newsroomTitle: "Media newsroom",
    newsroomBody: "Request spokespeople, press schedules, and official CNI graphic materials.",
    items: [
      {
        typeKey: "news",
        date: "Mar 12, 2025",
        title: "Honduras strengthens its global footprint with over $58M in new investment",
        summary:
          "The first quarter closed with strategic announcements in energy, agribusiness, and technology services, coordinated with the CNI.",
      },
      {
        typeKey: "event",
        date: "Mar 28, 2025",
        title: "Honduras Investment Summit forum — Tegucigalpa",
        summary:
          "A dialogue space among government, private sector, and multilaterals to present the Master Plan for Private Investment.",
      },
      {
        typeKey: "release",
        date: "Apr 5, 2025",
        title: "The CNI presents first results of the 2024 Investment Strategy",
        summary:
          "Five institutional goals — inform, promote, accompany, coordinate, and influence — guide the new investor journey.",
      },
    ],
  },
};

export const tramitesCopy: Record<
  Locale,
  {
    heroEyebrow: string;
    heroTitle: string;
    heroDescription: string;
    sectionEyebrow: string;
    sectionTitle: string;
    sectionDescription: string;
    pdiTitle: string;
    pdiBody: string;
    pdiLink: string;
    advisoryCta: string;
    procedures: ReadonlyArray<{ title: string; text: string; cta: string }>;
  }
> = {
  es: {
    heroEyebrow: "Servicios digitales del Estado",
    heroTitle: "Trámites en Línea",
    heroDescription:
      "Acceda a los trámites institucionales para inversión, certificación de regímenes especiales y servicios públicos asociados, articulados con la Ventanilla Única del CNI.",
    sectionEyebrow: "Catálogo institucional",
    sectionTitle: "Trámites destacados",
    sectionDescription:
      "Cada trámite cuenta con acompañamiento del CNI durante la Ruta del Inversionista, sin costo para el solicitante.",
    pdiTitle: "Portal Digital de Inversiones",
    pdiBody:
      "Plataforma oficial del Estado donde se gestionan los trámites de inversión, con trazabilidad de expedientes y comunicación segura entre instituciones.",
    pdiLink: "Acceder a pdihonduras.gob.hn",
    advisoryCta: "Solicitar asesoría",
    procedures: [
      {
        title: "Registro de Inversión Extranjera",
        text: "Inscripción formal de inversión al amparo de la Ley de Promoción y Protección de Inversiones (LPPI).",
        cta: "Iniciar trámite",
      },
      {
        title: "Certificación ZOLI",
        text: "Solicitud y acompañamiento para incorporar empresas al régimen de Zonas Libres (ZOLI).",
        cta: "Solicitar certificación",
      },
      {
        title: "Permisos Ambientales",
        text: "Ruta unificada para licenciamiento ambiental coordinada con SERNA y demás reguladores.",
        cta: "Ver requisitos",
      },
      {
        title: "Visas Ejecutivas",
        text: "Trámite acelerado de visas de trabajo y residencia para personal extranjero clave.",
        cta: "Consultar guía",
      },
    ],
  },
  en: {
    heroEyebrow: "Digital government services",
    heroTitle: "Online procedures",
    heroDescription:
      "Access institutional procedures for investment, certification of special regimes, and related public services, coordinated through the CNI one-stop shop.",
    sectionEyebrow: "Institutional catalog",
    sectionTitle: "Featured procedures",
    sectionDescription:
      "Each procedure includes CNI support along the Investor Journey, at no cost to the applicant.",
    pdiTitle: "Digital Investment Portal",
    pdiBody:
      "The official state platform where investment procedures are managed, with case traceability and secure inter-agency communication.",
    pdiLink: "Open pdihonduras.gob.hn",
    advisoryCta: "Request advisory",
    procedures: [
      {
        title: "Foreign investment registration",
        text: "Formal investment registration under the Investment Promotion and Protection Law (LPPI).",
        cta: "Start procedure",
      },
      {
        title: "ZOLI certification",
        text: "Application and guidance to incorporate companies into the Free Zones regime (ZOLI).",
        cta: "Request certification",
      },
      {
        title: "Environmental permits",
        text: "Unified licensing route coordinated with SERNA and other regulators.",
        cta: "View requirements",
      },
      {
        title: "Executive visas",
        text: "Expedited work and residence visas for key foreign personnel.",
        cta: "View guide",
      },
    ],
  },
};

export const mapaCopy: Record<Locale, { title: string; loading: string }> = {
  es: { title: "Mapa Geoespacial interactivo", loading: "Cargando mapa…" },
  en: { title: "Interactive geospatial map", loading: "Loading map…" },
};
