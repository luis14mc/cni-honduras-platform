import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { legacyRedirects, resolveInternalPath } from "@/src/config/routeRewrites";
import {
  getMirrorPath,
  resolveHref,
  siteNavigation,
  type SiteNavNode,
} from "@/src/config/siteNavigation";

/** Aplica la primera regla de redirección que coincide (igual que el middleware). */
function redirectOf(pathname: string): string | null {
  for (const rule of legacyRedirects) {
    if (rule.from.test(pathname)) return rule.to(pathname);
  }
  return null;
}

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
    ["/portafolio/oportunidades", "/en/portfolio/opportunities"],
    ["/portafolio/oportunidades/oc-cni-t002", "/en/portfolio/opportunities/oc-cni-t002"],
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
  });

  it("conserva query y hash", () => {
    expect(resolveHref("en", "/portafolio/oportunidades#lista")).toBe("/en/portfolio/opportunities#lista");
  });
});

describe("selector de idioma (getMirrorPath)", () => {
  it("espeja el detalle de una oportunidad en ambos sentidos", () => {
    expect(getMirrorPath("/portafolio/oportunidades/oc-1", "en")).toBe("/en/portfolio/opportunities/oc-1");
    expect(getMirrorPath("/en/portfolio/opportunities/oc-1", "es")).toBe("/portafolio/oportunidades/oc-1");
  });
});

describe("URL pública -> página interna (middleware)", () => {
  it.each([
    ["/portafolio/oportunidades", "/es/portafolio/oportunidades"],
    ["/portafolio/oportunidades/oc-1", "/es/portafolio/oportunidades/oc-1"],
    ["/en/portfolio/opportunities", "/en/portafolio/oportunidades"],
    ["/en/portfolio/opportunities/oc-1", "/en/portafolio/oportunidades/oc-1"],
    ["/en/portfolio/map", "/en/portafolio/mapa"],
    ["/mapa", "/es/portafolio/mapa"],
  ])("%s -> %s", (publicPath, internal) => {
    expect(resolveInternalPath(publicPath)).toBe(internal);
  });
});

describe("redirecciones desde rutas anteriores", () => {
  it.each([
    ["/crecer/oportunidades", "/portafolio/oportunidades"],
    ["/crecer/oportunidades/oc-1", "/portafolio/oportunidades/oc-1"],
    ["/portafolio/opportunity-cards", "/portafolio/oportunidades"],
    ["/en/grow/opportunities", "/en/portfolio/opportunities"],
    ["/en/grow/opportunities/oc-1", "/en/portfolio/opportunities/oc-1"],
    ["/en/portfolio/opportunity-cards", "/en/portfolio/opportunities"],
  ])("%s -> %s", (from, to) => {
    expect(redirectOf(from)).toBe(to);
  });

  it("no redirige la portada de Crecer ni el acompañamiento", () => {
    expect(redirectOf("/crecer")).toBeNull();
    expect(redirectOf("/crecer/acompanamiento")).toBeNull();
  });
});

describe("menú principal", () => {
  it("incluye el mapa y las oportunidades con slugs localizados", () => {
    const all = leaves(siteNavigation);
    const map = all.find((n) => n.id === "mapa");
    const opps = all.find((n) => n.id === "crecer-oportunidades");
    expect(map?.path).toEqual({ es: "/portafolio/mapa", en: "/en/portfolio/map" });
    expect(opps?.path).toEqual({ es: "/portafolio/oportunidades", en: "/en/portfolio/opportunities" });
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
