import type { ReactNode } from "react";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { BreadcrumbJsonLd } from "@/src/components/seo/BreadcrumbJsonLd";
import { isLocale } from "@/src/i18n/config";
import { siteUrl } from "@/src/lib/seo";
import { getProject } from "@/src/services/investment";

export default async function ProjectStructuredData({
  children, params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return children;
  const project = await getProject(slug, { locale }).catch(() => null);
  if (!project) return children;

  const spanish = locale === "es";
  const catalog = spanish ? "/portafolio" : "/en/portfolio";
  const url = siteUrl(`${catalog}/${spanish ? "fichas-proyectos" : "project-sheets"}/${encodeURIComponent(slug)}`);
  const latitude = project.latitude;
  const longitude = project.longitude;
  return (
    <>
      <BreadcrumbJsonLd id="ld-project-breadcrumb" crumbs={[
        { name: spanish ? "Inicio" : "Home", item: siteUrl(spanish ? "/" : "/en") },
        { name: spanish ? "Portafolio" : "Portfolio", item: siteUrl(catalog) },
        { name: project.title, item: url },
      ]} />
      <JsonLd id="ld-project-place" value={{
        "@context": "https://schema.org",
        "@type": "Place",
        name: project.title,
        url,
        description: project.summary || project.description,
        ...(project.location_text ? { address: project.location_text } : {}),
        ...(typeof latitude === "number" && typeof longitude === "number"
          ? { geo: { "@type": "GeoCoordinates", latitude, longitude } }
          : {}),
      }} />
      {children}
    </>
  );
}
