import { apiGet } from "@/src/lib/api";
import { getMapSummary, getProjectsByDepartment, getSectors } from "@/src/services/investment";
import type { DepartmentFeatureCollection } from "@/src/lib/types/investment-map";
import type { InvestmentProject, Sector } from "@/src/types/investment";
import type { MapDepartmentSummary } from "@/src/lib/types/investment-map";

export function getDepartmentGeoJson(): Promise<DepartmentFeatureCollection> {
  return apiGet<DepartmentFeatureCollection>("/geo/departments/geojson/");
}

export { getMapSummary, getProjectsByDepartment, getSectors };
export type { DepartmentFeatureCollection, InvestmentProject, MapDepartmentSummary, Sector };
