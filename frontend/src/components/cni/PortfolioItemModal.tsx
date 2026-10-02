"use client";

import { useEffect, useId, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
  item: PortfolioCatalogItem | null;
  pdfUrl?: string | null;
  onClose: () => void;
};

export function PortfolioItemModal({ locale, item, pdfUrl, onClose }: Props) {
  const t = portfolioCatalogCopy[locale];
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const open = Boolean(item);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const sector = item && isSectorSlug(item.sectorSlug) ? getSectorBySlug(locale, item.sectorSlug) : undefined;
  const imageSrc = item?.coverImageUrl || sector?.image || null;
  const locationLine = item
    ? [item.locationText, item.subregionLabel].filter(Boolean).join(" · ")
    : "";
  const contactHref = item
    ? withLocale(locale, `/contacto?ref=${encodeURIComponent(item.code || item.slug)}`)
    : "#";
  const mapHref = item
    ? withLocale(
        locale,
        item.kind === "project"
          ? `/portafolio/mapa?project=${encodeURIComponent(item.slug)}`
          : `/portafolio/mapa?opportunity=${encodeURIComponent(item.slug)}`,
      )
    : "#";
  const showDownload = item?.kind === "opportunity" && Boolean(pdfUrl);
  const showRequest = item?.kind === "project" || (item?.kind === "opportunity" && !pdfUrl);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={() => {
        if (item) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-3 backdrop:bg-[rgba(20,25,45,0.72)] backdrop:backdrop-blur-[4px] open:flex open:items-center open:justify-center sm:p-[30px]"
    >
      {item ? (
        <div
          className="relative grid max-h-[92vh] w-full max-w-[1080px] overflow-y-auto rounded-[20px] bg-white shadow-[0_40px_100px_rgba(0,0,0,0.28)] lg:grid-cols-[44%_56%]"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeModal}
            className="absolute right-[15px] top-[15px] z-10 inline-flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white/95 font-body text-[28px] leading-none text-[#252A58] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#32B372]"
          >
            ×
          </button>

          <div className="bg-[#eef1f6] lg:min-h-full">
            {imageSrc ? (
              <div className="relative h-[300px] sm:h-[350px] lg:h-full lg:min-h-[620px]">
                <Image
                  src={imageSrc}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 44vw, 100vw"
                  className={cn(
                    "object-cover",
                    item.kind === "opportunity" ? "object-top" : "object-center",
                  )}
                />
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center font-body text-xs font-bold uppercase tracking-[0.16em] text-[#252A58]/40 sm:h-[350px] lg:min-h-[620px]">
                {item.sectorName}
              </div>
            )}
          </div>

          <div className="px-6 py-9 sm:px-12 sm:py-14">
            <div className="mb-[18px] flex items-center justify-between gap-4">
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

            <h2
              id={titleId}
              className="mb-7 font-display text-[clamp(28px,4vw,42px)] font-extrabold leading-[1.15] text-[#252A58]"
            >
              {item.title}
            </h2>

            {locationLine ? (
              <div className="mb-7 border-l-4 border-[#32B372] pl-[15px]">
                <span className="mb-1 block font-body text-[11px] font-extrabold uppercase tracking-[0.7px] text-[#667085]">
                  {t.location}
                </span>
                <strong className="font-body text-base font-bold text-[#252A58]">{locationLine}</strong>
              </div>
            ) : null}

            {item.description ? (
              <p className="mb-[30px] whitespace-pre-line font-body text-[15px] leading-[1.8] text-[#4d5668]">
                {item.description}
              </p>
            ) : null}

            <div className="mb-[30px] grid grid-cols-1 gap-[15px] sm:grid-cols-2">
              <ModalStat label={t.investmentLabel} value={item.amountText || "—"} detail={item.amountNote} />
              <ModalStat label={t.phaseLabel} value={item.phase || "—"} detail={item.phaseDetail} />
            </div>

            {item.investmentType ? (
              <div className="mb-[30px] border-y border-[#e4e8ef] py-[25px]">
                <span className="mb-1 block font-body text-[11px] font-extrabold uppercase tracking-[0.7px] text-[#667085]">
                  {t.investmentType}
                </span>
                <p className="m-0 font-body text-[15px] leading-[1.7] text-[#4d5668]">{item.investmentType}</p>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              {showRequest ? (
                <Link
                  href={contactHref}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[11px] bg-[#334E88] px-4 py-3.5 text-center font-body text-[13px] font-extrabold text-white transition hover:bg-[#252A58] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F7BF06]"
                >
                  {t.requestFullSheet}
                </Link>
              ) : null}
              {showDownload && pdfUrl ? (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[11px] bg-[#334E88] px-4 py-3.5 text-center font-body text-[13px] font-extrabold text-white transition hover:bg-[#252A58] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#32B372]"
                >
                  {t.downloadFile}
                </a>
              ) : null}
            </div>

            <Link
              href={mapHref}
              className="mt-4 inline-flex min-h-11 items-center gap-1.5 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-[#334E88] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#32B372]"
            >
              {t.viewOnMap}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}

function ModalStat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-[13px] bg-[#f5f7fb] p-[18px]">
      <span className="mb-1 block font-body text-[11px] font-extrabold uppercase tracking-[0.7px] text-[#667085]">
        {label}
      </span>
      <strong className="mb-1 block font-body text-lg font-bold text-[#252A58]">{value}</strong>
      {detail ? <small className="font-body text-[13px] leading-snug text-[#667085]">{detail}</small> : null}
    </div>
  );
}
