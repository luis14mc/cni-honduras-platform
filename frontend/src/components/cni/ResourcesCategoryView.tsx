import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/src/i18n/config";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { designImages } from "@/src/lib/designAssets";
import {
  getResourceCategoryUi,
  type ResourceCategory,
} from "@/src/data/resourceCategories";

type Props = {
  locale: Locale;
  category: ResourceCategory;
};

export function ResourcesCategoryView({ locale, category }: Props) {
  const ui = getResourceCategoryUi(locale);
  const L = (p: string) => resolveHref(locale, p);
  const docs = category.docs[locale];
  const master = category.master[locale];

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <header className="relative flex h-[60vh] min-h-[400px] items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={designImages.resourcesDetail.hero}
            alt={category.heroAlt[locale]}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#000a1e] via-[#000a1e]/80 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-8 lg:px-12">
          <Link
            href={L("/recursos")}
            className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#e9c176] hover:text-white"
          >
            <MaterialIcon name="arrow_back" className="text-sm" />
            {ui.backToList}
          </Link>
          <div className="max-w-2xl">
            <span className="mb-4 inline-block text-xs font-bold uppercase tracking-[0.28em] text-[#e9c176]/90">
              {ui.eyebrow}
            </span>
            <div className="mb-8 h-1 w-20 bg-[#e9c176]" />
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white md:text-6xl">
              {category.title[locale]}
            </h1>
            <p className="max-w-xl text-xl leading-relaxed text-white/80">{category.description[locale]}</p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-8 py-24 lg:px-12">
        <div className="mb-16 flex flex-col items-end justify-between gap-8 md:flex-row">
          <div className="space-y-4">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#a68440]">
              {ui.directoryEyebrow}
            </span>
            <h2 className="text-4xl font-bold text-[#000a1e]">{category.directoryTitle[locale]}</h2>
          </div>
          <div className="flex w-full max-w-xs items-center gap-3 rounded-xl bg-[#e7e8e9] px-4 py-3 md:w-80">
            <MaterialIcon name="search" className="text-[#74777f]" />
            <input
              type="search"
              placeholder={ui.search}
              aria-label={ui.search}
              className="w-full border-none bg-transparent text-sm font-medium focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {docs.map((d) => (
            <article
              key={d.title}
              className={`group flex flex-col justify-between rounded-xl bg-white p-8 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,10,30,0.06)] ${d.featured ? "border-t-4 border-[#e9c176]" : ""}`}
            >
              <div>
                <div
                  className={`mb-6 flex h-12 w-12 items-center justify-center rounded-lg ${d.featured ? "bg-[#2e1f00] text-[#e9c176]" : "bg-[#002147] text-[#e9c176]"}`}
                >
                  <MaterialIcon name={d.icon} filled className="text-3xl" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-[#000a1e]">{d.title}</h3>
                <p className="mb-8 leading-relaxed text-[#44474e]">{d.text}</p>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  className="flex-1 rounded-lg bg-[#000a1e] py-3 text-sm font-bold text-white transition-transform active:scale-95"
                  aria-label={`${ui.download}: ${d.title}`}
                >
                  {ui.download}
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-lg bg-[#e7e8e9] py-3 text-sm font-bold text-[#191c1d] transition-all hover:bg-[#e1e3e4]"
                  aria-label={`${ui.view}: ${d.title}`}
                >
                  {ui.view}
                </button>
              </div>
            </article>
          ))}

          <article className="relative col-span-1 flex flex-col items-center gap-12 overflow-hidden rounded-xl bg-[#002147] p-12 md:flex-row lg:col-span-3">
            <div className="absolute -mr-20 -mt-20 right-0 top-0 h-64 w-64 rounded-full bg-[#e9c176]/10 blur-3xl" aria-hidden />
            <div className="relative z-10 flex-1">
              <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-[#e9c176]">
                {master.tag}
              </span>
              <h3 className="mb-4 text-3xl font-bold text-white md:text-4xl">{master.title}</h3>
              <p className="mb-8 max-w-2xl text-lg leading-relaxed text-[#708ab5]">{master.text}</p>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  className="rounded-lg bg-[#e9c176] px-8 py-4 font-bold text-[#2e1f00] transition-all hover:brightness-110 active:scale-95"
                >
                  {master.primary}
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#708ab5]/30 px-8 py-4 font-bold text-white transition-all hover:bg-[#708ab5]/10"
                >
                  {master.secondary}
                </button>
              </div>
            </div>
            <div className="relative z-10 hidden md:block" aria-hidden>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
                <MaterialIcon name="book_4" filled className="text-[120px] text-[#e9c176]" />
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="bg-[#edeeef] px-8 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#000a1e]">
            <MaterialIcon name="support_agent" className="text-4xl text-[#e9c176]" />
          </div>
          <h2 className="mb-6 text-4xl font-bold text-[#000a1e]">{ui.helpTitle}</h2>
          <p className="mb-10 text-xl leading-relaxed text-[#44474e]">{ui.helpText}</p>
          <div className="flex flex-col justify-center gap-6 sm:flex-row">
            <Link
              href={L("/asesoria")}
              className="rounded-lg bg-[#000a1e] px-10 py-4 text-lg font-bold text-white shadow-xl shadow-[#000a1e]/20 transition-all hover:-translate-y-1"
            >
              {ui.helpPrimary}
            </Link>
            <Link
              href={L("/recursos")}
              className="rounded-lg border border-[#c4c6cf]/30 bg-white px-10 py-4 text-lg font-bold text-[#000a1e] transition-all hover:bg-[#f8f9fa]"
            >
              {ui.helpSecondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
