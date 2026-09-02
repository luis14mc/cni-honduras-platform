import { describe, expect, it } from "vitest";
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
    expect(parseMapQueryState({ sector: "energia", department: ["cortes"], municipality: "San Pedro", project: "p-1" })).toEqual({ sector: "energia", department: null, municipality: null, project: "p-1" });
    const current = new URLSearchParams("ref=campaign&q=old&department=old");
    expect(serializeMapQueryState(current, { sector: null, department: "cortes", municipality: null, project: null })).toBe("ref=campaign&department=cortes");
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
