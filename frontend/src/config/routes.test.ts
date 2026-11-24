import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveInternalPath } from "@/src/config/routeRewrites";
import {
  getMirrorPath,
  resolveHref,
  siteNavigation,
  type SiteNavNode,
} from "@/src/config/siteNavigation";

/**
 * ¿Existe la página interna a la que el middleware reescribe esta URL pública?
 * Resuelve segmentos como lo hace Next: carpeta literal o, si no, una dinámica `[x]`.
 */
function internalPageExists(publicPath: string): boolean {
  const internal = resolveInternalPath(publicPath);
  if (!internal) return false;
  const segments = internal.replace(/^\/(es|en)(?=\/|$)/, "").split("/").filter(Boolean);
  let dir = path.join(process.cwd(), "src/app/[locale]");
  for (const segment of segments) {
    const literal = path.join(dir, segment);
    if (existsSync(literal)) {
      dir = literal;
      continue;
    }
    const dynamic = existsSync(dir)
      ? readdirSync(dir).find((name) => /^\[[^\].]+\]$/.test(name))
      : undefined;
    if (!dynamic) return false;
    dir = path.join(dir, dynamic);
  }
  return existsSync(path.join(dir, "page.tsx"));
}

function leaves(nodes: SiteNavNode[]): SiteNavNode[] {
  return nodes.flatMap((node) => [
    ...(node.external ? [] : [node]),
    ...leaves(node.children ?? []),
  ]);
}

describe("enlaces en inglés (resolveHref)", () => {
  it.each([
    ["/portafolio", "/en/portfolio"],
    ["/institucional/acerca", "/en/institutional/acerca"],
    ["/portafolio/oportunidades/oc-cni-t002", "/en/portfolio/opportunities/oc-cni-t002"],
    ["/portafolio/fichas-proyectos/distrito-palmerola", "/en/portfolio/project-sheets/distrito-palmerola"],
    ["/portafolio/casos/caso-demo", "/en/portfolio/success-stories/caso-demo"],
    ["/portafolio/mapa", "/en/portfolio/map"],
    ["/crecer/acompanamiento", "/en/grow/aftercare"],
    ["/facilidades-migratorias", "/en/migratory-facilities"],
    ["/contacto?opportunity=oc-cni-t002", "/en/contact?opportunity=oc-cni-t002"],
    ["/prensa/nota-demo", "/en/news/nota-demo"],
    ["/invertir/sectores/energia", "/en/invest/sectors/energia"],
  ])("%s -> %s (nunca cae a la portada /en)", (es, en) => {
    expect(resolveHref("en", es)).toBe(en);
  });

  it("traduce rutas de detalle en inglés de vuelta al español", () => {
    expect(resolveHref("es", "/en/portfolio/opportunities/oc-1")).toBe("/portafolio/oportunidades/oc-1");
    expect(resolveHref("es", "/en/portfolio/project-sheets/distrito-palmerola")).toBe(
      "/portafolio/fichas-proyectos/distrito-palmerola",
    );
  });

  it("conserva query y hash", () => {
    expect(resolveHref("en", "/portafolio#lista")).toBe("/en/portfolio#lista");
  });
});

describe("selector de idioma (getMirrorPath)", () => {
  it("espeja el detalle de una oportunidad en ambos sentidos", () => {
    expect(getMirrorPath("/portafolio/oportunidades/oc-1", "en")).toBe("/en/portfolio/opportunities/oc-1");
    expect(getMirrorPath("/en/portfolio/opportunities/oc-1", "es")).toBe("/portafolio/oportunidades/oc-1");
    expect(getMirrorPath("/portafolio/fichas-proyectos/distrito-palmerola", "en")).toBe(
      "/en/portfolio/project-sheets/distrito-palmerola",
    );
    expect(getMirrorPath("/en/portfolio/project-sheets/distrito-palmerola", "es")).toBe(
      "/portafolio/fichas-proyectos/distrito-palmerola",
    );
  });
});

describe("URL pública -> página interna (middleware)", () => {
  it.each([
    ["/portafolio", "/es/portafolio"],
    ["/portafolio/oportunidades/oc-1", "/es/portafolio/oportunidades/oc-1"],
    ["/en/portfolio", "/en/portafolio"],
    ["/en/institutional/about", "/en/institucional/about"],
    ["/en/portfolio/opportunities/oc-1", "/en/portafolio/oportunidades/oc-1"],
    ["/portafolio/fichas-proyectos/distrito-palmerola", "/es/portafolio/fichas-proyectos/distrito-palmerola"],
    ["/en/portfolio/project-sheets/distrito-palmerola", "/en/portafolio/fichas-proyectos/distrito-palmerola"],
    ["/en/portfolio/map", "/en/portafolio/mapa"],
  ])("%s -> %s", (publicPath, internal) => {
    expect(resolveInternalPath(publicPath)).toBe(internal);
    expect(internalPageExists(publicPath), publicPath).toBe(true);
  });
});

describe("menú principal", () => {
  it("incluye el mapa y el portafolio unificado", () => {
    const all = leaves(siteNavigation);
    const map = all.find((n) => n.id === "mapa");
    const portfolio = all.find((n) => n.id === "crecer-portafolio");
    expect(map?.path).toEqual({ es: "/portafolio/mapa", en: "/en/portfolio/map" });
    expect(portfolio?.path).toEqual({ es: "/portafolio", en: "/en/portfolio" });
  });

  it("no incluye los listados separados del portafolio", () => {
    const all = leaves(siteNavigation);
    expect(all.find((n) => n.id === "crecer-fichas-proyectos")).toBeUndefined();
    expect(all.find((n) => n.id === "crecer-oportunidades")).toBeUndefined();
  });

  it("cada ítem resuelve a su espejo en inglés (no a la portada)", () => {
    for (const node of leaves(siteNavigation)) {
      expect(resolveHref("en", node.path.es), node.id).toBe(node.path.en);
    }
  });

  it("cada ítem, en ambos idiomas, apunta a una página que existe", () => {
    for (const node of leaves(siteNavigation)) {
      expect(internalPageExists(node.path.es), `${node.id} es:${node.path.es}`).toBe(true);
      expect(internalPageExists(node.path.en), `${node.id} en:${node.path.en}`).toBe(true);
    }
  });
});
