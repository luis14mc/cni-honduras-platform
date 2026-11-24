import { trackEvent } from "@/src/lib/analytics";
import type { DepartmentProperties, MapKindFilter, TerritorialRegionLevel } from "@/src/lib/types/investment-map";

type RegionLayer = "none" | TerritorialRegionLevel;

type Options = {
  kindFilter: MapKindFilter;
  regionLayer: RegionLayer;
  selectDepartment: (department: DepartmentProperties) => void;
  clearDepartment: () => void;
  setStage: (stage: string) => void;
  selectRegionLayer: (layer: RegionLayer) => void;
  resetFilters: () => void;
  setKindFilter: (kind: MapKindFilter) => void;
};

export function createMapFilterHandlers(options: Options) {
  function handleDepartmentFilter(department: DepartmentProperties | null) {
    if (department) options.selectDepartment(department);
    else {
      options.clearDepartment();
      trackEvent("map_filter", { filter: "department", value: "all" });
    }
  }

  function handleStageFilter(stage: string) {
    options.setStage(stage);
    trackEvent("map_filter", { filter: "stage", value: stage || "all" });
  }

  function handleRegionLayerFilter(layer: RegionLayer) {
    if (layer !== options.regionLayer) trackEvent("map_filter", { filter: "region_level", value: layer });
    options.selectRegionLayer(layer);
  }

  function handleClearFilters() {
    options.resetFilters();
    trackEvent("map_filter", { filter: "reset" });
  }

  function handleKindFilter(kind: MapKindFilter) {
    if (kind !== options.kindFilter) trackEvent("map_filter", { filter: "kind", value: kind });
    options.setKindFilter(kind);
  }

  return { handleDepartmentFilter, handleStageFilter, handleRegionLayerFilter, handleClearFilters, handleKindFilter };
}
