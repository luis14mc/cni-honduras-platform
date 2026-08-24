"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/src/i18n/config";
import { investmentMapCopy } from "@/src/i18n/copy/investmentMap";
import type { DepartmentProperties, MapDepartmentSummary } from "@/src/lib/types/investment-map";
import { getMapTotals, indexSummaries } from "@/src/lib/types/investment-map";
import { getDepartmentGeoJson, getMapSummary, getProjectsByDepartment, getSectors } from "@/src/services/investmentMap";
import type { DepartmentFeatureCollection } from "@/src/lib/types/investment-map";
import type { InvestmentProject, Sector } from "@/src/types/investment";
import { InvestmentMapPanel } from "@/src/components/map/InvestmentMapPanel";

const InvestmentMapLeaflet = dynamic(
  () => import("@/src/components/map/InvestmentMapLeaflet").then((mod) => mod.InvestmentMapLeaflet),
  { ssr: false },
);

type AsyncState<T> = { status: "loading" | "ready" | "error"; data: T };

export function InvestmentMapDashboard({ locale }: { locale: Locale }) {
  const copy = investmentMapCopy[locale];
  const [geo, setGeo] = useState<AsyncState<DepartmentFeatureCollection | null>>({ status: "loading", data: null });
  const [summary, setSummary] = useState<AsyncState<MapDepartmentSummary[]>>({ status: "loading", data: [] });
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [sectorError, setSectorError] = useState(false);
  const [activeSector, setActiveSector] = useState("all");
  const [summarySector, setSummarySector] = useState<string | null>(null);
  const [selected, setSelected] = useState<DepartmentProperties | null>(null);
  const [projects, setProjects] = useState<AsyncState<InvestmentProject[]>>({ status: "ready", data: [] });
  const [projectsKey, setProjectsKey] = useState<string | null>(null);
  const [hovered, setHovered] = useState<DepartmentProperties | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDepartmentGeoJson()
      .then((data) => !cancelled && setGeo({ status: "ready", data }))
      .catch(() => !cancelled && setGeo({ status: "error", data: null }));
    getSectors({ locale })
      .then((data) => !cancelled && setSectors(data))
      .catch(() => !cancelled && setSectorError(true));
    return () => { cancelled = true; };
  }, [locale]);

  useEffect(() => {
    let cancelled = false;
    getMapSummary(activeSector === "all" ? undefined : activeSector)
      .then((data) => {
        if (cancelled) return;
        setSummary({ status: "ready", data });
        setSummarySector(activeSector);
      })
      .catch(() => {
        if (cancelled) return;
        setSummary((current) => ({ status: "error", data: current.data }));
        setSummarySector(activeSector);
      });
    return () => { cancelled = true; };
  }, [activeSector]);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    const requestKey = `${selected.slug}:${activeSector}`;
    getProjectsByDepartment(selected.slug, activeSector === "all" ? undefined : activeSector)
      .then((data) => {
        if (cancelled) return;
        setProjects({ status: "ready", data });
        setProjectsKey(requestKey);
      })
      .catch(() => {
        if (cancelled) return;
        setProjects({ status: "error", data: [] });
        setProjectsKey(requestKey);
      });
    return () => { cancelled = true; };
  }, [activeSector, selected]);

  const summaries = useMemo(() => indexSummaries(summary.data), [summary.data]);
  const selectedSummary = selected ? summaries.get(selected.slug) : undefined;
  const summaryLoading = summarySector !== activeSector;
  const selectedProjectsKey = selected ? `${selected.slug}:${activeSector}` : null;
  const projectsLoading = Boolean(selected && projectsKey !== selectedProjectsKey);
  const projectsForSelection = projectsKey === selectedProjectsKey ? projects.data : [];
  const nationalCounts = useMemo(() => getMapTotals(summary.data), [summary.data]);

  return (
    <section className="relative overflow-hidden bg-[#001a33] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(141,192,70,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(141,192,70,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="relative mx-auto max-w-[1520px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <header className="max-w-4xl">
          <p className="font-headline text-[10px] font-bold uppercase tracking-[0.24em] text-[#8DC046]">{copy.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[0.96] tracking-[-0.04em] sm:text-6xl">{copy.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#d5e3ff]/75 sm:text-lg">{copy.description}</p>
        </header>

        <div className="mt-10 rounded-2xl border border-white/10 bg-[#24436B]/65 p-4 shadow-2xl backdrop-blur sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 flex-1">
              <label htmlFor="investment-map-sector" className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#8DC046]">{copy.filterLabel}</label>
              <select id="investment-map-sector" value={activeSector} onChange={(event) => setActiveSector(event.target.value)} className="mt-2 block w-full max-w-xl rounded-xl border border-white/15 bg-[#001a33] px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-[#F7BF06] focus:ring-2 focus:ring-[#F7BF06]/30">
                <option value="all">{copy.allSectors}</option>
                {sectors.map((sector) => <option key={sector.slug} value={sector.slug}>{sector.name}</option>)}
              </select>
              {sectorError ? <p className="mt-2 text-xs text-[#d5e3ff]/70">{copy.allSectors}</p> : null}
            </div>
            <div className="flex gap-3 text-xs font-bold uppercase tracking-[0.12em] text-[#d5e3ff]/70">
              <span className="rounded-full border border-white/10 px-3 py-2">{nationalCounts.projects} {copy.projects}</span>
              <span className="rounded-full border border-white/10 px-3 py-2">{nationalCounts.opportunities} {copy.opportunities}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="relative min-h-[440px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white shadow-2xl sm:min-h-[600px]">
            {geo.status === "loading" ? <MapLoading copy={copy.loadingMap} /> : null}
            {geo.status === "error" ? <MapMessage>{copy.mapError}</MapMessage> : null}
            {geo.status === "ready" && geo.data?.features.length === 0 ? <MapMessage>{copy.noGeometry}</MapMessage> : null}
            {geo.data && geo.data.features.length > 0 ? <InvestmentMapLeaflet data={geo.data} summaries={summaries} activeSector={activeSector} selectedSlug={selected?.slug ?? null} onSelect={setSelected} onHover={setHovered} /> : null}
            {hovered && !selected ? <div className="pointer-events-none absolute bottom-4 left-4 z-[500] rounded-lg bg-[#001a33]/90 px-3 py-2 text-xs font-bold text-white shadow-lg">{hovered.name}</div> : null}
          </div>
          <InvestmentMapPanel locale={locale} copy={copy} department={selected} summary={selectedSummary} projects={projectsForSelection} projectsLoading={projectsLoading} projectsError={projectsKey === selectedProjectsKey && projects.status === "error"} onClear={() => setSelected(null)} />
        </div>

        {summaryLoading && summary.data.length === 0 ? <p className="mt-4 text-sm text-[#d5e3ff]/70">{copy.loadingData}</p> : null}
        {summary.status === "error" && !summaryLoading ? <p className="mt-4 rounded-xl border border-red-200/20 bg-red-950/25 p-4 text-sm text-red-100">{copy.summaryError}</p> : null}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#d5e3ff]/55"><span>{copy.withActivity} · {copy.selected} · {copy.filtered}</span><span>{copy.attribution}</span></div>
      </div>
    </section>
  );
}

function MapLoading({ copy }: { copy: string }) { return <div className="absolute inset-0 z-10 flex items-center justify-center bg-white"><div className="rounded-xl bg-[#001a33]/90 px-5 py-4 text-sm font-bold text-white shadow-xl" role="status">{copy}</div></div>; }
function MapMessage({ children }: { children: string }) { return <div className="absolute inset-0 z-10 flex items-center justify-center bg-white p-6 text-center text-sm font-semibold text-[#252A58]">{children}</div>; }
