import type { SectorSlug } from "@/src/data/investmentSectors";
import { designImages } from "@/src/lib/designAssets";

/** Canvas nativo de los PNG oficiales en /public/icons/sectors/. */
const ICON_PNG_CANVAS = 1024;

/** Logos oficiales de sectores (PNG actualizados, carpeta única). */
export const sectorIconAssets: Record<
  SectorSlug,
  { src: string; width: number; height: number }
> = {
  agroindustria: { src: "/icons/sectors/Agroindustria.png", width: ICON_PNG_CANVAS, height: ICON_PNG_CANVAS },
  manufactura: { src: "/icons/sectors/Manufactura 1.png", width: ICON_PNG_CANVAS, height: ICON_PNG_CANVAS },
  turismo: { src: "/icons/sectors/Turismo 1.png", width: ICON_PNG_CANVAS, height: ICON_PNG_CANVAS },
  energia: { src: "/icons/sectors/Energía 1.png", width: ICON_PNG_CANVAS, height: ICON_PNG_CANVAS },
  infraestructura: { src: "/icons/sectors/Infraestructura 1.png", width: ICON_PNG_CANVAS, height: ICON_PNG_CANVAS },
  logistica: { src: "/icons/sectors/Logística 1.png", width: ICON_PNG_CANVAS, height: ICON_PNG_CANVAS },
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
