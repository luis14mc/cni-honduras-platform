"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Locale } from "@/src/i18n/config";
import { investmentMapCopy } from "@/src/i18n/copy/investmentMap";
import type {
  DepartmentProperties,
  MapDepartmentSummary,
  MapInvestmentProject,
  MunicipalityFeatureCollection,
  MunicipalityProperties,
} from "@/src/lib/types/investment-map";
import {
  filterMapProjectsByMunicipality,
  getMapTotals,
  getMarkerProjects,
  indexSummaries,
} from "@/src/lib/types/investment-map";
import {
  getDepartmentGeoJson,
  getGeolocatedMapProjects,
  getMapSummary,
  getMunicipalityGeoJson,
  getSectors,
} from "@/src/services/investmentMap";
import type { DepartmentFeatureCollection } from "@/src/lib/types/investment-map";
import type { Sector } from "@/src/types/investment";
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
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentProperties | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<MunicipalityProperties | null>(null);
  const [selectedProject, setSelectedProject] = useState<MapInvestmentProject | null>(null);
  const [municipalities, setMunicipalities] = useState<AsyncState<MunicipalityFeatureCollection | null>>({
    status: "ready",
    data: null,
  });
  const [municipalitiesKey, setMunicipalitiesKey] = useState<string | null>(null);
  const [projects, setProjects] = useState<AsyncState<MapInvestmentProject[]>>({ status: "ready", data: [] });
  const [projectsKey, setProjectsKey] = useState<string | null>(null);
  const [hoveredDepartment, setHoveredDepartment] = useState<DepartmentProperties | null>(null);
  const [hoveredMunicipality, setHoveredMunicipality] = useState<MunicipalityProperties | null>(null);

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
    if (!selectedDepartment) return;
    let cancelled = false;
    const requestKey = selectedDepartment.slug;
    getMunicipalityGeoJson(selectedDepartment.slug)
      .then((data) => {
        if (cancelled) return;
        setMunicipalities({ status: "ready", data });
        setMunicipalitiesKey(requestKey);
      })
      .catch(() => {
        if (cancelled) return;
        setMunicipalities({ status: "error", data: null });
        setMunicipalitiesKey(requestKey);
      });
    return () => { cancelled = true; };
  }, [selectedDepartment]);

  useEffect(() => {
    if (!selectedDepartment) return;
    let cancelled = false;
    const requestKey = `${selectedDepartment.slug}:${activeSector}`;
    getGeolocatedMapProjects({
      departmentSlug: selectedDepartment.slug,
      sectorSlug: activeSector === "all" ? undefined : activeSector,
    })
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
  }, [activeSector, selectedDepartment]);

  const handleSelectDepartment = useCallback((department: DepartmentProperties) => {
    setSelectedDepartment(department);
    setSelectedMunicipality(null);
    setSelectedProject(null);
  }, []);

  const handleClearDepartment = useCallback(() => {
    setSelectedDepartment(null);
    setSelectedMunicipality(null);
    setSelectedProject(null);
    setMunicipalitiesKey(null);
    setMunicipalities({ status: "ready", data: null });
    setProjectsKey(null);
    setProjects({ status: "ready", data: [] });
  }, []);

  const handleClearMunicipality = useCallback(() => {
    setSelectedMunicipality(null);
    setSelectedProject(null);
  }, []);

  const handleClearProject = useCallback(() => {
    setSelectedProject(null);
  }, []);

  const handleSelectMunicipality = useCallback((municipality: MunicipalityProperties) => {
    setSelectedMunicipality(municipality);
    setSelectedProject(null);
  }, []);

  const summaries = useMemo(() => indexSummaries(summary.data), [summary.data]);
  const selectedSummary = selectedDepartment ? summaries.get(selectedDepartment.slug) : undefined;
  const summaryLoading = summarySector !== activeSector;
  const selectedProjectsKey = selectedDepartment ? `${selectedDepartment.slug}:${activeSector}` : null;
  const projectsLoading = Boolean(selectedDepartment && projectsKey !== selectedProjectsKey);
  const projectsForDepartment = useMemo(
    () => (projectsKey === selectedProjectsKey ? projects.data : []),
    [projects.data, projectsKey, selectedProjectsKey],
  );
  const visibleProjects = useMemo(
    () => filterMapProjectsByMunicipality(projectsForDepartment, selectedMunicipality?.slug ?? null),
    [projectsForDepartment, selectedMunicipality],
  );
  const markerProjects = useMemo(() => getMarkerProjects(visibleProjects), [visibleProjects]);
  const nationalCounts = useMemo(() => getMapTotals(summary.data), [summary.data]);
  const municipalitiesLoading = Boolean(
    selectedDepartment && municipalitiesKey !== selectedDepartment.slug,
  );
  const municipalitiesForMap =
    municipalitiesKey === selectedDepartment?.slug ? municipalities.data : null;
  const municipalitiesError =
    municipalitiesKey === selectedDepartment?.slug && municipalities.status === "error";
  const municipalitiesEmpty = Boolean(
    selectedDepartment &&
      municipalitiesKey === selectedDepartment.slug &&
      municipalities.status === "ready" &&
      (municipalities.data?.features.length ?? 0) === 0,
  );

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
            {geo.data && geo.data.features.length > 0 ? (
              <InvestmentMapLeaflet
                data={geo.data}
                summaries={summaries}
                activeSector={activeSector}
                selectedDepartmentSlug={selectedDepartment?.slug ?? null}
                municipalities={municipalitiesForMap}
                selectedMunicipalitySlug={selectedMunicipality?.slug ?? null}
                markerProjects={markerProjects}
                selectedProjectId={selectedProject?.id ?? null}
                onSelectDepartment={handleSelectDepartment}
                onSelectMunicipality={handleSelectMunicipality}
                onSelectProject={setSelectedProject}
                onHoverDepartment={setHoveredDepartment}
                onHoverMunicipality={setHoveredMunicipality}
              />
            ) : null}
            {municipalitiesLoading ? (
              <div className="pointer-events-none absolute right-4 top-4 z-[500] rounded-lg bg-[#001a33]/90 px-3 py-2 text-xs font-bold text-white shadow-lg" role="status">
                {copy.loadingMunicipalities}
              </div>
            ) : null}
            {hoveredMunicipality && selectedDepartment && !selectedMunicipality ? (
              <div className="pointer-events-none absolute bottom-4 left-4 z-[500] rounded-lg bg-[#001a33]/90 px-3 py-2 text-xs font-bold text-white shadow-lg">{hoveredMunicipality.name}</div>
            ) : null}
            {hoveredDepartment && !selectedDepartment ? (
              <div className="pointer-events-none absolute bottom-4 left-4 z-[500] rounded-lg bg-[#001a33]/90 px-3 py-2 text-xs font-bold text-white shadow-lg">{hoveredDepartment.name}</div>
            ) : null}
          </div>
          <InvestmentMapPanel
            locale={locale}
            copy={copy}
            department={selectedDepartment}
            municipality={selectedMunicipality}
            project={selectedProject}
            summary={selectedSummary}
            projects={visibleProjects}
            projectsLoading={projectsLoading}
            projectsError={projectsKey === selectedProjectsKey && projects.status === "error"}
            municipalitiesLoading={municipalitiesLoading}
            municipalitiesError={municipalitiesError}
            municipalitiesEmpty={municipalitiesEmpty}
            onClearDepartment={handleClearDepartment}
            onClearMunicipality={handleClearMunicipality}
            onClearProject={handleClearProject}
            onSelectProject={setSelectedProject}
          />
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
