import { apiGet } from "@/src/lib/api";
import type {
  TerritorialRegionFeatureCollection,
  TerritorialRegionLevel,
} from "@/src/lib/types/investment-map";

export function getTerritorialRegionsGeoJson(
  level: TerritorialRegionLevel,
): Promise<TerritorialRegionFeatureCollection> {
  const params = new URLSearchParams({ level });
  return apiGet<TerritorialRegionFeatureCollection>(`/geo/regions/geojson/?${params.toString()}`);
}

export type { TerritorialRegionFeatureCollection, TerritorialRegionLevel };
