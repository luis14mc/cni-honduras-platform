import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Download, FileText, FolderOpen, Search } from "lucide-react";
import { PageHero } from "@/src/components/cni/PageHero";
import { Section, SectionHeader } from "@/src/components/cni/Section";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { recursosPageCopy } from "@/src/i18n/copy/recursosPage";
import { withLocale } from "@/src/i18n/path";

export default async function RecursosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = recursosPageCopy[locale];
  const L = (path: string) => withLocale(locale, path);

  return (
    <div className="flex flex-1 flex-col bg-[#f8f9fa]">
      <div className="-mt-28">
        <PageHero
          eyebrow={c.heroEyebrow}
          title={c.heroTitle}
          description={c.heroDescription}
          imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuCdeI-WkdY5QFtNnd2a8ZrroFonITqMJnilc4gRMvgabyuUcopeUlv_pL-yv-4hMCgEqjkRVdFIMZcpYADaBnS88_LFD_xK_PChdcFPClk5pIAosEGBBEDdl51dsIpwiiFS2SdOq35GM2yJyvksNL43-_NEUL_uWBAWIh2RKClpecDSMQdYWaMa5BiqK81uZgU_-CAh2jhSj8ujXJ4PLu6Oo6ea2r1oO1Ww4FbjJFmKnrTkgA7iSaq2vY1RBOuBbn-swfzeE9ljdNEG"
          imageAlt={c.heroImageAlt}
          heightClass="min-h-[480px] md:min-h-[520px]"
          align="center"
        >
          <form action="#" method="get" className="mx-auto max-w-2xl">
            <label htmlFor="search" className="sr-only">
              {c.searchLabel}
            </label>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
              <input
                id="search"
                type="search"
                name="q"
                placeholder={c.searchPlaceholder}
                className="w-full rounded-xl border border-white/15 bg-white/10 py-4 pl-14 pr-6 text-base text-white placeholder:text-white/40 backdrop-blur focus:border-[#e9c176] focus:outline-none focus:ring-2 focus:ring-[#e9c176]/40"
              />
            </div>
          </form>
        </PageHero>
      </div>

      <Section tone="surface">
        <SectionHeader eyebrow={c.explorerEyebrow} title={c.explorerTitle} />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {c.folders.map((f) => (
            <Link
              key={f.name}
              href={f.href}
              className={`group rounded-xl bg-white p-8 tonal-depth-layering transition-all hover:-translate-y-1 ${
                f.featured ? "border-b-4 border-[#e9c176]" : ""
              }`}
            >
              <div className="mb-6 flex items-start justify-between">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-lg transition-colors ${
                    f.featured
                      ? "bg-[#2e1f00]/10 text-[#a68440] group-hover:bg-[#a68440] group-hover:text-white"
                      : "bg-[#000a1e]/5 text-[#000a1e] group-hover:bg-[#000a1e] group-hover:text-white"
                  }`}
                >
                  <FolderOpen className="h-7 w-7" />
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest ${
                    f.featured ? "text-[#a68440]" : "text-[#74777f]"
                  }`}
                >
                  {f.count}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#000a1e]">{f.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#44474e]">{f.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#3a5f94] transition-all group-hover:gap-3">
                {c.exploreFolder}
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section id="guia" tone="low">
        <SectionHeader eyebrow={c.recentEyebrow} title={c.recentTitle} description={c.recentDescription} />
        <div className="overflow-hidden rounded-xl bg-white tonal-depth-layering">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#000a1e] text-white">
                <tr className="text-[10px] uppercase tracking-[0.18em]">
                  <th className="px-6 py-4 font-semibold">{c.thResource}</th>
                  <th className="px-6 py-4 font-semibold">{c.thCategory}</th>
                  <th className="px-6 py-4 font-semibold">{c.thSize}</th>
                  <th className="px-6 py-4 text-right font-semibold">{c.thAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edeeef]">
                {c.docs.map((d) => (
                  <tr key={d.title} className="hover:bg-[#f8f9fa]">
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-3">
                        <FileText className="mt-0.5 h-5 w-5 text-[#a68440]" />
                        <div>
                          <p className="font-bold text-[#000a1e]">{d.title}</p>
                          <p className="mt-1 text-xs text-[#74777f]">{d.subtitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="rounded-full bg-[#000a1e]/5 px-3 py-1 text-xs font-bold text-[#000a1e]">{d.category}</span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-[#000a1e]">{d.size}</p>
                      <p className="text-[10px] uppercase tracking-tight text-[#74777f]">{d.date}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-md bg-[#e7e8e9] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#000a1e] transition hover:bg-[#000a1e] hover:text-white"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {c.download}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section tone="primary" className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 -skew-x-12 translate-x-20 bg-[#002147] opacity-40" />
        <div className="relative z-10 grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">{c.ctaTitle}</h2>
            <p className="mt-4 text-lg text-white/75">{c.ctaBody}</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row md:justify-end">
            <Link
              href={L("/asesoria")}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#e9c176] px-10 py-4 text-xs font-bold uppercase tracking-widest text-[#191c1d] transition hover:brightness-95"
            >
              {c.ctaData}
            </Link>
            <Link
              href={L("/cni")}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white/5 px-10 py-4 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white/10"
            >
              {c.ctaCni}
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
