import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { portfolioCatalogCopy } from "@/src/i18n/copy/portfolioCatalog";
import type { PortfolioCatalogItem } from "@/src/lib/portfolioCatalog";
import { getSectorBySlug, isSectorSlug } from "@/src/data/investmentSectors";
import { cn } from "@/src/lib/utils";

const SECTOR_BADGE: Record<string, string> = {
  agroindustria: "bg-[#8DC046]/15 text-[#4a7a14]",
  infraestructura: "bg-[#334E88]/12 text-[#334E88]",
  turismo: "bg-[#0E7A7C]/12 text-[#0E7A7C]",
  manufactura: "bg-[#252A58]/10 text-[#252A58]",
  energia: "bg-[#35A963]/15 text-[#1f7a3e]",
  logistica: "bg-[#168654]/12 text-[#168654]",
};

type Props = {
  locale: Locale;
  item: PortfolioCatalogItem;
  pdfUrl?: string | null;
  pdfLabel?: string;
  onOpen: () => void;
};

export function PortfolioItemCard({ locale, item, pdfUrl, pdfLabel, onOpen }: Props) {
  const t = portfolioCatalogCopy[locale];
  const mapHref = withLocale(
    locale,
    item.kind === "project"
      ? `/portafolio/mapa?project=${encodeURIComponent(item.slug)}`
      : `/portafolio/mapa?opportunity=${encodeURIComponent(item.slug)}`,
  );
  const sector = isSectorSlug(item.sectorSlug) ? getSectorBySlug(locale, item.sectorSlug) : undefined;
  const placeholder = sector?.image;
  const isOpportunity = item.kind === "opportunity";
  const ctaLabel = isOpportunity ? t.viewOpportunity : t.viewDetails;
  const imageClass = isOpportunity
    ? "object-cover object-top transition duration-[450ms] group-hover:scale-105"
    : cn("object-cover transition duration-[450ms] group-hover:scale-105", item.coverImageUrl ? "object-left" : "object-center");

  return (
    <article className="group flex h-full min-h-full flex-col overflow-hidden rounded-[18px] border border-[#e4e8ef] bg-white transition duration-300 hover:-translate-y-1.5 hover:border-[rgba(51,78,136,0.18)] hover:shadow-[0_20px_45px_rgba(37,42,88,0.11)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#eef1f6]">
        {item.coverImageUrl ? (
          <Image
            src={item.coverImageUrl}
            alt={item.title}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={imageClass}
          />
        ) : placeholder ? (
          <Image
            src={placeholder}
            alt={item.title}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-[450ms] group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full items-center justify-center font-body text-xs font-bold uppercase tracking-[0.16em] text-[#252A58]/40">
            {item.sectorName}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3.5 flex items-center justify-between gap-2.5">
          {item.sectorName ? (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1.5 font-body text-[11px] font-extrabold uppercase tracking-[0.7px]",
                SECTOR_BADGE[item.sectorSlug] ?? "bg-[#eef2f8] text-[#252A58]",
              )}
            >
              {item.sectorName}
            </span>
          ) : (
            <span />
          )}
          {item.code ? (
            <span className="shrink-0 font-body text-xs font-bold text-[#667085]">{item.code}</span>
          ) : null}
        </div>

        <h3 className="mb-3 min-h-[54px] font-display text-xl font-extrabold leading-snug text-[#252A58] max-sm:min-h-0">
          {item.title}
        </h3>

        {item.locationText ? (
          <p className="mb-3.5 min-h-[39px] font-body text-[13px] leading-relaxed text-[#667085] max-sm:min-h-0">
            <span className="inline-flex items-start gap-1.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#32B372]" aria-hidden />
              <span>
                {item.locationText}
                {item.subregionLabel ? (
                  <span className="mt-1 block text-[#667085]/80">{item.subregionLabel}</span>
                ) : null}
              </span>
            </span>
          </p>
        ) : null}

        {item.description ? (
          <p className="mb-5 line-clamp-3 min-h-[86px] font-body text-[13px] leading-relaxed text-[#4c5567] max-sm:min-h-0">
            {item.description}
          </p>
        ) : null}

        <div className="mt-auto">
          <div className="mb-4 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <MetaBox label={t.investmentLabel} value={item.amountText || "—"} />
            <MetaBox label={t.phaseLabel} value={item.phase || "—"} />
          </div>

          <button
            type="button"
            onClick={onOpen}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-[11px] bg-[#334E88] px-4 py-3.5 text-center font-body text-[13px] font-extrabold text-white transition hover:bg-[#252A58] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F7BF06]"
          >
            {ctaLabel} →
          </button>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link
              href={mapHref}
              className="inline-flex items-center gap-1.5 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-[#334E88] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#32B372]"
            >
              {t.viewOnMap}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
            {pdfUrl ? (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-[#168654] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#32B372]"
              >
                {pdfLabel || t.downloadCard}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function MetaBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f5f7fb] p-3.5">
      <span className="mb-1 block font-body text-[10px] font-bold uppercase tracking-[0.6px] text-[#667085]">
        {label}
      </span>
      <strong className="block font-body text-[13px] font-bold leading-snug text-[#252A58]">{value}</strong>
    </div>
  );
}
