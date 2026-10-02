import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { portfolioCatalogCopy } from "@/src/i18n/copy/portfolioCatalog";
import type { PortfolioCatalogItem } from "@/src/lib/portfolioCatalog";
import { getSectorBySlug } from "@/src/data/investmentSectors";
import { cn } from "@/src/lib/utils";

type Props = {
  locale: Locale;
  item: PortfolioCatalogItem;
  pdfUrl?: string | null;
  pdfLabel?: string;
};

export function PortfolioItemCard({ locale, item, pdfUrl, pdfLabel }: Props) {
  const t = portfolioCatalogCopy[locale];
  const detailHref = withLocale(
    locale,
    item.kind === "project"
      ? `/portafolio/fichas-proyectos/${item.slug}`
      : `/portafolio/oportunidades/${item.slug}`,
  );
  const mapHref = withLocale(
    locale,
    item.kind === "project"
      ? `/portafolio/mapa?project=${encodeURIComponent(item.slug)}`
      : `/portafolio/mapa?opportunity=${encodeURIComponent(item.slug)}`,
  );
  const sector = getSectorBySlug(locale, item.sectorSlug);
  const placeholder = sector?.image;
  const sectorColor = sector?.color_hex;
  const isOpportunity = item.kind === "opportunity";

  // Láminas de proyecto (16:10) muestran texto a la derecha; el contenido
  // visible está en el lado izquierdo → usamos object-left para que la foto
  // no quede tapada por la columna de texto cuando el aspect cambia.
  const imageClass = isOpportunity
    ? "object-cover object-top"
    : cn("object-cover", item.coverImageUrl ? "object-left" : "object-center");
  const aspectClass = isOpportunity ? "aspect-[4/3]" : "aspect-[16/10]";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-cni-primary/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#32B372]/40 hover:shadow-md">
      <Link
        href={detailHref}
        className="flex flex-1 flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#32B372]"
      >
        <div className={cn("relative overflow-hidden bg-cni-primary/8", aspectClass)}>
          {item.coverImageUrl ? (
            <Image
              src={item.coverImageUrl}
              alt={item.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className={imageClass}
            />
          ) : placeholder ? (
            <Image
              src={placeholder}
              alt={item.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center font-headline text-xs font-bold uppercase tracking-[0.16em] text-cni-primary/40">
              {item.sectorName}
            </span>
          )}
          {isOpportunity && item.coverImageUrl ? (
            <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-cni-primary/85 px-2.5 py-1 font-headline text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow">
              {t.opportunityCardBadge}
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap gap-2">
            {item.sectorName ? (
              <span
                className="rounded-full px-2.5 py-1 font-headline text-[10px] font-bold uppercase tracking-[0.14em] text-white"
                style={{ backgroundColor: sectorColor ?? "#252A58" }}
              >
                {item.sectorName}
              </span>
            ) : null}
            {item.code ? (
              <span className="rounded-full bg-[#eaf7f0] px-2.5 py-1 font-headline text-[10px] font-bold uppercase tracking-[0.14em] text-[#168654]">
                {item.code}
              </span>
            ) : null}
            {item.phase ? (
              <span className="rounded-full bg-[#f4f6fb] px-2.5 py-1 font-headline text-[10px] font-bold uppercase tracking-[0.14em] text-cni-primary">
                {item.phase}
              </span>
            ) : null}
          </div>
          <h3 className="mt-3 font-display text-lg font-extrabold leading-snug text-cni-primary group-hover:text-[#0E7A7C]">
            {item.title}
          </h3>
          {item.amountText ? (
            <p className="mt-3 font-display text-2xl font-extrabold text-[#001a33]">
              {item.amountText}
              {item.amountNote ? (
                <span className="ml-2 align-middle font-body text-sm font-normal text-cni-primary/45">
                  {item.amountNote}
                </span>
              ) : null}
            </p>
          ) : null}
          {item.locationText ? (
            <p className="mt-3 inline-flex items-start gap-2 font-body text-sm text-cni-primary/70">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#32B372]" aria-hidden />
              <span>
                {item.locationText}
                {item.subregionLabel ? (
                  <span className="mt-1 block text-cni-primary/50">{item.subregionLabel}</span>
                ) : null}
              </span>
            </p>
          ) : null}
          {item.investmentType ? (
            <p className="mt-3 line-clamp-2 font-body text-sm leading-relaxed text-cni-primary/65">
              {item.investmentType}
            </p>
          ) : null}
        </div>
      </Link>
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-cni-primary/8 px-5 py-3">
        <Link
          href={mapHref}
          onClick={(event) => event.stopPropagation()}
          className={cn(
            "inline-flex items-center gap-1.5 font-headline text-[11px] font-bold uppercase tracking-[0.14em] text-cni-primary underline-offset-4 hover:underline",
            "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#32B372]",
          )}
        >
          {t.viewOnMap}
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
        {pdfUrl ? (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="inline-flex items-center gap-1.5 font-headline text-[11px] font-bold uppercase tracking-[0.14em] text-[#168654] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#32B372]"
          >
            {pdfLabel || t.downloadCard}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        ) : null}
      </div>
    </article>
  );
}