import type { Locale } from "@/src/i18n/config";
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

const esSectores: ReadonlyArray<SectorCopy> = [
  {
    slug: "agroindustria",
    name: "Agroindustria Premium",
    short: "Clima fértil los 365 días. Café, cacao, tabaco.",
    fullText:
      "Aprovechando la diversidad ecológica y las rutas comerciales estratégicas para diseñar la próxima generación de inversión agrícola global de alto rendimiento.",
    highlights: ["Café de especialidad", "Cacao fino de aroma", "Tabaco premium", "Aceite de palma sostenible"],
    image: IMG.ag,
  },
  {
    slug: "manufactura",
    name: "Manufactura y Textil",
    short: "Liderazgo en nearshoring, beneficios 'Zero-Duty' hacia EE.UU.",
    fullText:
      "Hub de clase mundial para confección, ensamble ligero y componentes automotrices destinados a Norteamérica, con un ecosistema maduro de zonas libres y logística automatizada.",
    highlights: ["Nearshoring CAFTA-DR", "Zonas Libres (ZOLI)", "Logística multimodal", "Talento técnico"],
    image: IMG.mfg,
  },
  {
    slug: "turismo",
    name: "Turismo Sustentable",
    short: "Islas de la Bahía, arrecifes y arqueología Maya.",
    fullText:
      "Activos naturales sin igual, proximidad geográfica estratégica e incentivos institucionales para la hospitalidad de alta gama y eco-lujo certificado.",
    highlights: ["Roatán y Utila", "Ruinas de Copán", "Eco-lodges", "Marinas y cruceros"],
    image: IMG.tour,
  },
  {
    slug: "energia",
    name: "Energía Renovable",
    short: "Matriz 60% limpia. Proyectos solares, eólicos e hidroeléctricos.",
    fullText:
      "Transición acelerada hacia energías 100% renovables, con apertura en producción solar, eólica e hidrógeno verde, y demanda eléctrica creciente al 3.5–4% anual.",
    highlights: ["Solar y eólico", "Hidroeléctricas", "Hidrógeno verde", "Hub regional de red"],
    image: IMG.ene,
  },
  {
    slug: "infraestructura",
    name: "Infraestructura",
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
    name: "Premium agribusiness",
    short: "Fertile climate year-round. Coffee, cocoa, tobacco.",
    fullText:
      "Leveraging ecological diversity and strategic trade routes to design the next generation of high-yield global agricultural investment.",
    highlights: ["Specialty coffee", "Fine aroma cocoa", "Premium tobacco", "Sustainable palm oil"],
    image: IMG.ag,
  },
  {
    slug: "manufactura",
    name: "Manufacturing & textiles",
    short: "Nearshoring leadership, Zero-Duty benefits to the U.S.",
    fullText:
      "World-class hub for apparel, light assembly, and automotive components bound for North America, with mature free zones and automated logistics.",
    highlights: ["CAFTA-DR nearshoring", "Free Zones (ZOLI)", "Multimodal logistics", "Technical talent"],
    image: IMG.mfg,
  },
  {
    slug: "turismo",
    name: "Sustainable tourism",
    short: "Bay Islands, reefs, and Maya archaeology.",
    fullText:
      "Unmatched natural assets, strategic geography, and institutional incentives for high-end hospitality and certified eco-luxury.",
    highlights: ["Roatán & Utila", "Copán ruins", "Eco-lodges", "Marinas & cruises"],
    image: IMG.tour,
  },
  {
    slug: "energia",
    name: "Renewable energy",
    short: "~60% clean matrix. Solar, wind, and hydro projects.",
    fullText:
      "Accelerated transition toward 100% renewable generation, with openings in solar, wind, and green hydrogen, and power demand growing ~3.5–4% annually.",
    highlights: ["Solar & wind", "Hydro", "Green hydrogen", "Regional grid hub"],
    image: IMG.ene,
  },
  {
    slug: "infraestructura",
    name: "Infrastructure",
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
