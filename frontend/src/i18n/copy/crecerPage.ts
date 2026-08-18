import type { Locale } from "@/src/i18n/config";

export type CrecerLever = {
  title: string;
  text: string;
};

export type CrecerPageCopy = {
  heroEyebrow: string;
  heroTitleBefore: string;
  heroTitleAccent: string;
  heroDescription: string;
  heroImageAlt: string;
  ctaPortfolio: string;
  ctaCases: string;
  ctaAftercare: string;
  leversEyebrow: string;
  leversTitle: string;
  leversTitleAccent: string;
  leversLead: string;
  levers: ReadonlyArray<CrecerLever>;
  portfolioEyebrow: string;
  portfolioTitle: string;
  portfolioDescription: string;
  portfolioEmpty: string;
  portfolioError: string;
  portfolioCta: string;
  portfolioAll: string;
  casesEyebrow: string;
  casesTitle: string;
  casesDescription: string;
  casesEmpty: string;
  casesError: string;
  casesAll: string;
  aftercareEyebrow: string;
  aftercareTitle: string;
  aftercareBody: string;
  aftercareCta: string;
  pdiEyebrow: string;
  pdiTitle: string;
  pdiBody: string;
  pdiHost: string;
  pdiPoints: ReadonlyArray<{ title: string; text: string }>;
  pdiLink: string;
  advisoryCta: string;
};

export const crecerPageCopy: Record<Locale, CrecerPageCopy> = {
  es: {
    heroEyebrow: "Despliegue de capital",
    heroTitleBefore: "Crecer en",
    heroTitleAccent: "Honduras",
    heroDescription:
      "Infraestructura estratégica, incentivos fiscales sólidos y un acompañamiento institucional integral para escalar su operación al siguiente nivel en el corazón de las Américas.",
    heroImageAlt: "Infraestructura y conectividad en Honduras",
    ctaPortfolio: "Ver oportunidades",
    ctaCases: "Casos de éxito",
    ctaAftercare: "Acompañamiento",
    leversEyebrow: "Por qué crecer aquí",
    leversTitle: "Una tesis de inversión,",
    leversTitleAccent: "sólida y verificable.",
    leversLead:
      "El CNI articula marco legal, ventanilla única y aftercare para que el capital entre, se instale y escale.",
    levers: [
      {
        title: "Marco legal LPPI + ZOLI",
        text: "Protección al capital extranjero, repatriación de utilidades y zonas con incentivos fiscales para operación de largo plazo.",
      },
      {
        title: "Ventanilla Única",
        text: "Un punto de contacto para permisos, certificaciones ambientales y visas ejecutivas a lo largo de la Ruta del Inversionista.",
      },
      {
        title: "Acompañamiento gratuito",
        text: "Asesoría del CNI antes, durante y después de la instalación, sin costo para el inversionista.",
      },
    ],
    portfolioEyebrow: "Catálogo vivo",
    portfolioTitle: "Oportunidades de inversión",
    portfolioDescription:
      "Proyectos y ventanas publicados por el CNI. El detalle, métricas y contacto se consultan ficha por ficha.",
    portfolioEmpty: "Todavía no hay oportunidades publicadas.",
    portfolioError: "No pudimos cargar las oportunidades. Intente de nuevo más tarde.",
    portfolioCta: "Ver ficha",
    portfolioAll: "Todas las oportunidades",
    casesEyebrow: "Resultados",
    casesTitle: "Quiénes ya operan aquí",
    casesDescription: "Casos de éxito publicados por el CNI, con datos de inversión y empleo cuando están disponibles.",
    casesEmpty: "Todavía no hay casos de éxito publicados.",
    casesError: "No pudimos cargar los casos de éxito. Intente de nuevo más tarde.",
    casesAll: "Todos los casos",
    aftercareEyebrow: "Post-inversión",
    aftercareTitle: "Acompañamiento para escalar la operación",
    aftercareBody:
      "El aftercare del CNI sostiene la relación con el inversionista instalado: permisos, expansión, empleo y diálogo con el Estado.",
    aftercareCta: "Conocer aftercare",
    pdiEyebrow: "Ventanilla del Estado",
    pdiTitle: "Portal Digital de Inversiones",
    pdiBody:
      "La ventanilla oficial del Estado para consultar proyectos, dar seguimiento a trámites y comunicarse con las instituciones del ecosistema de inversión.",
    pdiHost: "pdihonduras.gob.hn",
    pdiPoints: [
      {
        title: "Consulta de proyectos",
        text: "Revise el catálogo público de iniciativas de inversión.",
      },
      {
        title: "Trazabilidad de trámites",
        text: "Siga el estado de gestiones ante las instituciones competentes.",
      },
      {
        title: "Canal institucional",
        text: "Comuníquese de forma segura con el ecosistema de inversión.",
      },
    ],
    pdiLink: "Acceder a PDI",
    advisoryCta: "Asesoría dedicada",
  },
  en: {
    heroEyebrow: "Capital deployment",
    heroTitleBefore: "Grow in",
    heroTitleAccent: "Honduras",
    heroDescription:
      "Strategic infrastructure, solid fiscal incentives, and full institutional accompaniment to scale your operation to the next level in the heart of the Americas.",
    heroImageAlt: "Infrastructure and connectivity in Honduras",
    ctaPortfolio: "View opportunities",
    ctaCases: "Success stories",
    ctaAftercare: "Aftercare",
    leversEyebrow: "Why grow here",
    leversTitle: "An investment thesis,",
    leversTitleAccent: "solid and verifiable.",
    leversLead:
      "CNI coordinates legal framework, a one-stop shop, and aftercare so capital can enter, land, and scale.",
    levers: [
      {
        title: "LPPI + ZOLI legal framework",
        text: "Protection for foreign capital, profit repatriation, and zones with fiscal incentives for long-term operations.",
      },
      {
        title: "One-stop shop",
        text: "A single point of contact for permits, environmental certifications, and executive visas along the Investor Journey.",
      },
      {
        title: "Free accompaniment",
        text: "CNI advisory before, during, and after establishment, at no cost to the investor.",
      },
    ],
    portfolioEyebrow: "Live catalog",
    portfolioTitle: "Investment opportunities",
    portfolioDescription:
      "Projects and windows published by CNI. Detail, metrics, and contact live on each opportunity brief.",
    portfolioEmpty: "There are no published opportunities yet.",
    portfolioError: "We could not load opportunities. Please try again later.",
    portfolioCta: "View brief",
    portfolioAll: "All opportunities",
    casesEyebrow: "Outcomes",
    casesTitle: "Who already operates here",
    casesDescription: "CNI-published success stories, with investment and jobs data when available.",
    casesEmpty: "There are no published success stories yet.",
    casesError: "We could not load success stories. Please try again later.",
    casesAll: "All stories",
    aftercareEyebrow: "Post-investment",
    aftercareTitle: "Support to scale the operation",
    aftercareBody:
      "CNI aftercare sustains the relationship with established investors: permits, expansion, jobs, and dialogue with the State.",
    aftercareCta: "Explore aftercare",
    pdiEyebrow: "State window",
    pdiTitle: "Digital Investment Portal",
    pdiBody:
      "The official government window to review projects, track procedures, and communicate with investment-ecosystem institutions.",
    pdiHost: "pdihonduras.gob.hn",
    pdiPoints: [
      {
        title: "Project lookup",
        text: "Browse the public catalog of investment initiatives.",
      },
      {
        title: "Procedure tracking",
        text: "Follow the status of filings with competent institutions.",
      },
      {
        title: "Institutional channel",
        text: "Communicate securely with the investment ecosystem.",
      },
    ],
    pdiLink: "Access PDI",
    advisoryCta: "Dedicated advisory",
  },
};
