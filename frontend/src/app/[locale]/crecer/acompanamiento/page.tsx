import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { crecerPageCopy } from "@/src/i18n/copy/crecerPage";
import { withLocale } from "@/src/i18n/path";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["crecer-acompanamiento"]);

export default async function AftercarePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = crecerPageCopy[locale];
  const L = (path: string) => withLocale(locale, path);

  return (
    <div className="al-crecer flex flex-1 flex-col bg-[#f4f6fb]">
      <header className="al-crecer-hero relative -mt-28 flex min-h-[70vh] flex-col justify-end overflow-hidden bg-cni-primary pt-32">
        <div className="absolute inset-0">
          <Image
            src="/images/hero/home/energia.webp"
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
        <div className={cn("relative z-10 w-full pb-12 pt-10 md:pb-16", layout.container)}>
          <Link
            href={L("/crecer")}
            className="mb-8 inline-flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-white/70 transition hover:text-white"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" aria-hidden />
            {locale === "es" ? "Crecer en Honduras" : "Grow in Honduras"}
          </Link>
          <p className="mb-5 font-headline text-[11px] font-bold uppercase tracking-[0.22em] text-[#32B372]">
            {c.aftercareEyebrow}
          </p>
          <h1 className="max-w-4xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-6xl">
            {c.aftercareTitle}
          </h1>
          <p className="mt-6 max-w-2xl font-body text-base leading-relaxed text-white/80 md:text-lg">
            {c.aftercareBody}
          </p>
        </div>
      </header>

      <section className={cn("bg-white", layout.section)}>
        <div className={layout.container}>
          <p className={t.eyebrow}>{c.leversEyebrow}</p>
          <h2 className={cn("mt-3", t.h2)}>{c.leversTitle}</h2>
          <div className={cn("mt-4", t.sectionRule)} />
          <p className={cn("mt-6 max-w-2xl", t.lead)}>{c.leversLead}</p>
          <ol className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {c.levers.map((lever, index) => (
              <li
                key={lever.title}
                className="rounded-2xl border border-cni-primary/10 bg-[#f8f9ff] p-7"
              >
                <p className="font-display text-3xl font-extrabold text-[#32B372]">0{index + 1}</p>
                <h3 className="mt-5 font-display text-xl font-extrabold text-cni-primary">{lever.title}</h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-[#0E7A7C]">{lever.text}</p>
              </li>
            ))}
          </ol>
          <Link
            href={L("/contacto")}
            className="mt-12 inline-flex items-center gap-2 rounded-md bg-cni-primary px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#1a1f42]"
          >
            {c.advisoryCta}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
