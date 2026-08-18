"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/src/i18n/config";
import { type SectorSlug } from "@/src/data/investmentSectors";
import {
  formatSuccessStoryInvestment,
  formatSuccessStoryJobs,
  successStoryDetailHref,
} from "@/src/lib/cmsSuccessStories";
import { cn } from "@/src/lib/utils";
import type { AsyncData } from "@/src/lib/asyncData";
import type { SuccessStory } from "@/src/types/investment";

type SectorOption = { slug: SectorSlug; label: string };

const labels = {
  es: {
    sectorAll: "Todos los sectores",
    empty: "No hay casos públicos con este filtro.",
    error: "No pudimos cargar los casos de éxito. Intente de nuevo más tarde.",
    cta: "Ver caso",
    count: (n: number) => (n === 1 ? "1 caso" : `${n} casos`),
    jobs: "empleos",
  },
  en: {
    sectorAll: "All sectors",
    empty: "No public stories match this filter.",
    error: "We could not load success stories. Please try again later.",
    cta: "View story",
    count: (n: number) => (n === 1 ? "1 story" : `${n} stories`),
    jobs: "jobs",
  },
} as const;

function chipClass(active: boolean) {
  return cn(
    "rounded-full px-4 py-2 font-headline text-[11px] font-bold uppercase tracking-[0.16em] transition",
    active ? "bg-[#000a1e] text-white" : "bg-[#f3f4f5] text-cni-primary hover:bg-[#e7e8e9]",
  );
}

type Props = {
  locale: Locale;
  sectors: SectorOption[];
  stories: AsyncData<SuccessStory[]>;
};

export function CasosCatalog({ locale, sectors, stories }: Props) {
  const t = labels[locale];
  const [sector, setSector] = useState<string>("all");

  const visible = useMemo(() => {
    if (stories.status !== "ok") return [];
    return stories.data.filter((story) => {
      if (sector === "all") return true;
      return story.sector?.slug === sector;
    });
  }, [sector, stories]);

  if (stories.status === "error") {
    return (
      <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-800">
        {t.error}
      </p>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap gap-2" aria-label={locale === "es" ? "Filtrar por sector" : "Filter by sector"}>
          <button type="button" className={chipClass(sector === "all")} onClick={() => setSector("all")}>
            {t.sectorAll}
          </button>
          {sectors.map((option) => (
            <button
              key={option.slug}
              type="button"
              className={chipClass(sector === option.slug)}
              onClick={() => setSector(option.slug)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-[#74777f]">
          {t.count(visible.length)}
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-cni-primary/15 bg-[#f3f4f5] px-6 py-12 text-center text-sm text-[#44474d]">
          {t.empty}
        </p>
      ) : (
        <div className="divide-y divide-cni-primary/10 overflow-hidden rounded-2xl border border-cni-primary/10 bg-[#f8f9ff]">
          {visible.map((story, index) => {
            const investment = formatSuccessStoryInvestment(locale, story.investment_amount);
            const jobs = formatSuccessStoryJobs(locale, story.jobs_generated);
            const meta = [
              story.company_name,
              story.sector?.name,
              investment,
              jobs ? `${jobs} ${t.jobs}` : null,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <Link
                key={story.slug}
                href={successStoryDetailHref(locale, story.slug)}
                className="group grid grid-cols-1 gap-3 px-6 py-5 transition-colors hover:bg-white md:grid-cols-12 md:items-center md:px-8"
              >
                <span className="font-headline text-[11px] font-bold tracking-[0.18em] text-[#32B372] md:col-span-1">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="md:col-span-8">
                  <p className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-on-surface-variant/55">
                    {meta}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-extrabold text-cni-primary group-hover:text-[#0E7A7C] md:text-xl">
                    {story.title}
                  </h3>
                  {story.summary ? (
                    <p className="mt-1 line-clamp-2 font-body text-sm text-[#44474d]">{story.summary}</p>
                  ) : null}
                </div>
                <span className="inline-flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-cni-primary md:col-span-3 md:justify-end">
                  {t.cta}
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
