import type { SectorSlug } from "@/src/data/investmentSectors";
import { designImages } from "@/src/lib/designAssets";

const ICON_CANVAS = 320;

/** Iconos oficiales de sectores (WebP, canvas uniforme 320×320). */
export const sectorIconAssets: Record<
  SectorSlug,
  { src: string; width: number; height: number }
> = {
  agroindustria: { src: "/icons/sectors/agroindustria.webp", width: ICON_CANVAS, height: ICON_CANVAS },
  manufactura: { src: "/icons/sectors/manufactura.webp", width: ICON_CANVAS, height: ICON_CANVAS },
  turismo: { src: "/icons/sectors/turismo.webp", width: ICON_CANVAS, height: ICON_CANVAS },
  energia: { src: "/icons/sectors/energia.webp", width: ICON_CANVAS, height: ICON_CANVAS },
  infraestructura: { src: "/icons/sectors/infraestructura.webp", width: ICON_CANVAS, height: ICON_CANVAS },
};

/** Tamaño estándar del icono en tarjetas y listados. */
export const SECTOR_ICON_SIZE = {
  card: 140,
  teaser: 96,
  header: 132,
  sidebar: 32,
} as const;
export const sectorPhotoHeaders: Partial<Record<SectorSlug, string>> = {
  agroindustria: designImages.sectors.agroindustria,
  turismo: designImages.sectors.turismo,
  energia: designImages.sectors.energia,
};
