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
// GeoJSON — regiones territoriales
// ---------------------------------------------------------------------------

export type TerritorialRegionLevel = "macro" | "sub" | "polo";

export type PoloType = "Consolidado" | "Detonante" | "Potencial";

export type TerritorialRegionProperties = {
  code: string;
  name: string;
  level: TerritorialRegionLevel;
  color: string;
  extra: {
    tipo?: PoloType;
    subregiones?: string[];
    approximate?: boolean;
    source?: string;
  };
};

export type TerritorialRegionFeature = {
  type: "Feature";
  id: number;
  geometry: GeoJSONGeometry | null;
  properties: TerritorialRegionProperties;
};

export type TerritorialRegionFeatureCollection = {
  type: "FeatureCollection";
  features: TerritorialRegionFeature[];
};

export type RegionLegendItem = { key: string; label: string; color: string };

/** Polos share a color per tipo; macro/sub regions have one color each. */
export function getRegionLegendItems(
  features: TerritorialRegionFeature[],
  poloTypeLabels: Record<PoloType, string>,
): RegionLegendItem[] {
  const items = new Map<string, RegionLegendItem>();
  for (const { properties } of features) {
    if (properties.level === "polo") {
      const tipo = properties.extra.tipo;
      if (tipo && !items.has(tipo)) items.set(tipo, { key: tipo, label: poloTypeLabels[tipo] ?? tipo, color: properties.color });
    } else {
      items.set(properties.code, { key: properties.code, label: `${properties.code} · ${properties.name}`, color: properties.color });
    }
  }
  return Array.from(items.values());
}

type Ring = [number, number][];

function ringContains(ring: Ring, lng: number, lat: number): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function ringArea(ring: Ring): number {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) sum += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  return Math.abs(sum) / 2;
}

/**
 * Regions are unions of municipality boundaries that do not tile perfectly, leaving thousands
 * of sliver holes (< 1e-4 deg²) drawn as stray lines. Real holes (lagoons, enclaves) are
 * ≥ 1e-3 deg², so anything smaller is dropped.
 */
export const REGION_MIN_HOLE_AREA = 1e-3;

export function stripRegionSlivers(
  collection: TerritorialRegionFeatureCollection,
  minHoleArea = REGION_MIN_HOLE_AREA,
): TerritorialRegionFeatureCollection {
  const cleanPolygon = ([outer, ...holes]: Ring[]) => [outer, ...holes.filter((hole) => ringArea(hole) >= minHoleArea)];
  return {
    ...collection,
    features: collection.features.map((feature) => {
      const { geometry } = feature;
      if (geometry?.type === "Polygon") {
        return { ...feature, geometry: { ...geometry, coordinates: cleanPolygon(geometry.coordinates as Ring[]) } };
      }
      if (geometry?.type === "MultiPolygon") {
        return { ...feature, geometry: { ...geometry, coordinates: (geometry.coordinates as Ring[][]).map(cleanPolygon) } };
      }
      return feature;
    }),
  };
}

/** Point-in-polygon for GeoJSON Polygon/MultiPolygon, honoring holes. */
export function geometryContainsPoint(geometry: GeoJSONGeometry | null, lng: number, lat: number): boolean {
  if (!geometry) return false;
  const polygons =
    geometry.type === "Polygon"
      ? [geometry.coordinates as Ring[]]
      : geometry.type === "MultiPolygon"
        ? (geometry.coordinates as Ring[][])
        : [];
  return polygons.some(
    ([outer, ...holes]) =>
      Boolean(outer) && ringContains(outer, lng, lat) && !holes.some((hole) => ringContains(hole, lng, lat)),
  );
}

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

export type MapItemKind = "project" | "opportunity";

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
  kind?: MapItemKind;
  code?: string | null;
  coverImageUrl?: string | null;
  amountText?: string | null;
  municipio_geocode?: string | null;
  locationText?: string | null;
};

export type MapKindFilter = "all" | MapItemKind;

export type MapMarkerGroup = {
  key: string;
  latitude: number;
  longitude: number;
  items: MapInvestmentProject[];
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
  description?: string;
  details?: InfrastructureDetails;
};

export type PortCategory = "principal" | "secundario" | "cruceros" | "cabotaje";

/** Display-only subset of the backend metadata; Spanish values with optional `_en` variants. */
export type InfrastructureDetails = {
  name_en?: string;
  category?: PortCategory | string;
  coast?: string;
  coast_en?: string;
  description_en?: string;
  source_name_en?: string;
  coords_verified?: boolean;
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

export type RoadClass = "primaria" | "secundaria";

export type RoadCorridorProperties = {
  id: number;
  code: string;
  ref: string;
  name: string;
  road_class: RoadClass;
  length_km: number;
  is_strategic: boolean;
  description: string;
  source_name: string;
  source_url: string;
};

export type RoadCorridorFeature = {
  type: "Feature";
  id?: number;
  geometry: { type: "MultiLineString"; coordinates: [number, number][][] } | null;
  properties: RoadCorridorProperties;
};

export type RoadCorridorFeatureCollection = {
  type: "FeatureCollection";
  features: RoadCorridorFeature[];
};

/** "CA-5 · Corredor del Caribe · 478 km"; the ref is skipped when the name already starts with it. */
export function formatRoadLabel(properties: Pick<RoadCorridorProperties, "ref" | "name" | "length_km">): string {
  const parts = properties.ref && !properties.name.startsWith(properties.ref)
    ? [properties.ref, properties.name]
    : [properties.name];
  if (properties.length_km > 0) parts.push(`${properties.length_km} km`);
  return parts.join(" · ");
}

export type MapQueryState = {
  sector: string | null;
  department: string | null;
  municipality: string | null;
  project: string | null;
  opportunity: string | null;
  regionLevel: TerritorialRegionLevel | null;
  /** Region `code` (R-01, M-03, copan…), only meaningful together with `regionLevel`. */
  region: string | null;
};

export type MapSearchResult =
  | { type: "department"; id: string; label: string; department: DepartmentProperties }
  | { type: "municipality"; id: string; label: string; municipality: MunicipalityProperties }
  | { type: "project"; id: string; label: string; project: MapInvestmentProject };

const QUERY_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const QUERY_REGION_CODE = /^[A-Za-z0-9-]+$/;
export const TERRITORIAL_REGION_LEVELS: readonly TerritorialRegionLevel[] = ["macro", "sub", "polo"];

export function normalizeMapSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim().replace(/\s+/g, " ");
}

function searchRank(label: string, query: string): number {
  const normalized = normalizeMapSearch(label);
  if (normalized === query) return 0;
  if (normalized.startsWith(query) || normalized.split(/\s+/).some((word) => word.startsWith(query))) return 1;
  if (normalized.includes(query)) return 2;
  return -1;
}

export function searchInvestmentMap(
  query: string,
  departments: DepartmentProperties[],
  municipalities: MunicipalityProperties[] = [],
  projects: MapInvestmentProject[] = [],
  limit = 8,
): MapSearchResult[] {
  const normalizedQuery = normalizeMapSearch(query);
  if (!normalizedQuery || limit <= 0) return [];
  const candidates: MapSearchResult[] = [
    ...departments.map((department) => ({ type: "department" as const, id: `department-${department.slug}`, label: department.name, department })),
    ...municipalities.map((municipality) => ({ type: "municipality" as const, id: `municipality-${municipality.slug}`, label: municipality.name, municipality })),
    ...projects.map((project) => ({ type: "project" as const, id: `project-${project.slug}`, label: project.title, project })),
  ];
  const groupOrder = { department: 0, municipality: 1, project: 2 } as const;
  return candidates
    .map((result, order) => ({ result, order, rank: searchRank(result.label, normalizedQuery) }))
    .filter((item) => item.rank >= 0)
    .sort((a, b) => groupOrder[a.result.type] - groupOrder[b.result.type] || a.rank - b.rank || a.order - b.order)
    .slice(0, limit)
    .map(({ result }) => result);
}

export function parseMapQueryState(input: Record<string, string | string[] | undefined>): MapQueryState {
  const read = (key: keyof MapQueryState, pattern = QUERY_SLUG) => {
    const value = input[key];
    return typeof value === "string" && pattern.test(value) ? value : null;
  };
  const levelValue = read("regionLevel");
  const regionLevel = TERRITORIAL_REGION_LEVELS.find((level) => level === levelValue) ?? null;
  const region = regionLevel ? read("region", QUERY_REGION_CODE) : null;
  return {
    sector: read("sector"),
    department: region ? null : read("department"),
    municipality: region ? null : read("municipality"),
    project: read("project"),
    opportunity: read("opportunity"),
    regionLevel,
    region,
  };
}

export function serializeMapQueryState(current: URLSearchParams, state: MapQueryState): string {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(state)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  next.delete("q");
  return next.toString();
}

export function getMapVisibleCounts(visibleProjects: number, loadedMunicipalities: number, activeLayers: number) {
  return { visibleProjects, loadedMunicipalities, activeLayers };
}

export function resetMapFilters<T extends {
  activeSector: string;
  department: DepartmentProperties | null;
  municipality: MunicipalityProperties | null;
  project: MapInvestmentProject | null;
  selectedInfrastructure: InfrastructureFeature | null;
  search: string;
  activeInfrastructureLayers: ReadonlySet<InfrastructureLayer>;
  infrastructureCache: InfrastructureCache;
}>(state: T): T {
  return {
    ...state,
    activeSector: "all",
    department: null,
    municipality: null,
    project: null,
    selectedInfrastructure: null,
    search: "",
  };
}

export function toggleInfrastructureLayer(
  layers: ReadonlySet<InfrastructureLayer>,
  layer: InfrastructureLayer,
): Set<InfrastructureLayer> {
  const next = new Set(layers);
  if (next.has(layer)) next.delete(layer);
  else next.add(layer);
  return next;
}

export const INFRASTRUCTURE_LAYERS: readonly InfrastructureLayer[] = ["airport", "port"];

/** Labels of the active layers in the fixed checkbox order, for the filters chip. */
export function getActiveInfrastructureLabels(
  layers: ReadonlySet<InfrastructureLayer>,
  labels: Record<InfrastructureLayer, string> & { roads?: string },
  roadsActive = false,
): string[] {
  const active = INFRASTRUCTURE_LAYERS.filter((layer) => layers.has(layer)).map((layer) => labels[layer]);
  return roadsActive && labels.roads ? [...active, labels.roads] : active;
}

export type LocalizedInfrastructure = {
  name: string;
  coast: string;
  description: string;
  sourceName: string;
};

export function localizeInfrastructure(
  properties: Pick<InfrastructureProperties, "name" | "description" | "details"> & { source_name?: string },
  locale: "es" | "en",
): LocalizedInfrastructure {
  const details = properties.details ?? {};
  const en = locale === "en";
  return {
    name: (en && details.name_en) || properties.name,
    coast: (en && details.coast_en) || details.coast || "",
    description: (en && details.description_en) || properties.description || "",
    sourceName: (en && details.source_name_en) || properties.source_name || "",
  };
}

/**
 * Fetches each layer at most once: nothing is requested until `load` is called, concurrent
 * calls share the in-flight request and a failed request can be retried.
 */
export function createLazyLayerLoader<K extends string, T>(fetchLayer: (key: K) => Promise<T>) {
  const loaded = new Map<K, T>();
  const pending = new Map<K, Promise<T>>();
  return {
    get: (key: K): T | undefined => loaded.get(key),
    /** Returns the new request, or null when the layer is already loaded or loading. */
    load(key: K): Promise<T> | null {
      if (loaded.has(key) || pending.has(key)) return null;
      const request = fetchLayer(key)
        .then((data) => {
          loaded.set(key, data);
          return data;
        })
        .finally(() => pending.delete(key));
      pending.set(key, request);
      return request;
    },
  };
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

export function getProjectFocus(
  project: Pick<MapInvestmentProject, "id" | "latitude" | "longitude"> | null,
): { position: [number, number]; key: number } | null {
  if (!project) return null;
  const position = toLeafletProjectPosition(project);
  return position ? { position, key: project.id } : null;
}

export function filterMapProjectsByMunicipality(
  projects: MapInvestmentProject[],
  municipalitySlug: string | null,
): MapInvestmentProject[] {
  if (!municipalitySlug) return projects;
  return projects.filter((project) => project.municipality?.slug === municipalitySlug);
}

export function filterMapProjectsByDepartment(
  projects: MapInvestmentProject[],
  departmentSlug: string | null,
): MapInvestmentProject[] {
  if (!departmentSlug) return projects;
  return projects.filter((project) => project.department?.slug === departmentSlug);
}

export function filterMapProjectsByKind(
  projects: MapInvestmentProject[],
  kind: MapKindFilter | null,
): MapInvestmentProject[] {
  if (!kind || kind === "all") return projects;
  return projects.filter((project) => (project.kind ?? "project") === kind);
}

export function sortMapProjectsByAmount(projects: MapInvestmentProject[]): MapInvestmentProject[] {
  return [...projects].sort((a, b) => {
    const amountA = Number(a.investment_amount) || 0;
    const amountB = Number(b.investment_amount) || 0;
    if (amountB !== amountA) return amountB - amountA;
    return a.slug.localeCompare(b.slug);
  });
}

export function findMapItemByQuery(
  projects: MapInvestmentProject[],
  query: { project?: string | null; opportunity?: string | null },
): MapInvestmentProject | null {
  if (query.opportunity) {
    return (
      projects.find((item) => item.slug === query.opportunity && (item.kind ?? "project") === "opportunity") ??
      projects.find((item) => item.slug === query.opportunity) ??
      null
    );
  }
  if (query.project) {
    return projects.find((item) => item.slug === query.project) ?? null;
  }
  return null;
}

export function filterMapProjectsBySector(
  projects: MapInvestmentProject[],
  sectorSlug: string | null,
): MapInvestmentProject[] {
  if (!sectorSlug) return projects;
  return projects.filter((project) => project.sector.slug === sectorSlug);
}

export function filterMapProjectsByRegion(
  projects: MapInvestmentProject[],
  region: Pick<TerritorialRegionFeature, "geometry"> | null,
): MapInvestmentProject[] {
  if (!region) return projects;
  return projects.filter(
    (project) => hasProjectCoordinates(project) && geometryContainsPoint(region.geometry, project.longitude!, project.latitude!),
  );
}

/** Sum of declared investment; null when no project declares an amount. */
export function getProjectsInvestmentTotal(projects: Pick<MapInvestmentProject, "investment_amount">[]): number | null {
  let total: number | null = null;
  for (const { investment_amount } of projects) {
    const amount = Number(investment_amount);
    if (investment_amount == null || investment_amount === "" || Number.isNaN(amount)) continue;
    total = (total ?? 0) + amount;
  }
  return total;
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
