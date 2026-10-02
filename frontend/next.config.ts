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
  async rewrites() {
    return {
      beforeFiles: buildStrapiBeforeFileRewrites(process.env.STRAPI_ORIGIN),
    };
  },
  images: {
    remotePatterns: [
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
