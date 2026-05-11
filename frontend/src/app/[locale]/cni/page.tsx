import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  FileSearch,
  Gavel,
  Globe,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { PageHero } from "@/src/components/cni/PageHero";
import { Section, SectionHeader } from "@/src/components/cni/Section";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { cniPageCopy } from "@/src/i18n/copy/cniPage";
import { withLocale } from "@/src/i18n/path";

export default async function CniServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = cniPageCopy[locale];
  const L = (path: string) => withLocale(locale, path);

  const techIcons = [Wrench, Globe, Check] as const;

  const dataIcons = [FileSearch, BarChart3, BarChart3, Globe] as const;

  return (
    <div className="flex flex-1 flex-col bg-[#f8f9fa]">
      <div className="-mt-28">
        <PageHero
          eyebrow={c.heroEyebrow}
          title={
            <>
              {c.heroTitleBefore} <span className="text-gradient-gold">{c.heroTitleAccent}</span>
            </>
          }
          description={c.heroDescription}
          imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuDc3VS3kv8ZFwapSbMmcTxiKFUvM6QpK0flspcn8Ih_83P1mWx6BL5gsLQ7Jbz90q-D6q0VANdNiLspOADv8JVTeRCq49udWtBalmdAbu1__LkgrbC8Bypg77Hz6S6ivJ-NQrRt45mPYfXvw9S72TcWXQPqG00VmevBq-cB1cgozGI8qqgFVCQVRMwFMem1qq-2oDjJg2yJJmKT7vYiMkXBWokSPebAmn-Ob3kCT_iBGT8N8AM1qgWhG_JDUlfKBLpEHCarWq25YEuo"
          imageAlt={c.heroImageAlt}
          heightClass="min-h-[560px] md:min-h-[640px]"
        />
      </div>

      <Section id="servicios-legales" tone="surface">
        <SectionHeader eyebrow={c.legalEyebrow} title={c.legalTitle} description={c.legalDescription} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <article className="group relative overflow-hidden rounded-xl bg-white p-10 transition-colors duration-500 hover:bg-[#000a1e] md:col-span-8 tonal-depth-layering">
            <Gavel className="mb-8 h-12 w-12 text-[#a68440] transition-colors group-hover:text-white" />
            <h3 className="text-3xl font-bold text-[#000a1e] transition-colors group-hover:text-white">{c.legalCardTitle}</h3>
            <p className="mt-4 max-w-md text-lg text-[#44474e] transition-colors group-hover:text-slate-300">{c.legalCardBody}</p>
          </article>
          <div className="rounded-xl bg-[#e7e8e9] p-8 md:col-span-4">
            <ShieldCheck className="mb-6 h-10 w-10 text-[#000a1e]" />
            <h3 className="text-xl font-bold text-[#000a1e]">{c.repatTitle}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#44474e]">{c.repatBody}</p>
          </div>
          {c.fiscal.map((f) => (
            <article key={f.title} className="md:col-span-4 rounded-xl border-l-4 border-[#e9c176] bg-white p-8 tonal-depth-layering">
              <BadgeCheck className="mb-5 h-8 w-8 text-[#3a5f94]" />
              <h3 className="text-lg font-bold text-[#000a1e]">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#44474e]">{f.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="servicios-tecnicos" tone="primary">
        <SectionHeader eyebrow={c.techEyebrow} title={c.techTitle} description={c.techDescription} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {c.techItems.map((item, i) => {
            const Icon = techIcons[i] ?? Wrench;
            return (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
                <Icon className="mb-6 h-10 w-10 text-[#e9c176]" />
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{item.text}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-16">
          <h3 className="text-2xl font-extrabold text-white">{c.roadmapTitle}</h3>
          <p className="mt-3 max-w-2xl text-white/70">{c.roadmapDescription}</p>
          <div className="relative mt-12">
            <div className="absolute left-0 top-8 hidden h-px w-full bg-white/15 md:block" />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              {c.steps.map((s, i) => (
                <div key={s.code} className="relative z-10">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full text-base font-bold ${
                      i === c.steps.length - 1 ? "bg-[#e9c176] text-[#191c1d]" : "border-2 border-white/30 bg-[#000a1e] text-white"
                    }`}
                  >
                    {s.code}
                  </div>
                  <h4 className="mt-6 text-lg font-bold text-white">{s.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section id="inteligencia-de-datos" tone="surface">
        <SectionHeader
          eyebrow={c.dataEyebrow}
          title={c.dataTitle}
          description={c.dataDescription}
          action={
            <Link
              href={L("/recursos")}
              className="border-b-2 border-[#e9c176] pb-1 text-sm font-bold uppercase tracking-widest text-[#000a1e] hover:text-[#e9c176]"
            >
              {c.dataCta}
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {c.dataCards.map((card, i) => {
            const Icon = dataIcons[i] ?? FileSearch;
            return (
              <article key={card.title} className="rounded-xl border-t-4 border-[#3a5f94] bg-white p-8 tonal-depth-layering">
                <Icon className="mb-5 h-9 w-9 text-[#3a5f94]" />
                <h3 className="text-base font-bold text-[#000a1e]">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#44474e]">{card.text}</p>
              </article>
            );
          })}
        </div>
      </Section>

      <Section tone="low">
        <div className="overflow-hidden rounded-2xl bg-[#e7e8e9] shadow-xl">
          <div className="flex flex-col lg:flex-row">
            <div className="p-10 lg:w-3/5 lg:p-14">
              <h2 className="text-3xl font-extrabold text-[#000a1e]">{c.oneStopTitle}</h2>
              <p className="mt-4 text-lg leading-relaxed text-[#44474e]">{c.oneStopBody}</p>
              <ul className="mt-8 space-y-4 text-sm font-medium text-[#000a1e]">
                {c.oneStopBullets.map((b) => (
                  <li key={b} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#a68440]" />
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                href={L("/asesoria")}
                className="mt-10 inline-flex items-center gap-2 rounded-md bg-[#000a1e] px-10 py-4 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#002147]"
              >
                {c.oneStopCta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="relative min-h-[320px] flex-1 bg-[#000a1e] p-10 text-white lg:w-2/5">
              <div className="absolute inset-0 hero-gradient opacity-90" />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-[#e9c176]">{c.freeLabel}</p>
                  <p className="mt-3 text-2xl font-extrabold leading-tight">{c.freeTagline}</p>
                </div>
                <ul className="mt-6 space-y-2 text-sm text-white/80">
                  {c.freeList.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
