import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import { ApiError } from "@/src/lib/api";
import { getOpportunity, getOpportunities, getProject, getProjects } from "@/src/services/investment";
import PortfolioPage from "@/src/app/[locale]/portafolio/page";
import ProjectPage from "@/src/app/[locale]/portafolio/fichas-proyectos/[slug]/page";
import OpportunityPage from "@/src/app/[locale]/portafolio/oportunidades/[slug]/page";

vi.mock("@/src/services/investment", () => ({
  getOpportunity: vi.fn(),
  getOpportunities: vi.fn(),
  getProject: vi.fn(),
  getProjects: vi.fn(),
}));
vi.mock("@/src/services/cms", () => ({ getDocuments: vi.fn().mockResolvedValue([]) }));
vi.mock("next/navigation", () => ({
  notFound: () => { throw new Error("NOT_FOUND"); },
}));

beforeEach(() => vi.clearAllMocks());

describe("investment portfolio pages", () => {
  it("keeps an empty Django result separate from an unavailable tab", async () => {
    vi.mocked(getProjects).mockResolvedValue([]);
    vi.mocked(getOpportunities).mockRejectedValue(new ApiError("Unavailable", 503, "/opportunities/"));
    const view = await PortfolioPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({}),
    });
    const catalog = (view.props.children as ReactElement<{ projects: unknown[]; errors: Record<string, boolean> }>[])
      .find((child) => "projects" in child.props);
    expect(catalog?.props.projects).toEqual([]);
    expect(catalog?.props.errors).toEqual({ proyectos: false, oportunidades: true });
    expect(getProjects).toHaveBeenCalledWith({ locale: "en" });
  });

  it("calls notFound for both missing sheets", async () => {
    vi.mocked(getProject).mockRejectedValue(new ApiError("Not found", 404, "/projects/missing/"));
    vi.mocked(getOpportunity).mockRejectedValue(new ApiError("Not found", 404, "/opportunities/missing/"));
    const params = Promise.resolve({ locale: "es", slug: "missing" });
    await expect(ProjectPage({ params })).rejects.toThrow("NOT_FOUND");
    await expect(OpportunityPage({ params })).rejects.toThrow("NOT_FOUND");
  });

  it("renders the availability error when an individual sheet fails", async () => {
    vi.mocked(getProject).mockRejectedValue(new ApiError("Unavailable", 503, "/projects/missing/"));
    const result = await ProjectPage({ params: Promise.resolve({ locale: "es", slug: "missing" }) });
    expect(result.props.children.props.children[1].props.role).toBe("alert");
  });
});
