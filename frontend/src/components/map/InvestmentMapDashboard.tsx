"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Anchor, Plane, Route, Search, X } from "lucide-react";
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
  RoadCorridorFeature,
  RoadCorridorFeatureCollection,
  MapQueryState,
  MapSearchResult,
  TerritorialRegionFeatureCollection,
  TerritorialRegionLevel,
} from "@/src/lib/types/investment-map";
import {
  getRegionLegendItems,
  filterMapProjectsByRegion,
  stripRegionSlivers,
  filterMapProjectsByDepartment,
  filterMapProjectsByMunicipality,
  filterMapProjectsBySector,
  filterMapProjectsByKind,
  findMapItemByQuery,
  sortMapProjectsByAmount,
  getMarkerProjects,
  indexSummaries,
  createLazyLayerLoader,
  getActiveInfrastructureLabels,
  toggleInfrastructureLayer,
  updateInfrastructureCache,
  getMapVisibleCounts,
  searchInvestmentMap,
  serializeMapQueryState,
  toLeafletProjectPosition,
  type MapKindFilter,
  type MapMarkerGroup,
} from "@/src/lib/types/investment-map";
import {
  getDepartmentGeoJson,
  getGeolocatedMapProjects,
  getMapSummary,
  getMunicipalityGeoJson,
  getSectors,
  getInfrastructureGeoJson,
  getRoadCorridorsGeoJson,
} from "@/src/services/investmentMap";
import { getTerritorialRegionsGeoJson } from "@/src/services/geo";
import { mergeMapProjects } from "@/src/lib/portfolioCatalog";
import { assignSeedDepartments, assignSeedMunicipalities, groupMarkersByPosition } from "@/src/lib/mapMarkers";
import type { DepartmentFeatureCollection } from "@/src/lib/types/investment-map";
import type { Sector } from "@/src/types/investment";
import { InvestmentMapPanel } from "@/src/components/map/InvestmentMapPanel";

const InvestmentMapLeaflet = dynamic(
  () => import("@/src/components/map/InvestmentMapLeaflet").then((mod) => mod.InvestmentMapLeaflet),
  { ssr: false },
);

type AsyncState<T> = { status: "loading" | "ready" | "error"; data: T };
type RegionLayerChoice = "none" | TerritorialRegionLevel;
const REGION_LAYER_CHOICES: RegionLayerChoice[] = ["none", "macro", "sub", "polo"];
const INFRASTRUCTURE_LAYER_OPTIONS: { layer: InfrastructureLayer; Icon: typeof Plane }[] = [
  { layer: "airport", Icon: Plane },
  { layer: "port", Icon: Anchor },
];

export function InvestmentMapDashboard({
  locale,
  initialQueryState,
  seedMapProjects,
}: {
  locale: Locale;
  initialQueryState: MapQueryState;
  seedMapProjects?: MapInvestmentProject[];
}) {
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
  const [projects, setProjects] = useState<AsyncState<MapInvestmentProject[]>>({ status: "loading", data: [] });
  const [projectsKey, setProjectsKey] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<MapKindFilter>("all");
  const [hoveredProjectId, setHoveredProjectId] = useState<number | null>(null);
  const [activeClusterKey, setActiveClusterKey] = useState<string | null>(null);
  const [clusterFocus, setClusterFocus] = useState<[number, number] | null>(null);
  const [hoveredDepartment, setHoveredDepartment] = useState<DepartmentProperties | null>(null);
  const [hoveredMunicipality, setHoveredMunicipality] = useState<MunicipalityProperties | null>(null);
  const [activeInfrastructureLayers, setActiveInfrastructureLayers] = useState<Set<InfrastructureLayer>>(new Set());
  const [infrastructureCache, setInfrastructureCache] = useState<InfrastructureCache>({});
  const [infrastructureLoader] = useState(() =>
    createLazyLayerLoader((layer: InfrastructureLayer) => getInfrastructureGeoJson(layer, locale)),
  );
  const [infrastructureStatus, setInfrastructureStatus] = useState<Record<InfrastructureLayer, "idle" | "loading" | "ready" | "error">>({ port: "idle", airport: "idle" });
  const [selectedInfrastructure, setSelectedInfrastructure] = useState<InfrastructureFeature | null>(null);
  const [roadsActive, setRoadsActive] = useState(false);
  const [roads, setRoads] = useState<RoadCorridorFeatureCollection | null>(null);
  const [roadsStatus, setRoadsStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [roadsLoader] = useState(() => createLazyLayerLoader<"roads", RoadCorridorFeatureCollection>(() => getRoadCorridorsGeoJson(locale)));
  const [selectedRoad, setSelectedRoad] = useState<RoadCorridorFeature | null>(null);
  const [regionLayer, setRegionLayer] = useState<RegionLayerChoice>(initialQueryState.regionLevel ?? "none");
  const [selectedRegionCode, setSelectedRegionCode] = useState<string | null>(initialQueryState.region);
  const [regionCache, setRegionCache] = useState<Partial<Record<TerritorialRegionLevel, TerritorialRegionFeatureCollection>>>({});
  const regionRequests = useRef<Partial<Record<TerritorialRegionLevel, Promise<unknown>>>>({});
  const [regionStatus, setRegionStatus] = useState<Record<TerritorialRegionLevel, "idle" | "loading" | "ready" | "error">>({ macro: "idle", sub: "idle", polo: "idle" });
  const regionStatusRef = useRef(regionStatus);
  const regionMode = regionLayer !== "none";
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
        else initialQueryRef.current.municipality = null;
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
        }
      })
      .catch(() => {
        if (cancelled) return;
        setMunicipalities({ status: "error", data: null });
        setMunicipalitiesKey(requestKey);
      });
    return () => { cancelled = true; };
  }, [selectedDepartment]);

  useEffect(() => {
    let cancelled = false;
    const requestKey = locale;
    getGeolocatedMapProjects({ locale })
      .then((data) => {
        if (cancelled) return;
        const merged = mergeMapProjects(data, seedMapProjects ?? []);
        setProjects({ status: "ready", data: merged });
        setProjectsKey(requestKey);
        loadedProjectsRef.current = merged;
      })
      .catch(() => {
        if (cancelled) return;
        const fallback = mergeMapProjects([], seedMapProjects ?? []);
        setProjects({ status: "ready", data: fallback });
        setProjectsKey(requestKey);
        loadedProjectsRef.current = fallback;
      });
    return () => { cancelled = true; };
  }, [locale, seedMapProjects]);

  const handleSelectDepartment = useCallback((department: DepartmentProperties) => {
    setRegionLayer("none");
    setSelectedRegionCode(null);
    setSelectedDepartment(department);
    setSelectedMunicipality(null);
    setSelectedProject(null);
    setActiveClusterKey(null);
    setClusterFocus(null);
    setSelectedInfrastructure(null);
    setSelectedRoad(null);
  }, []);

  const handleToggleInfrastructure = useCallback((layer: InfrastructureLayer) => {
    setActiveInfrastructureLayers((current) => {
      const next = toggleInfrastructureLayer(current, layer);
      if (!next.has(layer)) {
        setSelectedInfrastructure((selected) => selected?.properties.infrastructure_type === layer ? null : selected);
      }
      return next;
    });

    const request = infrastructureLoader.load(layer);
    if (!request) return;
    setInfrastructureStatus((current) => ({ ...current, [layer]: "loading" }));
    request
      .then((data) => {
        setInfrastructureCache((current) => updateInfrastructureCache(current, layer, data));
        setInfrastructureStatus((current) => ({ ...current, [layer]: "ready" }));
      })
      .catch(() => setInfrastructureStatus((current) => ({ ...current, [layer]: "error" })));
  }, [infrastructureLoader]);

  const handleToggleRoads = useCallback(() => {
    setRoadsActive((active) => {
      if (active) setSelectedRoad(null);
      return !active;
    });
    const request = roadsLoader.load("roads");
    if (!request) return;
    setRoadsStatus("loading");
    request
      .then((data) => {
        setRoads(data);
        setRoadsStatus("ready");
      })
      .catch(() => setRoadsStatus("error"));
  }, [roadsLoader]);

  const handleSelectRoad = useCallback((feature: RoadCorridorFeature) => {
    setSelectedRoad(feature);
    setSelectedInfrastructure(null);
    setSelectedProject(null);
  }, []);

  const updateRegionStatus = useCallback((level: TerritorialRegionLevel, status: "idle" | "loading" | "ready" | "error") => {
    regionStatusRef.current = { ...regionStatusRef.current, [level]: status };
    setRegionStatus(regionStatusRef.current);
  }, []);

  const ensureRegionLevel = useCallback((level: TerritorialRegionLevel) => {
    const status = regionStatusRef.current[level];
    if (regionRequests.current[level] || status === "ready" || status === "loading") return;
    updateRegionStatus(level, "loading");
    regionRequests.current[level] = getTerritorialRegionsGeoJson(level)
      .then((data) => {
        setRegionCache((current) => ({ ...current, [level]: stripRegionSlivers(data) }));
        updateRegionStatus(level, "ready");
      })
      .catch(() => updateRegionStatus(level, "error"))
      .finally(() => { delete regionRequests.current[level]; });
  }, [updateRegionStatus]);

  useEffect(() => {
    const level = initialQueryRef.current.regionLevel;
    if (level) ensureRegionLevel(level);
  }, [ensureRegionLevel]);

  const handleSelectRegion = useCallback((code: string | null) => {
    setSelectedRegionCode((current) => (code === null || current === code ? null : code));
    setSelectedProject(null);
    setActiveClusterKey(null);
    setClusterFocus(null);
    setSelectedInfrastructure(null);
    setSelectedRoad(null);
  }, []);

  const scrollMapIntoView = useCallback(() => {
    document.getElementById("investment-map-canvas")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const handleSelectProject = useCallback((project: MapInvestmentProject) => {
    setSelectedProject(project);
    setSelectedInfrastructure(null);
    setSelectedRoad(null);
    const position = toLeafletProjectPosition(project);
    if (position) setClusterFocus(position);
    setProjectFocusKey((key) => key + 1);
    scrollMapIntoView();
  }, [scrollMapIntoView]);

  const handleSelectCluster = useCallback((group: MapMarkerGroup) => {
    setSelectedProject(null);
    setActiveClusterKey(group.key);
    setClusterFocus([group.latitude, group.longitude]);
    setSelectedInfrastructure(null);
    setSelectedRoad(null);
    setProjectFocusKey((key) => key + 1);
    scrollMapIntoView();
  }, [scrollMapIntoView]);

  const handleSelectInfrastructure = useCallback((feature: InfrastructureFeature) => {
    setSelectedInfrastructure(feature);
    setSelectedProject(null);
    setSelectedRoad(null);
  }, []);

  const handleClearDepartment = useCallback(() => {
    setSelectedDepartment(null);
    setSelectedMunicipality(null);
    setSelectedProject(null);
    setActiveClusterKey(null);
    setClusterFocus(null);
    setMunicipalitiesKey(null);
    setMunicipalities({ status: "ready", data: null });
  }, []);

  const handleSelectRegionLayer = useCallback((choice: RegionLayerChoice) => {
    setRegionLayer(choice);
    setSelectedRegionCode(null);
    setSelectedProject(null);
    if (choice === "none") return;
    handleClearDepartment();
    setHoveredDepartment(null);
    setHoveredMunicipality(null);
    ensureRegionLevel(choice);
  }, [ensureRegionLevel, handleClearDepartment]);

  const handleClearMunicipality = useCallback(() => {
    setSelectedMunicipality(null);
    setSelectedProject(null);
  }, []);

  const handleClearProject = useCallback(() => {
    setSelectedProject(null);
  }, []);

  const handleClearCluster = useCallback(() => {
    setActiveClusterKey(null);
    setClusterFocus(null);
  }, []);

  const handleSelectMunicipality = useCallback((municipality: MunicipalityProperties) => {
    setSelectedMunicipality(municipality);
    setSelectedProject(null);
    setActiveClusterKey(null);
    setClusterFocus(null);
    setSelectedInfrastructure(null);
    setSelectedRoad(null);
  }, []);

  const handleSectorChange = useCallback((sector: string) => {
    setActiveSector(sector);
    setSelectedProject(null);
    setActiveClusterKey(null);
  }, []);

  const handleResetFilters = () => {
    setActiveSector("all");
    setKindFilter("all");
    handleSelectRegionLayer("none");
    handleClearDepartment();
    setSelectedInfrastructure(null);
    setSelectedRoad(null);
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
  const territorialCatalog = useMemo(() => {
    const withDepartments = assignSeedDepartments(projects.data, geo.data?.features ?? []);
    return assignSeedMunicipalities(withDepartments, municipalitiesForMap?.features ?? []);
  }, [geo.data, municipalitiesForMap, projects.data]);
  const activeRegions = regionLayer === "none" ? null : regionCache[regionLayer] ?? null;
  const activeRegionStatus = regionLayer === "none" ? "idle" : regionStatus[regionLayer];
  const selectedRegion = useMemo(
    () => activeRegions?.features.find((feature) => feature.properties.code === selectedRegionCode) ?? null,
    [activeRegions, selectedRegionCode],
  );
  const catalogReady = projectsKey === locale;
  const projectsLoading = !catalogReady;
  const visibleProjects = useMemo(() => {
    if (!catalogReady) return [];
    const sectorSlug = activeSector === "all" ? null : activeSector;
    let items = territorialCatalog;
    if (regionMode) {
      items = filterMapProjectsByRegion(items, selectedRegion);
    } else {
      items = filterMapProjectsByDepartment(items, selectedDepartment?.slug ?? null);
      items = filterMapProjectsByMunicipality(items, selectedMunicipality?.slug ?? null);
    }
    items = filterMapProjectsBySector(items, sectorSlug);
    items = filterMapProjectsByKind(items, kindFilter);
    return sortMapProjectsByAmount(items);
  }, [
    activeSector,
    catalogReady,
    kindFilter,
    regionMode,
    selectedDepartment,
    selectedMunicipality,
    selectedRegion,
    territorialCatalog,
  ]);
  const markerGroups = useMemo(() => groupMarkersByPosition(getMarkerProjects(visibleProjects)), [visibleProjects]);
  const activeCluster = markerGroups.find((group) => group.key === activeClusterKey) ?? null;
  const listedProjects = useMemo(() => {
    if (!activeCluster || selectedProject) return visibleProjects;
    return sortMapProjectsByAmount(activeCluster.items);
  }, [activeCluster, selectedProject, visibleProjects]);
  const markerProjects = useMemo(() => getMarkerProjects(visibleProjects), [visibleProjects]);
  const listPlace = activeCluster
    ? activeCluster.items[0]?.municipality?.name ||
      activeCluster.items[0]?.locationText ||
      activeCluster.items[0]?.department?.name ||
      copy.honduras
    : selectedMunicipality?.name
      ?? selectedDepartment?.name
      ?? selectedRegion?.properties.name
      ?? copy.honduras;
  const searchResults = useMemo(() => searchInvestmentMap(
    search,
    geo.data?.features.map((item) => item.properties) ?? [],
    municipalitiesForMap?.features.map((item) => item.properties) ?? [],
    visibleProjects,
  ), [geo.data, municipalitiesForMap, search, visibleProjects]);
  const regionLegendItems = useMemo(
    () => (activeRegions ? getRegionLegendItems(activeRegions.features, copy.poloTypes) : []),
    [activeRegions, copy.poloTypes],
  );
  const regionTooltipCopy = useMemo(
    () => ({
      regionCode: copy.regionCode,
      poloType: copy.poloType,
      poloTypes: copy.poloTypes,
      approximateBoundary: copy.approximateBoundary,
    }),
    [copy.approximateBoundary, copy.poloType, copy.poloTypes, copy.regionCode],
  );
  const infrastructureTooltipCopy = useMemo(
    () => ({ locale, operator: copy.operator, portCategories: copy.portCategories }),
    [copy.operator, copy.portCategories, locale],
  );
  const infrastructureLabels: Record<InfrastructureLayer, string> = { airport: copy.airports, port: copy.ports };
  const activeInfrastructureLabels = getActiveInfrastructureLabels(
    activeInfrastructureLayers,
    { ...infrastructureLabels, roads: copy.roadNetwork },
    roadsActive,
  );
  const counts = getMapVisibleCounts(markerProjects.length, municipalitiesForMap?.features.length ?? 0, activeInfrastructureLayers.size + (roadsActive ? 1 : 0) + (regionLayer === "none" ? 0 : 1));
  const selectedSectorName = activeSector === "all" ? copy.allSectors : sectors.find((sector) => sector.slug === activeSector)?.name ?? activeSector;
  const projectFocusPosition = selectedProject
    ? toLeafletProjectPosition(selectedProject)
    : clusterFocus;
  const queryReady = sectorsLoaded && geo.status !== "loading" && catalogReady && (
    regionMode
      ? activeRegionStatus === "ready" || activeRegionStatus === "error"
      : !selectedDepartment || municipalitiesKey === selectedDepartment.slug || municipalities.status === "error"
  );

  useEffect(() => {
    if (!catalogReady || geo.status === "loading") return;
    const query = initialQueryRef.current;
    if (!query.project && !query.opportunity) return;
    const item = findMapItemByQuery(territorialCatalog, {
      project: query.project,
      opportunity: query.opportunity,
    });
    if (!item) return;
    query.project = null;
    query.opportunity = null;
    setSelectedProject(item);
    const position = toLeafletProjectPosition(item);
    if (position) setClusterFocus(position);
    setProjectFocusKey((key) => key + 1);
  }, [catalogReady, geo.status, territorialCatalog]);

  useEffect(() => {
    if (!queryReady) return;
    const selectedKind = selectedProject?.kind ?? "project";
    const query = serializeMapQueryState(new URLSearchParams(window.location.search), {
      sector: activeSector === "all" ? null : activeSector,
      department: selectedDepartment?.slug ?? null,
      municipality: selectedMunicipality?.slug ?? null,
      project: selectedProject && selectedKind !== "opportunity" ? selectedProject.slug : null,
      opportunity: selectedProject && selectedKind === "opportunity"
        ? selectedProject.slug
        : selectedProject
          ? null
          : initialQueryState.opportunity,
      regionLevel: regionLayer === "none" ? null : regionLayer,
      region: selectedRegion?.properties.code ?? null,
    });
    const target = query ? `${pathname}?${query}` : pathname;
    if (`${window.location.pathname}${window.location.search}` !== target) router.replace(target, { scroll: false });
  }, [activeSector, initialQueryState.opportunity, pathname, queryReady, regionLayer, router, selectedDepartment, selectedMunicipality, selectedProject, selectedRegion]);

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
          <div className="mt-4" role="group" aria-labelledby="investment-map-view-label">
            <p id="investment-map-view-label" className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-[#8DC046]">{copy.mapViewLabel}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {REGION_LAYER_CHOICES.map((choice) => {
                const active = regionLayer === choice;
                return (
                  <button key={choice} type="button" aria-pressed={active} onClick={() => handleSelectRegionLayer(choice)} className={`min-h-9 rounded-full border px-4 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7BF06] ${active ? "border-[#F7BF06] bg-[#F7BF06] text-[#001a33]" : "border-white/20 bg-[#001a33]/60 text-white hover:border-[#8DC046]"}`}>
                    {choice === "none" ? copy.regionModeDepartments : copy.regionLevels[choice]}
                  </button>
                );
              })}
              {activeRegionStatus === "loading" ? <span role="status" className="text-xs text-[#d5e3ff]/75">{copy.layerLoading}</span> : null}
              {activeRegionStatus === "error" ? <span role="alert" className="text-xs text-red-200">{copy.layerError}</span> : null}
              {activeRegionStatus === "ready" && activeRegions?.features.length === 0 ? <span role="status" className="text-xs text-[#d5e3ff]/75">{copy.regionsEmpty}</span> : null}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full border border-white/15 px-3 py-2">{copy.currentFilters}: {selectedSectorName}{selectedDepartment ? ` · ${selectedDepartment.name}` : ""}{selectedMunicipality ? ` · ${selectedMunicipality.name}` : ""}{activeInfrastructureLabels.map((label) => ` · ${label}`).join("")}{regionLayer !== "none" ? ` · ${copy.regionLevels[regionLayer]}` : ""}{selectedRegion ? ` · ${selectedRegion.properties.name}` : ""}</span><button type="button" onClick={handleResetFilters} className="min-h-9 rounded-full border border-[#8DC046]/50 px-3 font-bold text-[#d8ef9f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F7BF06]">{copy.clearFilters}</button></div>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#d5e3ff]/75"><span>{counts.visibleProjects} {copy.visibleProjectsCount}</span><span>·</span><span>{counts.loadedMunicipalities} {copy.loadedMunicipalitiesCount}</span><span>·</span><span>{counts.activeLayers} {copy.activeLayersCount}</span></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <details className="rounded-xl border border-white/10 bg-[#001a33]/45 p-3"><summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-[#8DC046]">{copy.infrastructureLayers}</summary>{INFRASTRUCTURE_LAYER_OPTIONS.map(({ layer, Icon }) => <label key={layer} className="mt-3 flex min-h-8 cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={activeInfrastructureLayers.has(layer)} onChange={() => handleToggleInfrastructure(layer)} className="h-4 w-4 accent-[#32B372]" /><Icon aria-hidden="true" size={16} /><span>{infrastructureLabels[layer]}</span>{infrastructureStatus[layer] === "loading" ? <span role="status">{copy.layerLoading}</span> : null}{infrastructureStatus[layer] === "error" ? <span role="alert" className="text-red-200">{copy.layerError}</span> : null}</label>)}<label className="mt-3 flex min-h-8 cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={roadsActive} onChange={handleToggleRoads} className="h-4 w-4 accent-[#32B372]" /><Route aria-hidden="true" size={16} /><span>{copy.roadNetwork}</span>{roadsStatus === "loading" ? <span role="status">{copy.layerLoading}</span> : null}{roadsStatus === "error" ? <span role="alert" className="text-red-200">{copy.layerError}</span> : null}</label></details>
            <details className="rounded-xl border border-white/10 bg-[#001a33]/45 p-3"><summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-[#8DC046]">{copy.legend}</summary><ul className="mt-3 grid grid-cols-2 gap-2 text-xs">{!regionMode ? <><LegendItem shape="square" label={copy.legendDepartment} /><LegendItem shape="outline" label={copy.legendMunicipality} /></> : null}<LegendItem shape="dot" label={copy.legendProject} /><LegendItem shape="opportunity" label={copy.legendOpportunity} /><LegendItem shape="cluster" label={copy.legendCluster} /><LegendItem shape="selected" label={copy.legendSelectedProject} />{INFRASTRUCTURE_LAYER_OPTIONS.filter(({ layer }) => activeInfrastructureLayers.has(layer)).map(({ layer, Icon }) => <li key={layer} className="flex items-center gap-2"><Icon size={15} aria-hidden="true" />{infrastructureLabels[layer]}</li>)}{roadsActive ? <><LegendItem shape="road-primary" label={copy.legendPrimaryRoad} /><LegendItem shape="road-secondary" label={copy.legendSecondaryRoad} /></> : null}</ul><p className="mt-3 text-[11px] italic text-[#d5e3ff]/70">{copy.approximateMunicipalityNote}</p>{regionLegendItems.length ? <div className="mt-3 border-t border-white/10 pt-3"><p className="text-[10px] font-bold uppercase tracking-wider text-[#d5e3ff]/75">{copy.regionLevels[regionLayer]}</p><ul className="mt-2 grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2">{regionLegendItems.map((item) => <li key={item.key} className="flex items-center gap-2"><span aria-hidden="true" className="h-3.5 w-4 shrink-0 rounded-sm border border-white/70" style={{ backgroundColor: item.color }} />{item.label}</li>)}</ul>{regionLayer === "polo" ? <p className="mt-2 text-[11px] italic text-[#d5e3ff]/70">{copy.approximateBoundary}</p> : null}</div> : null}</details>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div id="investment-map-canvas" className="relative isolate z-0 min-h-[440px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white shadow-2xl sm:min-h-[600px]">
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
                selectedProjectPosition={projectFocusPosition}
                projectFocusKey={projectFocusKey}
                hoveredProjectId={hoveredProjectId}
                onSelectCluster={handleSelectCluster}
                clusterTooltip={copy.clusterTooltip}
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
                infrastructureCopy={infrastructureTooltipCopy}
                roads={roadsActive ? roads : null}
                selectedRoadCode={selectedRoad?.properties.code ?? null}
                onSelectRoad={handleSelectRoad}
                roadAttribution={copy.osmAttribution}
                onHoverDepartment={setHoveredDepartment}
                onHoverMunicipality={setHoveredMunicipality}
                regions={activeRegions}
                regionTooltipCopy={regionTooltipCopy}
                regionMode={regionMode}
                selectedRegionCode={selectedRegion?.properties.code ?? null}
                onSelectRegion={handleSelectRegion}
              />
            ) : null}
            {municipalitiesLoading ? (
              <div className="pointer-events-none absolute right-4 top-4 z-[500] rounded-lg bg-[#001a33]/90 px-3 py-2 text-xs font-bold text-white shadow-lg" role="status">
                {copy.loadingMunicipalities}
              </div>
            ) : null}
            {!regionMode && hoveredMunicipality && selectedDepartment && !selectedMunicipality ? (
              <div className="pointer-events-none absolute bottom-4 left-4 z-[500] rounded-lg bg-[#001a33]/90 px-3 py-2 text-xs font-bold text-white shadow-lg">{hoveredMunicipality.name}</div>
            ) : null}
            {!regionMode && hoveredDepartment && !selectedDepartment ? (
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
            projects={listedProjects}
            projectsLoading={projectsLoading}
            projectsError={projects.status === "error"}
            municipalitiesLoading={municipalitiesLoading}
            municipalitiesError={municipalitiesError}
            municipalitiesEmpty={municipalitiesEmpty}
            onClearDepartment={handleClearDepartment}
            onClearMunicipality={handleClearMunicipality}
            onClearProject={handleClearProject}
            onClearInfrastructure={() => setSelectedInfrastructure(null)}
            road={selectedRoad}
            onClearRoad={() => setSelectedRoad(null)}
            onSelectProject={handleSelectProject}
            regionMode={regionMode}
            region={selectedRegion}
            onClearRegion={() => handleSelectRegion(null)}
            kindFilter={kindFilter}
            onKindFilterChange={setKindFilter}
            onHoverProject={setHoveredProjectId}
            listPlace={listPlace}
            clusterActive={Boolean(activeCluster)}
            onClearCluster={handleClearCluster}
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
function LegendItem({ shape, label }: { shape: "square" | "outline" | "dot" | "opportunity" | "cluster" | "selected" | "road-primary" | "road-secondary"; label: string }) {
  const style = shape === "road-primary" ? "h-1 w-6 rounded-full bg-[#F7BF06] ring-2 ring-[#001a33]" : shape === "road-secondary" ? "h-0.5 w-6 rounded-full bg-white ring-1 ring-[#334E88]/60" : shape === "square" ? "h-4 w-5 rounded-sm border border-[#7BA3D4] bg-[#C5DCF0]" : shape === "outline" ? "h-4 w-5 rounded-sm border-2 border-[#7BA3D4]" : shape === "selected" ? "h-4 w-4 rounded-full border-2 border-white bg-[#F7BF06]" : shape === "opportunity" ? "h-4 w-4 rounded-full border-2 border-white bg-[#F7BF06]" : shape === "cluster" ? "grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-[#334E88] text-[9px] font-bold text-white" : "h-4 w-4 rounded-full border-2 border-white bg-[#32B372]";
  return <li className="flex items-center gap-2"><span aria-hidden="true" className={style}>{shape === "cluster" ? "12" : null}</span>{label}</li>;
}
