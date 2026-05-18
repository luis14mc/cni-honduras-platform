import type { Locale } from "@/src/i18n/config";
import type { SectorCopy } from "@/src/data/investmentSectors";
import { getSectors } from "@/src/data/investmentSectors";

export type { SectorCopy } from "@/src/data/investmentSectors";

export const invertirPageCopy: Record<
  Locale,
  {
    heroEyebrow: string;
    heroTitleBefore: string;
    heroTitleAccent: string;
    heroTitleAfter: string;
    heroDescription: string;
    heroImageAlt: string;
    stickySector: string;
    sectionEyebrow: string;
    sectionTitle: string;
    sectionDescription: string;
    sectorBadge: string;
    viewDetail: string;
    ctaAdvisor: string;
    ctaGuide: string;
    ctaTitle: string;
    ctaBody: string;
    ctaAdvisory: string;
    ctaCni: string;
    linkWhyHonduras: string;
    sectors: ReadonlyArray<SectorCopy>;
  }
> = {
  es: {
    heroEyebrow: "Marco Nacional de Inversión",
    heroTitleBefore: "Sectores",
    heroTitleAccent: "Estratégicos",
    heroTitleAfter: "de Inversión",
    heroDescription:
      "Aprovechando la ventaja geográfica única de Honduras y un marco económico estable para ofrecer oportunidades de alto rendimiento en cinco industrias prioritarias.",
    heroImageAlt: "Paisaje industrial y agrícola",
    stickySector: "Sector",
    sectionEyebrow: "Cinco motores de la economía hondureña",
    sectionTitle: "Sectores Estratégicos",
    sectionDescription:
      "Cada sector es respaldado por el CNI bajo los regímenes LPPI y ZOLI, con servicios legales, técnicos y de inteligencia de datos sin costo para el inversionista.",
    sectorBadge: "Sector",
    viewDetail: "Ver detalle",
    ctaAdvisor: "Conversar con un asesor",
    ctaGuide: "Descargar guía",
    ctaTitle: "¿Listo para activar su tesis de inversión en Honduras?",
    ctaBody:
      "Nuestros asesores institucionales atienden solicitudes específicas: análisis de prefactibilidad, marco legal, visitas in situ y conexión con el ecosistema público-privado.",
    ctaAdvisory: "Asesoría gratuita",
    ctaCni: "Servicios del CNI",
    linkWhyHonduras: "¿Por qué Honduras?",
    sectors: getSectors("es"),
  },
  en: {
    heroEyebrow: "National investment framework",
    heroTitleBefore: "Strategic",
    heroTitleAccent: "investment",
    heroTitleAfter: "sectors",
    heroDescription:
      "Leveraging Honduras’ unique geography and a stable economic framework to deliver high-return opportunities across five priority industries.",
    heroImageAlt: "Industrial and agricultural landscape",
    stickySector: "Sector",
    sectionEyebrow: "Five engines of the Honduran economy",
    sectionTitle: "Strategic sectors",
    sectorBadge: "Sector",
    sectionDescription:
      "Each sector is backed by the CNI under LPPI and ZOLI regimes with legal, technical, and data intelligence services at no cost to the investor.",
    viewDetail: "View details",
    ctaAdvisor: "Talk to an advisor",
    ctaGuide: "Download guide",
    ctaTitle: "Ready to activate your investment thesis in Honduras?",
    ctaBody:
      "Our institutional advisors handle specific requests: pre-feasibility analysis, legal framework, site visits, and connections across the public-private ecosystem.",
    ctaAdvisory: "Free advisory",
    ctaCni: "CNI services",
    linkWhyHonduras: "Why Honduras?",
    sectors: getSectors("en"),
  },
};
