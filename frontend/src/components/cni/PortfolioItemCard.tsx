"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Building2, Compass, Factory, Leaf, MapPin, Truck, Zap } from "lucide-react";
import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { portfolioCatalogCopy } from "@/src/i18n/copy/portfolioCatalog";
import type { PortfolioCatalogItem } from "@/src/lib/portfolioCatalog";
import { getSectorBySlug, isSectorSlug } from "@/src/data/investmentSectors";
import { formatUsdShort } from "@/src/lib/formatUsdShort";

const sectorIcons = {
  agroindustria: Leaf,
  infraestructura: Building2,
  turismo: Compass,
  manufactura: Factory,
  energia: Zap,
  logistica: Truck,
};

export function PortfolioItemCard({ locale, item }: { locale: Locale; item: PortfolioCatalogItem }) {
  const t = portfolioCatalogCopy[locale];
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const isProject = item.kind === "project";
  const slug = encodeURIComponent(item.slug);
  const detailHref = withLocale(locale, isProject ? `/portafolio/fichas-proyectos/${slug}` : `/portafolio/oportunidades/${slug}`);
  const mapHref = withLocale(locale, `/portafolio/mapa?${isProject ? "project" : "opportunity"}=${slug}`);
  const sectorSlug = isSectorSlug(item.sectorSlug) ? item.sectorSlug : null;
  const sector = sectorSlug ? getSectorBySlug(locale, sectorSlug) : undefined;
  const SectorIcon = sectorSlug ? sectorIcons[sectorSlug] : Building2;
  const color = sector?.color_hex ?? "#334E88";
  const location = [item.locationText, item.subregionLabel].filter(Boolean).join(" · ");
  const pdfUrl = isProject ? null : item.pdfUrl;

  return (
    <article className="group relative isolate flex h-full flex-col rounded-xl border border-[#dce3ee] bg-white shadow-sm transition motion-safe:hover:-translate-y-1 hover:shadow-lg focus-within:ring-2 focus-within:ring-[#13704d] focus-within:ring-offset-2">
      <div className="relative grid aspect-video place-items-center overflow-hidden rounded-t-[11px] bg-[#252a58]">
        <div className="absolute inset-0 grid place-items-center text-white" style={{ backgroundColor: color }} aria-hidden="true">
          <div className="rounded-full bg-[#172044] p-3"><SectorIcon className="size-8" /></div>
        </div>
        {item.coverImageUrl && failedImage !== item.coverImageUrl && (
          <Image
            src={item.coverImageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 92vw"
            onError={() => setFailedImage(item.coverImageUrl)}
            className={`object-cover transition duration-300 motion-safe:group-hover:scale-[1.03] ${isProject ? "object-center" : "object-top"}`}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#10182f]/55 via-transparent to-[#10182f]/25" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          {item.sectorName && (
            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#252a58]">
              <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
              {sector?.name ?? item.sectorName}
            </span>
          )}
          {item.code && <span className="ml-auto shrink-0 rounded-md bg-[#172044] px-2 py-1 font-mono text-[11px] font-bold text-white">{item.code}</span>}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-2 pt-4 sm:px-5">
        <h2 className="line-clamp-2 min-h-[2.6em] font-display text-lg font-extrabold leading-[1.3] text-[#252a58]">{item.title}</h2>
        <div className="mt-1 flex min-h-5 items-center gap-1.5 text-sm text-[#4c5567]">
          {location && <><MapPin className="size-4 shrink-0 text-[#16744f]" aria-hidden="true" /><p className="line-clamp-1" title={location}>{location}</p></>}
        </div>
        <p className="mb-3 mt-2 line-clamp-3 text-sm leading-5 text-[#4c5567]">{item.description}</p>
        <div className="mt-auto flex min-h-10 items-center justify-between gap-2 border-t border-[#e4e8ef] pt-2.5">
          <strong className="font-display text-lg font-extrabold leading-tight text-[#16744f] xl:text-xl">
            <span className="sr-only">{t.investmentLabel}: </span>
            {formatUsdShort(locale, item.amountUsd, item.amountText)}
          </strong>
          {item.phase && <span className="line-clamp-2 max-w-[43%] rounded-md bg-[#edf2fb] px-2 py-1 text-right text-[11px] font-bold leading-tight text-[#334e88]" title={item.phase}>{item.phase}</span>}
        </div>
        <div className="mt-1 flex items-center justify-between gap-2 text-xs font-bold">
          <Link
            href={detailHref}
            aria-label={`${locale === "es" ? "Ver ficha" : "View sheet"}: ${item.title}`}
            className="inline-flex min-h-11 items-center gap-1.5 text-[#252a58] after:absolute after:inset-0 after:z-10 after:rounded-xl hover:underline"
          >
            {locale === "es" ? "Ver ficha" : "View sheet"} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href={pdfUrl || mapHref}
            target={pdfUrl ? "_blank" : undefined}
            rel={pdfUrl ? "noopener noreferrer" : undefined}
            className="relative z-20 inline-flex min-h-11 items-center gap-1.5 rounded text-[#334e88] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#13704d]"
          >
            {pdfUrl ? (locale === "es" ? "Descargar PDF" : "Download PDF") : t.viewOnMap}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
