"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plane, Search, X } from "lucide-react";
import type { Locale } from "@/src/i18n/config";
import { investmentMapCopy } from "@/src/i18n/copy/investmentMap";
import type {
  DepartmentProperties,
  MapDepartmentSummary,
  MapInvestmentProject,
  MunicipalityFeatureCollection,
  MunicipalityProperties,
  InfrastructureCache,
  InfrastructureFeature,
  InfrastructureLayer,
  MapQueryState,
  MapSearchResult,
} from "@/src/lib/types/investment-map";
import {
  filterMapProjectsByMunicipality,
  filterMapProjectsBySector,
  getMarkerProjects,
  indexSummaries,
  toggleInfrastructureLayer,
  updateInfrastructureCache,
  getMapVisibleCounts,
  getProjectFocus,
  searchInvestmentMap,
  serializeMapQueryState,
} from "@/src/lib/types/investment-map";
import {
  getDepartmentGeoJson,
  getGeolocatedMapProjects,
  getMapSummary,
  getMunicipalityGeoJson,
  getSectors,
  getInfrastructureGeoJson,
} from "@/src/services/investmentMap";
import type { DepartmentFeatureCollection } from "@/src/lib/types/investment-map";
import type { Sector } from "@/src/types/investment";
import { InvestmentMapPanel } from "@/src/components/map/InvestmentMapPanel";

const InvestmentMapLeaflet = dynamic(
  () => import("@/src/components/map/InvestmentMapLeaflet").then((mod) => mod.InvestmentMapLeaflet),
  { ssr: false },
);

type AsyncState<T> = { status: "loading" | "ready" | "error"; data: T };

export function InvestmentMapDashboard({ locale, initialQueryState }: { locale: Locale; initialQueryState: MapQueryState }) {
  const copy = investmentMapCopy[locale];
  const router = useRouter();
  const pathname = usePathname();
  const [geo, setGeo] = useState<AsyncState<DepartmentFeatureCollection | null>>({ status: "loading", data: null });
  const [summary, setSummary] = useState<AsyncState<MapDepartmentSummary[]>>({ status: "loading", data: [] });
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [sectorsLoaded, setSectorsLoaded] = useState(false);
  const [sectorError, setSectorError] = useState(false);
  const [activeSector, setActiveSector] = useState(initialQueryState.sector ?? "all");
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
  const [activeInfrastructureLayers, setActiveInfrastructureLayers] = useState<Set<InfrastructureLayer>>(new Set());
  const [infrastructureCache, setInfrastructureCache] = useState<InfrastructureCache>({});
  const infrastructureCacheRef = useRef<InfrastructureCache>({});
  const infrastructureRequests = useRef<Partial<Record<InfrastructureLayer, Promise<unknown>>>>({});
  const [infrastructureStatus, setInfrastructureStatus] = useState<Record<InfrastructureLayer, "idle" | "loading" | "ready" | "error">>({ port: "idle", airport: "idle" });
  const [selectedInfrastructure, setSelectedInfrastructure] = useState<InfrastructureFeature | null>(null);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(-1);
  const [projectFocusKey, setProjectFocusKey] = useState(0);
  const initialQueryRef = useRef({ ...initialQueryState });
  const loadedProjectsRef = useRef<MapInvestmentProject[]>([]);
  const hydratedMunicipalityRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDepartmentGeoJson()
      .then((data) => {
        if (cancelled) return;
        setGeo({ status: "ready", data });
        const slug = initialQueryRef.current.department;
        const department = data.features.find((item) => item.properties.slug === slug)?.properties ?? null;
        initialQueryRef.current.department = null;
        if (department) setSelectedDepartment(department);
        else {
          initialQueryRef.current.municipality = null;
          initialQueryRef.current.project = null;
        }
      })
      .catch(() => !cancelled && setGeo({ status: "error", data: null }));
    getSectors({ locale })
      .then((data) => {
        if (cancelled) return;
        setSectors(data);
        const slug = initialQueryRef.current.sector;
        if (slug && !data.some((sector) => sector.slug === slug)) setActiveSector("all");
        initialQueryRef.current.sector = null;
      })
      .catch(() => { if (!cancelled) { setSectorError(true); setActiveSector("all"); initialQueryRef.current.sector = null; } })
      .finally(() => { if (!cancelled) setSectorsLoaded(true); });
    return () => { cancelled = true; };
  }, [locale]);

  useEffect(() => {
    let cancelled = false;
    getMapSummary(activeSector === "all" ? undefined : activeSector, locale)
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
  }, [activeSector, locale]);

  useEffect(() => {
    if (!selectedDepartment) return;
    let cancelled = false;
    const requestKey = selectedDepartment.slug;
    getMunicipalityGeoJson(selectedDepartment.slug)
      .then((data) => {
        if (cancelled) return;
        setMunicipalities({ status: "ready", data });
        setMunicipalitiesKey(requestKey);
        const slug = initialQueryRef.current.municipality;
        const municipality = data.features.find((item) => item.properties.slug === slug)?.properties ?? null;
        initialQueryRef.current.municipality = null;
        if (municipality) {
          hydratedMunicipalityRef.current = municipality.slug;
          setSelectedMunicipality(municipality);
          const projectSlug = initialQueryRef.current.project;
          const project = loadedProjectsRef.current.find((item) => item.slug === projectSlug && item.municipality?.slug === municipality.slug) ?? null;
          if (project) {
            setSelectedProject(project);
            setProjectFocusKey((key) => key + 1);
          }
          if (loadedProjectsRef.current.length) initialQueryRef.current.project = null;
        } else initialQueryRef.current.project = null;
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
      locale,
    })
      .then((data) => {
        if (cancelled) return;
        setProjects({ status: "ready", data });
        setProjectsKey(requestKey);
        loadedProjectsRef.current = data;
        const slug = initialQueryRef.current.project;
        if (initialQueryRef.current.municipality === null) {
          const project = data.find((item) => item.slug === slug) ?? null;
          initialQueryRef.current.project = null;
          if (project && (!hydratedMunicipalityRef.current || project.municipality?.slug === hydratedMunicipalityRef.current)) {
            setSelectedProject(project);
            setProjectFocusKey((key) => key + 1);
          }
        }
      })
      .catch(() => {
        if (cancelled) return;
        setProjects({ status: "error", data: [] });
        setProjectsKey(requestKey);
      });
    return () => { cancelled = true; };
  }, [activeSector, locale, selectedDepartment]);

  const handleSelectDepartment = useCallback((department: DepartmentProperties) => {
    setSelectedDepartment(department);
    setSelectedMunicipality(null);
    setSelectedProject(null);
    setSelectedInfrastructure(null);
  }, []);

  const handleToggleInfrastructure = useCallback((layer: InfrastructureLayer) => {
    setActiveInfrastructureLayers((current) => {
      const next = toggleInfrastructureLayer(current, layer);
      if (!next.has(layer)) {
        setSelectedInfrastructure((selected) => selected?.properties.infrastructure_type === layer ? null : selected);
      }
      return next;
    });

    if (infrastructureCacheRef.current[layer] || infrastructureRequests.current[layer]) return;
    setInfrastructureStatus((current) => ({ ...current, [layer]: "loading" }));
    const request = getInfrastructureGeoJson(layer, locale)
      .then((data) => {
        infrastructureCacheRef.current = updateInfrastructureCache(infrastructureCacheRef.current, layer, data);
        setInfrastructureCache(infrastructureCacheRef.current);
        setInfrastructureStatus((current) => ({ ...current, [layer]: "ready" }));
      })
      .catch(() => setInfrastructureStatus((current) => ({ ...current, [layer]: "error" })))
      .finally(() => { delete infrastructureRequests.current[layer]; });
    infrastructureRequests.current[layer] = request;
  }, [locale]);

  const handleSelectProject = useCallback((project: MapInvestmentProject) => {
    setSelectedProject(project);
    setSelectedInfrastructure(null);
    setProjectFocusKey((key) => key + 1);
  }, []);

  const handleSelectInfrastructure = useCallback((feature: InfrastructureFeature) => {
    setSelectedInfrastructure(feature);
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
    setSelectedInfrastructure(null);
  }, []);

  const handleSectorChange = useCallback((sector: string) => {
    setActiveSector(sector);
    setSelectedProject(null);
  }, []);

  const handleResetFilters = () => {
    setActiveSector("all");
    handleClearDepartment();
    setSelectedInfrastructure(null);
    setSearch("");
    setSearchOpen(false);
  };

  const visibleSummary = useMemo(
    () => (summarySector === activeSector ? summary.data : []),
    [activeSector, summary.data, summarySector],
  );
  const summaries = useMemo(() => indexSummaries(visibleSummary), [visibleSummary]);
  const selectedSummary = selectedDepartment ? summaries.get(selectedDepartment.slug) : undefined;
  const summaryLoading = summarySector !== activeSector;
  const selectedProjectsKey = selectedDepartment ? `${selectedDepartment.slug}:${activeSector}` : null;
  const projectsLoading = Boolean(selectedDepartment && projectsKey !== selectedProjectsKey);
  const projectsForDepartment = useMemo(
    () => (projectsKey === selectedProjectsKey ? projects.data : []),
    [projects.data, projectsKey, selectedProjectsKey],
  );
  const visibleProjects = useMemo(
    () => filterMapProjectsByMunicipality(
      filterMapProjectsBySector(projectsForDepartment, activeSector === "all" ? null : activeSector),
      selectedMunicipality?.slug ?? null,
    ),
    [activeSector, projectsForDepartment, selectedMunicipality],
  );
  const markerProjects = useMemo(() => getMarkerProjects(visibleProjects), [visibleProjects]);
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
  const searchResults = useMemo(() => searchInvestmentMap(
    search,
    geo.data?.features.map((item) => item.properties) ?? [],
    municipalitiesForMap?.features.map((item) => item.properties) ?? [],
    visibleProjects,
  ), [geo.data, municipalitiesForMap, search, visibleProjects]);
  const counts = getMapVisibleCounts(markerProjects.length, municipalitiesForMap?.features.length ?? 0, activeInfrastructureLayers.size);
  const selectedSectorName = activeSector === "all" ? copy.allSectors : sectors.find((sector) => sector.slug === activeSector)?.name ?? activeSector;
  const projectFocus = getProjectFocus(selectedProject);
  const queryReady = sectorsLoaded && geo.status !== "loading" && (
    !selectedDepartment || (
      municipalitiesKey === selectedDepartment.slug &&
      projectsKey === `${selectedDepartment.slug}:${activeSector}`
    )
  );

  useEffect(() => {
    if (!queryReady) return;
    const query = serializeMapQueryState(new URLSearchParams(window.location.search), {
      sector: activeSector === "all" ? null : activeSector,
      department: selectedDepartment?.slug ?? null,
      municipality: selectedMunicipality?.slug ?? null,
      project: selectedProject?.slug ?? null,
    });
    const target = query ? `${pathname}?${query}` : pathname;
    if (`${window.location.pathname}${window.location.search}` !== target) router.replace(target, { scroll: false });
  }, [activeSector, pathname, queryReady, router, selectedDepartment, selectedMunicipality, selectedProject]);

  const chooseSearchResult = (result: MapSearchResult) => {
    if (result.type === "department") handleSelectDepartment(result.department);
    if (result.type === "municipality") handleSelectMunicipality(result.municipality);
    if (result.type === "project") handleSelectProject(result.project);
    setSearch("");
    setSearchOpen(false);
    setActiveSearchIndex(-1);
  };

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
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor="investment-map-sector" className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#8DC046]">{copy.filterLabel}</label>
              <select id="investment-map-sector" value={activeSector} onChange={(event) => handleSectorChange(event.target.value)} className="mt-2 block w-full max-w-xl rounded-xl border border-white/15 bg-[#001a33] px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-[#F7BF06] focus:ring-2 focus:ring-[#F7BF06]/30">
                <option value="all">{copy.allSectors}</option>
                {sectors.map((sector) => <option key={sector.slug} value={sector.slug}>{sector.name}</option>)}
              </select>
              {sectorError ? <p className="mt-2 text-xs text-[#d5e3ff]/70">{copy.allSectors}</p> : null}
            </div>
            <div className="relative min-w-0">
              <label htmlFor="investment-map-search" className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#8DC046]">{copy.searchLabel}</label>
               <div className="relative mt-2"><Search className="pointer-events-none absolute left-3 top-3.5 text-[#8DC046]" size={18} aria-hidden="true" /><input id="investment-map-search" role="combobox" aria-autocomplete="list" aria-expanded={searchOpen} aria-controls="investment-map-results" aria-activedescendant={activeSearchIndex >= 0 ? searchResults[activeSearchIndex]?.id : undefined} value={search} placeholder={copy.searchPlaceholder} onFocus={() => setSearchOpen(Boolean(search))} onChange={(event) => { setSearch(event.target.value); setSearchOpen(Boolean(event.target.value)); setActiveSearchIndex(-1); }} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); setSearchOpen(true); setActiveSearchIndex((index) => Math.min(index + 1, searchResults.length - 1)); } else if (event.key === "ArrowUp") { event.preventDefault(); setActiveSearchIndex((index) => Math.max(index - 1, 0)); } else if (event.key === "Enter" && activeSearchIndex >= 0) { event.preventDefault(); chooseSearchResult(searchResults[activeSearchIndex]); } else if (event.key === "Escape") { setSearchOpen(false); setActiveSearchIndex(-1); } }} className="block w-full rounded-xl border border-white/15 bg-[#001a33] py-3 pl-10 pr-10 text-sm font-semibold text-white outline-none placeholder:text-[#d5e3ff]/55 focus:border-[#F7BF06] focus:ring-2 focus:ring-[#F7BF06]/30" />{search ? <button type="button" aria-label={copy.clearSearch} onClick={() => { setSearch(""); setSearchOpen(false); }} className="absolute right-1.5 top-1.5 grid min-h-9 min-w-9 place-items-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F7BF06]"><X size={17} aria-hidden="true" /></button> : null}</div>
              {searchOpen ? <div id="investment-map-results" role="listbox" aria-label={copy.searchResults} className="absolute z-[700] mt-2 max-h-72 w-full overflow-auto rounded-xl border border-[#334E88]/20 bg-white p-1 text-[#001a33] shadow-2xl">{searchResults.length ? (["department", "municipality", "project"] as const).map((type) => { const groupedResults = searchResults.map((result, index) => ({ result, index })).filter(({ result }) => result.type === type); if (!groupedResults.length) return null; return <div key={type} role="group" aria-label={copy.searchGroups[type]}><p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-[#334E88]" aria-hidden="true">{copy.searchGroups[type]}</p>{groupedResults.map(({ result, index }) => <div key={result.id} id={result.id} role="option" aria-selected={index === activeSearchIndex} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseSearchResult(result)} className={`min-h-11 cursor-pointer rounded-lg px-3 py-2 font-semibold ${index === activeSearchIndex ? "bg-[#E8F1FA]" : "hover:bg-[#E8F1FA]"}`}>{result.label}</div>)}</div>; }) : <p className="p-3 text-sm" role="status">{copy.searchNoResults}</p>}</div> : null}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full border border-white/15 px-3 py-2">{copy.currentFilters}: {selectedSectorName}{selectedDepartment ? ` · ${selectedDepartment.name}` : ""}{selectedMunicipality ? ` · ${selectedMunicipality.name}` : ""}{activeInfrastructureLayers.size ? ` · ${copy.airports}` : ""}</span><button type="button" onClick={handleResetFilters} className="min-h-9 rounded-full border border-[#8DC046]/50 px-3 font-bold text-[#d8ef9f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F7BF06]">{copy.clearFilters}</button></div>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#d5e3ff]/75"><span>{counts.visibleProjects} {copy.visibleProjectsCount}</span><span>·</span><span>{counts.loadedMunicipalities} {copy.loadedMunicipalitiesCount}</span><span>·</span><span>{counts.activeLayers} {copy.activeLayersCount}</span></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <details className="rounded-xl border border-white/10 bg-[#001a33]/45 p-3"><summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-[#8DC046]">{copy.infrastructureLayers}</summary><label className="mt-3 flex min-h-8 cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={activeInfrastructureLayers.has("airport")} onChange={() => handleToggleInfrastructure("airport")} className="h-4 w-4 accent-[#32B372]" /><Plane aria-hidden="true" size={16} /><span>{copy.airports}</span>{infrastructureStatus.airport === "loading" ? <span role="status">{copy.layerLoading}</span> : null}{infrastructureStatus.airport === "error" ? <span role="alert" className="text-red-200">{copy.layerError}</span> : null}</label></details>
            <details className="rounded-xl border border-white/10 bg-[#001a33]/45 p-3"><summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-[#8DC046]">{copy.legend}</summary><ul className="mt-3 grid grid-cols-2 gap-2 text-xs"><LegendItem shape="square" label={copy.legendDepartment} /><LegendItem shape="outline" label={copy.legendMunicipality} /><LegendItem shape="dot" label={copy.legendProject} /><LegendItem shape="selected" label={copy.legendSelectedProject} />{activeInfrastructureLayers.has("airport") ? <li className="flex items-center gap-2"><Plane size={15} aria-hidden="true" />{copy.airports}</li> : null}</ul></details>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="relative min-h-[440px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white shadow-2xl sm:min-h-[600px]">
            {geo.status === "loading" ? <MapLoading copy={copy.loadingMap} /> : null}
            {geo.status === "error" ? <MapMessage alert>{copy.mapError}</MapMessage> : null}
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
                selectedProjectPosition={projectFocus?.position ?? null}
                projectFocusKey={projectFocusKey}
                mapAriaLabel={copy.mapAriaLabel}
                mapInstructions={copy.mapInstructions}
                zoomInLabel={copy.zoomIn}
                zoomOutLabel={copy.zoomOut}
                onSelectDepartment={handleSelectDepartment}
                onSelectMunicipality={handleSelectMunicipality}
                onSelectProject={handleSelectProject}
                infrastructure={Array.from(activeInfrastructureLayers).flatMap(
                  (layer) => infrastructureCache[layer]?.features ?? [],
                )}
                selectedInfrastructureId={selectedInfrastructure?.properties.id ?? null}
                onSelectInfrastructure={handleSelectInfrastructure}
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
            infrastructure={selectedInfrastructure}
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
            onClearInfrastructure={() => setSelectedInfrastructure(null)}
            onSelectProject={handleSelectProject}
          />
        </div>

        {summaryLoading ? <p className="mt-4 text-sm text-[#d5e3ff]/70">{copy.loadingData}</p> : null}
        {summary.status === "error" && !summaryLoading ? <p role="alert" className="mt-4 rounded-xl border border-red-200/20 bg-red-950/25 p-4 text-sm text-red-100">{copy.summaryError}</p> : null}
        <div className="mt-5 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-[#d5e3ff]/55">{copy.attribution}</div>
      </div>
    </section>
  );
}

function MapLoading({ copy }: { copy: string }) { return <div className="absolute inset-0 z-10 flex items-center justify-center bg-white"><div className="rounded-xl bg-[#001a33]/90 px-5 py-4 text-sm font-bold text-white shadow-xl" role="status">{copy}</div></div>; }
function MapMessage({ children, alert = false }: { children: string; alert?: boolean }) { return <div role={alert ? "alert" : undefined} className="absolute inset-0 z-10 flex items-center justify-center bg-white p-6 text-center text-sm font-semibold text-[#252A58]">{children}</div>; }
function LegendItem({ shape, label }: { shape: "square" | "outline" | "dot" | "selected"; label: string }) { const style = shape === "square" ? "h-4 w-5 rounded-sm border border-[#7BA3D4] bg-[#C5DCF0]" : shape === "outline" ? "h-4 w-5 rounded-sm border-2 border-[#7BA3D4]" : shape === "selected" ? "h-4 w-4 rounded-full border-2 border-white bg-[#F7BF06]" : "h-4 w-4 rounded-full border-2 border-[#334E88] bg-[#32B372]"; return <li className="flex items-center gap-2"><span aria-hidden="true" className={style} />{label}</li>; }
