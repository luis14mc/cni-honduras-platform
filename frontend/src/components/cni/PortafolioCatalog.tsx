"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { isSectorSlug, type SectorSlug } from "@/src/data/investmentSectors";
import { cn } from "@/src/lib/utils";
import type { AsyncData } from "@/src/lib/asyncData";
import type { InvestmentOpportunity, InvestmentProject, ProjectStage } from "@/src/types/investment";

type Kind = "all" | "opportunity" | "project";

type SectorOption = { slug: SectorSlug; label: string };

type CatalogItem = {
  key: string;
  kind: "opportunity" | "project";
  title: string;
  summary: string;
  sectorSlug: string;
  sectorName: string;
  meta: string;
  href: string;
};

const labels = {
  es: {
    all: "Todos",
    opportunities: "Oportunidades",
    projects: "Proyectos",
    sectorAll: "Todos los sectores",
    empty: "No hay fichas públicas con estos filtros.",
    error: "No pudimos cargar el catálogo. Intente de nuevo más tarde.",
    errorPartial: "Parte del catálogo no cargó. Mostramos lo disponible.",
    cta: "Ver ficha",
    opportunity: "Oportunidad",
    project: "Proyecto",
    count: (n: number) => (n === 1 ? "1 ficha" : `${n} fichas`),
  },
  en: {
    all: "All",
    opportunities: "Opportunities",
    projects: "Projects",
    sectorAll: "All sectors",
    empty: "No public records match these filters.",
    error: "We could not load the catalog. Please try again later.",
    errorPartial: "Part of the catalog failed to load. Showing what is available.",
    cta: "View record",
    opportunity: "Opportunity",
    project: "Project",
    count: (n: number) => (n === 1 ? "1 record" : `${n} records`),
  },
} as const;

const STAGE: Record<Locale, Record<ProjectStage, string>> = {
  es: {
    promotion: "Promoción",
    announced: "Anunciado",
    startup: "Arranque",
    implementing: "Implementando",
    stalled: "Parado",
    finished: "Finalizado",
    cancelled: "Cancelado",
  },
  en: {
    promotion: "Promotion",
    announced: "Announced",
    startup: "Startup",
    implementing: "Implementing",
    stalled: "Stalled",
    finished: "Finished",
    cancelled: "Cancelled",
  },
};

const STATUS = {
  es: { open: "Abierta", in_progress: "En progreso", closed: "Cerrada" },
  en: { open: "Open", in_progress: "In progress", closed: "Closed" },
} as const;

function money(value: string | null): string | null {
  if (!value) return null;
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function chipClass(active: boolean) {
  return cn(
    "rounded-full px-4 py-2 font-headline text-[11px] font-bold uppercase tracking-[0.16em] transition",
    active
      ? "bg-[#000a1e] text-white"
      : "bg-[#f3f4f5] text-cni-primary hover:bg-[#e7e8e9]",
  );
}

type Props = {
  locale: Locale;
  sectors: SectorOption[];
  projects: AsyncData<InvestmentProject[]>;
  opportunities: AsyncData<InvestmentOpportunity[]>;
};

export function PortafolioCatalog({ locale, sectors, projects, opportunities }: Props) {
  const t = labels[locale];
  const [kind, setKind] = useState<Kind>("all");
  const [sector, setSector] = useState<string>("all");

  const items = useMemo(() => {
    const rows: CatalogItem[] = [];
    if (opportunities.status === "ok") {
      for (const item of opportunities.data) {
        const amount = money(item.estimated_investment);
        rows.push({
          key: `o-${item.slug}`,
          kind: "opportunity",
          title: item.title,
          summary: item.summary || "",
          sectorSlug: item.sector?.slug ?? "",
          sectorName: item.sector?.name ?? "",
          meta: [STATUS[locale][item.status], amount].filter(Boolean).join(" · "),
          href: withLocale(locale, `/crecer/oportunidades/${item.slug}`),
        });
      }
    }
    if (projects.status === "ok") {
      for (const item of projects.data) {
        const amount = money(item.investment_amount);
        const sectorHref = isSectorSlug(item.sector?.slug ?? "")
          ? withLocale(locale, `/invertir/sectores/${item.sector.slug}`)
          : withLocale(locale, "/invertir/sectores");
        rows.push({
          key: `p-${item.slug}`,
          kind: "project",
          title: item.title,
          summary: item.summary || item.description || "",
          sectorSlug: item.sector?.slug ?? "",
          sectorName: item.sector?.name ?? "",
          meta: [STAGE[locale][item.project_stage], amount].filter(Boolean).join(" · "),
          href: sectorHref,
        });
      }
    }
    return rows;
  }, [locale, opportunities, projects]);

  const visible = items.filter((item) => {
    if (kind !== "all" && item.kind !== kind) return false;
    if (sector !== "all" && item.sectorSlug !== sector) return false;
    return true;
  });

  const bothFailed = opportunities.status === "error" && projects.status === "error";
  const partialFailed = opportunities.status === "error" || projects.status === "error";
  const kindFailed =
    (kind === "opportunity" && opportunities.status === "error") ||
    (kind === "project" && projects.status === "error");

  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={locale === "es" ? "Tipo de ficha" : "Record type"}>
          {(
            [
              ["all", t.all],
              ["opportunity", t.opportunities],
              ["project", t.projects],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={kind === id} className={chipClass(kind === id)} onClick={() => setKind(id)}>
              {label}
            </button>
          ))}
        </div>
        <p className="font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-[#74777f]">
          {t.count(visible.length)}
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2" aria-label={locale === "es" ? "Filtrar por sector" : "Filter by sector"}>
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

      {bothFailed || kindFailed ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-800">
          {t.error}
        </p>
      ) : (
        <>
          {partialFailed && kind === "all" ? (
            <p role="status" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {t.errorPartial}
            </p>
          ) : null}
          {visible.length === 0 ? (
            <p className="rounded-xl border border-dashed border-cni-primary/15 bg-[#f3f4f5] px-6 py-12 text-center text-sm text-[#44474d]">
              {t.empty}
            </p>
          ) : (
            <div className="divide-y divide-cni-primary/10 overflow-hidden rounded-2xl border border-cni-primary/10 bg-[#f8f9ff]">
              {visible.map((item, index) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="group grid grid-cols-1 gap-3 px-6 py-5 transition-colors hover:bg-white md:grid-cols-12 md:items-center md:px-8"
                >
                  <span className="font-headline text-[11px] font-bold tracking-[0.18em] text-[#32B372] md:col-span-1">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="md:col-span-8">
                    <p className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-on-surface-variant/55">
                      {item.kind === "opportunity" ? t.opportunity : t.project}
                      {item.sectorName ? ` · ${item.sectorName}` : ""}
                      {item.meta ? ` · ${item.meta}` : ""}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-extrabold text-cni-primary group-hover:text-[#0E7A7C] md:text-xl">
                      {item.title}
                    </h3>
                    {item.summary ? (
                      <p className="mt-1 line-clamp-2 font-body text-sm text-[#44474d]">{item.summary}</p>
                    ) : null}
                  </div>
                  <span className="inline-flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-cni-primary md:col-span-3 md:justify-end">
                    {t.cta}
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
