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
] as const;

for (const [source, destination] of redirects) {
  test(`${source} redirects to its canonical page`, async ({ request }) => {
    const response = await request.get(`${source}?ref=legacy`, { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    const location = new URL(response.headers().location, response.url());
    expect(location.pathname + location.search).toBe(`${destination}?ref=legacy`);
  });
}
