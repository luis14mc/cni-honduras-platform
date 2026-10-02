"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Locale } from "@/src/i18n/config";
import { portfolioCatalogCopy } from "@/src/i18n/copy/portfolioCatalog";
import { PORTFOLIO_CATALOG_SECTORS, serializePortfolioFilters, slugifyPhase } from "@/src/lib/portfolioCatalog";
import { getSectorDisplayName } from "@/src/data/investmentSectors";
import { cn } from "@/src/lib/utils";

type Props = {
  locale: Locale;
  sector: string | null;
  fase: string | null;
  phases: string[];
};

export function PortfolioCatalogFilters({ locale, sector, fase, phases }: Props) {
  const t = portfolioCatalogCopy[locale];
  const pathname = usePathname();
  const router = useRouter();

  const hrefFor = (nextSector: string | null, nextFase: string | null) => {
    const query = serializePortfolioFilters({ sector: nextSector, fase: nextFase });
    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label={t.allSectors}>
        <Link
          href={hrefFor(null, fase)}
          className={chipClass(!sector)}
        >
          {t.allSectors}
        </Link>
        {PORTFOLIO_CATALOG_SECTORS.map((slug) => (
          <Link key={slug} href={hrefFor(slug, fase)} className={chipClass(sector === slug)}>
            {getSectorDisplayName(locale, slug)}
          </Link>
        ))}
      </div>
      {phases.length > 0 ? (
        <label className="flex max-w-xs flex-col gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-cni-primary/60">
          {t.phase}
          <select
            className="rounded-lg border border-cni-primary/15 bg-white px-3 py-2 font-body text-sm font-normal normal-case tracking-normal text-cni-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#32B372]"
            value={fase ?? ""}
            onChange={(event) => {
              const value = event.target.value || null;
              router.replace(hrefFor(sector, value), { scroll: false });
            }}
          >
            <option value="">{t.allPhases}</option>
            {phases.map((phase) => (
              <option key={phase} value={slugifyPhase(phase)}>
                {phase}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  );
}

function chipClass(active: boolean) {
  return cn(
    "rounded-full px-4 py-2 font-headline text-[11px] font-bold uppercase tracking-[0.14em] transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#32B372]",
    active ? "bg-cni-primary text-white" : "bg-white text-cni-primary ring-1 ring-cni-primary/15 hover:bg-[#eaf7f0]",
  );
}
