"use client";

import { useState } from "react";
import type { Locale } from "@/src/i18n/config";
import { ledgerChartPalette } from "@/src/lib/themes/architectural-ledger";

type Props = {
  locale: Locale;
};

type HoveredBar = { year: string; countryIndex: number } | null;

const MAX = 70;
const Y_TICKS = [70, 60, 50, 40, 30, 20, 10, 0];

export function GcbiBusinessEaseChart({ locale }: Props) {
  const [hovered, setHovered] = useState<HoveredBar>(null);
  const chart = ledgerChartPalette(locale).clima;

  return (
    <div className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-4 md:p-6">
      <div className="relative flex min-h-[280px] flex-col justify-between md:min-h-[320px]">
        <div className="relative flex flex-1 items-end border-b border-white/10 pb-2">
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between text-[9px] text-white/30">
            {Y_TICKS.map((tick) => (
              <div key={tick} className="flex h-0 w-full items-center gap-2">
                <span className="w-7 shrink-0 text-right tabular-nums">{tick}</span>
                <div className="flex-grow border-t border-white/5" />
              </div>
            ))}
          </div>

          <div className="relative z-10 flex h-56 w-full items-end pl-9 pr-1 md:h-64 md:pl-10">
            {chart.labels.map((year, yearIdx) => (
              <div key={year} className="relative flex h-full flex-1 flex-col items-center justify-end px-0.5 md:px-2">
                <div className="flex h-full w-full items-end justify-center gap-0.5 md:gap-1.5">
                  {chart.datasets.map((dataset, countryIdx) => {
                    const value = dataset.data[yearIdx] ?? 0;
                    const barHeight = (value / MAX) * 100;
                    const isHovered =
                      hovered?.year === year && hovered?.countryIndex === countryIdx;

                    return (
                      <div
                        key={dataset.label}
                        className="flex h-full flex-1 cursor-pointer items-end justify-center px-0.5"
                        onMouseEnter={() => setHovered({ year, countryIndex: countryIdx })}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered({ year, countryIndex: countryIdx })}
                        onBlur={() => setHovered(null)}
                        role="presentation"
                      >
                        <div
                          className="relative w-[6px] rounded-t transition-all duration-300 md:w-3.5"
                          style={{
                            height: `${barHeight}%`,
                            backgroundColor: dataset.color,
                            opacity: hovered ? (isHovered ? 1 : 0.35) : 0.9,
                            transform: isHovered ? "scaleY(1.03)" : "scaleY(1)",
                            transformOrigin: "bottom",
                          }}
                        >
                          <span
                            className={`pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-medium tabular-nums text-white/80 transition-opacity md:text-[9px] ${
                              isHovered || !hovered ? "opacity-100" : "opacity-0"
                            }`}
                          >
                            {value}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {hovered?.year === year && (
                  <div className="pointer-events-none absolute bottom-full z-20 mb-3 flex min-w-[130px] flex-col items-center rounded-lg border-b-4 border-[#29AB85] bg-white px-3 py-2.5 text-[#252A58] shadow-2xl">
                    <span className="font-headline text-[9px] font-extrabold uppercase tracking-wider text-[#252A58]/60">
                      {chart.datasets[hovered.countryIndex].label} · {year}
                    </span>
                    <span className="mt-0.5 font-display text-base font-extrabold tabular-nums">
                      {chart.datasets[hovered.countryIndex].data[yearIdx]}{" "}
                      {locale === "es" ? "pts" : "pts"}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full justify-between pl-9 pr-1 pt-3 font-headline text-[10px] font-bold uppercase tracking-wider text-white/50 md:pl-10 md:text-xs">
          {chart.labels.map((year) => (
            <div key={year} className="flex-1 text-center">
              {year}
            </div>
          ))}
        </div>
      </div>

      <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-white/10 pt-4">
        {chart.datasets.map((dataset) => (
          <li key={dataset.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: dataset.color }} />
            <span className="font-headline text-[10px] uppercase tracking-wider text-white/70">{dataset.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
