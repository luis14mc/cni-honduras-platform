import { describe, expect, it, vi } from "vitest";
import { trackEvent } from "@/src/lib/analytics";
import { createMapFilterHandlers } from "./mapFilterHandlers";

vi.mock("@/src/lib/analytics", () => ({ trackEvent: vi.fn() }));

describe("map filter handlers", () => {
  it("reports changed controls and keeps the existing selection actions", () => {
    const clearDepartment = vi.fn();
    const setStage = vi.fn();
    const selectRegionLayer = vi.fn();
    const resetFilters = vi.fn();
    const setKindFilter = vi.fn();
    const handlers = createMapFilterHandlers({
      kindFilter: "project", regionLayer: "none", selectDepartment: vi.fn(),
      clearDepartment, setStage, selectRegionLayer, resetFilters, setKindFilter,
    });

    handlers.handleDepartmentFilter(null);
    handlers.handleStageFilter("implementing");
    handlers.handleRegionLayerFilter("none");
    handlers.handleRegionLayerFilter("sub");
    handlers.handleClearFilters();
    handlers.handleKindFilter("project");
    handlers.handleKindFilter("case");

    expect(clearDepartment).toHaveBeenCalledOnce();
    expect(setStage).toHaveBeenCalledWith("implementing");
    expect(selectRegionLayer.mock.calls).toEqual([["none"], ["sub"]]);
    expect(resetFilters).toHaveBeenCalledOnce();
    expect(setKindFilter.mock.calls).toEqual([["project"], ["case"]]);
    expect(vi.mocked(trackEvent).mock.calls).toEqual([
      ["map_filter", { filter: "department", value: "all" }],
      ["map_filter", { filter: "stage", value: "implementing" }],
      ["map_filter", { filter: "region_level", value: "sub" }],
      ["map_filter", { filter: "reset" }],
      ["map_filter", { filter: "kind", value: "case" }],
    ]);
  });
});
