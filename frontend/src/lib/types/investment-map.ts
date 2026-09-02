/**
 * Tipos del mapa interactivo de inversión (API v1 geo + investment).
 */

/** @deprecated Legacy mock map nodes — used by DynamicLeafletMap / mapActions */
export interface InvestmentNode {
  id: number;
  slug: string;
  title: string;
  lat: number;
  lng: number;
  capexUsd: string;
  sectorName: string;
  sectorColor: string;
  sectorIcon: string;
}

/** @deprecated Legacy server action result */
export interface MapActionSuccess {
  success: true;
  data: InvestmentNode[];
}

/** @deprecated Legacy server action result */
export interface MapActionError {
  success: false;
  error: string;
}

/** @deprecated Legacy server action result */
export type MapActionResult = MapActionSuccess | MapActionError;

// ---------------------------------------------------------------------------
// GeoJSON — departamentos
// ---------------------------------------------------------------------------

export type GeoJSONGeometry = {
  type: string;
  coordinates: unknown;
};

export type DepartmentProperties = {
  name: string;
  slug: string;
  code?: string;
  description?: string;
  center_lat?: number | null;
  center_lng?: number | null;
  is_active?: boolean;
};

export type DepartmentFeature = {
  type: "Feature";
  id: number;
  geometry: GeoJSONGeometry | null;
  properties: DepartmentProperties;
};

export type DepartmentFeatureCollection = {
  type: "FeatureCollection";
  features: DepartmentFeature[];
};

// ---------------------------------------------------------------------------
// GeoJSON — municipios
// ---------------------------------------------------------------------------

export type MunicipalityProperties = {
  name: string;
  slug: string;
  code?: string;
  department_slug: string;
  department?: string;
  center_lat?: number | null;
  center_lng?: number | null;
};

export type MunicipalityFeature = {
  type: "Feature";
  id: number;
  geometry: GeoJSONGeometry | null;
  properties: MunicipalityProperties;
};

export type MunicipalityFeatureCollection = {
  type: "FeatureCollection";
  features: MunicipalityFeature[];
};

// ---------------------------------------------------------------------------
// Map projects — GET /api/v1/investment/projects/?has_location=true
// ---------------------------------------------------------------------------

export type MapInvestmentProject = {
  id: number;
  title: string;
  slug: string;
  sector: MapSector;
  department: MapDepartmentCenter | null;
  municipality: {
    id: number;
    name: string;
    slug: string;
    code: string;
  } | null;
  stage: string;
  investment_amount: string | null;
  estimated_jobs: number | null;
  location: GeoJSON.Point | null;
  latitude: number | null;
  longitude: number | null;
  featured: boolean;
};

export type MapSelectionState = {
  department: DepartmentProperties | null;
  municipality: MunicipalityProperties | null;
  project: MapInvestmentProject | null;
  infrastructure: InfrastructureFeature | null;
};

export type InfrastructureLayer = "port" | "airport";

export type InfrastructurePlace = {
  id: number;
  name: string;
  slug: string;
  code: string;
};

export type InfrastructureProperties = {
  id: number;
  name: string;
  slug: string;
  infrastructure_type: InfrastructureLayer;
  department: InfrastructurePlace | null;
  municipality: InfrastructurePlace | null;
  operator: string;
  status: string;
  source_name: string;
  source_url: string;
};

export type InfrastructureFeature = {
  type: "Feature";
  id?: number;
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: InfrastructureProperties;
};

export type InfrastructureFeatureCollection = {
  type: "FeatureCollection";
  features: InfrastructureFeature[];
};

export type InfrastructureCache = Partial<Record<InfrastructureLayer, InfrastructureFeatureCollection>>;

export function toggleInfrastructureLayer(
  layers: ReadonlySet<InfrastructureLayer>,
  layer: InfrastructureLayer,
): Set<InfrastructureLayer> {
  const next = new Set(layers);
  if (next.has(layer)) next.delete(layer);
  else next.add(layer);
  return next;
}

export function updateInfrastructureCache(
  cache: InfrastructureCache,
  layer: InfrastructureLayer,
  data: InfrastructureFeatureCollection,
): InfrastructureCache {
  if (cache[layer] === data) return cache;
  return { ...cache, [layer]: data };
}

export function selectMapProject(
  state: MapSelectionState,
  project: MapInvestmentProject,
): MapSelectionState {
  return { ...state, project, infrastructure: null };
}

export function selectMapInfrastructure(
  state: MapSelectionState,
  infrastructure: InfrastructureFeature,
): MapSelectionState {
  return { ...state, project: null, infrastructure };
}

export function disableInfrastructureLayer(
  state: MapSelectionState,
  layer: InfrastructureLayer,
): MapSelectionState {
  return state.infrastructure?.properties.infrastructure_type === layer
    ? { ...state, infrastructure: null }
    : state;
}

export function changeMapSector<T extends { activeSector: string; activeInfrastructureLayers: ReadonlySet<InfrastructureLayer> }>(
  state: T,
  activeSector: string,
): T {
  return { ...state, activeSector };
}

export function toLeafletPointPosition(coordinates: [number, number]): [number, number] | null {
  const [longitude, latitude] = coordinates;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return [latitude, longitude];
}

export function hasProjectCoordinates(
  project: Pick<MapInvestmentProject, "latitude" | "longitude">,
): boolean {
  return (
    project.latitude != null &&
    project.longitude != null &&
    Number.isFinite(project.latitude) &&
    Number.isFinite(project.longitude) &&
    project.latitude >= -90 &&
    project.latitude <= 90 &&
    project.longitude >= -180 &&
    project.longitude <= 180
  );
}

export function toLeafletProjectPosition(
  project: Pick<MapInvestmentProject, "latitude" | "longitude">,
): [number, number] | null {
  if (!hasProjectCoordinates(project)) return null;
  return [project.latitude!, project.longitude!];
}

export function filterMapProjectsByMunicipality(
  projects: MapInvestmentProject[],
  municipalitySlug: string | null,
): MapInvestmentProject[] {
  if (!municipalitySlug) return projects;
  return projects.filter((project) => project.municipality?.slug === municipalitySlug);
}

export function filterMapProjectsBySector(
  projects: MapInvestmentProject[],
  sectorSlug: string | null,
): MapInvestmentProject[] {
  if (!sectorSlug) return projects;
  return projects.filter((project) => project.sector.slug === sectorSlug);
}

export function getMarkerProjects(projects: MapInvestmentProject[]): MapInvestmentProject[] {
  return projects.filter(hasProjectCoordinates);
}

export function clearMapProject(state: MapSelectionState): MapSelectionState {
  return { ...state, project: null };
}

export function clearMapMunicipality(state: MapSelectionState): MapSelectionState {
  return { ...state, municipality: null, project: null };
}

export function clearMapDepartment(): MapSelectionState {
  return { department: null, municipality: null, project: null, infrastructure: null };
}

/** Legacy response shape kept for the existing deprecated map component. */
export type DepartmentApiItem = {
  id: number;
  name: string;
  slug: string;
  code: string;
  description: string;
  geometry: GeoJSONGeometry | null;
  center_lat: number | null;
  center_lng: number | null;
  is_active: boolean;
};

/** @deprecated MAP-002 consumes the GeoJSON endpoint directly. */
export function departmentsToFeatureCollection(
  departments: DepartmentApiItem[],
): DepartmentFeatureCollection {
  return {
    type: "FeatureCollection",
    features: departments.filter((dept) => dept.geometry).map((dept) => ({
      type: "Feature" as const,
      id: dept.id,
      geometry: dept.geometry,
      properties: {
        name: dept.name,
        slug: dept.slug,
        code: dept.code,
        description: dept.description,
        center_lat: dept.center_lat,
        center_lng: dept.center_lng,
        is_active: dept.is_active,
      },
    })),
  };
}

// ---------------------------------------------------------------------------
// Map summary — GET /api/v1/investment/map-summary/
// ---------------------------------------------------------------------------

export type MapSector = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color_hex: string;
};

export type MapDepartmentCenter = {
  id: number;
  name: string;
  slug: string;
  code: string;
  center_lat: number | null;
  center_lng: number | null;
};

export type MapDepartmentSummary = {
  department: MapDepartmentCenter;
  projects_count: number;
  opportunities_count: number;
  total_investment: string | null;
  estimated_jobs: number | null;
  sectors: MapSector[];
};

export function hasPublicInvestmentActivity(summary: MapDepartmentSummary | undefined): boolean {
  if (!summary) return false;
  return summary.projects_count + summary.opportunities_count > 0;
}

export function formatMapInvestment(
  value: string | null | undefined,
  locale: "es" | "en" = "es",
): string {
  if (!value) return "—";
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return new Intl.NumberFormat(locale === "es" ? "es-HN" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatMapJobs(value: number | null | undefined, locale: "es" | "en" = "es"): string {
  if (value == null) return "—";
  return new Intl.NumberFormat(locale === "es" ? "es-HN" : "en-US").format(value);
}

export function indexSummaries(
  summaries: MapDepartmentSummary[],
): Map<string, MapDepartmentSummary> {
  return new Map(summaries.map((summary) => [summary.department.slug, summary]));
}

export function getMapTotals(summaries: MapDepartmentSummary[]) {
  return summaries.reduce(
    (totals, item) => ({
      projects: totals.projects + item.projects_count,
      opportunities: totals.opportunities + item.opportunities_count,
      jobs: totals.jobs + (item.estimated_jobs ?? 0),
      investment: totals.investment + Number(item.total_investment ?? 0),
    }),
    { projects: 0, opportunities: 0, jobs: 0, investment: 0 },
  );
}
