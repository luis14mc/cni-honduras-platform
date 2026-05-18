import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Map, Network } from "lucide-react";
import type { Locale } from "@/src/i18n/config";
import { homeCopy } from "@/src/i18n/copy/home";
import { getSectors } from "@/src/data/investmentSectors";
import { designImages } from "@/src/lib/designAssets";
import { getPathById, getSectorHref, withLocale } from "@/src/i18n/path";

type Props = { locale: Locale };

const SECTOR_IMAGES: Record<string, string> = {
  agroindustria: designImages.home.sectorAgro,
  manufactura: designImages.home.sectorMfg,
  turismo: designImages.home.sectorTourism,
  energia: designImages.home.sectorEnergy,
  infraestructura: designImages.home.sectorInfra,
};

export function HomePageView({ locale }: Props) {
  const hc = homeCopy[locale];
  const L = (path: string) => withLocale(locale, path);
  const sectors = getSectors(locale);

  return (
    <div className="flex flex-1 flex-col bg-[#f8f9fa]">
      {/* Hero — temp-design/Home */}
      <header className="relative -mt-28 flex min-h-screen min-h-[700px] items-center overflow-hidden asymmetric-clip bg-[#000a1e] pt-28">
        <div className="absolute inset-0 z-0">
          <Image
            src={designImages.home.heroCoast}
            alt={hc.hero.imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#000a1e] via-[#000a1e]/40 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-6 py-16 md:px-10">
          <div className="max-w-4xl">
            <span className="mb-6 inline-block rounded-full border border-[#e9c176]/30 px-4 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-[#e9c176]">
              {hc.hero.badge}
            </span>
            <h1 className="font-headline text-5xl font-extrabold leading-tight tracking-tight text-white md:text-7xl">
              {hc.hero.titleLine1}{" "}
              <span className="text-[#ffdea5]">{hc.hero.titleGrow}</span>
              {hc.hero.titleLine2 ? ` ${hc.hero.titleLine2}` : ""}
            </h1>
            <p className="mt-8 max-w-2xl text-xl font-light leading-relaxed text-[#708ab5]">{hc.hero.subtitle}</p>
            <div className="mt-12 flex flex-wrap gap-6">
              <Link
                href={L("/invertir")}
                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#002147] to-[#3a5f94] px-10 py-4 text-lg font-bold text-white transition hover:shadow-xl active:scale-95"
              >
                {hc.hero.ctaExplore}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href={L("/crecer")}
                className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-10 py-4 text-lg font-bold text-white backdrop-blur-md transition hover:bg-white/10 active:scale-95"
              >
                {hc.hero.ctaGrow}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Bento value props */}
      <section className="relative z-20 mx-auto -mt-16 max-w-screen-2xl px-6 md:px-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-xl bg-white p-10 shadow-sm transition-colors duration-500 hover:bg-[#002147] md:col-span-2">
            <Network className="mb-6 block h-10 w-10 text-[#e9c176]" />
            <h3 className="font-headline text-3xl font-bold text-[#000a1e] group-hover:text-white">{hc.bento.port.title}</h3>
            <p className="mt-4 text-lg leading-relaxed text-[#44474e] group-hover:text-[#708ab5]">{hc.bento.port.text}</p>
            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[#e7e8e9]">
              <div className="h-full w-[78.6%] bg-[#e9c176] transition-all duration-1000" />
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-xl bg-[#3a5f94] p-10 text-white shadow-sm">
            <div>
              <h3 className="font-headline text-2xl font-bold">{hc.bento.talent.title}</h3>
              <p className="mt-4 leading-relaxed text-white/90">{hc.bento.talent.text}</p>
            </div>
            <div className="mt-8 flex items-baseline gap-2">
              <span className="text-5xl font-bold">#1</span>
              <span className="text-sm uppercase tracking-widest opacity-70">{hc.bento.talent.rank}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 md:col-span-3 md:grid-cols-2">
            <div className="flex items-center gap-8 rounded-xl bg-[#002147] p-10 text-white">
              <div className="flex-1">
                <h4 className="mb-2 text-[0.65rem] font-bold uppercase tracking-widest text-[#e9c176]">
                  {hc.bento.export.label}
                </h4>
                <span className="font-headline text-4xl font-extrabold tracking-tighter">{hc.bento.export.value}</span>
                <p className="mt-2 text-sm text-[#708ab5]">{hc.bento.export.hint}</p>
              </div>
              <div className="hidden h-24 w-px bg-white/10 md:block" />
              <div className="flex-1">
                <h4 className="mb-2 text-[0.65rem] font-bold uppercase tracking-widest text-[#e9c176]">
                  {hc.bento.maquila.label}
                </h4>
                <span className="font-headline text-4xl font-extrabold tracking-tighter">{hc.bento.maquila.value}</span>
                <p className="mt-2 text-sm text-[#708ab5]">{hc.bento.maquila.hint}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sectores estratégicos */}
      <section className="bg-[#f3f4f5] py-24">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
          <div className="mb-16 text-center">
            <h2 className="font-headline text-4xl font-bold text-[#000a1e] md:text-5xl">{hc.sectores.title}</h2>
            <div className="mx-auto mt-4 h-1 w-24 bg-[#e9c176]" />
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
            {sectors.map((s) => (
              <Link
                key={s.slug}
                href={getSectorHref(locale, s.slug)}
                className="group cursor-pointer overflow-hidden rounded-xl bg-white transition-all duration-300 hover:shadow-2xl"
              >
                <div className="relative aspect-[1.19/1] overflow-hidden">
                  <Image
                    src={SECTOR_IMAGES[s.slug] ?? s.image}
                    alt={s.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-headline font-bold text-[#000a1e]">{s.name.replace(/ Premium.*/i, "").replace(/ &.*/i, "")}</h3>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href={L("/invertir/sectores")}
              className="inline-flex items-center gap-2 border-b-2 border-[#e9c176] pb-1 text-sm font-bold uppercase tracking-widest text-[#000a1e] hover:text-[#e9c176]"
            >
              {hc.sectores.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Honduras en cifras */}
      <section className="bg-[#000a1e] py-24 text-white">
        <div className="mx-auto grid max-w-screen-2xl grid-cols-1 items-center gap-16 px-6 md:px-10 lg:grid-cols-2">
          <div>
            <h2 className="font-headline text-4xl font-bold md:text-5xl">{hc.cifras.title}</h2>
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
              {hc.cifras.stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`border-l-4 py-2 pl-6 ${i % 2 === 0 ? "border-[#e9c176]" : "border-[#3a5f94]"}`}
                >
                  <span className="block text-3xl font-bold text-[#e9c176]">{stat.value}</span>
                  <p className="mt-1 text-sm uppercase tracking-wider text-[#708ab5]">{stat.label}</p>
                  <p className="mt-3 text-xs opacity-70">{stat.hint}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
              <div className="relative flex aspect-square items-center justify-center">
                <div className="pointer-events-none absolute inset-0 opacity-20">
                  <div className="h-full w-full bg-[radial-gradient(circle_at_center,#3a5f94,transparent)] blur-3xl" />
                </div>
                <div className="relative z-10 text-center">
                  <Map className="mx-auto mb-4 h-20 w-20 text-[#e9c176]" />
                  <h4 className="font-headline text-xl font-bold">{hc.mapaTerritorial.titleLine1}</h4>
                  <p className="mt-2 text-sm text-[#708ab5]">{hc.mapaTerritorial.description}</p>
                  <Link
                    href={L("/mapa")}
                    className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#e9c176] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#191c1d] transition hover:brightness-95"
                  >
                    {hc.mapaGeo.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Casos de éxito */}
      <section className="bg-[#f8f9fa] py-24">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
          <h2 className="mb-16 text-center font-headline text-4xl font-bold text-[#000a1e]">{hc.testimonials.title}</h2>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {hc.testimonials.items.map((t, i) => (
              <div
                key={t.name}
                className={`relative rounded-xl bg-white p-12 shadow-sm ${i === 0 ? "border-t-8 border-[#e9c176]" : "border-t-8 border-[#3a5f94]"}`}
              >
                <span
                  className={`absolute -right-4 -top-4 font-serif text-7xl italic leading-none ${i === 0 ? "text-[#e9c176]/20" : "text-[#3a5f94]/20"}`}
                >
                  “
                </span>
                <p className="mb-8 text-xl font-light italic leading-relaxed text-[#44474e]">“{t.quote}”</p>
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full font-bold text-white ${i === 0 ? "bg-[#002147]" : "bg-[#3a5f94]"}`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-[#000a1e]">{t.name}</p>
                    <p className="text-sm text-[#44474e]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href={L("/crecer/acompanamiento")}
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#000a1e] hover:text-[#e9c176]"
            >
              {hc.testimonials.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Aliados */}
      <section className="bg-[#e1e3e4]/30 py-16">
        <div className="mx-auto max-w-screen-2xl px-6 text-center md:px-10">
          <p className="mb-10 text-sm uppercase tracking-widest text-[#74777f]">{hc.aliados.eyebrow}</p>
          <div className="mx-auto max-w-4xl opacity-70 grayscale transition-all duration-500 hover:grayscale-0">
            <Image
              src={designImages.home.allies}
              alt={hc.aliados.title}
              width={1200}
              height={200}
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-[#c4c6cf]/30 bg-white py-20">
        <div className="mx-auto max-w-2xl px-6 text-center md:px-10">
          <h2 className="font-headline text-3xl font-bold text-[#000a1e]">{hc.newsletter.title}</h2>
          <p className="mt-4 text-[#44474e]">{hc.newsletter.description}</p>
          <form className="mt-8 flex flex-col gap-3 sm:flex-row" action="#" method="post">
            <input
              type="email"
              placeholder={hc.newsletter.placeholder}
              className="flex-1 rounded-md border border-[#c4c6cf]/40 bg-[#f8f9fa] px-4 py-3 text-sm outline-none gold-border-focus"
            />
            <button
              type="submit"
              className="rounded-md bg-[#000a1e] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#002147]"
            >
              {hc.newsletter.button}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
