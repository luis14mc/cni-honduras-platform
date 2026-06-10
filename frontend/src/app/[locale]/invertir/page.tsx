import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/src/components/cni/PageHero";
import { Section, SectionHeader } from "@/src/components/cni/Section";
import { SectorTeaserCard } from "@/src/components/cni/SectorTeaserCard";
import { SectorIcon } from "@/src/components/cni/SectorIcon";
import type { SectorSlug } from "@/src/data/investmentSectors";
import { sectorPhotoHeaders, SECTOR_ICON_SIZE } from "@/src/lib/sectorIcons";
import { isLocale } from "@/src/i18n/config";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.invertir);
import type { Locale } from "@/src/i18n/config";
import { invertirPageCopy } from "@/src/i18n/copy/invertirPage";
import { getSectorHref, withLocale } from "@/src/i18n/path";

export default async function InvertirPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = invertirPageCopy[locale];
  const L = (path: string) => withLocale(locale, path);

  const sectors = c.sectors;

  return (
    <div className="flex flex-1 flex-col bg-[#f8f9fa]">
      <div className="-mt-28">
        <PageHero
          eyebrow={c.heroEyebrow}
          title={
            <>
              {c.heroTitleBefore} <span className="text-[#e9c176]">{c.heroTitleAccent}</span> {c.heroTitleAfter}
            </>
          }
          description={c.heroDescription}
          imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuCkhGbKl8Lz7IlbOD3CCQNNw7PIii4skuAOK5RQs4CG9eZvct26UCGdfj9t-CZKKM4XilJWv1G2ipBQw0jHUn8F-fIL5gFwWYKjBlTHSnq1ZEec8HstOuCoSRg6FVR0HhcJ9D7AzmVFMbjFZi1-Z69Kg7NoqC3crywxEHSTOKQeY0GfWp7bnzJ5iPwCCHUo3FIjbUG3WD1ImAc6ZOJJ9luz1VlnxAYQe5HbpdJ6MrzjoV3b0zpjCRNFqKlhlP7K5em02xaA3ntMzPPj"
          imageAlt={c.heroImageAlt}
          heightClass="min-h-[640px] md:min-h-[720px]"
        >
          <Link
            href={L("/invertir/por-que-honduras")}
            className="inline-flex items-center gap-2 border-b-2 border-[#e9c176] pb-1 text-sm font-bold uppercase tracking-widest text-white transition hover:text-[#e9c176]"
          >
            {c.linkWhyHonduras}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </PageHero>
      </div>

      <div className="sticky top-28 z-30 glass-panel border-b border-[#c4c6cf]/30">
        <div className="mx-auto max-w-screen-2xl overflow-x-auto px-6 no-scrollbar md:px-10">
          <ul className="flex items-center gap-10 py-5">
            {sectors.map((s) => (
              <li key={s.slug}>
                <Link
                  href={getSectorHref(locale, s.slug)}
                  className="group flex items-center gap-3 whitespace-nowrap text-sm font-extrabold uppercase tracking-tight text-[#44474e] transition-colors hover:text-[#000a1e]"
                >
                  <span className="block h-[2px] w-8 bg-[#e9c176] transition-all group-hover:w-12" />
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Section id="sectores" tone="white">
        <SectionHeader eyebrow={c.sectionEyebrow} title={c.sectionTitle} description={c.sectionDescription} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sectors.map((sector, idx) => (
            <SectorTeaserCard
              key={sector.slug}
              locale={locale}
              slug={sector.slug as SectorSlug}
              name={sector.name}
              short={sector.short}
              image={sector.image}
              badge={c.sectorBadge}
              badgeIndex={idx}
              viewDetailLabel={c.viewDetail}
            />
          ))}
        </div>
      </Section>

      {sectors.map((s, idx) => {
        const slug = s.slug as SectorSlug;
        const sidePhoto = sectorPhotoHeaders[slug] ?? s.image;
        const sideUsesIcon = !sectorPhotoHeaders[slug];

        return (
        <Section key={s.slug} id={s.slug} tone={idx % 2 === 0 ? "surface" : "low"}>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className={`lg:col-span-7 ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#2e1f00]/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-[#a68440]">
                {c.sectorBadge} 0{idx + 1}
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#000a1e] md:text-4xl">{s.name}</h2>
              <p className="mt-4 max-w-2xl text-base font-bold leading-relaxed text-[#000a1e]">{s.short}</p>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#44474e]">{s.fullText}</p>
              <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {s.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-center gap-3 rounded-lg border-l-4 border-[#e9c176] bg-white px-5 py-3 text-sm font-medium text-[#000a1e] tonal-depth-layering"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#3a5f94]" />
                    {h}
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href={L("/contacto")}
                  className="inline-flex items-center gap-2 rounded-md bg-[#000a1e] px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#002147]"
                >
                  {c.ctaAdvisor}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={L("/recursos")}
                  className="inline-flex items-center gap-2 rounded-md border border-[#000a1e]/15 bg-white px-8 py-4 text-xs font-bold uppercase tracking-widest text-[#000a1e] transition hover:border-[#e9c176]"
                >
                  {c.ctaGuide}
                </Link>
              </div>
            </div>
            <div className={`lg:col-span-5 ${idx % 2 === 1 ? "lg:order-1" : ""}`}>
              {sideUsesIcon ? (
                <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-white to-[#eef0f2] tonal-depth-layering">
                  <SectorIcon slug={slug} size={SECTOR_ICON_SIZE.card} />
                </div>
              ) : (
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl tonal-depth-layering">
                  <Image src={sidePhoto} alt={s.name} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000a1e]/70 via-transparent to-transparent" />
                </div>
              )}
            </div>
          </div>
        </Section>
        );
      })}

      <section className="relative overflow-hidden bg-[#000a1e] py-24 text-white">
        <div className="absolute right-0 top-0 h-full w-1/3 skew-x-12 translate-x-20 bg-[#002147] opacity-50" />
        <div className="relative z-10 mx-auto flex max-w-screen-2xl flex-col items-start justify-between gap-10 px-6 md:flex-row md:items-center md:px-10">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">{c.ctaTitle}</h2>
            <p className="mt-4 text-lg text-white/75">{c.ctaBody}</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href={L("/contacto")}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#e9c176] px-10 py-4 text-xs font-bold uppercase tracking-widest text-[#191c1d] transition hover:brightness-95"
            >
              {c.ctaAdvisory}
            </Link>
            <Link
              href={L("/quienes-somos")}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white/5 px-10 py-4 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white/10"
            >
              {c.ctaCni}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
