import { apiGet } from "@/src/lib/api";
import {
  getGeolocatedMapProjects,
  getMapSummary,
  getSectors,
} from "@/src/services/investment";
import type {
  DepartmentFeatureCollection,
  MapDepartmentSummary,
  MapInvestmentProject,
  MunicipalityFeatureCollection,
  InfrastructureFeatureCollection,
  InfrastructureLayer,
} from "@/src/lib/types/investment-map";
import type { Sector } from "@/src/types/investment";

export function getDepartmentGeoJson(): Promise<DepartmentFeatureCollection> {
  return apiGet<DepartmentFeatureCollection>("/geo/departments/geojson/");
}

export function getMunicipalityGeoJson(
  departmentSlug: string,
): Promise<MunicipalityFeatureCollection> {
  const params = new URLSearchParams({ department: departmentSlug });
  return apiGet<MunicipalityFeatureCollection>(
    `/geo/municipalities/geojson/?${params.toString()}`,
  );
}

export function getInfrastructureGeoJson(
  type: InfrastructureLayer,
  locale: "es" | "en",
): Promise<InfrastructureFeatureCollection> {
  const params = new URLSearchParams({ type, lang: locale });
  return apiGet<InfrastructureFeatureCollection>(`/geo/infrastructure/geojson/?${params.toString()}`);
}

export { getGeolocatedMapProjects, getMapSummary, getSectors };
export type {
  DepartmentFeatureCollection,
  MapDepartmentSummary,
  MapInvestmentProject,
  MunicipalityFeatureCollection,
  Sector,
};
