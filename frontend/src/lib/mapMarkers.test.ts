import { describe, expect, it } from "vitest";
import { assignSeedDepartments, groupMarkersByPosition } from "@/src/lib/mapMarkers";
import { getSeedMapProjects } from "@/src/lib/portfolioCatalog";
import {
  filterMapProjectsByDepartment,
  findMapItemByQuery,
  parseMapQueryState,
  type DepartmentFeature,
  type MapInvestmentProject,
} from "@/src/lib/types/investment-map";

function boxDepartment(
  id: number,
  slug: string,
  name: string,
  west: number,
  south: number,
  east: number,
  north: number,
): DepartmentFeature {
  return {
    type: "Feature",
    id,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [west, south],
          [east, south],
          [east, north],
          [west, north],
          [west, south],
        ],
      ],
    },
    properties: { slug, name, code: String(id) },
  };
}

const TEST_DEPARTMENTS: DepartmentFeature[] = [
  boxDepartment(1, "atlantida", "Atlántida", -88.2, 15.4, -86.9, 16.05),
  boxDepartment(6, "choluteca", "Choluteca", -87.6, 12.9, -86.8, 13.6),
  boxDepartment(11, "islas-de-la-bahia", "Islas de la Bahía", -87.0, 16.15, -85.8, 16.55),
  boxDepartment(5, "cortes", "Cortés", -88.4, 14.7, -87.5, 15.9),
];

function point(partial: Partial<MapInvestmentProject> & { slug: string; latitude: number; longitude: number }): MapInvestmentProject {
  return {
    id: partial.id ?? partial.slug.length,
    title: partial.title ?? partial.slug,
    slug: partial.slug,
    sector: partial.sector ?? { id: 1, name: "Turismo", slug: "turismo", icon: "", color_hex: "#0E7A7C" },
    department: partial.department ?? null,
    municipality: partial.municipality ?? null,
    stage: partial.stage ?? "",
    investment_amount: partial.investment_amount ?? "1",
    estimated_jobs: null,
    location: { type: "Point", coordinates: [partial.longitude, partial.latitude] },
    latitude: partial.latitude,
    longitude: partial.longitude,
    featured: false,
    kind: partial.kind ?? "project",
  };
}

describe("assignSeedDepartments", () => {
  it("assigns Tela to Atlántida, Choluteca to Choluteca, and Roatán to Islas de la Bahía", () => {
    const seed = getSeedMapProjects();
    const assigned = assignSeedDepartments(seed, TEST_DEPARTMENTS);
    expect(assigned.find((item) => item.slug.includes("bahia-de-tela"))?.department).toMatchObject({
      slug: "atlantida",
      name: "Atlántida",
    });
    expect(assigned.find((item) => item.slug === "centro-de-convenciones-zona-sur")?.department).toMatchObject({
      slug: "choluteca",
      name: "Choluteca",
    });
    expect(assigned.find((item) => item.slug === "sky-legacy-tower")?.department).toMatchObject({
      slug: "islas-de-la-bahia",
      name: "Islas de la Bahía",
    });
  });

  it("falls back to the nearest centroid when a point is outside every polygon", () => {
    const offshore = point({
      slug: "costa-fuera",
      latitude: 16.48,
      longitude: -85.7,
    });
    const [assigned] = assignSeedDepartments([offshore], TEST_DEPARTMENTS);
    expect(assigned.department?.slug).toBe("islas-de-la-bahia");
  });
});

describe("groupMarkersByPosition", () => {
  it("groups points that share the same rounded coordinate into one cluster", () => {
    const items = [
      point({ slug: "b-sheet", latitude: 14.99614, longitude: -87.84239 }),
      point({ slug: "a-sheet", latitude: 14.99614, longitude: -87.84239 }),
      point({ slug: "solo", latitude: 15.5, longitude: -88.0 }),
    ];
    const groups = groupMarkersByPosition(items);
    expect(groups).toHaveLength(2);
    const clustered = groups.find((group) => group.items.length === 2);
    expect(clustered?.items.map((item) => item.slug)).toEqual(["a-sheet", "b-sheet"]);
    expect(groups.find((group) => group.items.length === 1)?.items[0].slug).toBe("solo");
  });

  it("returns a stable grouping for the same input", () => {
    const items = [
      point({ slug: "zeta", latitude: 14.996141, longitude: -87.842389 }),
      point({ slug: "alpha", latitude: 14.996139, longitude: -87.842391 }),
    ];
    expect(groupMarkersByPosition(items)).toEqual(groupMarkersByPosition([...items].reverse()));
  });
});

describe("department filter on the merged catalog", () => {
  it("keeps only sheets whose assigned department slug matches", () => {
    const merged = assignSeedDepartments(getSeedMapProjects(), TEST_DEPARTMENTS);
    const cortes = filterMapProjectsByDepartment(merged, "cortes");
    const choluteca = filterMapProjectsByDepartment(merged, "choluteca");
    expect(cortes.every((item) => item.department?.slug === "cortes")).toBe(true);
    expect(cortes.some((item) => item.slug.includes("tela"))).toBe(false);
    expect(choluteca.length).toBeGreaterThan(0);
    expect(choluteca.every((item) => item.department?.slug === "choluteca")).toBe(true);
    expect(filterMapProjectsByDepartment(merged, "olancho")).toEqual([]);
  });
});

describe("map deep links", () => {
  it("parses ?opportunity= and finds the matching sheet in the merged set", () => {
    expect(parseMapQueryState({ opportunity: "complejo-ecoturistico-el-cajon" })).toMatchObject({
      opportunity: "complejo-ecoturistico-el-cajon",
      project: null,
    });
    const seed = getSeedMapProjects();
    const found = findMapItemByQuery(seed, { opportunity: "complejo-ecoturistico-el-cajon" });
    expect(found?.slug).toBe("complejo-ecoturistico-el-cajon");
    expect(found?.kind).toBe("opportunity");
  });
});
