import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { isLocale, type Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { PageHero } from "@/src/components/cni/PageHero";
import { Section } from "@/src/components/cni/Section";
import { buildDetailMetadata } from "@/src/lib/seo";
import { getProject } from "@/src/services/investment";
import { ApiError } from "@/src/lib/api";
import { portfolioCatalogCopy } from "@/src/i18n/copy/portfolioCatalog";
import { formatPoloLabel, formatSubregionLabel, getSeedBySlug } from "@/src/lib/portfolioCatalog";
import { getSectorBySlug } from "@/src/data/investmentSectors";
import { designImages } from "@/src/lib/designAssets";
import type { InvestmentProject, RegionRef } from "@/src/types/investment";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? (raw as Locale) : "es";
  try {
    const project = await getProject(slug, { locale });
    return buildDetailMetadata({
      locale,
      slugPath: `/portafolio/fichas-proyectos/${slug}`,
      enMirrorPath: `/en/portfolio/project-sheets/${slug}`,
      title: project.title,
      description: project.summary || project.description,
      image: project.cover_image_url,
    });
  } catch {
    const seed = getSeedBySlug("project", slug, locale);
    if (seed) {
      return buildDetailMetadata({
        locale,
        slugPath: `/portafolio/fichas-proyectos/${slug}`,
        enMirrorPath: `/en/portfolio/project-sheets/${slug}`,
        title: seed.item.title,
        description: seed.record.description,
        image: seed.item.coverImageUrl,
      });
    }
    return {};
  }
}

export default async function ProjectSheetDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = portfolioCatalogCopy[locale];
  const L = (path: string) => withLocale(locale, path);

  let project: InvestmentProject | null = null;
  let loadError = false;
  let notFoundFromApi = false;
  try {
    project = await getProject(slug, { locale });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFoundFromApi = true;
    } else {
      loadError = true;
    }
  }

  // Fallback al JSON local si Django responde 404 o no hay datos (Django sin seed cargado).
  const seedFallback =
    notFoundFromApi || (!project && !loadError) ? getSeedBySlug("project", slug, locale) : null;

  if (loadError && !seedFallback) {
    return (
      <div className="flex flex-1 flex-col bg-[#f8f9ff]">
        <Section tone="surface">
          <Link href={L("/portafolio/fichas-proyectos")} className="text-xs font-bold uppercase tracking-widest text-[#334E88] hover:text-[#35A963]">
            ← {t.backSheets}
          </Link>
          <div role="alert" className="mt-10 rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center text-sm text-red-800">
            {t.error}
          </div>
        </Section>
      </div>
    );
  }

  if (seedFallback && !project) {
    const item = seedFallback.item;
    const record = seedFallback.record;
    const regionLabel = item.subregionLabel;
    const macroregionName = record.macroregion ? record.macroregion : null;
    const poloName = record.polos?.[0]
      ? record.polos[0].split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
      : null;
    const placeholder = getSectorBySlug(locale, item.sectorSlug)?.image || designImages.portfolio.hero;
    const heroSrc = item.coverImageUrl || placeholder;
    const mapHref = L(`/portafolio/mapa?project=${encodeURIComponent(item.slug)}`);
    const contactHref = L(`/contacto?ref=${encodeURIComponent(item.code || item.slug)}`);
    const amountNotes = record.amount_notes?.length ? ` · ${record.amount_notes[0]}` : "";
    const phaseLabel = record.phase_detail ? `${record.phase} — ${record.phase_detail}` : record.phase;
    const facts: Array<[string, string]> = [
      item.code ? [t.code, item.code] : null,
      item.sectorName ? [t.sector, item.sectorName] : null,
      item.locationText ? [t.location, item.locationText] : null,
      regionLabel ? [t.region, regionLabel] : null,
      macroregionName ? [t.macroregion, macroregionName] : null,
      poloName ? [t.polo, poloName] : null,
      item.amountText ? [t.amount, `${item.amountText}${amountNotes}`] : null,
      phaseLabel ? [t.phaseLabel, phaseLabel] : null,
      item.investmentType ? [t.investmentType, item.investmentType] : null,
    ].filter(Boolean) as Array<[string, string]>;

    return (
      <div className="flex flex-1 flex-col bg-[#f8f9ff]">
        <div className="-mt-28">
          <PageHero
            eyebrow={item.code || t.techSheet}
            title={item.title}
            description={item.locationText}
            imageSrc={heroSrc}
            imageAlt={item.title}
            heightClass="min-h-[420px] md:min-h-[520px]"
            imageClassName="absolute inset-0 object-cover object-top"
          />
        </div>
        <Section tone="surface">
          <Link href={L("/portafolio/fichas-proyectos")} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#334E88] hover:text-[#35A963]">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t.backSheets}
          </Link>
          <div className="mt-10 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#0E7A7C]">{t.techSheet}</h2>
              <dl className="mt-6 divide-y divide-cni-primary/10 rounded-xl border border-cni-primary/10 bg-white">
                {facts.map(([label, value]) => (
                  <div key={label} className="grid gap-1 px-5 py-4 sm:grid-cols-3">
                    <dt className="font-headline text-[11px] font-bold uppercase tracking-[0.14em] text-cni-primary/50">{label}</dt>
                    <dd className="font-body text-sm text-cni-primary sm:col-span-2">{value}</dd>
                  </div>
                ))}
              </dl>
              {record.description ? (
                <section className="mt-10 max-w-3xl">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-[#0E7A7C]">{t.description}</h2>
                  <p className="mt-4 whitespace-pre-line font-body text-base leading-relaxed text-[#252A58]">{record.description}</p>
                </section>
              ) : null}
            </div>
            <aside className="space-y-4 lg:col-span-5">
              {item.coverImageUrl ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-cni-primary/10">
                  <Image src={item.coverImageUrl} alt={item.title} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                </div>
              ) : null}
              {item.locationText ? (
                <p className="inline-flex items-start gap-2 font-body text-sm text-cni-primary/70">
                  <MapPin className="mt-0.5 h-4 w-4 text-[#32B372]" aria-hidden />
                  {item.locationText}
                </p>
              ) : null}
              <Link
                href={mapHref}
                className="inline-flex w-full items-center justify-center rounded-md border border-[#334E88]/30 px-8 py-3 text-xs font-bold uppercase tracking-widest text-[#334E88] transition hover:bg-[#334E88]/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#32B372]"
              >
                {t.viewOnMapCta}
              </Link>
              <Link
                href={contactHref}
                className="inline-flex w-full items-center justify-center rounded-md bg-[#252A58] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#0E7A7C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F7BF06]"
              >
                {t.interested}
              </Link>
            </aside>
          </div>
        </Section>
      </div>
    );
  }

  if (!project) notFound();

  const region = project.region as RegionRef | null;
  const placeholder = getSectorBySlug(locale, project.sector?.slug || "")?.image || designImages.portfolio.hero;
  const heroSrc = project.cover_image_url || placeholder;
  const mapHref = L(`/portafolio/mapa?project=${encodeURIComponent(project.slug)}`);
  const contactHref = L(`/contacto?ref=${encodeURIComponent(project.code || project.slug)}`);
  const facts = [
    project.code ? [t.code, project.code] : null,
    project.sector?.name ? [t.sector, project.sector.name] : null,
    project.location_text ? [t.location, project.location_text] : null,
    formatSubregionLabel(region, locale) ? [t.region, formatSubregionLabel(region, locale)!] : null,
    region?.parent?.name ? [t.macroregion, region.parent.name] : null,
    formatPoloLabel(region) ? [t.polo, formatPoloLabel(region)!] : null,
    project.amount_text ? [t.amount, `${project.amount_text}${project.amount_notes?.[0] ? ` · ${project.amount_notes[0]}` : ""}`] : null,
    project.phase ? [t.phaseLabel, `${project.phase}${project.phase_detail ? ` — ${project.phase_detail}` : ""}`] : null,
    project.investment_type ? [t.investmentType, project.investment_type] : null,
  ].filter(Boolean) as Array<[string, string]>;

  return (
    <div className="flex flex-1 flex-col bg-[#f8f9ff]">
      <div className="-mt-28">
        <PageHero
          eyebrow={project.code || t.techSheet}
          title={project.title}
          description={project.location_text || project.summary}
          imageSrc={heroSrc}
          imageAlt={project.title}
          heightClass="min-h-[420px] md:min-h-[520px]"
          imageClassName={project.cover_image_url ? "absolute inset-0 object-cover object-top" : "absolute inset-0 object-cover"}
        />
      </div>
      <Section tone="surface">
        <Link href={L("/portafolio/fichas-proyectos")} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#334E88] hover:text-[#35A963]">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t.backSheets}
        </Link>
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0E7A7C]">{t.techSheet}</h2>
            <dl className="mt-6 divide-y divide-cni-primary/10 rounded-xl border border-cni-primary/10 bg-white">
              {facts.map(([label, value]) => (
                <div key={label} className="grid gap-1 px-5 py-4 sm:grid-cols-3">
                  <dt className="font-headline text-[11px] font-bold uppercase tracking-[0.14em] text-cni-primary/50">{label}</dt>
                  <dd className="font-body text-sm text-cni-primary sm:col-span-2">{value}</dd>
                </div>
              ))}
            </dl>
            {project.description ? (
              <section className="mt-10 max-w-3xl">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#0E7A7C]">{t.description}</h2>
                <p className="mt-4 whitespace-pre-line font-body text-base leading-relaxed text-[#252A58]">{project.description}</p>
              </section>
            ) : null}
          </div>
          <aside className="space-y-4 lg:col-span-5">
            {project.cover_image_url ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-cni-primary/10">
                <Image src={project.cover_image_url} alt={project.title} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              </div>
            ) : null}
            {project.location_text ? (
              <p className="inline-flex items-start gap-2 font-body text-sm text-cni-primary/70">
                <MapPin className="mt-0.5 h-4 w-4 text-[#32B372]" aria-hidden />
                {project.location_text}
              </p>
            ) : null}
            <Link
              href={mapHref}
              className="inline-flex w-full items-center justify-center rounded-md border border-[#334E88]/30 px-8 py-3 text-xs font-bold uppercase tracking-widest text-[#334E88] transition hover:bg-[#334E88]/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#32B372]"
            >
              {t.viewOnMapCta}
            </Link>
            <Link
              href={contactHref}
              className="inline-flex w-full items-center justify-center rounded-md bg-[#252A58] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#0E7A7C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F7BF06]"
            >
              {t.interested}
            </Link>
          </aside>
        </div>
      </Section>
    </div>
  );
}
