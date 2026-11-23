"use client";

import Image from "next/image";
import type { Locale } from "@/src/i18n/config";
import type { InvestmentMapCopy } from "@/src/i18n/copy/investmentMap";
import type { MapInvestmentProject } from "@/src/lib/types/investment-map";
import { formatMapInvestment } from "@/src/lib/types/investment-map";

const PROJECT_COLOR = "#32B372";
const OPPORTUNITY_COLOR = "#F7BF06";

export function MapResultsList({
  locale,
  copy,
  projects,
  loading,
  error,
  emptyMessage,
  onSelectProject,
  onHoverProject,
}: {
  locale: Locale;
  copy: InvestmentMapCopy;
  projects: MapInvestmentProject[];
  loading: boolean;
  error: boolean;
  emptyMessage: string;
  onSelectProject: (project: MapInvestmentProject) => void;
  onHoverProject: (id: number | null) => void;
}) {
  return (
    <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
      {loading ? <p className="text-sm text-[#d5e3ff]/70">{copy.loadingProjects}</p> : null}
      {error ? <p role="alert" className="rounded-lg border border-red-200/20 bg-red-950/25 p-3 text-sm text-red-100">{copy.projectsError}</p> : null}
      {!loading && !error && projects.length === 0 ? (
        <p className="text-sm text-[#d5e3ff]/70">{emptyMessage}</p>
      ) : null}
      <ul className="space-y-2">
        {projects.map((item) => {
          const kind = item.kind ?? "project";
          const amount = item.amountText || formatMapInvestment(item.investment_amount, locale);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelectProject(item)}
                onMouseEnter={() => onHoverProject(item.id)}
                onMouseLeave={() => onHoverProject(null)}
                onFocus={() => onHoverProject(item.id)}
                onBlur={() => onHoverProject(null)}
                className="flex min-h-11 w-full gap-3 rounded-xl border border-white/10 bg-[#252A58]/55 p-3 text-left transition hover:border-[#F7BF06]/60 hover:bg-[#252A58]/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7BF06]"
              >
                <SheetThumb item={item} />
                <span className="min-w-0 flex-1">
                  <span className="block font-bold leading-snug">{item.title}</span>
                  {item.code ? <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-wide text-[#d5e3ff]/70">{item.code}</span> : null}
                  <span className="mt-1 block text-xs text-[#d5e3ff]/75">
                    {item.sector?.name ?? "—"}
                    {amount ? ` · ${amount}` : ""}
                    {item.municipality?.name || item.locationText ? ` · ${item.municipality?.name || item.locationText}` : ""}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="mt-1 h-3 w-3 shrink-0 rounded-full border border-white"
                  style={{ backgroundColor: kind === "opportunity" ? OPPORTUNITY_COLOR : PROJECT_COLOR }}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SheetThumb({ item }: { item: MapInvestmentProject }) {
  const kind = item.kind ?? "project";
  return (
    <span
      className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg"
      style={{ backgroundColor: kind === "opportunity" ? OPPORTUNITY_COLOR : PROJECT_COLOR }}
    >
      {item.coverImageUrl ? (
        <Image
          src={item.coverImageUrl}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 object-cover"
          onError={(event) => { event.currentTarget.style.visibility = "hidden"; }}
        />
      ) : null}
    </span>
  );
}
