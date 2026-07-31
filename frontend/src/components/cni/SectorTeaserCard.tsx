import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { SectorIcon } from "@/src/components/cni/SectorIcon";
import { sectorPhotoHeaders, SECTOR_ICON_SIZE } from "@/src/lib/sectorIcons";
import type { SectorSlug } from "@/src/data/investmentSectors";
import { getSectorHref } from "@/src/i18n/path";
import type { Locale } from "@/src/i18n/config";
import { type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";

type Props = {
  locale: Locale;
  slug: SectorSlug;
  name: string;
  short: string;
  image: string;
  badge: string;
  badgeIndex: number;
  viewDetailLabel: string;
};

export function SectorTeaserCard({
  locale,
  slug,
  name,
  short,
  image,
  badge,
  badgeIndex,
  viewDetailLabel,
}: Props) {
  const photoSrc = sectorPhotoHeaders[slug] ?? image;
  const useIconHeader = !sectorPhotoHeaders[slug];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-cni-primary/10 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-[#29AB85]/30 hover:shadow-lg">
      {useIconHeader ? (
        <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-b from-white to-[#eff4ff]">
          <div className="site-footer-mesh pointer-events-none absolute inset-0 opacity-[0.15]" aria-hidden />
          <SectorIcon slug={slug} size={SECTOR_ICON_SIZE.header} />
          <span className="absolute left-4 top-4 rounded bg-[#29AB85] px-2.5 py-1 font-headline text-[10px] font-bold uppercase tracking-[0.14em] text-white">
            {badge} 0{badgeIndex + 1}
          </span>
        </div>
      ) : (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={photoSrc}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cni-primary/85 via-cni-primary/25 to-transparent" />
          <span className="absolute left-4 top-4 rounded bg-[#29AB85] px-2.5 py-1 font-headline text-[10px] font-bold uppercase tracking-[0.14em] text-white">
            {badge} 0{badgeIndex + 1}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-6 md:p-7">
        {!useIconHeader && <SectorIcon slug={slug} size={SECTOR_ICON_SIZE.teaser} className="mb-4" />}
        <h3 className={t.h3Card}>{name}</h3>
        <p className={cn("mt-3 flex-1", t.bodySm, "text-cni-on-surface-variant")}>{short}</p>
        <Link
          href={getSectorHref(locale, slug)}
          className={cn(
            "mt-6 inline-flex items-center gap-2 text-cni-primary transition-all group-hover:gap-3 group-hover:text-[#29AB85]",
            t.button,
          )}
        >
          {viewDetailLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
