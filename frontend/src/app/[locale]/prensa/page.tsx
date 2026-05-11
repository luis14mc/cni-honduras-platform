import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Calendar, Megaphone, Newspaper } from "lucide-react";
import { PageHero } from "@/src/components/cni/PageHero";
import { Section, SectionHeader } from "@/src/components/cni/Section";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { prensaCopy } from "@/src/i18n/copy/secondaryPages";
import { withLocale } from "@/src/i18n/path";

const ICONS = {
  news: Newspaper,
  event: Calendar,
  release: Megaphone,
} as const;

export default async function PrensaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = prensaCopy[locale];
  const L = (path: string) => withLocale(locale, path);

  return (
    <div className="flex flex-1 flex-col bg-[#f8f9fa]">
      <div className="-mt-28">
        <PageHero
          eyebrow={c.heroEyebrow}
          title={c.heroTitle}
          description={c.heroDescription}
          heightClass="min-h-[420px] md:min-h-[460px]"
        />
      </div>

      <Section tone="surface">
        <SectionHeader
          eyebrow={c.sectionEyebrow}
          title={c.sectionTitle}
          action={
            <Link
              href={L("/asesoria")}
              className="border-b-2 border-[#e9c176] pb-1 text-sm font-bold uppercase tracking-widest text-[#000a1e] hover:text-[#e9c176]"
            >
              {c.contactCta}
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {c.items.map((item) => {
            const Icon = ICONS[item.typeKey];
            const typeLabel = c.types[item.typeKey];
            return (
              <article
                key={item.title}
                className="group rounded-xl border-l-4 border-[#e9c176] bg-white p-8 tonal-depth-layering transition-all hover:-translate-y-1"
              >
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#3a5f94]">
                  <span className="inline-flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {typeLabel}
                  </span>
                  <time>{item.date}</time>
                </div>
                <h3 className="mt-4 text-lg font-bold leading-snug text-[#000a1e]">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#44474e]">{item.summary}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#000a1e] transition-all group-hover:gap-3 group-hover:text-[#e9c176]">
                  {c.readMore} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </article>
            );
          })}
        </div>
      </Section>

      <Section tone="primary" className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 skew-x-12 translate-x-16 bg-[#002147] opacity-40" />
        <div className="relative z-10 grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">{c.newsroomTitle}</h2>
            <p className="mt-4 text-lg text-white/75">{c.newsroomBody}</p>
          </div>
          <div className="md:flex md:justify-end">
            <Link
              href="mailto:info@cni.hn"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#e9c176] px-10 py-4 text-xs font-bold uppercase tracking-widest text-[#191c1d] transition hover:brightness-95"
            >
              info@cni.hn
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
