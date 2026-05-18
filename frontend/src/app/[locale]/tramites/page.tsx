import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { ArrowRight, ClipboardCheck, FileCheck2, ScrollText, ShieldCheck } from "lucide-react";
import { PageHero } from "@/src/components/cni/PageHero";
import { Section, SectionHeader } from "@/src/components/cni/Section";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { tramitesCopy } from "@/src/i18n/copy/secondaryPages";
import { resolveHref } from "@/src/i18n/path";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.tramites);

const ICONS = [FileCheck2, ShieldCheck, ClipboardCheck, ScrollText] as const;

export default async function TramitesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = tramitesCopy[locale];
  const L = (path: string) => resolveHref(locale, path);

  const rows = c.procedures.map((p, i) => ({ ...p, Icon: ICONS[i] ?? FileCheck2 }));

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: locale === "es" ? "Inicio" : "Home", item: L("/") },
      { "@type": "ListItem", position: 2, name: locale === "es" ? "Trámites en Línea" : "Online Procedures", item: L("/tramites") },
    ],
  };

  return (
    <div className="flex flex-1 flex-col bg-[#f8f9fa]">
      <Script id="breadcrumb-tramites" type="application/ld+json">
        {JSON.stringify(breadcrumb)}
      </Script>

      <div className="-mt-28">
        <PageHero
          eyebrow={c.heroEyebrow}
          title={c.heroTitle}
          description={c.heroDescription}
          heightClass="min-h-[420px] md:min-h-[460px]"
        />
      </div>

      <Section tone="surface">
        <SectionHeader eyebrow={c.sectionEyebrow} title={c.sectionTitle} description={c.sectionDescription} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {rows.map(({ Icon, title, text, cta }) => (
            <article
              key={title}
              className="group rounded-xl border border-[#c4c6cf]/30 bg-white p-8 tonal-depth-layering transition-all hover:-translate-y-1"
            >
              <Icon className="mb-6 h-10 w-10 text-[#3a5f94]" aria-hidden="true" />
              <h2 className="text-xl font-bold text-[#000a1e]">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#44474e]">{text}</p>
              <Link
                href={L("/asesoria")}
                className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#000a1e] transition-all group-hover:gap-3 group-hover:text-[#e9c176]"
                aria-label={`${cta}: ${title}`}
              >
                {cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="primary" className="relative overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-1/3 -skew-x-12 -translate-x-20 bg-[#002147] opacity-50" aria-hidden="true" />
        <div className="relative z-10 grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">{c.pdiTitle}</h2>
            <p className="mt-4 text-lg text-white/75">{c.pdiBody}</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row md:justify-end">
            <a
              href="https://pdihonduras.gob.hn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#e9c176] px-10 py-4 text-xs font-bold uppercase tracking-widest text-[#191c1d] transition hover:brightness-95"
              aria-label="Portal Digital de Inversiones de Honduras (abre en nueva pestaña)"
            >
              {c.pdiLink}
            </a>
            <Link
              href={L("/asesoria")}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white/5 px-10 py-4 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white/10"
            >
              {c.advisoryCta}
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
