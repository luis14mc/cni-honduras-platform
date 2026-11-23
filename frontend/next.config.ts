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
      { source: "/mapa", destination: "/portafolio/mapa", statusCode: 301 },
      { source: "/es/mapa", destination: "/portafolio/mapa", statusCode: 301 },
      { source: "/en/mapa", destination: "/en/portfolio/map", statusCode: 301 },
      { source: "/:legacy(postulacion|postulacion-de-proyectos)", destination: "/postula-tu-proyecto", statusCode: 301 },
      { source: "/es/:legacy(postulacion|postulacion-de-proyectos)", destination: "/postula-tu-proyecto", statusCode: 301 },
      { source: "/en/:legacy(postulacion|postulacion-de-proyectos|application)", destination: "/en/submit-your-project", statusCode: 301 },
      { source: "/portafolio/postulacion", destination: "/postula-tu-proyecto", statusCode: 301 },
      { source: "/es/portafolio/postulacion", destination: "/postula-tu-proyecto", statusCode: 301 },
      { source: "/en/portafolio/postulacion", destination: "/en/submit-your-project", statusCode: 301 },
      { source: "/en/portfolio/submit", destination: "/en/submit-your-project", statusCode: 301 },
    ];
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
