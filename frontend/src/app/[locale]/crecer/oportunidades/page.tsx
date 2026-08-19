import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { crecerPageCopy } from "@/src/i18n/copy/crecerPage";
import { withLocale } from "@/src/i18n/path";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { getOpportunities } from "@/src/lib/strapi/editorial";
import { loadAsyncData } from "@/src/lib/asyncData";
import type { InvestmentOpportunity } from "@/src/types/investment";
import { layout } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["crecer-oportunidades"]);

export default async function OportunidadesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = crecerPageCopy[locale];
  const L = (path: string) => withLocale(locale, path);
  const result = await loadAsyncData(() => getOpportunities(locale), [] as InvestmentOpportunity[]);

  return (
    <div className="al-crecer flex flex-1 flex-col bg-[#f4f6fb]">
      <header className="al-crecer-hero relative -mt-28 flex min-h-[58vh] flex-col justify-end overflow-hidden bg-cni-primary pt-32">
        <div className="absolute inset-0">
          <Image
            src="/images/hero/home/logistica.webp"
            alt={c.heroImageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.7]"
          />
          <div className="absolute inset-0 bg-[#12162e]/72" />
          <div className="al-crecer-hero-mesh pointer-events-none absolute inset-0 opacity-35" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e22] via-transparent to-transparent" />
        </div>
        <div className={cn("relative z-10 w-full pb-12 pt-8", layout.container)}>
          <Link
            href={L("/crecer")}
            className="mb-8 inline-flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-white/70 transition hover:text-white"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" aria-hidden />
            {locale === "es" ? "Crecer en Honduras" : "Grow in Honduras"}
          </Link>
          <p className="mb-4 font-headline text-[11px] font-bold uppercase tracking-[0.22em] text-[#32B372]">
            {c.portfolioEyebrow}
          </p>
          <h1 className="max-w-4xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-6xl">
            {c.portfolioTitle}
          </h1>
          <p className="mt-5 max-w-2xl font-body text-base text-white/80">{c.portfolioDescription}</p>
        </div>
      </header>

      <section className={cn("bg-white", layout.section)}>
        <div className={layout.container}>
          {result.status === "error" ? (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-800">
              {c.portfolioError}
            </p>
          ) : result.data.length === 0 ? (
            <p className="rounded-xl border border-dashed border-cni-primary/15 bg-[#f8f9ff] px-6 py-12 text-center text-sm text-[#0E7A7C]">
              {c.portfolioEmpty}
            </p>
          ) : (
            <div className="divide-y divide-cni-primary/10 overflow-hidden rounded-2xl border border-cni-primary/10 bg-[#f8f9ff]">
              {result.data.map((item, index) => (
                <Link
                  key={item.slug}
                  href={L(`/crecer/oportunidades/${item.slug}`)}
                  className="al-crecer-row group grid grid-cols-1 gap-4 px-6 py-6 transition-colors hover:bg-white md:grid-cols-12 md:items-center md:px-8"
                >
                  <span className="font-headline text-[11px] font-bold tracking-[0.18em] text-[#32B372] md:col-span-1">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="md:col-span-8">
                    <p className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-on-surface-variant/55">
                      {item.sector?.name || item.code || item.status}
                    </p>
                    <h2 className="mt-1 font-display text-xl font-extrabold text-cni-primary group-hover:text-[#0E7A7C]">
                      {item.title}
                    </h2>
                    {item.summary ? (
                      <p className="mt-2 line-clamp-2 font-body text-sm text-[#0E7A7C]">{item.summary}</p>
                    ) : null}
                  </div>
                  <span className="inline-flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-cni-primary md:col-span-3 md:justify-end">
                    {c.portfolioCta}
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
