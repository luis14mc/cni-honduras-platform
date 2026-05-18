import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, Cpu, Sprout, Tent, Zap } from "lucide-react";
import { PageHero } from "@/src/components/cni/PageHero";
import { Section, SectionHeader } from "@/src/components/cni/Section";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { invertirPageCopy } from "@/src/i18n/copy/invertirPage";
import { getSectorHref } from "@/src/i18n/path";
import { getPathById } from "@/src/config/siteNavigation";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["invertir-sectores"]);

const ICONS = {
  agroindustria: Sprout,
  manufactura: Cpu,
  turismo: Tent,
  energia: Zap,
  infraestructura: Building2,
} as const;

export default async function SectoresIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = invertirPageCopy[locale];
  const sectors = c.sectors.map((s) => ({
    ...s,
    Icon: ICONS[s.slug as keyof typeof ICONS] ?? Sprout,
  }));

  return (
    <div className="flex flex-1 flex-col bg-[#f8f9fa]">
      <div className="-mt-28">
        <PageHero
          eyebrow={c.sectionEyebrow}
          title={c.sectionTitle}
          description={c.sectionDescription}
          heightClass="min-h-[420px] md:min-h-[480px]"
        />
      </div>
      <Section tone="white">
        <SectionHeader
          eyebrow={c.heroEyebrow}
          title={c.heroTitleBefore + " " + c.heroTitleAccent}
          description={c.heroDescription}
          action={
            <Link
              href={getPathById("invertir", locale)!}
              className="border-b-2 border-[#e9c176] pb-1 text-sm font-bold uppercase tracking-widest text-[#000a1e] hover:text-[#e9c176]"
            >
              {locale === "en" ? "Investment overview" : "Vista general de inversión"} →
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sectors.map(({ slug, name, short, Icon, image }, idx) => (
            <article
              key={slug}
              className="group relative overflow-hidden rounded-xl bg-[#f3f4f5] tonal-depth-layering transition-all hover:shadow-2xl"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image src={image} alt={name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000a1e]/80 via-[#000a1e]/20 to-transparent" />
                <span className="absolute left-4 top-4 inline-flex items-center justify-center rounded bg-[#e9c176] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-[#191c1d]">
                  {c.sectorBadge} 0{idx + 1}
                </span>
              </div>
              <div className="p-8">
                <Icon className="mb-4 h-10 w-10 text-[#3a5f94]" />
                <h3 className="text-xl font-bold text-[#000a1e]">{name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#44474e]">{short}</p>
                <Link
                  href={getSectorHref(locale, slug)}
                  className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#000a1e] transition-all group-hover:gap-3 group-hover:text-[#e9c176]"
                >
                  {c.viewDetail} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
}
