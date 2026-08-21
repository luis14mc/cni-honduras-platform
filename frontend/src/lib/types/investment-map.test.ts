import { describe, expect, it } from "vitest";
import {
  formatMapInvestment,
  formatMapJobs,
  getMapTotals,
  indexSummaries,
  type MapDepartmentSummary,
} from "@/src/lib/types/investment-map";

const summary = (slug: string, projects_count: number, total_investment: string | null): MapDepartmentSummary => ({
  department: { id: projects_count, name: slug, slug, code: "", center_lat: null, center_lng: null },
  projects_count,
  opportunities_count: 1,
  total_investment,
  estimated_jobs: projects_count * 10,
  sectors: [],
});

describe("investment map pure helpers", () => {
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
});
