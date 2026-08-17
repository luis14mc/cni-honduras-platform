import { describe, expect, it } from "vitest";
import { normalizeSectorSlug, sectorsMatch } from "@/src/lib/strapi/sector";

describe("normalizeSectorSlug", () => {
  it("slugifies common sector labels", () => {
    expect(normalizeSectorSlug("Agroindustria")).toBe("agroindustria");
    expect(normalizeSectorSlug("Energía")).toBe("energia");
    expect(normalizeSectorSlug("Infraestructura Vial")).toBe("infraestructura-vial");
  });

  it("trims spaces and collapses punctuation", () => {
    expect(normalizeSectorSlug("  Turismo  ")).toBe("turismo");
    expect(normalizeSectorSlug("Agro-industria")).toBe("agro-industria");
  });

  it("returns empty for blank input", () => {
    expect(normalizeSectorSlug("")).toBe("");
    expect(normalizeSectorSlug("   ")).toBe("");
    expect(normalizeSectorSlug(null)).toBe("");
    expect(normalizeSectorSlug(undefined)).toBe("");
  });
});

describe("sectorsMatch", () => {
  it("matches free-form Strapi values to route slugs", () => {
    expect(sectorsMatch("Agroindustria", "agroindustria")).toBe(true);
    expect(sectorsMatch("Energía", "energia")).toBe(true);
    expect(sectorsMatch("Infraestructura Vial", "infraestructura-vial")).toBe(true);
  });

  it("does not treat distinct sectors as equal", () => {
    expect(sectorsMatch("Turismo", "energia")).toBe(false);
    expect(sectorsMatch("", "agroindustria")).toBe(false);
  });
});
