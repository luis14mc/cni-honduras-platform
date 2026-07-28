"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "@/src/i18n/config";
import { facilidadesMigratoriasPageCopy } from "@/src/i18n/copy/facilidadesMigratoriasPage";
import mapSpec from "@/src/data/investorEntryMap.json";
import { cn } from "@/src/lib/utils";

const PLOTLY_SRC = "https://cdn.plot.ly/plotly-3.3.1.min.js";

type PlotlyInstance = {
  newPlot: (
    root: HTMLElement,
    data: unknown,
    layout?: unknown,
    config?: unknown,
  ) => Promise<void>;
  purge: (root: HTMLElement) => void;
};

declare global {
  interface Window {
    Plotly?: PlotlyInstance;
  }
}

function loadPlotly(): Promise<PlotlyInstance> {
  if (window.Plotly) return Promise.resolve(window.Plotly);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${PLOTLY_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Plotly!), { once: true });
      existing.addEventListener("error", () => reject(new Error("Plotly failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = PLOTLY_SRC;
    script.async = true;
    script.onload = () => resolve(window.Plotly!);
    script.onerror = () => reject(new Error("Plotly failed to load"));
    document.head.appendChild(script);
  });
}

type Props = {
  locale: Locale;
};

const MAP_CONFIG = {
  responsive: true,
  displayModeBar: false,
  scrollZoom: false,
  doubleClick: false,
  showTips: false,
} as const;

const MAP_LAYOUT = {
  ...mapSpec.layout,
  dragmode: false,
  geo: {
    ...mapSpec.layout.geo,
  },
};

const legendToneClass = {
  green: "bg-[#16A34A]",
  amber: "bg-[#F59E0B]",
  red: "bg-[#DC2626]",
} as const;

export function InvestorEntryMap({ locale }: Props) {
  const copy = facilidadesMigratoriasPageCopy[locale];
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    loadPlotly()
      .then((Plotly) => {
        if (cancelled || !containerRef.current) return;
        return Plotly.newPlot(containerRef.current, mapSpec.data, MAP_LAYOUT, MAP_CONFIG);
      })
      .catch(() => {
        if (containerRef.current) {
          containerRef.current.innerHTML =
            locale === "es"
              ? '<p class="p-6 text-sm text-red-700">No se pudo cargar el mapa interactivo.</p>'
              : '<p class="p-6 text-sm text-red-700">Could not load the interactive map.</p>';
        }
      });

    return () => {
      cancelled = true;
      if (containerRef.current && window.Plotly) {
        window.Plotly.purge(containerRef.current);
      }
    };
  }, [locale]);

  return (
    <div className="al-migratory-map">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl">
          <p className="font-headline text-[10px] font-bold uppercase tracking-[0.22em] text-[#29AB85]">
            {copy.mapEyebrow}
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold uppercase tracking-tight text-cni-primary md:text-3xl">
            {copy.mapTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-cni-primary/70 md:text-base">{copy.mapDescription}</p>
        </div>
        <span className="inline-flex shrink-0 self-start rounded-full border border-cni-primary/10 bg-white px-4 py-2 font-headline text-[10px] font-bold uppercase tracking-[0.12em] text-cni-primary/70">
          {copy.mapBaseline}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-cni-primary/10 bg-white shadow-sm">
        <div ref={containerRef} className="al-migratory-map-plot h-[520px] w-full md:h-[820px]" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        {copy.mapLegend.map((item) => (
          <article
            key={item.tone}
            className="rounded-xl border border-cni-primary/8 bg-white p-5 shadow-sm"
          >
            <div className="mb-2 flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-wide text-cni-primary">
              <span className={cn("h-3 w-3 rounded-full", legendToneClass[item.tone])} aria-hidden />
              {item.label}
            </div>
            <p className="text-sm leading-relaxed text-cni-primary/70">{item.text}</p>
          </article>
        ))}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-cni-primary/60">{copy.mapNote}</p>
    </div>
  );
}
