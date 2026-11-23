import L,{ type PathOptions } from "leaflet";

import type {
  DepartmentProperties,
  MapDepartmentSummary,
  MunicipalityProperties,
  InfrastructureLayer,
  PoloType,
  PortCategory,
  RoadClass,
  RoadCorridorProperties,
  TerritorialRegionProperties,
} from "@/src/lib/types/investment-map";

export const HONDURAS_CENTER: [number, number] = [14.63, -86.24];
export const HONDURAS_BOUNDS: L.LatLngBoundsExpression = [
  [12.6, -90.4],
  [17, -82.4],
];
export const STROKE = "#334E88";
export const MUNICIPALITY_STROKE = "#7BA3D4";
export const FILL_BASE = "#E8F1FA";
export const FILL_ACTIVE = "#C5DCF0";
export const HOVER_FILL = "#32B372";
export const SELECTED_FILL = "#32B372";
export const SELECTED_STROKE = "#334E88";
export const MARKER_FILL = "#32B372";
export const MARKER_SELECTED = "#F7BF06";
export const MARKER_OPPORTUNITY = "#F7BF06";
export const MARKER_STROKE = "#ffffff";
export const CLUSTER_FILL = "#334E88";
// overlayPane (departments, municipalities) is 400 and markerPane is 600.
export const REGIONS_PANE_Z = 450;
// Above every polygon layer (regions included) and below project markers.
export const ROADS_PANE_Z = 455;
export const PROJECTS_PANE_Z = 460;
export const ROAD_STYLES: Record<RoadClass, PathOptions> = {
  primaria: { color: "#F7BF06", weight: 3.5, opacity: 1 },
  secundaria: { color: "#FFFFFF", weight: 2, opacity: 0.8 },
};
export const ROAD_STRATEGIC_HALO: PathOptions = { color: "#001a33", weight: 6, opacity: 0.9 };
// White lines vanish on the light department fill, so secondary roads get a thin casing.
export const ROAD_SECONDARY_CASING: PathOptions = { color: "#334E88", weight: 3.5, opacity: 0.45 };
export const OSM_COPYRIGHT_URL = "https://www.openstreetmap.org/copyright";

export function styleRoad(properties: RoadCorridorProperties, selectedRoadCode: string | null): PathOptions {
  const base = ROAD_STYLES[properties.road_class] ?? ROAD_STYLES.secundaria;
  if (properties.code !== selectedRoadCode) return base;
  return { ...base, weight: (base.weight ?? 2) + 2, opacity: 1 };
}

export function styleRoadCasing(properties: RoadCorridorProperties): PathOptions {
  return properties.is_strategic ? ROAD_STRATEGIC_HALO : ROAD_SECONDARY_CASING;
}

// SVG bodies mirror lucide-react's Plane and Anchor icons (divIcon needs raw HTML).
export const INFRASTRUCTURE_MARKERS: Record<InfrastructureLayer, { background: string; color: string; svg: string }> = {
  airport: {
    background: "#F7BF06",
    color: "#001a33",
    svg: '<path d="M22 2 9.5 14.5M15 5l4 4M2 16l6 1 1 5 3-7 7-3-5-1-1-5Z"/>',
  },
  port: {
    background: "#334E88",
    color: "#ffffff",
    svg: '<path d="M12 6v16"/><path d="m19 13 2-1a9 9 0 0 1-18 0l2 1"/><path d="M9 11h6"/><circle cx="12" cy="4" r="2"/>',
  },
};

export type InfrastructureTooltipCopy = {
  locale: "es" | "en";
  operator: string;
  portCategories: Record<PortCategory, string>;
};

export type RegionTooltipCopy = {
  regionCode: string;
  poloType: string;
  poloTypes: Record<PoloType, string>;
  approximateBoundary: string;
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

export function clusterDivIcon(
  count: number,
  highlighted: boolean,
  projectCount: number,
  opportunityCount: number,
) {
  const size = highlighted ? 40 : 34;
  const total = Math.max(1, projectCount + opportunityCount);
  const projectDeg = (projectCount / total) * 360;
  const ring =
    projectCount > 0 && opportunityCount > 0
      ? `conic-gradient(${MARKER_FILL} 0 ${projectDeg}deg, ${MARKER_OPPORTUNITY} ${projectDeg}deg 360deg)`
      : CLUSTER_FILL;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span style="display:grid;place-items:center;width:${size}px;height:${size}px;border-radius:50%;background:${ring};padding:3px;box-shadow:0 2px 8px rgba(0,26,51,.35)"><span style="display:grid;place-items:center;width:100%;height:100%;border-radius:50%;background:${CLUSTER_FILL};color:#fff;font:700 13px/1 Inter,system-ui,sans-serif;border:2px solid #fff">${count}</span></span>`,
  });
}

export function regionTooltipHtml(properties: TerritorialRegionProperties, copy: RegionTooltipCopy): string {
  const lines = [
    `<strong>${escapeHtml(properties.name)}</strong>`,
    `${escapeHtml(copy.regionCode)}: ${escapeHtml(properties.code)}`,
  ];
  if (properties.level === "polo") {
    const tipo = properties.extra.tipo;
    if (tipo) lines.push(`${escapeHtml(copy.poloType)}: ${escapeHtml(copy.poloTypes[tipo] ?? tipo)}`);
    if (properties.extra.approximate) lines.push(`<em>${escapeHtml(copy.approximateBoundary)}</em>`);
  }
  return lines.join("<br/>");
}

export const REGION_STROKE = "#ffffff";
export const REGION_SELECTED_STROKE = "#F7BF06";

export function styleRegion(properties: TerritorialRegionProperties, selectedRegionCode: string | null): PathOptions {
  const base = { color: REGION_STROKE, weight: 1.5, opacity: 1, fillColor: properties.color };
  if (properties.code === selectedRegionCode) {
    return { ...base, color: REGION_SELECTED_STROKE, weight: 3, fillOpacity: 0.75 };
  }
  return { ...base, fillOpacity: selectedRegionCode ? 0.2 : 0.55 };
}

export function styleDepartment(
  properties: DepartmentProperties,
  summaries: Map<string, MapDepartmentSummary>,
  activeSector: string,
  selectedDepartmentSlug: string | null,
): PathOptions {
  const summary = summaries.get(properties.slug);
  const hasActivity = Boolean(
    summary && summary.projects_count + summary.opportunities_count > 0,
  );
  const matches =
    activeSector === "all" ||
    (summary?.sectors?.some((sector) => sector.slug === activeSector) ?? false);
  const selected = properties.slug === selectedDepartmentSlug;

  if (selected) {
    return {
      color: SELECTED_STROKE,
      weight: 3,
      opacity: 1,
      fillColor: FILL_ACTIVE,
      fillOpacity: 0.45,
    };
  }

  if (activeSector !== "all" && matches) {
    return {
      color: STROKE,
      weight: 2.2,
      opacity: 1,
      fillColor: HOVER_FILL,
      fillOpacity: 0.58,
    };
  }

  if (activeSector !== "all" && !matches) {
    return {
      color: STROKE,
      weight: 1,
      opacity: 0.28,
      fillColor: FILL_BASE,
      fillOpacity: 0.35,
    };
  }

  if (hasActivity) {
    const activity = (summary?.projects_count ?? 0) + (summary?.opportunities_count ?? 0);
    return {
      color: STROKE,
      weight: 1.6,
      opacity: 1,
      fillColor: FILL_ACTIVE,
      fillOpacity: Math.min(0.78, 0.48 + activity * 0.03),
    };
  }

  return {
    color: STROKE,
    weight: 1.3,
    opacity: 0.95,
    fillColor: FILL_BASE,
    fillOpacity: 0.82,
  };
}

export function styleMunicipality(
  properties: MunicipalityProperties,
  selectedMunicipalitySlug: string | null,
): PathOptions {
  const selected = properties.slug === selectedMunicipalitySlug;
  if (selected) {
    return {
      color: SELECTED_STROKE,
      weight: 2,
      opacity: 1,
      fillColor: SELECTED_FILL,
      fillOpacity: 0.78,
    };
  }
  return {
    color: MUNICIPALITY_STROKE,
    weight: 0.9,
    opacity: 0.95,
    fillColor: FILL_BASE,
    fillOpacity: 0.72,
  };
}
