"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/src/i18n/config";

type Series = { label: string; data: readonly number[]; color: string };
type Chart = { labels: readonly string[]; datasets: readonly Series[] };
type Kind = "ied" | "pib" | "clima";
type Selection = { year: number; series?: number };

const axes = {
  ied: [0, 300, 600, 900, 1200],
  pib: [2, 2.5, 3, 3.5, 4, 4.5],
  clima: [0, 20, 40, 60, 70],
};

export function CompactEconomicChart({ chart, kind, locale, title }: {
  chart: Chart; kind: Kind; locale: Locale; title: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [selection, setSelection] = useState<Selection | null>(null);
  const ticks = axes[kind];
  const min = ticks[0];
  const max = ticks[ticks.length - 1];
  const plot = { left: 38, right: width - 8, top: 12, bottom: 216 };
  const groupWidth = Math.max(0, (plot.right - plot.left) / chart.labels.length);
  const x = (index: number) => plot.left + groupWidth * (index + 0.5);
  const y = (value: number) => plot.bottom - (value - min) * (plot.bottom - plot.top) / (max - min);
  const barStep = Math.min(14, (groupWidth - 6) / chart.datasets.length);
  const unit = kind === "ied" ? "M USD" : kind === "pib" ? "%" : "pts";
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const describe = (index: number, year: number) => {
    const series = chart.datasets[index];
    return `${series.label}: ${format.format(series.data[year])} ${unit}`;
  };

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(element);
    function clearOutside(event: PointerEvent) {
      if (!element?.contains(event.target as Node)) setSelection(null);
    }
    document.addEventListener("pointerdown", clearOutside);
    return () => {
      observer.disconnect();
      document.removeEventListener("pointerdown", clearOutside);
    };
  }, []);

  function target(point: Selection, label: string) {
    return {
      role: "button",
      tabIndex: 0,
      "aria-label": label,
      "aria-pressed": selection?.year === point.year && selection?.series === point.series,
      onClick: () => setSelection(point),
      onKeyDown: (event: React.KeyboardEvent<SVGRectElement>) => {
        if (event.key === "Escape") setSelection(null);
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setSelection(point);
        }
      },
    };
  }

  return (
    <div ref={box} data-compact-chart className="h-[300px] min-w-0 overflow-hidden text-white">
      {width >= 180 && (
        <svg width="100%" height="244" viewBox={`0 0 ${width} 244`} role="group" aria-label={title}>
          {ticks.map((tick) => (
            <g key={tick} aria-hidden="true">
              <line x1={plot.left} x2={plot.right} y1={y(tick)} y2={y(tick)} stroke="white" opacity=".18" />
              <text x={plot.left - 6} y={y(tick) + 4} textAnchor="end" fill="#e0e5f2" fontSize={11}>{format.format(tick)}</text>
            </g>
          ))}
          {kind === "pib" && chart.datasets.map((series) => (
            <g key={series.label} aria-hidden="true">
              <polyline points={series.data.map((value, year) => `${x(year)},${y(value)}`).join(" ")}
                fill="none" stroke={series.color} strokeWidth="2" />
              {series.data.map((value, year) => <circle key={year} cx={x(year)} cy={y(value)} r="3" fill={series.color} />)}
            </g>
          ))}
          {chart.labels.map((year, index) => (
            <g key={year}>
              <text x={x(index)} y={235} textAnchor="middle" fill="#e0e5f2" fontSize={11}>{year}</text>
              {kind === "pib" ? (
                <rect {...target({ year: index }, year)} className="cursor-pointer focus-visible:stroke-white"
                  x={x(index) - groupWidth / 2} y={plot.top} width={groupWidth} height={plot.bottom - plot.top}
                  fill="white" fillOpacity={selection?.year === index ? ".12" : "0"} />
              ) : chart.datasets.map((series, i) => {
                const value = series.data[index];
                if (value === undefined) return null;
                const left = x(index) + barStep * (i - chart.datasets.length / 2);
                return (
                  <g key={series.label}>
                    <rect x={left + 1} y={y(value)} width={barStep - 2} height={plot.bottom - y(value)}
                      rx="1" fill={series.color} opacity={selection && (selection.year !== index || selection.series !== i) ? ".55" : "1"} />
                    <rect {...target({ year: index, series: i }, `${year} · ${describe(i, index)}`)}
                      className="cursor-pointer focus-visible:stroke-white" x={left} y={plot.top}
                      width={barStep} height={plot.bottom - plot.top} fill="transparent" />
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      )}
      <div role="status" className="px-1 pt-1 text-xs leading-4">
        {selection && (
          <div className="rounded-md bg-white/10 px-2 py-1">
            <strong>{chart.labels[selection.year]}</strong>
            <ul className="grid grid-cols-2 gap-x-2">
              {(selection.series === undefined ? chart.datasets.map((_, i) => i) : [selection.series])
                .map((i) => <li key={i}>{describe(i, selection.year)}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
