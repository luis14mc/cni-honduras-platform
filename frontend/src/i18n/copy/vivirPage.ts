import type { Locale } from "@/src/i18n/config";

export const vivirPageCopy: Record<
  Locale,
  {
    heroEyebrow: string;
    heroTitleBefore: string;
    heroTitleAccent: string;
    heroDescription: string;
    heroImageAlt: string;
    stats: ReadonlyArray<{ value: string; label: string }>;
    pillarsEyebrow: string;
    pillarsTitle: string;
    pillarsDescription: string;
    pillars: ReadonlyArray<{ title: string; text: string }>;
    coastImageAlt: string;
    zonesEyebrow: string;
    zonesTitle: string;
    zonesDescription: string;
    bullets: readonly string[];
    ctaAdvisor: string;
    ctaTitle: string;
    ctaBody: string;
    ctaSectors: string;
    ctaCni: string;
  }
> = {
  es: {
    heroEyebrow: "Calidad de vida soberana",
    heroTitleBefore: "Vivir en",
    heroTitleAccent: "Honduras",
    heroDescription:
      "Calidad de vida, infraestructura de salud, educación bilingüe internacional, seguridad y zonas residenciales de alto valor para ejecutivos expatriados. Beneficios demográficos y culturales para arraigar su capital.",
    heroImageAlt: "Paisaje aéreo de Honduras",
    stats: [
      { value: "24", label: "Edad mediana" },
      { value: "90%", label: "Fluidez en inglés en hubs tecnológicos" },
      { value: "2h", label: "Caribe ↔ Pacífico" },
      { value: "+12", label: "Colegios internacionales" },
    ],
    pillarsEyebrow: "Bento de vida ejecutiva",
    pillarsTitle: "Pilares de bienestar para inversionistas y familias",
    pillarsDescription: "Un entorno diseñado para que el capital encuentre talento, raíces y comunidad.",
    pillars: [
      {
        title: "Infraestructura de salud",
        text: "Red de hospitales privados de alta complejidad y certificaciones internacionales en Tegucigalpa y San Pedro Sula.",
      },
      {
        title: "Educación bilingüe internacional",
        text: "Escuelas con currículos IB, americano y europeo. Universidades acreditadas y programas STEM en expansión.",
      },
      {
        title: "Seguridad para ejecutivos",
        text: "Zonas residenciales privadas con vigilancia 24/7 y barrios consolidados para familias expatriadas.",
      },
      {
        title: "Residencias de alto valor",
        text: "Inversión inmobiliaria en Tegucigalpa, San Pedro Sula, Roatán y Tela con plusvalía sostenida.",
      },
      {
        title: "Clima y naturaleza",
        text: "Temperatura cálida todo el año, dos océanos, arrecifes y montañas a menos de dos horas.",
      },
      {
        title: "Beneficios demográficos y culturales",
        text: "Población joven, cultura abierta y comunidades multilingües con fuerte presencia internacional.",
      },
    ],
    coastImageAlt: "Marinas y resorts en la costa hondureña",
    zonesEyebrow: "Zonas residenciales premium",
    zonesTitle: "Donde vivir según su agenda",
    zonesDescription:
      "Tegucigalpa, San Pedro Sula, La Ceiba, Tela y Roatán concentran los desarrollos residenciales más demandados por ejecutivos extranjeros, con servicios integrados y conectividad aérea.",
    bullets: [
      "Cuatro aeropuertos internacionales y vuelos directos a Houston, Miami, Atlanta, CDMX y Madrid.",
      "Condominios y residenciales privados con concierge, gimnasio y seguridad gestionada.",
      "Comunidad expatriada consolidada con cámaras binacionales y clubes corporativos.",
    ],
    ctaAdvisor: "Hablar con un asesor de relocación",
    ctaTitle: "Vivir aquí también es invertir aquí",
    ctaBody:
      "Estabilidad regulatoria, identidad cultural y una red de instituciones que acompañan a su familia y a su empresa.",
    ctaSectors: "Ver sectores",
    ctaCni: "Servicios del CNI",
  },
  en: {
    heroEyebrow: "Sovereign quality of life",
    heroTitleBefore: "Live in",
    heroTitleAccent: "Honduras",
    heroDescription:
      "Quality of life, healthcare infrastructure, international bilingual education, security, and high-value residential areas for expatriate executives. Demographic and cultural benefits to anchor your capital.",
    heroImageAlt: "Aerial landscape of Honduras",
    stats: [
      { value: "24", label: "Median age" },
      { value: "90%", label: "English fluency in tech hubs" },
      { value: "2h", label: "Caribbean ↔ Pacific" },
      { value: "+12", label: "International schools" },
    ],
    pillarsEyebrow: "Executive lifestyle grid",
    pillarsTitle: "Wellbeing pillars for investors and families",
    pillarsDescription: "An environment where capital finds talent, roots, and community.",
    pillars: [
      {
        title: "Healthcare infrastructure",
        text: "Private hospitals with high complexity care and international certifications in Tegucigalpa and San Pedro Sula.",
      },
      {
        title: "International bilingual education",
        text: "Schools with IB, U.S., and European curricula. Accredited universities and expanding STEM programs.",
      },
      {
        title: "Executive security",
        text: "Private residential zones with 24/7 security and established neighborhoods for expatriate families.",
      },
      {
        title: "High-value residences",
        text: "Real estate investment in Tegucigalpa, San Pedro Sula, Roatán, and Tela with sustained appreciation.",
      },
      {
        title: "Climate & nature",
        text: "Warm weather year-round, two oceans, reefs, and mountains within two hours.",
      },
      {
        title: "Demographic & cultural benefits",
        text: "Young population, open culture, and multilingual communities with strong international presence.",
      },
    ],
    coastImageAlt: "Marinas and resorts on the Honduran coast",
    zonesEyebrow: "Premium residential zones",
    zonesTitle: "Where to live for your agenda",
    zonesDescription:
      "Tegucigalpa, San Pedro Sula, La Ceiba, Tela, and Roatán host the most sought-after residential developments for foreign executives, with integrated services and air connectivity.",
    bullets: [
      "Four international airports and direct flights to Houston, Miami, Atlanta, Mexico City, and Madrid.",
      "Private condominiums and gated communities with concierge, gym, and managed security.",
      "Established expatriate community with binational chambers and corporate clubs.",
    ],
    ctaAdvisor: "Talk to a relocation advisor",
    ctaTitle: "Living here is also investing here",
    ctaBody: "Regulatory stability, cultural identity, and institutions that support both your family and your company.",
    ctaSectors: "View sectors",
    ctaCni: "CNI services",
  },
};
