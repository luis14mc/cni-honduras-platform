import type { Locale } from "@/src/i18n/config";
import type { Sector } from "@/src/types/investment";
import { designImages } from "@/src/lib/designAssets";

const IMG = {
  ag: designImages.sectors.agroindustria,
  mfg: designImages.sectors.manufactura,
  tour: designImages.sectors.turismo,
  ene: designImages.sectors.energia,
  infra: designImages.sectors.infraestructura,
} as const;

export type SectorCopy = {
  slug: string;
  name: string;
  short: string;
  fullText: string;
  highlights: readonly string[];
  image: string;
};

export const SECTOR_SLUGS = ["agroindustria", "manufactura", "turismo", "energia", "infraestructura"] as const;
export type SectorSlug = (typeof SECTOR_SLUGS)[number];

export function isSectorSlug(value: string): value is SectorSlug {
  return (SECTOR_SLUGS as readonly string[]).includes(value);
}

/** Nombre canónico de cada sector (sin calificativos adicionales). */
export const SECTOR_DISPLAY_NAMES: Record<Locale, Record<SectorSlug, string>> = {
  es: {
    agroindustria: "Agroindustria",
    manufactura: "Manufactura",
    turismo: "Turismo",
    energia: "Energía",
    infraestructura: "Infraestructura",
  },
  en: {
    agroindustria: "Agroindustry",
    manufactura: "Manufacturing",
    turismo: "Tourism",
    energia: "Energy",
    infraestructura: "Infrastructure",
  },
};

export function getSectorDisplayName(locale: Locale, slug: SectorSlug): string {
  return SECTOR_DISPLAY_NAMES[locale][slug];
}

const esSectores: ReadonlyArray<SectorCopy> = [
  {
    slug: "agroindustria",
    name: SECTOR_DISPLAY_NAMES.es.agroindustria,
    short: "Clima fértil los 365 días. Café, cacao, tabaco.",
    fullText:
      "Aprovechando la diversidad ecológica y las rutas comerciales estratégicas para diseñar la próxima generación de inversión agrícola global de alto rendimiento.",
    highlights: ["Café de especialidad", "Cacao fino de aroma", "Tabaco premium", "Aceite de palma sostenible"],
    image: IMG.ag,
  },
  {
    slug: "manufactura",
    name: SECTOR_DISPLAY_NAMES.es.manufactura,
    short: "Liderazgo en nearshoring, beneficios 'Zero-Duty' hacia EE.UU.",
    fullText:
      "Hub de clase mundial para confección, ensamble ligero y componentes automotrices destinados a Norteamérica, con un ecosistema maduro de zonas libres y logística automatizada.",
    highlights: ["Nearshoring CAFTA-DR", "Zonas Libres (ZOLI)", "Logística multimodal", "Talento técnico"],
    image: IMG.mfg,
  },
  {
    slug: "turismo",
    name: SECTOR_DISPLAY_NAMES.es.turismo,
    short: "Islas de la Bahía, arrecifes y arqueología Maya.",
    fullText:
      "Activos naturales sin igual, proximidad geográfica estratégica e incentivos institucionales para la hospitalidad de alta gama y eco-lujo certificado.",
    highlights: ["Roatán y Utila", "Ruinas de Copán", "Eco-lodges", "Marinas y cruceros"],
    image: IMG.tour,
  },
  {
    slug: "energia",
    name: SECTOR_DISPLAY_NAMES.es.energia,
    short: "Matriz 60% limpia. Proyectos solares, eólicos e hidroeléctricos.",
    fullText:
      "Transición acelerada hacia energías 100% renovables, con apertura en producción solar, eólica e hidrógeno verde, y demanda eléctrica creciente al 3.5–4% anual.",
    highlights: ["Solar y eólico", "Hidroeléctricas", "Hidrógeno verde", "Hub regional de red"],
    image: IMG.ene,
  },
  {
    slug: "infraestructura",
    name: SECTOR_DISPLAY_NAMES.es.infraestructura,
    short: "Conectividad logística y proyectos de escala nacional.",
    fullText:
      "Puertos, carreteras, energía y zonas logísticas que articulan la inversión productiva con los mercados globales bajo marco LPPI y alianzas público-privadas.",
    highlights: ["Puerto Cortés", "Corredor logístico", "Zonas francas", "Energía y conectividad"],
    image: IMG.infra,
  },
];

const enSectores: ReadonlyArray<SectorCopy> = [
  {
    slug: "agroindustria",
    name: SECTOR_DISPLAY_NAMES.en.agroindustria,
    short: "Fertile climate year-round. Coffee, cocoa, tobacco.",
    fullText:
      "Leveraging ecological diversity and strategic trade routes to design the next generation of high-yield global agricultural investment.",
    highlights: ["Specialty coffee", "Fine aroma cocoa", "Premium tobacco", "Sustainable palm oil"],
    image: IMG.ag,
  },
  {
    slug: "manufactura",
    name: SECTOR_DISPLAY_NAMES.en.manufactura,
    short: "Nearshoring leadership, Zero-Duty benefits to the U.S.",
    fullText:
      "World-class hub for apparel, light assembly, and automotive components bound for North America, with mature free zones and automated logistics.",
    highlights: ["CAFTA-DR nearshoring", "Free Zones (ZOLI)", "Multimodal logistics", "Technical talent"],
    image: IMG.mfg,
  },
  {
    slug: "turismo",
    name: SECTOR_DISPLAY_NAMES.en.turismo,
    short: "Bay Islands, reefs, and Maya archaeology.",
    fullText:
      "Unmatched natural assets, strategic geography, and institutional incentives for high-end hospitality and certified eco-luxury.",
    highlights: ["Roatán & Utila", "Copán ruins", "Eco-lodges", "Marinas & cruises"],
    image: IMG.tour,
  },
  {
    slug: "energia",
    name: SECTOR_DISPLAY_NAMES.en.energia,
    short: "~60% clean matrix. Solar, wind, and hydro projects.",
    fullText:
      "Accelerated transition toward 100% renewable generation, with openings in solar, wind, and green hydrogen, and power demand growing ~3.5–4% annually.",
    highlights: ["Solar & wind", "Hydro", "Green hydrogen", "Regional grid hub"],
    image: IMG.ene,
  },
  {
    slug: "infraestructura",
    name: SECTOR_DISPLAY_NAMES.en.infraestructura,
    short: "Logistics connectivity and national-scale projects.",
    fullText:
      "Ports, roads, energy, and logistics zones linking productive investment to global markets under LPPI and public-private partnerships.",
    highlights: ["Puerto Cortés", "Logistics corridor", "Free zones", "Energy & connectivity"],
    image: IMG.infra,
  },
];

export function getSectors(locale: Locale): ReadonlyArray<SectorCopy> {
  return locale === "en" ? enSectores : esSectores;
}

export function getSectorBySlug(locale: Locale, slug: string): SectorCopy | undefined {
  if (!isSectorSlug(slug)) return undefined;
  return getSectors(locale).find((s) => s.slug === slug);
}

/** Combina datos del sector estático con respuesta de la API (campos API tienen prioridad). */
export function mergeSectorWithApi(fallback: SectorCopy, api: Sector): SectorCopy {
  return {
    slug: fallback.slug,
    name: api.name || fallback.name,
    short: api.short_description || fallback.short,
    fullText: api.description || fallback.fullText,
    highlights: fallback.highlights,
    image: api.image || fallback.image,
  };
}
