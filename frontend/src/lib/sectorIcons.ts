import type { SectorSlug } from "@/src/data/investmentSectors";
import { designImages } from "@/src/lib/designAssets";

const ICON_CANVAS = 320;
const ICON_PNG_CANVAS = 1024;

/** Iconos oficiales de sectores (WebP, canvas uniforme 320×320; Logística y Transporte en PNG 1024). */
export const sectorIconAssets: Record<
  SectorSlug,
  { src: string; width: number; height: number }
> = {
  agroindustria: { src: "/icons/sectors/agroindustria.webp", width: ICON_CANVAS, height: ICON_CANVAS },
  manufactura: { src: "/icons/sectors/manufactura.webp", width: ICON_CANVAS, height: ICON_CANVAS },
  turismo: { src: "/icons/sectors/turismo.webp", width: ICON_CANVAS, height: ICON_CANVAS },
  energia: { src: "/icons/sectors/energia.webp", width: ICON_CANVAS, height: ICON_CANVAS },
  infraestructura: { src: "/icons/sectors/infraestructura.webp", width: ICON_CANVAS, height: ICON_CANVAS },
  logistica: { src: "/img/sectores/Logística 1.png", width: ICON_PNG_CANVAS, height: ICON_PNG_CANVAS },
};

/** Tamaño estándar del icono en tarjetas y listados. */
export const SECTOR_ICON_SIZE = {
  card: 140,
  teaser: 96,
  header: 132,
  sidebar: 32,
} as const;
export const sectorPhotoHeaders: Record<SectorSlug, string> = {
  agroindustria: designImages.sectors.agroindustria,
  manufactura: designImages.sectors.manufactura,
  turismo: designImages.sectors.turismo,
  energia: designImages.sectors.energia,
  infraestructura: designImages.sectors.infraestructura,
  logistica: designImages.sectors.logistica,
};
