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
};

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
  return { department: null, municipality: null, project: null };
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
