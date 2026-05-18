import type { Locale } from "@/src/i18n/config";

export const porQueHondurasPageCopy: Record<
  Locale,
  {
    heroEyebrow: string;
    heroTitle: string;
    heroDescription: string;
    sectionEyebrow: string;
    sectionTitle: string;
    sectionDescription: string;
    ctaInvertir: string;
  }
> = {
  es: {
    heroEyebrow: "Ventaja competitiva",
    heroTitle: "¿Por qué Honduras?",
    heroDescription:
      "Ubicación geoestratégica, marco LPPI y ZOLI, talento joven y red de tratados comerciales que convierten al país en plataforma para manufactura, servicios y energía.",
    sectionEyebrow: "Cuatro pilares",
    sectionTitle: "Por qué desplegar capital aquí",
    sectionDescription:
      "Síntesis de los factores que el CNI prioriza al acompañar la Ruta del Inversionista.",
    ctaInvertir: "Ver sectores estratégicos →",
  },
  en: {
    heroEyebrow: "Competitive edge",
    heroTitle: "Why Honduras?",
    heroDescription:
      "Geostrategic location, LPPI and ZOLI frameworks, young talent, and a treaty network that make the country a platform for manufacturing, services, and energy.",
    sectionEyebrow: "Four pillars",
    sectionTitle: "Why deploy capital here",
    sectionDescription: "A synthesis of factors the CNI prioritizes along the Investor Journey.",
    ctaInvertir: "View strategic sectors →",
  },
};
