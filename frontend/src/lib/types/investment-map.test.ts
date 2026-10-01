import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { investmentMapCopy } from "@/src/i18n/copy/investmentMap";
import {
  clearMapDepartment,
  clearMapMunicipality,
  clearMapProject,
  filterMapProjectsByMunicipality,
  filterMapProjectsBySector,
  formatMapInvestment,
  formatMapJobs,
  getMapTotals,
  getMarkerProjects,
  hasProjectCoordinates,
  indexSummaries,
  toLeafletProjectPosition,
  changeMapSector,
  disableInfrastructureLayer,
  selectMapInfrastructure,
  selectMapProject,
  toLeafletPointPosition,
  toggleInfrastructureLayer,
  updateInfrastructureCache,
  getMapVisibleCounts,
  getProjectFocus,
  normalizeMapSearch,
  parseMapQueryState,
  resetMapFilters,
  searchInvestmentMap,
  serializeMapQueryState,
  geometryContainsPoint,
  getRegionLegendItems,
  filterMapProjectsByRegion,
  getProjectsInvestmentTotal,
  stripRegionSlivers,
  createLazyLayerLoader,
  getActiveInfrastructureLabels,
  localizeInfrastructure,
  type TerritorialRegionFeatureCollection,
  type TerritorialRegionFeature,
  type InfrastructureFeature,
  type MapInvestmentProject,
  type MapDepartmentSummary,
  type MapSelectionState,
} from "@/src/lib/types/investment-map";

const summary = (slug: string, projects_count: number, total_investment: string | null): MapDepartmentSummary => ({
  department: { id: projects_count, name: slug, slug, code: "", center_lat: null, center_lng: null },
  projects_count,
  opportunities_count: 1,
  total_investment,
  estimated_jobs: projects_count * 10,
  sectors: [],
});

const mapProject = (
  slug: string,
  municipalitySlug: string | null,
  latitude: number | null,
): MapInvestmentProject => ({
  id: slug.length,
  title: slug,
  slug,
  sector: { id: 1, name: "Turismo", slug: "turismo", icon: "leaf", color_hex: "#32B372" },
  department: { id: 1, name: "Cortés", slug: "cortes", code: "05", center_lat: null, center_lng: null },
  municipality: municipalitySlug
    ? { id: 1, name: municipalitySlug, slug: municipalitySlug, code: "0501" }
    : null,
  stage: "promotion",
  investment_amount: "100",
  estimated_jobs: 10,
  location: latitude == null ? null : { type: "Point", coordinates: [-87.2, latitude] },
  latitude,
  longitude: latitude == null ? null : -87.2,
  featured: false,
});

describe("investment map pure helpers", () => {
  const infrastructure: InfrastructureFeature = {
    type: "Feature",
    geometry: { type: "Point", coordinates: [-87.9, 15.8] },
    properties: { id: 7, name: "Puerto", slug: "puerto", infrastructure_type: "port", department: null, municipality: null, operator: "ENP", status: "active", source_name: "CNI", source_url: "https://example.com" },
  };

  it("toggles infrastructure layers without mutating the source set", () => {
    const source = new Set<"port" | "airport">(["port"]);
    expect(toggleInfrastructureLayer(source, "airport")).toEqual(new Set(["port", "airport"]));
    expect(toggleInfrastructureLayer(source, "port")).toEqual(new Set());
    expect(source).toEqual(new Set(["port"]));
  });

  it("caches each infrastructure response once and preserves other layers", () => {
    const data = { type: "FeatureCollection" as const, features: [infrastructure] };
    const cache = updateInfrastructureCache({}, "port", data);
    expect(updateInfrastructureCache(cache, "port", data)).toBe(cache);
    expect(updateInfrastructureCache(cache, "airport", { ...data })).toMatchObject({ port: data, airport: data });
  });

  it("keeps project and infrastructure selections mutually exclusive", () => {
    const state: MapSelectionState = { department: null, municipality: null, project: null, infrastructure };
    const project = mapProject("p", null, 15.5);
    expect(selectMapProject(state, project)).toMatchObject({ project, infrastructure: null });
    expect(selectMapInfrastructure({ ...state, project }, infrastructure)).toMatchObject({ project: null, infrastructure });
  });

  it("converts infrastructure Point coordinates to Leaflet order", () => {
    expect(toLeafletPointPosition([-87.9, 15.8])).toEqual([15.8, -87.9]);
    expect(toLeafletPointPosition([-181, 15.8])).toBeNull();
  });

  it("clears selected infrastructure only when its layer is disabled", () => {
    const state: MapSelectionState = { department: null, municipality: null, project: null, infrastructure };
    expect(disableInfrastructureLayer(state, "airport")).toBe(state);
    expect(disableInfrastructureLayer(state, "port").infrastructure).toBeNull();
  });

  it("requests ports only once their layer is activated, and only once", async () => {
    const fetchLayer = vi.fn(async (layer: "port" | "airport") => ({ type: "FeatureCollection" as const, features: layer === "port" ? [infrastructure] : [] }));
    const loader = createLazyLayerLoader(fetchLayer);
    expect(fetchLayer).not.toHaveBeenCalled();

    expect(loader.load("airport")).not.toBeNull();
    expect(fetchLayer).toHaveBeenCalledTimes(1);
    expect(fetchLayer).not.toHaveBeenCalledWith("port");

    const request = loader.load("port");
    expect(loader.load("port")).toBeNull();
    await expect(request).resolves.toMatchObject({ features: [infrastructure] });
    expect(loader.load("port")).toBeNull();
    expect(loader.get("port")?.features).toHaveLength(1);
    expect(fetchLayer.mock.calls.filter(([layer]) => layer === "port")).toHaveLength(1);
  });

  it("allows retrying a layer whose request failed", async () => {
    const fetchLayer = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce("ok");
    const loader = createLazyLayerLoader<"port", string>(fetchLayer);
    await expect(loader.load("port")).rejects.toThrow("offline");
    await expect(loader.load("port")).resolves.toBe("ok");
    expect(fetchLayer).toHaveBeenCalledTimes(2);
  });

  it("lists only the active infrastructure layers in the filters chip", () => {
    const labels = { airport: "Aeropuertos", port: "Puertos" };
    expect(getActiveInfrastructureLabels(new Set(), labels)).toEqual([]);
    expect(getActiveInfrastructureLabels(new Set(["port"]), labels)).toEqual(["Puertos"]);
    expect(getActiveInfrastructureLabels(new Set(["airport"]), labels)).toEqual(["Aeropuertos"]);
    expect(getActiveInfrastructureLabels(new Set(["port", "airport"]), labels)).toEqual(["Aeropuertos", "Puertos"]);
  });

  it("localizes port name, coast and description with Spanish fallback", () => {
    const port = {
      name: "Puerto Cortés",
      description: "Principal puerto",
      source_name: "CNI – curaduría",
      details: { name_en: "Port of Puerto Cortés", coast: "Caribe", coast_en: "Caribbean", description_en: "Leading port", source_name_en: "CNI – curation", category: "principal" },
    };
    expect(localizeInfrastructure(port, "es")).toEqual({ name: "Puerto Cortés", coast: "Caribe", description: "Principal puerto", sourceName: "CNI – curaduría" });
    expect(localizeInfrastructure(port, "en")).toEqual({ name: "Port of Puerto Cortés", coast: "Caribbean", description: "Leading port", sourceName: "CNI – curation" });
    expect(localizeInfrastructure({ name: "Toncontín Airport", source_name: "OurAirports" }, "en")).toEqual({ name: "Toncontín Airport", coast: "", description: "", sourceName: "OurAirports" });
    expect(Object.keys(investmentMapCopy.en.portCategories)).toEqual(Object.keys(investmentMapCopy.es.portCategories));
  });

  it("changes sector without modifying active infrastructure layers", () => {
    const layers = new Set<"port" | "airport">(["port"]);
    const next = changeMapSector({ activeSector: "all", activeInfrastructureLayers: layers }, "tourism");
    expect(next.activeSector).toBe("tourism");
    expect(next.activeInfrastructureLayers).toBe(layers);
  });
  it("indexes map summaries by department slug", () => {
    const indexed = indexSummaries([summary("cortes", 2, "100"), summary("atlantida", 1, null)]);
    expect(indexed.get("cortes")?.projects_count).toBe(2);
    expect(indexed.has("francisco-morazan")).toBe(false);
  });

  it("calculates filtered map totals without inventing null values", () => {
    expect(getMapTotals([summary("cortes", 2, "100"), summary("atlantida", 1, null)])).toEqual({
      projects: 3,
      opportunities: 2,
      jobs: 30,
      investment: 100,
    });
  });

  it("formats currency and jobs for both supported locales", () => {
    expect(formatMapInvestment("1250000", "es")).toMatch(/1[,.]250[,.]000/);
    expect(formatMapInvestment("1250000", "en")).toContain("1,250,000");
    expect(formatMapJobs(1200, "en")).toBe("1,200");
    expect(formatMapJobs(null, "es")).toBe("—");
  });

  it("filters geolocated projects by municipality slug", () => {
    const projects = [
      mapProject("a", "san-pedro-sula", 15.5),
      mapProject("b", "la-ceiba", 15.7),
    ];
    expect(filterMapProjectsByMunicipality(projects, "san-pedro-sula")).toHaveLength(1);
    expect(filterMapProjectsByMunicipality(projects, null)).toHaveLength(2);
  });

  it("filters marker projects by sector", () => {
    const tourism = mapProject("tourism", "san-pedro-sula", 15.5);
    const energy = { ...mapProject("energy", "san-pedro-sula", 15.6), sector: { ...tourism.sector, slug: "energia" } };
    expect(filterMapProjectsBySector([tourism, energy], "turismo")).toEqual([tourism]);
    expect(filterMapProjectsBySector([tourism, energy], null)).toHaveLength(2);
  });

  it("excludes projects without coordinates from marker candidates", () => {
    const projects = [mapProject("with-point", "san-pedro-sula", 15.5), mapProject("without-point", "san-pedro-sula", null)];
    expect(hasProjectCoordinates(projects[0])).toBe(true);
    expect(getMarkerProjects(projects)).toEqual([projects[0]]);
  });

  it("converts GeoDjango coordinates to Leaflet latitude-longitude order", () => {
    const project = mapProject("point", "san-pedro-sula", 15.5);
    expect(project.location?.coordinates).toEqual([-87.2, 15.5]);
    expect(toLeafletProjectPosition(project)).toEqual([15.5, -87.2]);
    expect(toLeafletProjectPosition({ latitude: 91, longitude: -87.2 })).toBeNull();
  });

  it("resets map selection in cascade", () => {
    const base: MapSelectionState = {
      department: { name: "Cortés", slug: "cortes" },
      municipality: { name: "SPS", slug: "san-pedro-sula", department_slug: "cortes" },
      project: mapProject("p1", "san-pedro-sula", 15.5),
      infrastructure: null,
    };
    expect(clearMapProject(base).project).toBeNull();
    expect(clearMapProject(base).municipality?.slug).toBe("san-pedro-sula");
    expect(clearMapMunicipality(base).municipality).toBeNull();
    expect(clearMapMunicipality(base).project).toBeNull();
    expect(clearMapDepartment()).toEqual({
      department: null,
      municipality: null,
      project: null,
      infrastructure: null,
    });
  });

  it("normalizes accents and ranks exact, word-prefix, then substring matches", () => {
    expect(normalizeMapSearch("  Cortés  ")).toBe("cortes");
    const departments = ["La Paz", "Paz del Norte", "Copán"].map((name, id) => ({ name, slug: `d-${id}` }));
    const results = searchInvestmentMap("paz", departments, [], [mapProject("proyecto-paz", null, 15)]);
    expect(results.map((item) => item.label)).toEqual(["La Paz", "Paz del Norte", "proyecto-paz"]);
    expect(results.map((item) => item.type)).toEqual(["department", "department", "project"]);
  });

  it("searches only supplied loaded records and enforces a total limit", () => {
    const departments = Array.from({ length: 10 }, (_, id) => ({ name: `San ${id}`, slug: `san-${id}` }));
    expect(searchInvestmentMap("san", departments)).toHaveLength(8);
    expect(searchInvestmentMap("missing", departments, [], [mapProject("loaded-project", null, 15)])).toEqual([]);
  });

  it("resets filters while preserving infrastructure layers and cache", () => {
    const layers = new Set<"airport">(["airport"]);
    const cache = { airport: { type: "FeatureCollection" as const, features: [] } };
    const reset = resetMapFilters({ activeSector: "turismo", department: { name: "Cortés", slug: "cortes" }, municipality: null, project: mapProject("p", null, 15), selectedInfrastructure: infrastructure, search: "cor", activeInfrastructureLayers: layers, infrastructureCache: cache });
    expect(reset).toMatchObject({ activeSector: "all", department: null, municipality: null, project: null, selectedInfrastructure: null, search: "" });
    expect(reset.activeInfrastructureLayers).toBe(layers);
    expect(reset.infrastructureCache).toBe(cache);
  });

  it("returns real visible counts and a validated project focus", () => {
    expect(getMapVisibleCounts(3, 18, 1)).toEqual({ visibleProjects: 3, loadedMunicipalities: 18, activeLayers: 1 });
    expect(getProjectFocus(mapProject("focus", null, 15.5))).toEqual({ position: [15.5, -87.2], key: 5 });
    expect(getProjectFocus(null)).toBeNull();
  });

  it("parses syntactically valid map params and serializes without stale map state", () => {
    expect(parseMapQueryState({ sector: "energia", department: ["cortes"], municipality: "San Pedro", project: "p-1" })).toEqual({ sector: "energia", department: null, municipality: null, project: "p-1", regionLevel: null, region: null });
    const current = new URLSearchParams("ref=campaign&q=old&department=old");
    expect(serializeMapQueryState(current, { sector: null, department: "cortes", municipality: null, project: null, regionLevel: null, region: null })).toBe("ref=campaign&department=cortes");
  });

  it("parses and serializes the territorial region selection", () => {
    expect(parseMapQueryState({ regionLevel: "sub", region: "R-12" })).toMatchObject({ regionLevel: "sub", region: "R-12" });
    expect(parseMapQueryState({ regionLevel: "polo", region: "copan" })).toMatchObject({ regionLevel: "polo", region: "copan" });
    expect(parseMapQueryState({ regionLevel: "macro" })).toMatchObject({ regionLevel: "macro", region: null });
    expect(parseMapQueryState({ regionLevel: "pais", region: "R-01" })).toMatchObject({ regionLevel: null, region: null });
    expect(parseMapQueryState({ regionLevel: "sub", region: "R-01<script>" })).toMatchObject({ regionLevel: "sub", region: null });
    expect(parseMapQueryState({ regionLevel: "sub", region: ["R-01"] })).toMatchObject({ region: null });

    const state = { sector: null, department: null, municipality: null, project: null, regionLevel: "sub" as const, region: "R-12" };
    expect(serializeMapQueryState(new URLSearchParams("department=cortes"), state)).toBe("regionLevel=sub&region=R-12");
    expect(serializeMapQueryState(new URLSearchParams("regionLevel=sub&region=R-12"), { ...state, regionLevel: null, region: null })).toBe("");
  });

  it("gives the region precedence over department and municipality", () => {
    expect(parseMapQueryState({ department: "cortes", municipality: "san-pedro-sula", regionLevel: "sub", region: "R-01" })).toMatchObject({
      department: null,
      municipality: null,
      regionLevel: "sub",
      region: "R-01",
    });
    expect(parseMapQueryState({ department: "cortes", regionLevel: "sub" })).toMatchObject({ department: "cortes", regionLevel: "sub", region: null });
  });

  it("covers the canonical search, map and stage labels in Spanish and English", () => {
    expect(investmentMapCopy.es.searchPlaceholder).toBe("Buscar departamento, municipio o proyecto");
    expect(investmentMapCopy.en.searchPlaceholder).toBe("Search department, municipality or project");
    expect(investmentMapCopy.es.mapAriaLabel).toContain("Honduras");
    expect(investmentMapCopy.en.stageLabel).toBe("Stage");
    expect(investmentMapCopy.es.clearSearch).toBeTruthy();
    expect(investmentMapCopy.en.searchResults).toBeTruthy();
  });
});

describe("territorial regions", () => {
  const square = (x: number, y: number, size = 1) => [[x, y], [x + size, y], [x + size, y + size], [x, y + size], [x, y]];
  const region = (code: string, level: TerritorialRegionFeature["properties"]["level"], color: string, extra = {}): TerritorialRegionFeature => ({
    type: "Feature",
    id: 1,
    geometry: { type: "Polygon", coordinates: [square(0, 0)] },
    properties: { code, name: `Región ${code}`, level, color, extra },
  });

  it("detects points inside polygons and multipolygons, honoring holes", () => {
    const withHole = { type: "Polygon", coordinates: [square(0, 0, 4), square(1, 1, 2)] };
    expect(geometryContainsPoint(withHole, 0.5, 0.5)).toBe(true);
    expect(geometryContainsPoint(withHole, 2, 2)).toBe(false);
    const multi = { type: "MultiPolygon", coordinates: [[square(0, 0)], [square(10, 10)]] };
    expect(geometryContainsPoint(multi, 10.5, 10.5)).toBe(true);
    expect(geometryContainsPoint(multi, 5, 5)).toBe(false);
    expect(geometryContainsPoint(null, 0, 0)).toBe(false);
  });

  it("builds one legend entry per sub/macro region and one per polo type", () => {
    const labels = investmentMapCopy.en.poloTypes;
    expect(getRegionLegendItems([region("R-01", "sub", "#7FC731"), region("R-02", "sub", "#9934CC")], labels)).toEqual([
      { key: "R-01", label: "R-01 · Región R-01", color: "#7FC731" },
      { key: "R-02", label: "R-02 · Región R-02", color: "#9934CC" },
    ]);
    const polos = [
      region("copan", "polo", "#F9A825", { tipo: "Detonante" }),
      region("yoro", "polo", "#64B5F6", { tipo: "Potencial" }),
      region("juticalpa", "polo", "#F9A825", { tipo: "Detonante" }),
    ];
    expect(getRegionLegendItems(polos, labels)).toEqual([
      { key: "Detonante", label: "Catalyst", color: "#F9A825" },
      { key: "Potencial", label: "Potential", color: "#64B5F6" },
    ]);
  });

  it("ships bilingual copy for the territorial regions layer", () => {
    expect(investmentMapCopy.es.territorialRegions).toBe("Regiones territoriales");
    expect(investmentMapCopy.en.territorialRegions).toBe("Territorial regions");
    expect(investmentMapCopy.es.regionLevels.none).toBe("Ninguna");
    expect(investmentMapCopy.en.approximateBoundary).toBe("Approximate boundary");
    expect(investmentMapCopy.es.approximateBoundary).toBe("Delimitación aproximada");
  });
});

describe("filterMapProjectsByRegion", () => {
  const at = (slug: string, longitude: number | null, latitude: number | null): MapInvestmentProject => ({
    ...mapProject(slug, null, latitude),
    longitude,
    location: latitude == null || longitude == null ? null : { type: "Point", coordinates: [longitude, latitude] },
  });
  const square = { geometry: { type: "Polygon", coordinates: [[[-88, 15], [-87, 15], [-87, 16], [-88, 16], [-88, 15]]] } };

  it("keeps projects inside the region and drops the ones outside", () => {
    const inside = at("inside", -87.5, 15.5);
    const outside = at("outside", -86.5, 15.5);
    expect(filterMapProjectsByRegion([inside, outside], square)).toEqual([inside]);
  });

  it("excludes projects without coordinates", () => {
    expect(filterMapProjectsByRegion([at("no-point", null, null)], square)).toEqual([]);
  });

  it("returns every project when no region is selected", () => {
    const projects = [at("a", -87.5, 15.5), at("b", null, null)];
    expect(filterMapProjectsByRegion(projects, null)).toBe(projects);
  });

  it("matches islands of a MultiPolygon region (R-15 Arrecife Mesoamericano)", () => {
    const file = readFileSync(resolve(__dirname, "../../../../backend/apps/geo/data/regiones/subregiones.geojson"), "utf-8");
    const r15 = (JSON.parse(file) as TerritorialRegionFeatureCollectionLike).features.find((feature) => feature.properties.code === "R-15");
    expect(r15?.geometry?.type).toBe("MultiPolygon");
    const roatan = at("roatan", -86.53, 16.33);
    const utila = at("utila", -86.89, 16.1);
    const guanaja = at("guanaja", -85.89, 16.46);
    const openSea = at("open-sea", -86.7, 16.2);
    const laCeiba = at("la-ceiba", -86.78, 15.76);
    expect(filterMapProjectsByRegion([roatan, utila, guanaja, openSea, laCeiba], r15!)).toEqual([roatan, utila, guanaja]);
  });

  it("drops sliver holes but keeps real holes in region geometries", () => {
    const outer = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]];
    const sliver = [[0.1, 0.1], [0.101, 0.1], [0.101, 0.101], [0.1, 0.1]];
    const lagoon = [[0.4, 0.4], [0.6, 0.4], [0.6, 0.6], [0.4, 0.6], [0.4, 0.4]];
    const cleaned = stripRegionSlivers({
      type: "FeatureCollection",
      features: [
        { type: "Feature", id: 1, geometry: { type: "Polygon", coordinates: [outer, sliver, lagoon] }, properties: { code: "A", name: "A", level: "sub", color: "#000", extra: {} } },
        { type: "Feature", id: 2, geometry: { type: "MultiPolygon", coordinates: [[outer, sliver]] }, properties: { code: "B", name: "B", level: "sub", color: "#000", extra: {} } },
      ],
    });
    expect(cleaned.features[0].geometry?.coordinates).toEqual([outer, lagoon]);
    expect(cleaned.features[1].geometry?.coordinates).toEqual([[outer]]);
    expect(geometryContainsPoint(cleaned.features[0].geometry, 0.1005, 0.1003)).toBe(true);
    expect(geometryContainsPoint(cleaned.features[0].geometry, 0.5, 0.5)).toBe(false);
  });

  it("keeps real R-15 islands after removing slivers", () => {
    const file = readFileSync(resolve(__dirname, "../../../../backend/apps/geo/data/regiones/subregiones.geojson"), "utf-8");
    const collection = JSON.parse(file) as TerritorialRegionFeatureCollection;
    const r15 = stripRegionSlivers(collection).features.find((feature) => feature.properties.code === "R-15")!;
    expect(filterMapProjectsByRegion([at("roatan", -86.53, 16.33), at("open-sea", -86.7, 16.2)], r15).map((p) => p.slug)).toEqual(["roatan"]);
  });

  it("totals declared investment and returns null when nothing is declared", () => {
    expect(getProjectsInvestmentTotal([{ investment_amount: "100" }, { investment_amount: "250.5" }, { investment_amount: null }])).toBe(350.5);
    expect(getProjectsInvestmentTotal([{ investment_amount: null }, { investment_amount: "" }])).toBeNull();
    expect(getProjectsInvestmentTotal([])).toBeNull();
  });
});

type TerritorialRegionFeatureCollectionLike = {
  features: { properties: { code: string }; geometry: { type: string; coordinates: unknown } | null }[];
};
