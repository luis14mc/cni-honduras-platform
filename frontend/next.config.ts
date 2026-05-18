import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita que Turbopack use la raíz del monorepo cuando hay otro lockfile arriba.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/aida/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/aida-public/**" },
      { protocol: "https", hostname: "cdn.pixabay.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
