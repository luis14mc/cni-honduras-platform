import Image from "next/image";
import { cn } from "@/src/lib/utils";
import type { SectorSlug } from "@/src/data/investmentSectors";
import { sectorIconAssets } from "@/src/lib/sectorIcons";

type SectorIconProps = {
  slug: SectorSlug;
  className?: string;
  /** Lado del contenedor cuadrado (px). */
  size?: number;
};

export function SectorIcon({ slug, className, size = 40 }: SectorIconProps) {
  const icon = sectorIconAssets[slug];

  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={icon.src}
        alt=""
        width={icon.width}
        height={icon.height}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
