import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Globe2,
  Handshake,
  MapPin,
  Newspaper,
  Send,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { Section, SectionHeader } from "@/src/components/cni/Section";
import type { Locale } from "@/src/i18n/config";
import { homeCopy } from "@/src/i18n/copy/home";
import { withLocale } from "@/src/i18n/path";

const VIDEO_SRC =
  "https://cdn.pixabay.com/video/2019/10/22/28227-368735500_large.mp4";

/** Imagen de referencia: estrategia de inversión y crecimiento (Unsplash). */
const HERO_INVESTMENT_IMAGE =
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=85";

const IED_ANUAL: ReadonlyArray<{ year: string; pct: number; label: string }> = [
  { year: "2019", pct: 52, label: "$0.95B" },
  { year: "2020", pct: 48, label: "$0.88B" },
  { year: "2021", pct: 62, label: "$1.05B" },
  { year: "2022", pct: 70, label: "$1.12B" },
  { year: "2023", pct: 78, label: "$1.20B" },
  { year: "2024", pct: 88, label: "$1.24B" },
];

const CLIMA_VALUES = [72, 78, 65, 81] as const;

const CIFRAS_ACCENTS = [
  "border-[#e9c176]",
  "border-[#3a5f94]",
  "border-[#002147]",
  "border-[#e9c176]",
] as const;

const CIFRAS_VALUES = ["$1.24B", "3.8%", "142", "~60%"] as const;

const PORQUE_ICONS = [Globe2, Shield, Users, Building2] as const;

type Props = { locale: Locale };

export function HomePageView({ locale }: Props) {
  const hc = homeCopy[locale];
  const L = (path: string) => withLocale(locale, path);

  return (
    <div className="flex flex-1 flex-col bg-[#f8f9fa]">
      <section className="relative -mt-28 flex min-h-[100dvh] items-center overflow-hidden bg-[#000a1e] pt-28">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-luminosity"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-[#000a1e]/90 via-[#000a1e]/65 to-[#000a1e]/40" />
        <div className="absolute inset-0 hero-gradient mix-blend-multiply opacity-30" />

        <div className="relative z-10 mx-auto grid w-full max-w-screen-2xl grid-cols-1 items-center gap-10 px-6 py-16 md:gap-12 md:px-10 lg:grid-cols-12 lg:gap-14 lg:py-20">
          <div className="lg:col-span-6 xl:col-span-7">
            <span className="mb-6 inline-flex items-center rounded-full border border-[#e9c176]/30 bg-[#2e1f00]/30 px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.28em] text-[#e9c176] backdrop-blur">
              {hc.hero.badge}
            </span>
            <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.02] tracking-tight text-white md:text-6xl lg:text-6xl xl:text-[5.25rem]">
              {hc.hero.titleLine1}{" "}
              <span className="text-[#e9c176]">{hc.hero.titleGrow}</span> {hc.hero.titleLine2}
            </h1>
            <p className="mt-8 max-w-2xl text-lg font-light leading-relaxed text-white/85 md:text-xl">{hc.hero.subtitle}</p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href={L("/invertir")}
                className="inline-flex items-center justify-center gap-3 rounded-md bg-[#e9c176] px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#191c1d] transition hover:brightness-95"
              >
                {hc.hero.ctaExplore}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#postulacion"
                className="inline-flex items-center justify-center gap-3 rounded-md border border-white/20 bg-white/10 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white backdrop-blur-md transition hover:bg-white/20"
              >
                {hc.hero.ctaProject}
                <Send className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 xl:col-span-5">
            <div className="relative mx-auto aspect-[16/11] w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-2xl shadow-black/40 ring-1 ring-[#e9c176]/20 backdrop-blur-sm lg:max-w-none lg:aspect-[4/3]">
              <Image
                src={HERO_INVESTMENT_IMAGE}
                alt={hc.hero.imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#000a1e]/50 via-transparent to-[#002147]/30"
                aria-hidden
              />
              <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg border border-white/10 bg-black/35 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-md">
                <span className="flex items-center gap-2 text-[#e9c176]">
                  <BarChart3 className="h-3.5 w-3.5" />
                  {hc.hero.imageCaption}
                </span>
                <span className="text-white/60">FDI · CAFTA-DR · LPPI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section id="postulacion" tone="surface" className="-mt-20 relative z-20 border-b border-black/5 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeader
              eyebrow={hc.postulacion.eyebrow}
              title={hc.postulacion.title}
              description={hc.postulacion.description}
            />
            <ul className="mt-6 space-y-3 text-sm text-[#44474e]">
              {hc.postulacion.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3a5f94]" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <form
            className="rounded-2xl border border-[#c4c6cf]/40 bg-white p-8 tonal-depth-layering md:p-10"
            action="#"
            method="post"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="post-nombre" className="text-[10px] font-bold uppercase tracking-widest text-[#44474e]">
                  {hc.postulacion.labels.name}
                </label>
                <input
                  id="post-nombre"
                  name="nombre"
                  required
                  className="mt-1 w-full rounded-md border border-[#c4c6cf]/50 bg-[#f8f9fa] px-3 py-2.5 text-sm text-[#191c1d] focus:border-[#3a5f94] focus:outline-none focus:ring-2 focus:ring-[#3a5f94]/25"
                />
              </div>
              <div>
                <label htmlFor="post-empresa" className="text-[10px] font-bold uppercase tracking-widest text-[#44474e]">
                  {hc.postulacion.labels.company}
                </label>
                <input
                  id="post-empresa"
                  name="empresa"
                  className="mt-1 w-full rounded-md border border-[#c4c6cf]/50 bg-[#f8f9fa] px-3 py-2.5 text-sm text-[#191c1d] focus:border-[#3a5f94] focus:outline-none focus:ring-2 focus:ring-[#3a5f94]/25"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="post-correo" className="text-[10px] font-bold uppercase tracking-widest text-[#44474e]">
                  {hc.postulacion.labels.email}
                </label>
                <input
                  id="post-correo"
                  name="correo"
                  type="email"
                  required
                  className="mt-1 w-full rounded-md border border-[#c4c6cf]/50 bg-[#f8f9fa] px-3 py-2.5 text-sm text-[#191c1d] focus:border-[#3a5f94] focus:outline-none focus:ring-2 focus:ring-[#3a5f94]/25"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="post-sector" className="text-[10px] font-bold uppercase tracking-widest text-[#44474e]">
                  {hc.postulacion.labels.sector}
                </label>
                <select
                  id="post-sector"
                  name="sector"
                  className="mt-1 w-full rounded-md border border-[#c4c6cf]/50 bg-[#f8f9fa] px-3 py-2.5 text-sm text-[#191c1d] focus:border-[#3a5f94] focus:outline-none focus:ring-2 focus:ring-[#3a5f94]/25"
                >
                  {hc.postulacion.sectors.map((s) => (
                    <option key={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="post-desc" className="text-[10px] font-bold uppercase tracking-widest text-[#44474e]">
                  {hc.postulacion.labels.summary}
                </label>
                <textarea
                  id="post-desc"
                  name="descripcion"
                  rows={4}
                  required
                  className="mt-1 w-full rounded-md border border-[#c4c6cf]/50 bg-[#f8f9fa] px-3 py-2.5 text-sm text-[#191c1d] focus:border-[#3a5f94] focus:outline-none focus:ring-2 focus:ring-[#3a5f94]/25"
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-gradient-to-br from-[#3a5f94] to-[#002147] px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition hover:brightness-110"
              >
                {hc.postulacion.submit}
                <Send className="h-4 w-4" />
              </button>
              <Link
                href={L("/asesoria")}
                className="text-center text-xs font-bold uppercase tracking-widest text-[#3a5f94] underline-offset-4 hover:underline"
              >
                {hc.postulacion.fullForm}
              </Link>
            </div>
          </form>
        </div>
      </Section>

      <Section tone="low">
        <SectionHeader eyebrow={hc.porque.eyebrow} title={hc.porque.title} description={hc.porque.description} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {hc.porque.cards.map((card, i) => {
            const Icon = PORQUE_ICONS[i] ?? Globe2;
            return (
              <article
                key={card.title}
                className="rounded-xl border-l-4 border-[#e9c176] bg-white p-8 tonal-depth-layering transition-shadow hover:shadow-xl"
              >
                <Icon className="mb-5 h-10 w-10 text-[#3a5f94]" />
                <h3 className="text-xl font-bold text-[#000a1e]">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#44474e]">{card.text}</p>
              </article>
            );
          })}
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeader
          eyebrow={hc.clima.eyebrow}
          title={hc.clima.title}
          description={hc.clima.description}
          action={
            <span className="inline-flex items-center gap-2 text-sm font-bold text-[#3a5f94]">
              <BarChart3 className="h-4 w-4" />
              {hc.clima.orientative}
            </span>
          }
        />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="glass-card rounded-xl border border-white/60 p-8 tonal-depth-layering">
            <h3 className="text-lg font-bold text-[#000a1e]">{hc.clima.iedTitle}</h3>
            <p className="mt-1 text-xs text-[#44474e]">{hc.clima.iedHint}</p>
            <div className="mt-8 space-y-4">
              {IED_ANUAL.map((row) => (
                <div key={row.year}>
                  <div className="mb-1 flex justify-between text-xs font-bold uppercase tracking-wider text-[#44474e]">
                    <span>{row.year}</span>
                    <span className="text-[#000a1e]">{row.label}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-[#e7e8e9]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#3a5f94] to-[#002147] transition-all"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-xl border border-white/60 p-8 tonal-depth-layering">
            <h3 className="text-lg font-bold text-[#000a1e]">{hc.clima.factorsTitle}</h3>
            <p className="mt-1 text-xs text-[#44474e]">{hc.clima.factorsHint}</p>
            <div className="mt-8 space-y-6">
              {hc.clima.factors.map((c, i) => {
                const value = CLIMA_VALUES[i] ?? 0;
                return (
                  <div key={c.name}>
                    <div className="mb-1 flex justify-between text-sm font-bold text-[#000a1e]">
                      <span>{c.name}</span>
                      <span className="text-[#e9c176]">{value}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#e7e8e9]">
                      <div className="h-full rounded-full bg-[#e9c176]" style={{ width: `${value}%` }} />
                    </div>
                    <p className="mt-1 text-[11px] text-[#74777f]">{c.hint}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      <Section tone="low" className="border-y border-black/5">
        <SectionHeader eyebrow={hc.cifras.eyebrow} title={hc.cifras.title} description={hc.cifras.description} />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {hc.cifras.cards.map((s, i) => (
            <article
              key={s.label}
              className={`rounded-xl border-l-4 ${CIFRAS_ACCENTS[i]} bg-white p-8 tonal-depth-layering`}
            >
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#44474e]">{s.label}</p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-4xl font-extrabold text-[#000a1e]">{CIFRAS_VALUES[i]}</span>
                <span className="mb-1 text-sm font-bold text-[#3a5f94]">{s.delta}</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#44474e]">{s.hint}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {hc.cifras.extra.map((c) => (
            <div
              key={c.label}
              className="rounded-lg border border-[#c4c6cf]/30 bg-[#f8f9fa] px-4 py-5 text-center md:px-6"
            >
              <p className="text-lg font-extrabold text-[#000a1e] md:text-xl">{c.value}</p>
              <p className="mt-2 text-[10px] font-bold uppercase leading-snug tracking-wider text-[#44474e]">
                {c.label}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
          <div className="relative lg:col-span-7">
            <div className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f3f4f5] opacity-40 blur-3xl" />
            <div className="relative">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6LIaXLMXPHukDPkTbCzX0iiHa_VA776AMwjIpVN04OuCYcV3TSd6X3rT_j8FX6wKuUfS5oM71gPVxzs4ZE9sGy7RaV6XaOEGkRsFnZ722L7GXPOIqy0oh2FX6ZYcY7B9LhGJKKsAYD4-hUN3tjC9pLccB1d5zSP2ws21tX2wj9N5fnbqAtgdg6yHKjUcuFKByXOiPXDjSeG0X75BARXOmPm65O2H5g-hVQRbdjB9n8K5ZBz0nm3cdB4xrDgaWWCzZ32K2eDudjfs8"
                alt={hc.mapaTerritorial.mapAlt}
                width={1200}
                height={900}
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="w-full rounded-xl object-cover shadow-2xl grayscale opacity-90"
              />
              <span className="pointer-events-none absolute left-1/2 top-1/3 h-4 w-4 -translate-x-1/2 rounded-full bg-[#e9c176] shadow-[0_0_0_8px_rgba(233,193,118,0.25)] animate-ping" />
              <span className="pointer-events-none absolute bottom-1/4 right-1/3 h-4 w-4 rounded-full bg-[#e9c176] animate-pulse" />
            </div>
          </div>

          <div className="space-y-8 lg:col-span-5">
            <SectionHeader
              title={
                <>
                  {hc.mapaTerritorial.titleLine1} <br />
                  {hc.mapaTerritorial.titleLine2}
                </>
              }
              description={hc.mapaTerritorial.description}
            />
            <div className="glass-card rounded-xl border border-white/50 p-8 shadow-2xl shadow-[#000a1e]/5">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#002147] text-[#e9c176]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#000a1e]">{hc.mapaTerritorial.cortesTitle}</h3>
                  <p className="text-xs uppercase tracking-widest text-[#44474e]">{hc.mapaTerritorial.cortesSubtitle}</p>
                </div>
              </div>
              <dl className="space-y-6">
                <div className="flex items-end justify-between border-b border-[#c4c6cf]/30 pb-4">
                  <dt className="text-sm font-medium text-[#44474e]">{hc.mapaTerritorial.stats.projects}</dt>
                  <dd className="text-2xl font-extrabold text-[#000a1e]">142</dd>
                </div>
                <div className="flex items-end justify-between border-b border-[#c4c6cf]/30 pb-4">
                  <dt className="text-sm font-medium text-[#44474e]">{hc.mapaTerritorial.stats.fdi}</dt>
                  <dd className="text-2xl font-extrabold text-[#000a1e]">$1.2B</dd>
                </div>
                <div className="flex items-end justify-between">
                  <dt className="text-sm font-medium text-[#44474e]">{hc.mapaTerritorial.stats.growth}</dt>
                  <dd className="inline-flex items-center gap-1 text-lg font-bold text-[#e9c176]">
                    <TrendingUp className="h-4 w-4" />
                    +8.4%
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="low">
        <SectionHeader
          title={hc.sectores.title}
          description={hc.sectores.description}
          action={
            <Link
              href={L("/invertir")}
              className="shrink-0 border-b-2 border-[#e9c176] pb-1 text-sm font-bold uppercase tracking-widest text-[#000a1e] hover:text-[#e9c176]"
            >
              {hc.sectores.cta}
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          {hc.sectores.teasers.map((s) => (
            <Link
              key={s.name}
              href={L("/invertir#sectores")}
              className="group relative overflow-hidden rounded-xl bg-white p-8 transition-all duration-300 tonal-depth-layering hover:bg-[#000a1e]"
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-bl-full bg-[#f3f4f5] opacity-50 transition-transform group-hover:scale-110 group-hover:bg-white/5" />
              <h3 className="relative z-10 text-xl font-bold text-[#000a1e] transition-colors group-hover:text-white">{s.name}</h3>
              <p className="relative z-10 mt-3 text-sm leading-relaxed text-[#44474e] transition-colors group-hover:text-white/75">
                {s.tagline}
              </p>
              <span className="relative z-10 mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#3a5f94] transition-colors group-hover:gap-4 group-hover:text-[#e9c176]">
                {hc.sectores.more} <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl bg-[#e7e8e9] tonal-depth-layering">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTOrj5aS5PfECpLevSgvjEay7592jS6zqv3dNh7PUr8I1-oQCdbDjThJ4n0WibwdkPCFBeyalABTLsyv7QqPV4j0-wcoRcrqFWnWCVAKm2UlFMYMHIUrAfOOpUw8QUlVPXeTrcVqB9cf97R2Wn44nJeA-DRlftkZWPTp3ZYJTBrUO5cxEFbG-5MGWKdMM50_yhqb3qiNosX_XDxMWKVEYUUrVcoit6WV9h6kw_iJgB9Sr2sp2qsyArwP3g4Oje-9_RQ6z_5GHOWdgo"
              alt={hc.mapaGeo.mapAlt}
              width={1100}
              height={700}
              className="h-[420px] w-full object-cover opacity-90 mix-blend-multiply"
            />
            <div className="absolute left-6 top-6 glass-card rounded-xl border border-white/50 p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 animate-pulse rounded-full bg-[#3a5f94]" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-[#3a5f94]">{hc.mapaGeo.cluster}</p>
                  <p className="text-base font-bold text-[#000a1e]">{hc.mapaGeo.fm}</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-6 right-6 glass-card rounded-xl border border-white/50 p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 animate-pulse rounded-full bg-[#e9c176]" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-[#2e1f00]">{hc.mapaGeo.energy}</p>
                  <p className="text-base font-bold text-[#000a1e]">{hc.mapaGeo.cortes}</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <SectionHeader
              eyebrow={hc.mapaGeo.eyebrow}
              title={hc.mapaGeo.title}
              description={hc.mapaGeo.description}
            />
            <Link
              href={L("/mapa")}
              className="inline-flex items-center gap-3 rounded-md bg-gradient-to-br from-[#3a5f94] to-[#002147] px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:brightness-110"
            >
              {hc.mapaGeo.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>

      <Section tone="low">
        <SectionHeader eyebrow={hc.aliados.eyebrow} title={hc.aliados.title} description={hc.aliados.description} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hc.aliados.items.map((a) => (
            <article
              key={a.name}
              className="flex gap-4 rounded-xl border border-[#c4c6cf]/30 bg-white p-6 tonal-depth-layering"
            >
              <Handshake className="mt-1 h-8 w-8 shrink-0 text-[#e9c176]" />
              <div>
                <h3 className="text-sm font-bold text-[#000a1e]">{a.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#44474e]">{a.role}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeader
          eyebrow={hc.prensa.eyebrow}
          title={hc.prensa.title}
          description={hc.prensa.description}
          action={
            <Link
              href={L("/prensa")}
              className="border-b-2 border-[#e9c176] pb-1 text-sm font-bold uppercase tracking-widest text-[#000a1e] hover:text-[#e9c176]"
            >
              {hc.prensa.cta}
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {hc.prensa.items.map((n) => (
            <article
              key={n.title}
              className="group flex h-full flex-col rounded-xl border-l-4 border-[#3a5f94] bg-white p-8 tonal-depth-layering transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#74777f]">
                <Newspaper className="h-4 w-4 text-[#3a5f94]" />
                {n.date}
              </div>
              <h3 className="mt-4 flex-1 text-lg font-bold leading-snug text-[#000a1e]">{n.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#44474e]">{n.excerpt}</p>
              <Link
                href={L("/prensa")}
                className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#3a5f94] transition-all group-hover:gap-3 group-hover:text-[#000a1e]"
              >
                {hc.prensa.readMore} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <section className="relative overflow-hidden bg-[#000a1e] py-24 text-white">
        <div className="absolute right-0 top-0 h-full w-1/2 -skew-x-12 translate-x-20 bg-[#002147] opacity-40" />
        <div className="relative z-10 mx-auto max-w-screen-2xl px-6 md:px-10">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-extrabold tracking-tight">{hc.newsletter.title}</h2>
            <p className="mt-4 text-lg text-white/70">{hc.newsletter.description}</p>
            <form className="mt-10 flex flex-col gap-4 sm:flex-row" action="#" method="post">
              <input
                type="email"
                name="email"
                required
                placeholder={hc.newsletter.placeholder}
                className="flex-1 rounded-md border border-white/20 bg-white/10 px-6 py-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#e9c176]"
              />
              <button
                type="submit"
                className="rounded-md bg-[#e9c176] px-10 py-4 text-xs font-bold uppercase tracking-widest text-[#2e1f00] transition hover:brightness-95"
              >
                {hc.newsletter.button}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
