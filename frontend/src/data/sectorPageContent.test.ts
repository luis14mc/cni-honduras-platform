import { describe, expect, it } from "vitest";
import { SECTOR_ACCENTS } from "@/src/i18n/copy/invertirPage";
import { getSectorPageContent } from "@/src/data/sectorPageContent";

describe("getSectorPageContent", () => {
  it("uses catalog color for agroindustria instead of a hardcoded accent", () => {
    const page = getSectorPageContent("agroindustria", "es");
    expect(page.color).toBe(SECTOR_ACCENTS.agroindustria.accent);
    expect(page.palette).toEqual(SECTOR_ACCENTS.agroindustria);
    expect(page.slug).toBe("agroindustria");
  });

  it("loads the approved Spanish agroindustry template", () => {
    const page = getSectorPageContent("agroindustria", "es");
    expect(page.name).toBe("Agroindustria");
    expect(page.hero.headline).toBe("El hub de producción agrícola en Centroamérica");
    expect(page.hero.metrics).toHaveLength(3);
    expect(page.hero.metrics[0]?.value).toBe("+3,000 MM");
    expect(page.intro.videoUrl).toBe("https://youtu.be/gzplb3I4X98");
    expect(page.benefits.items).toHaveLength(3);
    expect(page.guide).toBeNull();
  });

  it("does not invent EN copy: agroindustry EN falls back to the Spanish body", () => {
    const es = getSectorPageContent("agroindustria", "es");
    const en = getSectorPageContent("agroindustria", "en");
    expect(en.hero.headline).toBe(es.hero.headline);
    expect(en.name).toBe("Agroindustry");
  });

  it("lets other sectors reuse the same shape from existing extras", () => {
    const turismo = getSectorPageContent("turismo", "es");
    expect(turismo.color).toBe(SECTOR_ACCENTS.turismo.accent);
    expect(turismo.hero.metrics.length).toBeGreaterThan(0);
    expect(turismo.benefits.items.length).toBeGreaterThan(0);
    expect(turismo.guide).toBeNull();
    expect(turismo.intro.videoUrl).toBeNull();
  });
});
