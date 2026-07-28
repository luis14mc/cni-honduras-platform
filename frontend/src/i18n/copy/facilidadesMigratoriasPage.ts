import type { Locale } from "@/src/i18n/config";

export const MIGRATORY_DOCUMENTS = {
  solicitud:
    "https://cni.hn/wp-content/uploads/2026/07/FORMATO-DE-SOLICITUD.docx",
  acta: "https://cni.hn/wp-content/uploads/2026/07/ACTA-DE-RESPONSABILIDAD.docx",
  comunicado:
    "https://cni.hn/wp-content/uploads/2026/07/Comunicado-Facilidades-Migratorias.pdf",
} as const;

export const MIGRATORY_SOCIAL_POSTS = [
  {
    href: "https://www.instagram.com/p/Dali2wrFSVl/",
    label: { es: "Facilidades Migratorias · Parte 1", en: "Migratory Facilities · Part 1" },
  },
  {
    href: "https://www.instagram.com/p/Dalx2mllTGi/",
    label: { es: "Facilidades Migratorias · Parte 2", en: "Migratory Facilities · Part 2" },
  },
  {
    href: "https://www.instagram.com/p/DamAPOoFQm1/",
    label: { es: "Facilidades Migratorias · Parte 3", en: "Migratory Facilities · Part 3" },
  },
] as const;

export const facilidadesMigratoriasPageCopy: Record<
  Locale,
  {
    heroEyebrow: string;
    heroTitle: string;
    heroDescription: string;
    heroCta: string;
    documentsEyebrow: string;
    documentsTitle: string;
    documentsDescription: string;
    documents: ReadonlyArray<{
      id: "solicitud" | "acta" | "comunicado";
      title: string;
      description: string;
      bullets: readonly string[];
      cta: string;
    }>;
    importantNoteTitle: string;
    importantNote: string;
    updateEyebrow: string;
    updateTitle: string;
    updateDescription: string;
    updateDocTitle: string;
    updateDocMeta: string;
    openPdf: string;
    downloadPdf: string;
    pdfFallback: string;
    infoEyebrow: string;
    infoTitle: string;
    infoDescription: string;
    infoItems: ReadonlyArray<{ title: string; paragraphs: readonly string[]; bullets?: readonly string[] }>;
    mapEyebrow: string;
    mapTitle: string;
    mapDescription: string;
    mapBaseline: string;
    mapLegend: ReadonlyArray<{ tone: "green" | "amber" | "red"; label: string; text: string }>;
    mapNote: string;
    socialEyebrow: string;
    socialTitle: string;
    socialDescription: string;
    socialMore: string;
    ctaTitle: string;
    ctaDescription: string;
    ctaButton: string;
    advisoryCta: string;
  }
> = {
  es: {
    heroEyebrow: "Despacho de Promoción de Inversiones",
    heroTitle: "Facilidad Migratoria en Materia de Inversión",
    heroDescription:
      "Servicio de uso exclusivo para empresas debidamente registradas en el país que quieran gestionar facilidades migratorias en materia de inversión en Honduras.",
    heroCta: "Recursos migratorios",
    documentsEyebrow: "Recursos migratorios",
    documentsTitle: "Documentos para la gestión de facilidades migratorias",
    documentsDescription:
      "Descargue los documentos requeridos para presentar solicitudes de facilidades migratorias vinculadas a actividades de inversión, visitas técnicas, prospección empresarial y proyectos en Honduras.",
    documents: [
      {
        id: "solicitud",
        title: "Formato de Solicitud",
        description:
          "Documento base para solicitar la gestión de una facilidad migratoria a favor de un ciudadano extranjero vinculado a actividades de inversión en Honduras.",
        bullets: [
          "Datos de la empresa solicitante",
          "Información del ciudadano extranjero",
          "Pasaporte, nacionalidad y propósito del ingreso",
          "Fecha de ingreso, salida y punto migratorio",
        ],
        cta: "Descargar formato",
      },
      {
        id: "acta",
        title: "Acta de Responsabilidad",
        description:
          "Formato mediante el cual la empresa declara y asume responsabilidad por la permanencia temporal del ciudadano extranjero en el territorio nacional.",
        bullets: [
          "Responsabilidad por estadía y alimentación",
          "Responsabilidad por transporte interno",
          "Compromiso sobre entrada y salida del país",
          "Cumplimiento del período declarado",
        ],
        cta: "Descargar acta",
      },
      {
        id: "comunicado",
        title: "Comunicado Oficial",
        description:
          "Documento informativo sobre la actualización del procedimiento para facilidades migratorias de ingreso a Honduras en materia de inversiones.",
        bullets: [
          "Vigencia a partir del 13 de julio de 2026",
          "Uso exclusivo para inversionistas y empresarios extranjeros",
          "Requisitos y documentación requerida",
          "Consideraciones generales del proceso",
        ],
        cta: "Descargar comunicado",
      },
    ],
    importantNoteTitle: "Nota importante",
    importantNote:
      "Antes de presentar la solicitud, la empresa debe contar con la información completa del ciudadano extranjero, el propósito de ingreso, las fechas de entrada y salida, el acta de responsabilidad en papel membretado, el itinerario de viaje, pasaporte vigente y la Constancia de Inversionista emitida por el CNI.",
    updateEyebrow: "Comunicado oficial",
    updateTitle: "Actualización del Procedimiento para Facilidades Migratorias",
    updateDescription:
      "Consulte el comunicado oficial sobre el procedimiento para facilidades migratorias de ingreso a Honduras en materia de inversiones, aplicable para inversionistas, personal y empresarios extranjeros.",
    updateDocTitle: "Comunicado Facilidades Migratorias",
    updateDocMeta: "Documento PDF · Vigencia a partir del 13 de julio de 2026",
    openPdf: "Abrir PDF",
    downloadPdf: "Descargar",
    pdfFallback: "Si el visor no carga correctamente, puede abrir el comunicado en una nueva pestaña.",
    infoEyebrow: "Primera Fase · Facilidades Migratorias",
    infoTitle: "Información General",
    infoDescription:
      "Conoce qué son las facilidades migratorias, quién puede solicitarlas, qué institución las emite y en qué casos aplican para actividades vinculadas a inversión en Honduras.",
    infoItems: [
      {
        title: "¿Qué es la facilidad migratoria?",
        paragraphs: [
          "La facilidad migratoria es un proceso legal y administrativo que permite regular el ingreso y la permanencia de ciudadanos extranjeros en Honduras, conforme a la normativa migratoria vigente.",
        ],
      },
      {
        title: "¿Quién puede solicitarla?",
        paragraphs: [
          "De acuerdo con la Ley de Migración y Extranjería, las facilidades migratorias deben ser solicitadas por los Secretarios de Estado de la República de Honduras, según el rubro o sector correspondiente.",
          "En materia de inversión, el sector privado puede gestionar la solicitud a través del Despacho de Promoción de Inversiones.",
        ],
      },
      {
        title: "¿Quién la emite?",
        paragraphs: [
          "Las facilidades migratorias son aprobadas y emitidas por el Instituto Nacional de Migración, como autoridad competente en materia migratoria.",
        ],
      },
      {
        title: "¿Por qué se solicita?",
        paragraphs: [
          "La facilidad migratoria permite autorizar el ingreso de ciudadanos extranjeros en las categorías migratorias “B” y “C”, cuando existan motivos relacionados con:",
        ],
        bullets: ["Misiones oficiales", "Razones humanitarias", "Trabajo"],
      },
      {
        title: "En materia de inversión",
        paragraphs: [
          "El Despacho de Promoción de Inversiones gestionará solicitudes de empresas para ciudadanos extranjeros que ingresen al país por actividades vinculadas a inversión, tales como:",
        ],
        bullets: [
          "Visitas exploratorias o de prospección",
          "Servicios de mantenimiento",
          "Procesos de capacitación técnica",
          "Otras actividades vinculadas a proyectos de inversión",
        ],
      },
    ],
    mapEyebrow: "Investor Facilitation",
    mapTitle: "Honduras Investor Entry Access Map",
    mapDescription:
      "Vista pública de acceso migratorio para inversionistas por país de pasaporte/origen. Clasificación visual tipo semáforo para orientar el acompañamiento inicial.",
    mapBaseline: "Baseline: Anexo I Listado de Visas · 23 Oct 2024",
    mapLegend: [
      {
        tone: "green",
        label: "Green",
        text: "Visa-exempt / fast access. Enviar checklist estándar de entrada y agenda de reuniones.",
      },
      {
        tone: "amber",
        label: "Amber",
        text: "Ruta consular. Confirmar requisitos y tiempos antes de fijar agenda comercial.",
      },
      {
        tone: "red",
        label: "Red",
        text: "Visa consultada / autorización previa. Coordinar acompañamiento con anticipación.",
      },
    ],
    mapNote:
      "Nota: esta visualización es una guía pública de facilitación; la validación final debe realizarse contra la normativa migratoria aplicable.",
    socialEyebrow: "Noticias y publicaciones",
    socialTitle: "Facilidades Migratorias en redes sociales",
    socialDescription:
      "Consulte las publicaciones oficiales relacionadas con la actualización del procedimiento para facilidades migratorias en materia de inversión.",
    socialMore: "Ver más publicaciones",
    ctaTitle: "Acelera tu proceso de inversión en Honduras",
    ctaDescription: "Contacta al CNI para asistencia gratuita",
    ctaButton: "Contacta al CNI",
    advisoryCta: "Solicitar asesoría",
  },
  en: {
    heroEyebrow: "Investment Promotion Office",
    heroTitle: "Investment-Related Migratory Facility",
    heroDescription:
      "Exclusive service for duly registered companies in the country seeking to manage migratory facilities for investment-related activities in Honduras.",
    heroCta: "Migratory resources",
    documentsEyebrow: "Migratory resources",
    documentsTitle: "Documents for managing migratory facilities",
    documentsDescription:
      "Download the required documents to submit migratory facility requests linked to investment activities, technical visits, business prospecting, and projects in Honduras.",
    documents: [
      {
        id: "solicitud",
        title: "Application Form",
        description:
          "Base document to request management of a migratory facility for a foreign national linked to investment activities in Honduras.",
        bullets: [
          "Applicant company details",
          "Foreign national information",
          "Passport, nationality, and purpose of entry",
          "Entry date, exit date, and border point",
        ],
        cta: "Download form",
      },
      {
        id: "acta",
        title: "Letter of Responsibility",
        description:
          "Form by which the company declares and assumes responsibility for the temporary stay of the foreign national in the country.",
        bullets: [
          "Responsibility for lodging and meals",
          "Responsibility for internal transportation",
          "Commitment regarding entry and exit",
          "Compliance with the declared period",
        ],
        cta: "Download letter",
      },
      {
        id: "comunicado",
        title: "Official Announcement",
        description:
          "Information document on the updated procedure for investment-related migratory entry facilities in Honduras.",
        bullets: [
          "Effective from July 13, 2026",
          "Exclusive use for foreign investors and businesspeople",
          "Required documentation",
          "General process considerations",
        ],
        cta: "Download announcement",
      },
    ],
    importantNoteTitle: "Important note",
    importantNote:
      "Before submitting the request, the company must have complete information on the foreign national, purpose of entry, entry and exit dates, letter of responsibility on letterhead, travel itinerary, valid passport, and the Investor Certificate issued by the CNI.",
    updateEyebrow: "Official announcement",
    updateTitle: "Updated Procedure for Migratory Facilities",
    updateDescription:
      "Review the official announcement on investment-related migratory entry facilities in Honduras, applicable to foreign investors, personnel, and businesspeople.",
    updateDocTitle: "Migratory Facilities Announcement",
    updateDocMeta: "PDF document · Effective from July 13, 2026",
    openPdf: "Open PDF",
    downloadPdf: "Download",
    pdfFallback: "If the viewer does not load correctly, you can open the announcement in a new tab.",
    infoEyebrow: "Phase One · Migratory Facilities",
    infoTitle: "General Information",
    infoDescription:
      "Learn what migratory facilities are, who may request them, which institution issues them, and when they apply to investment-related activities in Honduras.",
    infoItems: [
      {
        title: "What is a migratory facility?",
        paragraphs: [
          "A migratory facility is a legal and administrative process that regulates the entry and stay of foreign nationals in Honduras under current immigration regulations.",
        ],
      },
      {
        title: "Who can request it?",
        paragraphs: [
          "Under the Migration and Aliens Law, migratory facilities must be requested by Secretaries of State of the Republic of Honduras according to the relevant sector.",
          "For investment matters, the private sector may manage the request through the Investment Promotion Office.",
        ],
      },
      {
        title: "Who issues it?",
        paragraphs: [
          "Migratory facilities are approved and issued by the National Migration Institute as the competent immigration authority.",
        ],
      },
      {
        title: "Why is it requested?",
        paragraphs: [
          "The migratory facility authorizes entry of foreign nationals in categories “B” and “C” when there are reasons related to:",
        ],
        bullets: ["Official missions", "Humanitarian reasons", "Work"],
      },
      {
        title: "For investment matters",
        paragraphs: [
          "The Investment Promotion Office will manage company requests for foreign nationals entering the country for investment-related activities such as:",
        ],
        bullets: [
          "Exploratory or prospecting visits",
          "Maintenance services",
          "Technical training processes",
          "Other activities linked to investment projects",
        ],
      },
    ],
    mapEyebrow: "Investor Facilitation",
    mapTitle: "Honduras Investor Entry Access Map",
    mapDescription:
      "Public view of migratory access for investors by passport/country of origin. Traffic-light classification to guide initial support.",
    mapBaseline: "Baseline: Annex I Visa List · Oct 23, 2024",
    mapLegend: [
      {
        tone: "green",
        label: "Green",
        text: "Visa-exempt / fast access. Send standard entry checklist and meeting agenda.",
      },
      {
        tone: "amber",
        label: "Amber",
        text: "Consular route. Confirm requirements and timelines before setting a business agenda.",
      },
      {
        tone: "red",
        label: "Red",
        text: "Consulted visa / prior authorization. Coordinate support well in advance.",
      },
    ],
    mapNote:
      "Note: this visualization is a public facilitation guide; final validation must be performed against applicable immigration regulations.",
    socialEyebrow: "News and publications",
    socialTitle: "Migratory Facilities on social media",
    socialDescription:
      "Review official publications related to the updated investment-related migratory facilities procedure.",
    socialMore: "View more publications",
    ctaTitle: "Accelerate your investment process in Honduras",
    ctaDescription: "Contact the CNI for free assistance",
    ctaButton: "Contact CNI",
    advisoryCta: "Request advisory",
  },
};

export function migratoryDocumentHref(id: "solicitud" | "acta" | "comunicado"): string {
  return MIGRATORY_DOCUMENTS[id];
}
