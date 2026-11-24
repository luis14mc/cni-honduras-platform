import path from "path";
import type { NextConfig } from "next";
import { buildStrapiBeforeFileRewrites } from "./src/lib/strapi/proxy";

/** Optional public media/CDN host (no provider hardcoding). Set in deploy env if needed. */
const mediaHost = process.env.NEXT_PUBLIC_MEDIA_HOSTNAME?.trim();

function remoteFromPublicUrl(value: string | undefined) {
  if (!value) return [];
  try {
    const url = new URL(value);
    const protocol = url.protocol.replace(":", "");
    if (protocol !== "http" && protocol !== "https") return [];
    return [{ protocol: protocol as "http" | "https", hostname: url.hostname, pathname: "/**" }];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  // Evita que Turbopack use la raíz del monorepo cuando hay otro lockfile arriba.
  turbopack: {
    root: path.join(__dirname),
  },
  async redirects() {
    return [
      ["/mapa", "/portafolio/mapa"],
      ["/es/mapa", "/portafolio/mapa"],
      ["/en/mapa", "/en/portfolio/map"],
      ["/:legacy(postulacion|postulacion-de-proyectos)", "/postula-tu-proyecto"],
      ["/es/:legacy(postulacion|postulacion-de-proyectos)", "/postula-tu-proyecto"],
      ["/en/:legacy(postulacion|postulacion-de-proyectos|application)", "/en/submit-your-project"],
      ["/portafolio/postulacion", "/postula-tu-proyecto"],
      ["/es/portafolio/postulacion", "/postula-tu-proyecto"],
      ["/en/portafolio/postulacion", "/en/submit-your-project"],
      ["/en/portfolio/submit", "/en/submit-your-project"],
      ["/portafolio/fichas-proyectos", "/portafolio?tipo=proyectos"],
      ["/es/portafolio/fichas-proyectos", "/portafolio?tipo=proyectos"],
      ["/portafolio/oportunidades", "/portafolio?tipo=oportunidades"],
      ["/es/portafolio/oportunidades", "/portafolio?tipo=oportunidades"],
      ["/en/portfolio/project-sheets", "/en/portfolio?tipo=proyectos"],
      ["/en/portfolio/opportunities", "/en/portfolio?tipo=oportunidades"],
      ["/crecer/oportunidades", "/portafolio?tipo=oportunidades"],
      ["/portafolio/opportunity-cards", "/portafolio?tipo=oportunidades"],
      ["/crecer/oportunidades/:slug", "/portafolio/oportunidades/:slug"],
      ["/en/grow/opportunities", "/en/portfolio?tipo=oportunidades"],
      ["/en/portfolio/opportunity-cards", "/en/portfolio?tipo=oportunidades"],
      ["/en/grow/opportunities/:slug", "/en/portfolio/opportunities/:slug"],
      ["/en/invertir/sectores/:path*", "/en/invest/sectors/:path*"],
      ["/en/invertir/por-que-honduras", "/en/invest/why-honduras"],
      ["/en/invertir/:path*", "/en/invest/:path*"],
      ["/servicios", "/cni"],
      ["/servicios/asistencia-legal", "/cni/servicios-legales"],
      ["/servicios/asistencia-tecnica", "/cni/servicios-tecnicos"],
      ["/servicios/inteligencia-de-datos", "/cni/inteligencia-de-datos"],
      ["/servicios/tramites", "/tramites"],
      ["/en/services", "/en/cni"],
      ["/en/services/legal-assistance", "/en/cni/legal-services"],
      ["/en/services/technical-assistance", "/en/cni/technical-services"],
      ["/en/services/data-intelligence", "/en/cni/data-intelligence"],
      ["/en/services/procedures", "/en/procedures"],
      ["/en/quienes-somos", "/en/about-us"],
      ["/en/institucional/:slug", "/en/institutional/:slug"],
      ["/es", "/"],
      ["/es/:path+", "/:path+"],
    ].map(([source, destination]) => ({ source, destination, statusCode: 301 }));
  },
  async rewrites() {
    return {
      beforeFiles: buildStrapiBeforeFileRewrites(process.env.STRAPI_ORIGIN),
    };
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cni.hn", pathname: "/wp-content/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/aida/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/aida-public/**" },
      { protocol: "https", hostname: "cdn.pixabay.com", pathname: "/**" },
      { protocol: "https", hostname: "api-test.cni.hn", pathname: "/**" },
      { protocol: "https", hostname: "api.cni.hn", pathname: "/**" },
      { protocol: "http", hostname: "localhost", pathname: "/**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/**" },
      ...remoteFromPublicUrl(process.env.NEXT_PUBLIC_API_URL),
      ...(mediaHost
        ? ([{ protocol: "https", hostname: mediaHost, pathname: "/**" }] as const)
        : []),
    ],
  },
};

export default nextConfig;
