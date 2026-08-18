import type { Locale } from "@/src/i18n/config";
import type { SectorCopy } from "@/src/data/investmentSectors";
import { getSectors } from "@/src/data/investmentSectors";

export type { SectorCopy } from "@/src/data/investmentSectors";

export type SectorAccentPalette = {
  /** Acento principal del sector (badge, líneas, hovers). */
  accent: string;
  /** Fondo translúcido para contenedores de icono. */
  soft: string;
  /** Borde translúcido para contenedores. */
  border: string;
};

export const SECTOR_ACCENTS: Record<string, SectorAccentPalette> = {
  agroindustria: { accent: "#93C01F", soft: "rgba(147, 192, 31, 0.10)", border: "rgba(147, 192, 31, 0.35)" },
  manufactura: { accent: "#7C25A8", soft: "rgba(124, 37, 168, 0.10)", border: "rgba(124, 37, 168, 0.35)" },
  energia: { accent: "#F7BF06", soft: "rgba(247, 191, 6, 0.10)", border: "rgba(247, 191, 6, 0.40)" },
  turismo: { accent: "#57D0E1", soft: "rgba(87, 208, 225, 0.10)", border: "rgba(87, 208, 225, 0.35)" },
  infraestructura: { accent: "#F98639", soft: "rgba(249, 134, 57, 0.10)", border: "rgba(249, 134, 57, 0.35)" },
  logistica: { accent: "#2EB29C", soft: "rgba(46, 178, 156, 0.10)", border: "rgba(46, 178, 156, 0.35)" },
};

export type SectoresInstitutionalLink = {
  label: string;
  href: string;
};

export type SectoresOffice = {
  city: string;
  address: string;
  email: string;
  phone: string;
};

export type SectoresIndexCopy = {
  heroEyebrow: string;
  heroTitleBefore: string;
  heroTitleAccent: string;
  heroTitleAfter: string;
  heroDescription: string;
  heroImageAlt: string;
  heroChips: ReadonlyArray<string>;
  linkWhyHonduras: string;
  catalogEyebrow: string;
  catalogTitleBefore: string;
  catalogTitleAccent: string;
  catalogDescription: string;
  cardEyebrow: string;
  cardCta: string;
  cardStatsLabel: string;
  whyEyebrow: string;
  whyTitleBefore: string;
  whyTitleAccent: string;
  whyDescription: string;
  whyItems: ReadonlyArray<{ title: string; text: string }>;
  statsEyebrow: string;
  statsTitleBefore: string;
  statsTitleAccent: string;
  statsDescription: string;
  stats: ReadonlyArray<{ value: string; label: string; hint: string }>;
  ctaTitle: string;
  ctaBody: string;
  ctaPrimary: string;
  ctaSecondary: string;
  acompanamientoEyebrow: string;
  acompanamientoTitle: string;
  acompanamientoSubtitle: string;
  acompanamientoLinksEyebrowA: string;
  acompanamientoLinksEyebrowB: string;
  acompanamientoLinks: ReadonlyArray<SectoresInstitutionalLink>;
  acompanamientoOffices: ReadonlyArray<SectoresOffice>;
  acompanamientoOfficesTitle: string;
};

const SECTORES_INDEX: Record<Locale, SectoresIndexCopy> = {
  es: {
    heroEyebrow: "Catálogo Estratégico Nacional",
    heroTitleBefore: "Sectores para",
    heroTitleAccent: "invertir en Honduras",
    heroTitleAfter: "",
    heroDescription:
      "Seis motores priorizados por el Consejo Nacional de Inversiones, con marco legal LPPI/ZOLI, inteligencia de datos sectorial y acompañamiento institucional gratuito.",
    heroImageAlt: "Panorama de sectores productivos en Honduras",
    heroChips: ["LPPI · ZOLI", "Marco soberano", "Acompañamiento CNI", "Dato abierto"],
    linkWhyHonduras: "¿Por qué Honduras?",
    catalogEyebrow: "01 · Seis motores económicos",
    catalogTitleBefore: "Sectores",
    catalogTitleAccent: "Estratégicos",
    catalogDescription:
      "Explore cada uno de los seis motores priorizados por el CNI y visite la página del sector de su interés para conocer indicadores clave, ventajas competitivas, encaje legal bajo LPPI/ZOLI y proyectos activos listos para invertir.",
    cardEyebrow: "Ficha sectorial",
    cardCta: "Ver sector",
    cardStatsLabel: "Indicador clave",
    whyEyebrow: "02 · Por qué estos sectores",
    whyTitleBefore: "Una tesis de inversión,",
    whyTitleAccent: "sólida y verificable.",
    whyDescription:
      "Los sectores priorizados por el CNI están seleccionados por su capacidad real de atraer capital, generar empleo de calidad y dinamizar exportaciones.",
    whyItems: [
      {
        title: "Encaje con la matriz productiva",
        text: "Cada sector aprovecha activos naturales, logísticos o talento ya disponibles en el país, reduciendo el CAPEX de entrada y el riesgo operativo.",
      },
      {
        title: "Marco legal LPPI y ZOLI",
        text: "Incentivos fiscales, estabilidad jurídica y regímenes de zonas libres que protegen la inversión durante todo el ciclo de vida del proyecto.",
      },
      {
        title: "Acompañamiento institucional",
        text: "Asesoría legal, técnica y de inteligencia de datos sin costo, brindada por el equipo del CNI en cada hito de la Ruta del Inversionista.",
      },
    ],
    statsEyebrow: "03 · Marco macro Honduras",
    statsTitleBefore: "El entorno que",
    statsTitleAccent: "sostiene la inversión.",
    statsDescription:
      "Indicadores verificables que sustentan la tesis de inversión y la priorización sectorial del CNI.",
    stats: [
      { value: "$993.9M", label: "IED recibida (2024)", hint: "Balanza de pagos · BCH" },
      { value: "78.6%", label: "Movimiento portuario", hint: "Puerto Cortés · ENP" },
      { value: "11", label: "Tratados de Libre Comercio", hint: "Acceso a 45+ naciones" },
      { value: "58.6%", label: "Matriz energética limpia", hint: "Solar, eólica e hidro" },
      { value: "+9.89M", label: "Habitantes · bono demográfico", hint: "Edad promedio 31 años" },
    ],
    ctaTitle: "¿Listo para activar su tesis de inversión en Honduras?",
    ctaBody:
      "Conecte con oficiales de inversión del CNI para evaluar prefactibilidad, encaje legal y acceso al portafolio Ready-to-Invest.",
    ctaPrimary: "Solicitar asesoría",
    ctaSecondary: "Descargar guía del inversionista",
    acompanamientoEyebrow: "05 · Acompañamiento CNI",
    acompanamientoTitle: "Institucionalidad que respalda su inversión",
    acompanamientoSubtitle:
      "Una red de socios públicos, gremiales y multilaterales, más dos oficinas físicas del CNI listas para acompañarle en cada etapa del proceso.",
    acompanamientoLinksEyebrowA: "Presidencia · Aduanas",
    acompanamientoLinksEyebrowB: "Fedecamaras · WAIPA",
    acompanamientoLinks: [
      { label: "Presidencia", href: "https://www.presidencia.gob.hn" },
      { label: "COHEP", href: "https://cohep.com" },
      { label: "BCH", href: "https://www.bch.hn" },
      { label: "INE", href: "https://www.ine.gob.hn" },
      { label: "Aduanas", href: "https://www.aduanas.gob.hn" },
      { label: "Fedecamaras", href: "https://www.fedecamaras.com" },
      { label: "SDE", href: "https://sde.gob.hn" },
      { label: "SERNA", href: "https://www.miambiente.gob.hn" },
      { label: "ANDI", href: "https://andi.hn" },
      { label: "WAIPA", href: "https://waipa.org" },
    ],
    acompanamientoOfficesTitle: "Oficinas de atención",
    acompanamientoOffices: [
      {
        city: "Tegucigalpa",
        address: "Centro Cívico Gubernamental, Torre 1, Nivel 12.",
        email: "seguimiento@cni.hn",
        phone: "(504) 2242-8955",
      },
      {
        city: "San Pedro Sula",
        address:
          "Cámara de Comercio e Industria de Cortés. Col. Las Brisas 22 y 24 calle entre 1 y 4ta. avenida Junior.",
        email: "oficinasps@cni.hn",
        phone: "(504) 2561-6100 ext 109",
      },
    ],
  },
  en: {
    heroEyebrow: "National strategic catalog",
    heroTitleBefore: "Sectors to",
    heroTitleAccent: "invest in Honduras",
    heroTitleAfter: "",
    heroDescription:
      "Six priority engines curated by the National Investment Council, with LPPI/ZOLI legal frameworks, sector data intelligence, and free institutional support.",
    heroImageAlt: "Panorama of productive sectors in Honduras",
    heroChips: ["LPPI · ZOLI", "Sovereign framework", "CNI accompaniment", "Open data"],
    linkWhyHonduras: "Why Honduras?",
    catalogEyebrow: "01 · Six economic engines",
    catalogTitleBefore: "Strategic",
    catalogTitleAccent: "Sectors",
    catalogDescription:
      "Explore each of the six priority engines curated by CNI and visit the sector page of your interest to discover key indicators, competitive advantages, LPPI/ZOLI legal fit, and active projects ready to invest.",
    cardEyebrow: "Sector brief",
    cardCta: "View sector",
    cardStatsLabel: "Key indicator",
    whyEyebrow: "02 · Why these sectors",
    whyTitleBefore: "An investment thesis,",
    whyTitleAccent: "solid and verifiable.",
    whyDescription:
      "The sectors prioritized by CNI are selected for their real capacity to attract capital, generate quality jobs, and boost exports.",
    whyItems: [
      {
        title: "Fit with the productive matrix",
        text: "Each sector leverages natural, logistics, or talent assets already available in the country, lowering entry CAPEX and operational risk.",
      },
      {
        title: "LPPI and ZOLI legal framework",
        text: "Fiscal incentives, legal certainty, and free-zone regimes that protect the investment throughout the project lifecycle.",
      },
      {
        title: "Institutional accompaniment",
        text: "Free legal, technical, and data-intelligence advisory delivered by the CNI team at every milestone of the Investor Journey.",
      },
    ],
    statsEyebrow: "03 · Honduras macro framework",
    statsTitleBefore: "The environment that",
    statsTitleAccent: "supports investment.",
    statsDescription:
      "Verifiable indicators underpinning the investment thesis and CNI sector prioritization.",
    stats: [
      { value: "$993.9M", label: "FDI received (2024)", hint: "Balance of payments · BCH" },
      { value: "78.6%", label: "Port throughput", hint: "Puerto Cortés · ENP" },
      { value: "11", label: "Free Trade Agreements", hint: "Access to 45+ nations" },
      { value: "58.6%", label: "Clean energy matrix", hint: "Solar, wind and hydro" },
      { value: "+9.89M", label: "Inhabitants · demographic dividend", hint: "Average age 31 years" },
    ],
    ctaTitle: "Ready to activate your investment thesis in Honduras?",
    ctaBody:
      "Connect with CNI investment officers to evaluate pre-feasibility, legal fit, and access to the Ready-to-Invest portfolio.",
    ctaPrimary: "Request advisory",
    ctaSecondary: "Download investor guide",
    acompanamientoEyebrow: "05 · CNI accompaniment",
    acompanamientoTitle: "The institutional network behind your investment",
    acompanamientoSubtitle:
      "A network of public, business and multilateral partners, plus two CNI offices ready to accompany you at every stage of the process.",
    acompanamientoLinksEyebrowA: "Presidency · Customs",
    acompanamientoLinksEyebrowB: "Fedecamaras · WAIPA",
    acompanamientoLinks: [
      { label: "Presidency", href: "https://www.presidencia.gob.hn" },
      { label: "COHEP", href: "https://cohep.com" },
      { label: "BCH", href: "https://www.bch.hn" },
      { label: "INE", href: "https://www.ine.gob.hn" },
      { label: "Customs", href: "https://www.aduanas.gob.hn" },
      { label: "Fedecamaras", href: "https://www.fedecamaras.com" },
      { label: "SDE", href: "https://sde.gob.hn" },
      { label: "SERNA", href: "https://www.miambiente.gob.hn" },
      { label: "ANDI", href: "https://andi.hn" },
      { label: "WAIPA", href: "https://waipa.org" },
    ],
    acompanamientoOfficesTitle: "Service offices",
    acompanamientoOffices: [
      {
        city: "Tegucigalpa",
        address: "Centro Cívico Gubernamental, Torre 1, Nivel 12.",
        email: "seguimiento@cni.hn",
        phone: "(504) 2242-8955",
      },
      {
        city: "San Pedro Sula",
        address:
          "Cámara de Comercio e Industria de Cortés. Col. Las Brisas 22 y 24 calle entre 1 y 4ta. avenida Junior.",
        email: "oficinasps@cni.hn",
        phone: "(504) 2561-6100 ext 109",
      },
    ],
  },
};

export const invertirPageCopy: Record<
  Locale,
  SectoresIndexCopy & {
    stickySector: string;
    ctaAdvisor: string;
    ctaGuide: string;
    ctaAdvisory: string;
    ctaCni: string;
    /** @deprecated use catalogEyebrow */
    sectionEyebrow: string;
    /** @deprecated use catalogTitleBefore + catalogTitleAccent */
    sectionTitle: string;
    /** @deprecated use catalogDescription */
    sectionDescription: string;
    /** @deprecated use cardEyebrow */
    sectorBadge: string;
    /** @deprecated use cardCta */
    viewDetail: string;
    sectors: ReadonlyArray<SectorCopy>;
  }
> = {
  es: {
    ...SECTORES_INDEX.es,
    stickySector: "Sector",
    ctaAdvisor: "Conversar con un asesor",
    ctaGuide: "Descargar guía",
    ctaAdvisory: "Asesoría gratuita",
    ctaCni: "Servicios del CNI",
    sectionEyebrow: SECTORES_INDEX.es.catalogEyebrow,
    sectionTitle: `${SECTORES_INDEX.es.catalogTitleBefore} ${SECTORES_INDEX.es.catalogTitleAccent}`,
    sectionDescription: SECTORES_INDEX.es.catalogDescription,
    sectorBadge: SECTORES_INDEX.es.cardEyebrow,
    viewDetail: SECTORES_INDEX.es.cardCta,
    sectors: getSectors("es"),
  },
  en: {
    ...SECTORES_INDEX.en,
    stickySector: "Sector",
    ctaAdvisor: "Talk to an advisor",
    ctaGuide: "Download guide",
    ctaAdvisory: "Free advisory",
    ctaCni: "CNI services",
    sectionEyebrow: SECTORES_INDEX.en.catalogEyebrow,
    sectionTitle: `${SECTORES_INDEX.en.catalogTitleBefore} ${SECTORES_INDEX.en.catalogTitleAccent}`,
    sectionDescription: SECTORES_INDEX.en.catalogDescription,
    sectorBadge: SECTORES_INDEX.en.cardEyebrow,
    viewDetail: SECTORES_INDEX.en.cardCta,
    sectors: getSectors("en"),
  },
};

/** Acceso al subconjunto de copy usado por la ruta /invertir/sectores (catálogo). */
export const sectoresIndexCopy = SECTORES_INDEX;