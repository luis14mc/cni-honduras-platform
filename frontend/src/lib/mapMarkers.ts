import type {
  DepartmentFeature,
  MapInvestmentProject,
  MapMarkerGroup,
  MunicipalityFeature,
} from "@/src/lib/types/investment-map";
import { geometryContainsPoint, hasProjectCoordinates } from "@/src/lib/types/investment-map";

type Ring = [number, number][];

export function roundCoordKey(latitude: number, longitude: number): string {
  return `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
}

export function groupMarkersByPosition(items: MapInvestmentProject[]): MapMarkerGroup[] {
  const buckets = new Map<string, MapInvestmentProject[]>();
  const ordered = [...items].filter(hasProjectCoordinates).sort((a, b) => a.slug.localeCompare(b.slug));
  for (const item of ordered) {
    const key = roundCoordKey(item.latitude!, item.longitude!);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(item);
    else buckets.set(key, [item]);
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, groupItems]) => {
      const [latText, lngText] = key.split(",");
      return {
        key,
        latitude: Number(latText),
        longitude: Number(lngText),
        items: groupItems,
      };
    });
}

function ringCentroid(ring: Ring): [number, number] | null {
  const closed = ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1];
  const pts = closed ? ring.slice(0, -1) : ring;
  if (!pts.length) return null;
  let lng = 0;
  let lat = 0;
  for (const [x, y] of pts) {
    lng += x;
    lat += y;
  }
  return [lng / pts.length, lat / pts.length];
}

function geometryCentroid(geometry: DepartmentFeature["geometry"]): [number, number] | null {
  if (!geometry) return null;
  const rings: Ring[] =
    geometry.type === "Polygon"
      ? [(geometry.coordinates as Ring[])[0]]
      : geometry.type === "MultiPolygon"
        ? (geometry.coordinates as Ring[][]).map((polygon) => polygon[0])
        : [];
  const centroids = rings.map(ringCentroid).filter((item): item is [number, number] => Boolean(item));
  if (!centroids.length) return null;
  let lng = 0;
  let lat = 0;
  for (const [x, y] of centroids) {
    lng += x;
    lat += y;
  }
  return [lng / centroids.length, lat / centroids.length];
}

function distanceSq(lng1: number, lat1: number, lng2: number, lat2: number): number {
  const dx = lng1 - lng2;
  const dy = lat1 - lat2;
  return dx * dx + dy * dy;
}

function nearestDepartment(lng: number, lat: number, departments: DepartmentFeature[]): DepartmentFeature | null {
  let best: DepartmentFeature | null = null;
  let bestDist = Infinity;
  for (const feature of departments) {
    const centroid = geometryCentroid(feature.geometry);
    if (!centroid) continue;
    const dist = distanceSq(lng, lat, centroid[0], centroid[1]);
    if (dist < bestDist) {
      bestDist = dist;
      best = feature;
    }
  }
  return best;
}

function departmentCodeKey(value: string | undefined): string {
  return (value || "").replace(/\D/g, "").padStart(2, "0");
}

function departmentByGeocode(
  geocode: string | null | undefined,
  departments: DepartmentFeature[],
): DepartmentFeature | null {
  const prefix = departmentCodeKey((geocode || "").slice(0, 2));
  if (!prefix || prefix === "00") return null;
  return (
    departments.find((feature) => departmentCodeKey(feature.properties.code) === prefix) ?? null
  );
}

function municipalityByGeocode(
  geocode: string | null | undefined,
  municipalities: MunicipalityFeature[],
): MunicipalityFeature | null {
  if (!geocode) return null;
  return municipalities.find((feature) => (feature.properties.code || "") === geocode) ?? null;
}

export function assignSeedDepartments(
  items: MapInvestmentProject[],
  departments: DepartmentFeature[],
): MapInvestmentProject[] {
  if (!departments.length) return items;
  return items.map((item) => {
    if (item.department?.slug || !hasProjectCoordinates(item)) return item;
    const lng = item.longitude!;
    const lat = item.latitude!;
    const containing =
      departments.find((feature) => geometryContainsPoint(feature.geometry, lng, lat)) ??
      departmentByGeocode(item.municipio_geocode, departments) ??
      nearestDepartment(lng, lat, departments);
    if (!containing) return item;
    return {
      ...item,
      department: {
        id: containing.id,
        name: containing.properties.name,
        slug: containing.properties.slug,
        code: containing.properties.code ?? "",
        center_lat: containing.properties.center_lat ?? null,
        center_lng: containing.properties.center_lng ?? null,
      },
    };
  });
}

export function assignSeedMunicipalities(
  items: MapInvestmentProject[],
  municipalities: MunicipalityFeature[],
): MapInvestmentProject[] {
  if (!municipalities.length) return items;
  return items.map((item) => {
    if (item.municipality?.slug || !hasProjectCoordinates(item)) return item;
    const lng = item.longitude!;
    const lat = item.latitude!;
    const containing =
      municipalities.find((feature) => geometryContainsPoint(feature.geometry, lng, lat)) ??
      municipalityByGeocode(item.municipio_geocode, municipalities);
    if (!containing) return item;
    return {
      ...item,
      municipality: {
        id: containing.id,
        name: containing.properties.name,
        slug: containing.properties.slug,
        code: containing.properties.code || item.municipio_geocode || "",
      },
    };
  });
}
