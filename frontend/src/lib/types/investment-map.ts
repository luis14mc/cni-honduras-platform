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
  geometry: GeoJSONGeometry | null;
  properties: DepartmentProperties;
};

export type DepartmentFeatureCollection = {
  type: "FeatureCollection";
  features: DepartmentFeature[];
};

/** Respuesta cruda de GET /api/v1/geo/departments/ */
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

export function departmentsToFeatureCollection(
  departments: DepartmentApiItem[],
): DepartmentFeatureCollection {
  return {
    type: "FeatureCollection",
    features: departments
      .filter((dept) => dept.geometry)
      .map((dept) => ({
        type: "Feature" as const,
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

export function formatMapInvestment(value: string | null | undefined): string {
  if (!value) return "—";
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatMapJobs(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("es-HN").format(value);
}
