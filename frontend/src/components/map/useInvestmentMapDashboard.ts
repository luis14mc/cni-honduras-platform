import { useMapFilters } from "./useMapFilters";
import { MAP_INVESTMENT_AMOUNT } from "@/src/lib/types/investment-map";
import { useInvestmentMapSelection } from "./useInvestmentMapSelection";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/src/i18n/config";
import { investmentMapCopy } from "@/src/i18n/copy/investmentMap";
import type {
  DepartmentProperties,
  MapInvestmentProject,
  MunicipalityProperties,
  InfrastructureLayer,
  MapQueryState,
  MapSearchResult,
} from "@/src/lib/types/investment-map";
import {
  getRegionLegendItems,
  findMapItemByQuery,
  sortMapProjectsByAmount,
  getMarkerProjects,
  indexSummaries,
  getActiveInfrastructureLabels,
  getMapVisibleCounts,
  searchInvestmentMap,
  serializeMapQueryState,
  toLeafletProjectPosition,
  type MapKindFilter,
} from "@/src/lib/types/investment-map";
import {
  assignMapDepartments,
  assignMapMunicipalities,
  groupMarkersByPosition,
} from "@/src/lib/mapMarkers";

import { useInvestmentMapData } from "./useInvestmentMapData";
export function useInvestmentMapDashboard({
  locale,
  initialQueryState,
}: {
  locale: Locale;
  initialQueryState: MapQueryState;
}) {
  const copy = investmentMapCopy[locale];
  const pathname = usePathname();
  const [activeSector, setActiveSector] = useState(initialQueryState.sector ?? "all");
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentProperties | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<MunicipalityProperties | null>(null);
  const [selectedProject, setSelectedProject] = useState<MapInvestmentProject | null>(null);
  const [kindFilter, setKindFilter] = useState<MapKindFilter>(initialQueryState.kind ?? "all");
  const [stage, setStage] = useState(initialQueryState.stage ?? "");
  const [minInvestment, setMinInvestment] = useState(initialQueryState.minInvestment ?? "");
  const [maxInvestment, setMaxInvestment] = useState(initialQueryState.maxInvestment ?? "");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(-1);
  const initialQueryRef = useRef({ ...initialQueryState });
  const { geo, summary, summarySector, sectors, sectorError, sectorsLoaded, municipalities, municipalitiesKey, setMunicipalities, setMunicipalitiesKey, projects, projectsKey } = useInvestmentMapData({
    locale, initialQueryRef, activeSector, setActiveSector, selectedDepartment,
    setSelectedDepartment, setSelectedMunicipality,
  });

  const {
    hoveredProjectId,
    setHoveredProjectId,
    activeClusterKey,
    setActiveClusterKey,
    clusterFocus,
    setClusterFocus,
    hoveredDepartment,
    setHoveredDepartment,
    hoveredMunicipality,
    setHoveredMunicipality,
    activeInfrastructureLayers,
    infrastructureCache,
    infrastructureStatus,
    selectedInfrastructure,
    setSelectedInfrastructure,
    roadsActive,
    roads,
    roadsStatus,
    selectedRoad,
    setSelectedRoad,
    regionLayer,
    selectedRegionCode,
    regionCache,
    regionStatus,
    regionMode,
    projectFocusKey,
    setProjectFocusKey,
    handleSelectDepartment,
    handleToggleInfrastructure,
    handleToggleRoads,
    handleSelectRoad,
    handleSelectRegion,
    handleSelectProject,
    handleSelectCluster,
    handleSelectInfrastructure,
    handleClearDepartment,
    handleSelectRegionLayer,
    handleClearMunicipality,
    handleClearProject,
    handleClearCluster,
    handleSelectMunicipality,
  } = useInvestmentMapSelection({
    locale, initialQueryState, setSelectedDepartment, setSelectedMunicipality, setSelectedProject,
    setMunicipalities, setMunicipalitiesKey,
  });

  const handleSectorChange = useCallback((sector: string) => {
    setActiveSector(sector);
    setSelectedProject(null);
    setActiveClusterKey(null);
  }, [setActiveClusterKey]);

  const handleResetFilters = () => {
    setActiveSector("all");
    setKindFilter("all");
    setStage("");
    setMinInvestment("");
    setMaxInvestment("");
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
    const withDepartments = assignMapDepartments(projects.data, geo.data?.features ?? []);
    return assignMapMunicipalities(withDepartments, municipalitiesForMap?.features ?? []);
  }, [geo.data, municipalitiesForMap, projects.data]);
  const activeRegions = regionLayer === "none" ? null : regionCache[regionLayer] ?? null;
  const activeRegionStatus = regionLayer === "none" ? "idle" : regionStatus[regionLayer];
  const selectedRegion = useMemo(
    () => activeRegions?.features.find((feature) => feature.properties.code === selectedRegionCode) ?? null,
    [activeRegions, selectedRegionCode],
  );
  const catalogReady = projectsKey === locale;
  const projectsLoading = !catalogReady;
  const visibleProjects = useMapFilters(territorialCatalog, {
    activeSector, catalogReady, kindFilter, stage, minInvestment, maxInvestment,
    regionMode, selectedDepartment, selectedMunicipality, selectedRegion,
  });
  const visibleSelection = selectedProject && visibleProjects.some(({ id }) => id === selectedProject.id)
    ? selectedProject : null;
  const markerGroups = useMemo(() => groupMarkersByPosition(getMarkerProjects(visibleProjects)), [visibleProjects]);
  const activeCluster = markerGroups.find((group) => group.key === activeClusterKey) ?? null;
  const listedProjects = useMemo(() => {
    if (!activeCluster || visibleSelection) return visibleProjects;
    return sortMapProjectsByAmount(activeCluster.items);
  }, [activeCluster, visibleSelection, visibleProjects]);
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
  const projectFocusPosition = visibleSelection
    ? toLeafletProjectPosition(visibleSelection)
    : clusterFocus;
  const queryReady = sectorsLoaded && geo.status !== "loading" && catalogReady && (
    regionMode
      ? activeRegionStatus === "ready" || activeRegionStatus === "error"
      : !selectedDepartment || municipalitiesKey === selectedDepartment.slug || municipalities.status === "error"
  );

  useEffect(() => {
    if (!catalogReady || geo.status === "loading") return;
    const query = initialQueryRef.current;
    if (!query.project && !query.opportunity && !query.case) return;
    const item = query.case ? territorialCatalog.find((entry) => entry.kind === "case" && entry.slug === query.case) : findMapItemByQuery(territorialCatalog, {
      project: query.project,
      opportunity: query.opportunity,
    });
    if (!item) return;
    query.project = null;
    query.opportunity = null;
    query.case = null;
    setSelectedProject(item);
    const position = toLeafletProjectPosition(item);
    if (position) setClusterFocus(position);
    setProjectFocusKey((key) => key + 1);
  }, [catalogReady, geo.status, setClusterFocus, setProjectFocusKey, territorialCatalog]);

  useEffect(() => {
    if (!queryReady) return;
    const selectedKind = selectedProject?.kind ?? "project";
    const query = serializeMapQueryState(new URLSearchParams(window.location.search), {
      sector: activeSector === "all" ? null : activeSector,
      department: selectedDepartment?.slug ?? null,
      municipality: selectedMunicipality?.slug ?? null,
      project: selectedKind === "project" ? selectedProject?.slug ?? null : null,
      opportunity: selectedKind === "opportunity" ? selectedProject?.slug ?? null : null,
      case: selectedKind === "case" ? selectedProject?.slug ?? null : null,
      kind: kindFilter === "all" ? null : kindFilter,
      stage: stage || null,
      minInvestment: MAP_INVESTMENT_AMOUNT.test(minInvestment) ? minInvestment : null,
      maxInvestment: MAP_INVESTMENT_AMOUNT.test(maxInvestment) ? maxInvestment : null,
      regionLevel: regionLayer === "none" ? null : regionLayer,
      region: selectedRegion?.properties.code ?? null,
    });
    const target = query ? `${pathname}?${query}` : pathname;
    if (`${window.location.pathname}${window.location.search}` !== target) window.history.replaceState(null, "", target);
  }, [activeSector, kindFilter, stage, minInvestment, maxInvestment, pathname, queryReady, regionLayer, selectedDepartment, selectedMunicipality, selectedProject, selectedRegion]);

  const chooseSearchResult = (result: MapSearchResult) => {
    if (result.type === "department") handleSelectDepartment(result.department);
    if (result.type === "municipality") handleSelectMunicipality(result.municipality);
    if (result.type === "project") handleSelectProject(result.project);
    setSearch("");
    setSearchOpen(false);
    setActiveSearchIndex(-1);
  };

  return {
    copy, activeSector, selectedDepartment, selectedMunicipality, selectedProject: visibleSelection, kindFilter,
    setKindFilter, hoveredProjectId, setHoveredProjectId, hoveredDepartment, setHoveredDepartment,
    hoveredMunicipality, setHoveredMunicipality, activeInfrastructureLayers, infrastructureCache,
    infrastructureStatus, selectedInfrastructure, setSelectedInfrastructure, roadsActive, roads,
    roadsStatus, selectedRoad, setSelectedRoad, regionLayer, regionMode, search, setSearch,
    searchOpen, setSearchOpen, activeSearchIndex, setActiveSearchIndex, projectFocusKey,
    handleSelectDepartment, handleToggleInfrastructure, handleToggleRoads, handleSelectRoad,
    handleSelectRegion, handleSelectProject, handleSelectCluster, handleSelectInfrastructure,
    handleClearDepartment, handleSelectRegionLayer, handleClearMunicipality, handleClearProject,
    handleClearCluster, handleSelectMunicipality, handleSectorChange, handleResetFilters, summaries,
    selectedSummary, summaryLoading, municipalitiesLoading, municipalitiesForMap,
    municipalitiesError, municipalitiesEmpty, activeRegions, activeRegionStatus, selectedRegion,
    projectsLoading, activeCluster, listedProjects, markerProjects, listPlace,
    searchResults, regionLegendItems, regionTooltipCopy, infrastructureTooltipCopy,
    infrastructureLabels, activeInfrastructureLabels, counts, selectedSectorName,
    projectFocusPosition, chooseSearchResult, geo, summary, sectors, sectorError, projects, locale,
    stage, setStage, minInvestment, setMinInvestment, maxInvestment, setMaxInvestment,
  };
}
