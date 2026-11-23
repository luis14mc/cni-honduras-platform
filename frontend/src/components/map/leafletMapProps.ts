
import type {
  DepartmentFeatureCollection,
  DepartmentProperties,
  MapDepartmentSummary,
  MapInvestmentProject,
  MapMarkerGroup,
  MunicipalityFeatureCollection,
  MunicipalityProperties,
  InfrastructureFeature,
  RoadCorridorFeature,
  RoadCorridorFeatureCollection,
  TerritorialRegionFeatureCollection,
} from "@/src/lib/types/investment-map";

import { InfrastructureTooltipCopy, RegionTooltipCopy } from "./mapLeafletVisuals";
export type LeafletMapProps = {
  data: DepartmentFeatureCollection;
  summaries: Map<string, MapDepartmentSummary>;
  activeSector: string;
  selectedDepartmentSlug: string | null;
  municipalities: MunicipalityFeatureCollection | null;
  selectedMunicipalitySlug: string | null;
  markerProjects: MapInvestmentProject[];
  selectedProjectId: number | null;
  selectedProjectPosition: [number, number] | null;
  projectFocusKey: number;
  mapAriaLabel: string;
  mapInstructions: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  onSelectDepartment: (properties: DepartmentProperties) => void;
  onSelectMunicipality: (properties: MunicipalityProperties) => void;
  onSelectProject: (project: MapInvestmentProject) => void;
  hoveredProjectId?: number | null;
  onSelectCluster?: (group: MapMarkerGroup) => void;
  clusterTooltip?: (count: number, place: string) => string;
  onHoverDepartment: (properties: DepartmentProperties | null) => void;
  onHoverMunicipality: (properties: MunicipalityProperties | null) => void;
  infrastructure: InfrastructureFeature[];
  selectedInfrastructureId: number | null;
  onSelectInfrastructure: (feature: InfrastructureFeature) => void;
  infrastructureCopy?: InfrastructureTooltipCopy;
  roads?: RoadCorridorFeatureCollection | null;
  selectedRoadCode?: string | null;
  onSelectRoad?: (feature: RoadCorridorFeature) => void;
  /** Visible OSM credit (ODbL), shown in Leaflet's attribution control while roads are drawn. */
  roadAttribution?: string;
  regions?: TerritorialRegionFeatureCollection | null;
  regionTooltipCopy?: RegionTooltipCopy;
  regionMode?: boolean;
  selectedRegionCode?: string | null;
  onSelectRegion?: (code: string | null) => void;
};
