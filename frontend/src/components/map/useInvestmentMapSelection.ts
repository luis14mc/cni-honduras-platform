import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/src/i18n/config";
import type {
  DepartmentProperties,
  MapInvestmentProject,
  MunicipalityProperties,
  InfrastructureCache,
  InfrastructureFeature,
  InfrastructureLayer,
  RoadCorridorFeature,
  RoadCorridorFeatureCollection,
  MapQueryState,
  TerritorialRegionFeatureCollection,
  TerritorialRegionLevel,
} from "@/src/lib/types/investment-map";
import {
  stripRegionSlivers,
  createLazyLayerLoader,
  toggleInfrastructureLayer,
  updateInfrastructureCache,
  toLeafletProjectPosition,
  type MapMarkerGroup,
} from "@/src/lib/types/investment-map";
import { getInfrastructureGeoJson, getRoadCorridorsGeoJson } from "@/src/services/investmentMap";
import { getTerritorialRegionsGeoJson } from "@/src/services/geo";

import type { Dispatch, SetStateAction } from "react";
import type { useInvestmentMapData } from "./useInvestmentMapData";

type RegionLayerChoice = "none" | TerritorialRegionLevel;
type Data = ReturnType<typeof useInvestmentMapData>;

type Options = Pick<Data, "setMunicipalities" | "setMunicipalitiesKey"> & {
  locale: Locale;
  initialQueryState: MapQueryState;
  setSelectedDepartment: Dispatch<SetStateAction<DepartmentProperties | null>>;
  setSelectedMunicipality: Dispatch<SetStateAction<MunicipalityProperties | null>>;
  setSelectedProject: Dispatch<SetStateAction<MapInvestmentProject | null>>;
};

export function useInvestmentMapSelection({
  locale, initialQueryState, setSelectedDepartment, setSelectedMunicipality, setSelectedProject,
  setMunicipalities, setMunicipalitiesKey,
}: Options) {
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
  const [projectFocusKey, setProjectFocusKey] = useState(0);

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
  }, [setSelectedDepartment, setSelectedMunicipality, setSelectedProject]);

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
  }, [setSelectedProject]);

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
    const level = initialQueryState.regionLevel;
    if (level) ensureRegionLevel(level);
  }, [ensureRegionLevel, initialQueryState.regionLevel]);

  const handleSelectRegion = useCallback((code: string | null) => {
    setSelectedRegionCode((current) => (code === null || current === code ? null : code));
    setSelectedProject(null);
    setActiveClusterKey(null);
    setClusterFocus(null);
    setSelectedInfrastructure(null);
    setSelectedRoad(null);
  }, [setSelectedProject]);

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
  }, [scrollMapIntoView, setSelectedProject]);

  const handleSelectCluster = useCallback((group: MapMarkerGroup) => {
    setSelectedProject(null);
    setActiveClusterKey(group.key);
    setClusterFocus([group.latitude, group.longitude]);
    setSelectedInfrastructure(null);
    setSelectedRoad(null);
    setProjectFocusKey((key) => key + 1);
    scrollMapIntoView();
  }, [scrollMapIntoView, setSelectedProject]);

  const handleSelectInfrastructure = useCallback((feature: InfrastructureFeature) => {
    setSelectedInfrastructure(feature);
    setSelectedProject(null);
    setSelectedRoad(null);
  }, [setSelectedProject]);

  const handleClearDepartment = useCallback(() => {
    setSelectedDepartment(null);
    setSelectedMunicipality(null);
    setSelectedProject(null);
    setActiveClusterKey(null);
    setClusterFocus(null);
    setMunicipalitiesKey(null);
    setMunicipalities({ status: "ready", data: null });
  }, [setSelectedDepartment, setSelectedMunicipality, setSelectedProject, setMunicipalities, setMunicipalitiesKey]);

  const handleSelectRegionLayer = useCallback((choice: RegionLayerChoice) => {
    setRegionLayer(choice);
    setSelectedRegionCode(null);
    setSelectedProject(null);
    if (choice === "none") return;
    handleClearDepartment();
    setHoveredDepartment(null);
    setHoveredMunicipality(null);
    ensureRegionLevel(choice);
  }, [ensureRegionLevel, handleClearDepartment, setSelectedProject]);

  const handleClearMunicipality = useCallback(() => {
    setSelectedMunicipality(null);
    setSelectedProject(null);
  }, [setSelectedMunicipality, setSelectedProject]);

  const handleClearProject = useCallback(() => {
    setSelectedProject(null);
  }, [setSelectedProject]);

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
  }, [setSelectedMunicipality, setSelectedProject]);

  return {
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
  };
}
