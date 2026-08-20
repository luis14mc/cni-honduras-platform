import { describe, expect, it } from "vitest";
import { SECTOR_ACCENTS } from "@/src/i18n/copy/invertirPage";
import { getSectorPageContent, SECTOR_GUIDE_COVER } from "@/src/data/sectorPageContent";

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
    expect(page.guide?.title).toBe("Guía de Agroindustria");
    expect(page.guide?.subtitle).toBe("Guía sectorial");
    expect(page.guide?.image).toBe(SECTOR_GUIDE_COVER.agroindustria);
  });

  it("loads the approved English agroindustry template", () => {
    const page = getSectorPageContent("agroindustria", "en");
    expect(page.name).toBe("Agroindustry");
    expect(page.hero.headline).toBe("Central America’s agricultural production hub");
    expect(page.hero.metrics[1]?.value).toBe("8th");
    expect(page.intro.title).toBe("Agribusiness");
    expect(page.intro.videoUrl).toBe("https://youtu.be/gzplb3I4X98");
    expect(page.benefits.items).toHaveLength(3);
    expect(page.guide?.title).toBe("Agroindustry guide");
  });

  it("loads the approved Spanish manufacturing template", () => {
    const page = getSectorPageContent("manufactura", "es");
    expect(page.name).toBe("Manufactura");
    expect(page.color).toBe(SECTOR_ACCENTS.manufactura.accent);
    expect(page.hero.headline).toBe("El hub de nearshoring en Centroamérica");
    expect(page.hero.metrics).toHaveLength(3);
    expect(page.hero.metrics[0]?.value).toBe("503.1k");
    expect(page.intro.videoUrl).toBe("https://youtu.be/XjbxTvn0Ybs");
    expect(page.benefits.title).toBe("Beneficios de Invertir en el sector de Manufactura");
    expect(page.benefits.items).toHaveLength(3);
    expect(page.guide).toBeNull();
  });

  it("loads the approved English manufacturing template", () => {
    const page = getSectorPageContent("manufactura", "en");
    expect(page.name).toBe("Manufacturing");
    expect(page.hero.headline).toBe("Central America’s nearshoring hub");
    expect(page.intro.title).toBe("Manufacturing");
    expect(page.intro.videoUrl).toBe("https://youtu.be/XjbxTvn0Ybs");
    expect(page.benefits.title).toBe("Benefits of Investing in the Manufacturing Sector");
    expect(page.guide).toBeNull();
  });

  it("loads the approved Spanish tourism template", () => {
    const page = getSectorPageContent("turismo", "es");
    expect(page.name).toBe("Turismo");
    expect(page.color).toBe(SECTOR_ACCENTS.turismo.accent);
    expect(page.hero.headline).toContain("vastas oportunidades de inversión");
    expect(page.hero.metrics).toHaveLength(3);
    expect(page.hero.metrics[0]?.value).toBe("2.7 millones");
    expect(page.intro.videoUrl).toBe("https://youtu.be/CuF6u-CEdnw");
    expect(page.benefits.title).toBe("Beneficios de Invertir en el sector de turismo");
    expect(page.benefits.items).toHaveLength(3);
    expect(page.guide?.title).toBe("Guía de Turismo");
    expect(page.guide?.image).toBe(SECTOR_GUIDE_COVER.turismo);
  });

  it("loads the approved English tourism template", () => {
    const page = getSectorPageContent("turismo", "en");
    expect(page.name).toBe("Tourism");
    expect(page.hero.headline).toContain("vast investment opportunities");
    expect(page.hero.metrics[0]?.value).toBe("2.7 million");
    expect(page.intro.title).toBe("Tourism");
    expect(page.intro.videoUrl).toBe("https://youtu.be/CuF6u-CEdnw");
    expect(page.intro.description.split(/\n\s*\n/).length).toBe(2);
    expect(page.guide?.title).toBe("Tourism guide");
  });

  it("loads the approved Spanish energy template", () => {
    const page = getSectorPageContent("energia", "es");
    expect(page.name).toBe("Energía");
    expect(page.color).toBe(SECTOR_ACCENTS.energia.accent);
    expect(page.hero.headline).toBe("Energía Limpia para un Futuro Sostenible");
    expect(page.hero.metrics).toHaveLength(3);
    expect(page.hero.metrics[0]?.value).toBe("53%");
    expect(page.intro.videoUrl).toBe("https://youtu.be/wbBNwUCdkRc");
    expect(page.benefits.title).toBe("Beneficios de Invertir en el sector de Energía");
    expect(page.benefits.items).toHaveLength(3);
    expect(page.guide).toBeNull();
  });

  it("loads the approved English energy template", () => {
    const page = getSectorPageContent("energia", "en");
    expect(page.name).toBe("Energy");
    expect(page.hero.headline).toBe("Clean Energy for a Sustainable Future");
    expect(page.intro.title).toBe("Energy");
    expect(page.intro.videoUrl).toBe("https://youtu.be/wbBNwUCdkRc");
    expect(page.benefits.title).toBe("Benefits of Investing in the Energy Sector");
    expect(page.guide).toBeNull();
  });

  it("loads the approved Spanish infrastructure template", () => {
    const page = getSectorPageContent("infraestructura", "es");
    expect(page.name).toBe("Infraestructura");
    expect(page.color).toBe(SECTOR_ACCENTS.infraestructura.accent);
    expect(page.hero.headline).toBe("Conectividad y Desarrollo para Impulsar tu Negocio");
    expect(page.hero.metrics).toHaveLength(3);
    expect(page.hero.metrics[0]?.value).toBe("8");
    expect(page.intro.videoUrl).toBe("https://youtu.be/j4IpoLINxt0");
    expect(page.benefits.title).toBe("Beneficios de Invertir en el sector de infraestructura");
    expect(page.benefits.items).toHaveLength(3);
    expect(page.guide?.title).toBe("Guía de Infraestructura");
    expect(page.guide?.image).toBe(SECTOR_GUIDE_COVER.infraestructura);
  });

  it("loads the approved English infrastructure template", () => {
    const page = getSectorPageContent("infraestructura", "en");
    expect(page.name).toBe("Infrastructure");
    expect(page.hero.headline).toBe("Connectivity and Development to Power Your Business");
    expect(page.intro.title).toBe("Infrastructure");
    expect(page.intro.videoUrl).toBe("https://youtu.be/j4IpoLINxt0");
    expect(page.benefits.items[2]?.title).toContain("Logistics Performance Index");
    expect(page.guide?.title).toBe("Infrastructure guide");
  });

  it("lets remaining sectors reuse the same shape from existing extras", () => {
    const logistica = getSectorPageContent("logistica", "es");
    expect(logistica.color).toBe(SECTOR_ACCENTS.logistica.accent);
    expect(logistica.hero.metrics.length).toBeGreaterThan(0);
    expect(logistica.benefits.items.length).toBeGreaterThan(0);
    expect(logistica.guide).toBeNull();
    expect(logistica.intro.videoUrl).toBeNull();
  });
});
