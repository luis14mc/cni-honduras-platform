import { expect, test } from "@playwright/test";

const redirects = [
  ["/mapa", "/portafolio/mapa"],
  ["/es/mapa", "/portafolio/mapa"],
  ["/en/mapa", "/en/portfolio/map"],
  ["/postulacion", "/postula-tu-proyecto"],
  ["/postulacion-de-proyectos", "/postula-tu-proyecto"],
  ["/es/postulacion", "/postula-tu-proyecto"],
  ["/es/postulacion-de-proyectos", "/postula-tu-proyecto"],
  ["/en/postulacion", "/en/submit-your-project"],
  ["/en/postulacion-de-proyectos", "/en/submit-your-project"],
  ["/en/application", "/en/submit-your-project"],
  ["/portafolio/postulacion", "/postula-tu-proyecto"],
  ["/es/portafolio/postulacion", "/postula-tu-proyecto"],
  ["/en/portafolio/postulacion", "/en/submit-your-project"],
  ["/en/portfolio/submit", "/en/submit-your-project"],
  ["/portafolio/fichas-proyectos", "/portafolio?tipo=proyectos"],
  ["/portafolio/oportunidades", "/portafolio?tipo=oportunidades"],
  ["/en/portfolio/project-sheets", "/en/portfolio?tipo=proyectos"],
  ["/en/portfolio/opportunities", "/en/portfolio?tipo=oportunidades"],
  ["/crecer/oportunidades", "/portafolio?tipo=oportunidades"],
  ["/crecer/oportunidades/oc-1", "/portafolio/oportunidades/oc-1"],
  ["/en/grow/opportunities", "/en/portfolio?tipo=oportunidades"],
  ["/en/grow/opportunities/oc-1", "/en/portfolio/opportunities/oc-1"],
  ["/en/institucional/about", "/en/institutional/about"],
  ["/en/quienes-somos", "/en/about-us"],
  ["/es", "/"],
  ["/es/prensa", "/prensa"],
] as const;

for (const [source, destination] of redirects) {
  test(`${source} redirects to its canonical page`, async ({ request }) => {
    const response = await request.get(`${source}?ref=legacy`, { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    const location = new URL(response.headers().location, response.url());
    const expected = new URL(destination, response.url());
    expected.searchParams.set("ref", "legacy");
    expect(location.pathname).toBe(expected.pathname);
    expect(Object.fromEntries(location.searchParams)).toEqual(Object.fromEntries(expected.searchParams));
  });
}
