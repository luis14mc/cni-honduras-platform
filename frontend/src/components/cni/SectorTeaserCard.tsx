import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { SectorIcon } from "@/src/components/cni/SectorIcon";
import { sectorPhotoHeaders, SECTOR_ICON_SIZE } from "@/src/lib/sectorIcons";
import type { SectorSlug } from "@/src/data/investmentSectors";
import { getSectorHref } from "@/src/i18n/path";
import type { Locale } from "@/src/i18n/config";

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
    <article className="group relative overflow-hidden rounded-xl bg-[#eff4ff] tonal-depth-layering transition-all hover:shadow-2xl">
      {useIconHeader ? (
        <div className="relative flex h-48 items-center justify-center bg-gradient-to-b from-white to-[#eef0f2] px-8">
          <SectorIcon slug={slug} size={SECTOR_ICON_SIZE.header} />
          <span className="absolute left-4 top-4 inline-flex items-center justify-center rounded bg-[#35A963] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-[#252A58]">
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#252A58]/80 via-[#252A58]/20 to-transparent" />
          <span className="absolute left-4 top-4 inline-flex items-center justify-center rounded bg-[#35A963] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-[#252A58]">
            {badge} 0{badgeIndex + 1}
          </span>
        </div>
      )}
      <div className="p-8">
        {!useIconHeader && <SectorIcon slug={slug} size={SECTOR_ICON_SIZE.teaser} className="mb-5" />}
        <h3 className="text-xl font-bold text-[#252A58]">{name}</h3>
        <p className="mt-3 text-sm leading-relaxed text-[#0E7A7C]">{short}</p>
        <Link
          href={getSectorHref(locale, slug)}
          className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#252A58] transition-all group-hover:gap-3 group-hover:text-[#35A963]"
        >
          {viewDetailLabel} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
