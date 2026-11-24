import type { Locale } from "@/src/i18n/config";
import type { NewsCategory } from "@/src/types/cms";
import { homeCopy } from "./home";

export const newsCategoryLabels: Record<Locale, Record<NewsCategory, string>> = {
  es: {
    news: "Noticia",
    press_release: "Comunicado",
    event: "Evento",
    announcement: "Anuncio",
    article: "Artículo",
  },
  en: {
    news: "News",
    press_release: "Press release",
    event: "Event",
    announcement: "Announcement",
    article: "Article",
  },
};

export function homeSectionCopy(locale: Locale) {
  const hc = homeCopy[locale];
  const partnerBenefits =
    locale === "es"
      ? [
          { icon: "diversity_3", title: "Acompañamiento Integral" },
          { icon: "person_pin_circle", title: "Punto de Contacto Único" },
          { icon: "manage_search", title: "Información Actualizada" },
          { icon: "cases", title: "Portafolio Exclusivo" },
          { icon: "assured_workload", title: "Respaldo Gubernamental" },
          { icon: "hub", title: "Conexiones Estratégicas" },
        ]
      : [
          { icon: "diversity_3", title: "End-to-End Support" },
          { icon: "person_pin_circle", title: "Single Point of Contact" },
          { icon: "manage_search", title: "Up-to-Date Information" },
          { icon: "cases", title: "Exclusive Portfolio" },
          { icon: "assured_workload", title: "Government Backing" },
          { icon: "hub", title: "Strategic Connections" },
        ];

  const testimonialsCopy = hc.testimonials ?? {
    eyebrow: locale === "es" ? "Voces del ecosistema" : "Ecosystem voices",
    title: locale === "es" ? "Casos de Éxito" : "Success Stories",
    description:
      locale === "es"
        ? "Testimonios de inversionistas globales y líderes locales que confiaron en Honduras para hacer crecer sus proyectos."
        : "Voices of global investors and local leaders who trusted Honduras to grow their projects.",
    cta: locale === "es" ? "Ver todos los casos" : "View all cases",
    ctaFeatured: locale === "es" ? "Ver caso completo" : "Read full case",
    empty:
      locale === "es"
        ? "Próximamente publicaremos casos de éxito destacados."
        : "Featured success stories will be published here soon.",
    error:
      locale === "es"
        ? "No pudimos cargar los casos de éxito. Intente de nuevo más tarde."
        : "We could not load success stories right now. Please try again later.",
  };

  const dCopy = hc.graficosDashboard ?? {
    eyebrow: "Dashboard Inteligente",
    title: "Comparativa Regional",
    downloadBtn: "Descargar Reporte Completo",
    sources: "Fuentes: Banco Central de Honduras, GCBI Index 2025, Proyecciones FMI.",
    ied: {
      label: "Reporte 2024-2025",
      title: "Inversión Extranjera Directa",
      desc: "Honduras consolida su posición como un receptor clave de capital extranjero en Centroamérica, superando expectativas regionales.",
      value: "$993.9M",
      insight: "El crecimiento sostenido en la reinversión de utilidades refleja la confianza del inversor a largo plazo.",
      source: "Fuente: Sección de Balanza de Pagos, Departamento de Sector Externo, BCH",
    },
    pib: {
      label: "Proyección 2024-2029",
      title: "Crecimiento Proyectado PIB",
      desc: "Estimaciones macroeconómicas que posicionan a Honduras con una de las recuperaciones más robustas de la región.",
      value: "3.85%",
      insight: "La estabilidad monetaria y el control inflacionario son pilares de esta proyección positiva.",
      source: "Elaboración propia con datos del Informe Proyecciones 2024-2025, Banco Central de Honduras; CEPAL, Balance Preiminar de las Económias de ALC 2023 (dic. 2023).",
    },
    clima: {
      label: "GCBI Index 2025",
      title: "Facilidad para Negocios",
      desc: "Honduras lidera los índices de confianza corporativa gracias a la digitalización de trámites y seguridad jurídica.",
      value: "60 Pts",
      insight: "Honduras es calificado como el país más confiable para negocios en CA según el GCBI 2025.",
      source: "Elaboración propia con datos de TMF group, 2025.",
    }
  };

  const actionCards = hc.actionCards ?? {
    investTitle: "Invertir en Honduras",
    investDesc: "Forma parte de nuestra red de inversionista.",
    growTitle: "Crecer en Honduras",
    growDesc: "Herramientas, inteligencia de mercado y soporte especializado para empresas establecidas.",
    moreInfo: locale === "es" ? "Más información" : "More information"
  };

  const postExtra = hc.postulacionExtra ?? {
    advisoryTitle: "Asesoría Técnica",
    advisoryDesc: "Conoce las oportunidades y proyectos de inversión para expandir tus operaciones en Honduras",
    ctaProject: "Postular Mi Proyecto"
  };
  return { partnerBenefits, testimonialsCopy, dCopy, actionCards, postExtra };
}
