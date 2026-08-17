import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Globe2, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import type { CSSProperties } from "react";
import { SectionHeader } from "@/src/components/cni/Section";
import { SectorIcon } from "@/src/components/cni/SectorIcon";
import type { SectorCopy, SectorSlug } from "@/src/data/investmentSectors";
import type { Locale } from "@/src/i18n/config";
import {
  type SectoresIndexCopy,
  SECTOR_ACCENTS,
  sectoresIndexCopy,
} from "@/src/i18n/copy/invertirPage";
import { getSectorHref, withLocale } from "@/src/i18n/path";
import { sectorPhotoHeaders } from "@/src/lib/sectorIcons";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";

type Props = {
  locale: Locale;
  copy: SectoresIndexCopy;
  sectors: ReadonlyArray<SectorCopy>;
  loadStatus?: "ok" | "error";
};

const SECTORES_HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCkhGbKl8Lz7IlbOD3CCQNNw7PIii4skuAOK5RQs4CG9eZvct26UCGdfj9t-CZKKM4XilJWv1G2ipBQw0jHUn8F-fIL5gFwWYKjBlTHSnq1ZEec8HstOuCoSRg6FVR0HhcJ9D7AzmVFMbjFZi1-Z69Kg7NoqC3crywxEHSTOKQeY0GfWp7bnzJ5iPwCCHUo3FIjbUG3WD1ImAc6ZOJJ9luz1VlnxAYQe5HbpdJ6MrzjoV3b0zpjCRNFqKlhlP7K5em02xaA3ntMzPPj";

function indexLabel(slug: SectorSlug, locale: Locale): string {
  const display = sectoresIndexCopy[locale];
  switch (slug) {
    case "agroindustria":
      return locale === "es" ? "Sector 01" : "Sector 01";
    case "manufactura":
      return locale === "es" ? "Sector 02" : "Sector 02";
    case "turismo":
      return locale === "es" ? "Sector 03" : "Sector 03";
    case "energia":
      return locale === "es" ? "Sector 04" : "Sector 04";
    case "infraestructura":
      return locale === "es" ? "Sector 05" : "Sector 05";
    case "logistica":
      return locale === "es" ? "Sector 06" : "Sector 06";
  }
  // unreachable
  void display;
  return slug;
}

function quickStat(slug: SectorSlug, locale: Locale): { value: string; label: string } {
  switch (slug) {
    case "agroindustria":
      return locale === "es"
        ? { value: "$1.2B", label: "IED sectorial · ref." }
        : { value: "$1.2B", label: "Sector FDI · ref." };
    case "manufactura":
      return locale === "es"
        ? { value: "48h", label: "Ventana a EE.UU." }
        : { value: "48h", label: "U.S. window" };
    case "turismo":
      return locale === "es"
        ? { value: "2M+", label: "Visitantes anuales · ref." }
        : { value: "2M+", label: "Annual visitors · ref." };
    case "energia":
      return locale === "es"
        ? { value: "58.6%", label: "Matriz limpia" }
        : { value: "58.6%", label: "Clean matrix" };
    case "infraestructura":
      return locale === "es"
        ? { value: "78.6%", label: "Movimiento portuario" }
        : { value: "78.6%", label: "Port throughput" };
    case "logistica":
      return locale === "es"
        ? { value: "2", label: "Costos · Atlántico y Pacífico" }
        : { value: "2", label: "Coasts · Atlantic & Pacific" };
  }
}

export function SectoresPageView({ locale, copy: c, sectors, loadStatus = "ok" }: Props) {
  const L = (path: string) => withLocale(locale, path);
  const emptyMessage =
    locale === "es"
      ? "Próximamente publicaremos los sectores priorizados."
      : "Priority sectors will be published here soon.";
  const errorMessage =
    locale === "es"
      ? "No pudimos cargar los sectores. Intente de nuevo más tarde."
      : "We could not load sectors right now. Please try again later.";

  return (
    <div className="al-sectores-index flex flex-1 flex-col bg-[#f8f9ff]">
      {/* 1. Hero institucional — overlay reforzado para legibilidad */}
      <section className="al-sectores-hero relative -mt-28 flex min-h-screen items-center overflow-hidden bg-cni-primary pb-20 pt-40 md:pb-24 md:pt-36">
        <div className="absolute inset-0">
          <Image
            src={SECTORES_HERO_IMAGE}
            alt={c.heroImageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.72]"
          />
          {/* Capa base navy fuerte */}
          <div className="absolute inset-0 bg-[#1a1f3d]/70" />
          {/* Gradiente direccional navy → teal → transparente */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(120deg, rgba(26, 31, 61, 0.92) 0%, rgba(37, 42, 88, 0.78) 42%, rgba(14, 122, 124, 0.42) 78%, rgba(14, 122, 124, 0.18) 100%)",
            }}
          />
          {/* Viñeta inferior */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e22]/55 via-transparent to-transparent" />
          {/* Mesh técnico */}
          <div className="al-sectores-hero-mesh pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        </div>

        <div className={cn(layout.container, "relative z-10")}>
          <h1
            className="max-w-5xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ textShadow: "0 2px 24px rgba(0, 0, 0, 0.55)" }}
          >
            {c.heroTitleBefore}{" "}
            <span className="al-sector-accent-text">{c.heroTitleAccent}</span>
            {c.heroTitleAfter ? ` ${c.heroTitleAfter}` : null}
          </h1>

          <p
            className="mt-6 max-w-2xl font-body text-base font-light leading-relaxed text-white/90 md:text-lg"
            style={{ textShadow: "0 1px 12px rgba(0, 0, 0, 0.45)" }}
          >
            {c.heroDescription}
          </p>

          <div className="mt-10 flex flex-col gap-8">
            <div className="flex flex-wrap gap-2.5">
              {c.heroChips.map((chip, i) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 font-headline text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm"
                >
                  <span className="text-[#29AB85]">0{i + 1}</span>
                  {chip}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link
                href={L("/invertir/por-que-honduras")}
                className={cn(
                  "inline-flex w-fit items-center gap-2 border-b-2 border-[#29AB85] pb-1 text-white transition hover:text-[#29AB85]",
                  t.button,
                )}
              >
                {c.linkWhyHonduras}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={L("/asesoria")}
                className="inline-flex items-center gap-2 rounded-md bg-[#252A58] px-6 py-3 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-md transition hover:bg-[#24436B]"
              >
                {c.ctaPrimary}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Catálogo sectorial — grid editorial con acento per-sector */}
      <section className="bg-white pt-20 md:pt-24">
        <div className={layout.container}>
          <SectionHeader
            eyebrow={c.catalogEyebrow}
            title={
              <>
                {c.catalogTitleBefore}{" "}
                <span className="al-sector-accent-text">{c.catalogTitleAccent}</span>
              </>
            }
            description={c.catalogDescription}
            action={
              <div className="hidden flex-wrap items-center gap-2 md:flex">
                {sectors.map((sector, idx) => {
                  const palette = SECTOR_ACCENTS[sector.slug];
                  if (!palette) return null;
                  return (
                    <a
                      key={sector.slug}
                      href={`#${sector.slug}`}
                      className="al-sector-jump inline-flex items-center gap-2 rounded-full border border-cni-primary/10 bg-white px-3.5 py-2 font-headline text-[10px] font-bold uppercase tracking-[0.16em] text-cni-primary shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      style={
                        {
                          "--sector-accent": palette.accent,
                          "--sector-soft": palette.soft,
                          "--sector-border": palette.border,
                        } as CSSProperties
                      }
                    >
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full font-display text-[10px] font-extrabold"
                        aria-hidden
                      >
                        0{idx + 1}
                      </span>
                      {sector.name}
                    </a>
                  );
                })}
              </div>
            }
          />

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loadStatus === "error" ? (
              <div
                role="alert"
                className="md:col-span-2 lg:col-span-3 rounded-xl border border-red-200 bg-red-50 p-10 text-center text-red-800"
              >
                {errorMessage}
              </div>
            ) : sectors.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3 rounded-xl border border-dashed border-cni-primary/15 bg-[#f8f9ff] p-10 text-center text-cni-primary/70">
                {emptyMessage}
              </div>
            ) : (
              sectors.map((sector, idx) => {
              const slug = sector.slug as SectorSlug;
              const palette = SECTOR_ACCENTS[slug];
              if (!palette) return null;
              const stat = quickStat(slug, locale);

              return (
                <Link
                  key={sector.slug}
                  id={sector.slug}
                  href={getSectorHref(locale, slug)}
                  className="al-sector-tile group relative flex min-h-[460px] flex-col overflow-hidden rounded-2xl border border-[#252A58]/8 bg-white shadow-[0_1px_0_rgba(37,42,88,0.04),0_18px_40px_-22px_rgba(37,42,88,0.18)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-transparent hover:shadow-[0_30px_60px_-22px_rgba(37,42,88,0.28)]"
                  style={
                    {
                      "--sector-accent": palette.accent,
                      "--sector-soft": palette.soft,
                      "--sector-border": palette.border,
                    } as CSSProperties
                  }
                >
                  {/* Halo de color superior */}
                  <span
                    className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full opacity-60 transition-opacity duration-700 group-hover:opacity-100"
                    style={{ background: `radial-gradient(circle, ${palette.soft} 0%, transparent 65%)` }}
                    aria-hidden
                  />

                  {/* Banda de acento superior */}
                  <span
                    className="relative z-10 h-1 w-full origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100"
                    style={{ backgroundColor: palette.accent }}
                    aria-hidden
                  />

                  {/* Header: logo + índice */}
                  <div className="relative z-10 flex items-start justify-between gap-4 px-7 pt-7">
                    <div
                      className="al-sector-tile-logo relative flex h-24 w-24 items-center justify-center rounded-2xl border transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                      style={{
                        backgroundColor: palette.soft,
                        borderColor: palette.border,
                      }}
                    >
                      <SectorIcon slug={slug} size={84} />
                      <span
                        className="pointer-events-none absolute -inset-1 -z-10 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-80"
                        style={{ backgroundColor: palette.accent }}
                        aria-hidden
                      />
                    </div>
                    <span
                      className="font-display text-3xl font-extrabold leading-none tabular-nums transition-colors duration-500"
                      style={{ color: `${palette.accent}30` }}
                      aria-hidden
                    >
                      0{idx + 1}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="relative z-10 flex flex-1 flex-col px-7 pb-7 pt-5">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-px w-6 transition-all duration-500 group-hover:w-10"
                        style={{ backgroundColor: palette.accent }}
                        aria-hidden
                      />
                      <p
                        className="font-headline text-[10px] font-bold uppercase tracking-[0.22em]"
                        style={{ color: palette.accent }}
                      >
                        {c.cardEyebrow}
                      </p>
                    </div>
                    <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight text-cni-primary md:text-[26px]">
                      {sector.name}
                    </h3>
                    <p className="mt-3 line-clamp-3 font-body text-sm leading-relaxed text-[#0E7A7C] md:text-[15px]">
                      {sector.short}
                    </p>

                    {/* Highlights como chips */}
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {sector.highlights.slice(0, 2).map((h) => (
                        <span
                          key={h}
                          className="rounded-full px-2.5 py-1 font-headline text-[10px] font-bold uppercase tracking-[0.12em]"
                          style={{
                            backgroundColor: palette.soft,
                            color: palette.accent,
                            border: `1px solid ${palette.border}`,
                          }}
                        >
                          {h}
                        </span>
                      ))}
                    </div>

                    {/* Stat + CTA anclados al fondo */}
                    <div className="mt-auto pt-6">
                      <div className="flex items-baseline justify-between border-t border-[#252A58]/8 pt-4">
                        <div>
                          <p
                            className="font-headline text-[9px] font-bold uppercase tracking-[0.22em]"
                            style={{ color: palette.accent }}
                          >
                            {c.cardStatsLabel}
                          </p>
                          <p className="mt-1 font-display text-2xl font-extrabold text-cni-primary">
                            {stat.value}
                          </p>
                        </div>
                        <span
                          className="font-headline text-[10px] font-bold uppercase tracking-[0.16em] text-right max-w-[55%]"
                          style={{ color: palette.accent }}
                        >
                          {stat.label}
                        </span>
                      </div>

                      <span
                        className="mt-5 inline-flex items-center gap-2 font-headline text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-500 group-hover:gap-3"
                        style={{ color: palette.accent }}
                      >
                        {c.cardCta}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
            )}
          </div>
        </div>
      </section>

      {/* 3. ¿Por qué estos sectores? — bloque editorial */}
      <section className={cn("bg-[#eff4ff]", "py-20 md:py-24")}>
        <div className={layout.container}>
          <SectionHeader
            eyebrow={c.whyEyebrow}
            title={
              <>
                {c.whyTitleBefore}{" "}
                <span className="al-sector-accent-text">{c.whyTitleAccent}</span>
              </>
            }
            description={c.whyDescription}
          />

          <div className="grid gap-6 md:grid-cols-3">
            {c.whyItems.map((item, idx) => {
              const Icon = [Globe2, ShieldCheck, Sparkles][idx % 3] ?? Globe2;
              return (
                <article
                  key={item.title}
                  className="al-sectores-why-card group relative overflow-hidden rounded-2xl border border-cni-primary/8 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <span className="absolute -right-4 -top-6 font-display text-7xl font-extrabold leading-none text-cni-primary/[0.04] transition-colors group-hover:text-[#29AB85]/10">
                    0{idx + 1}
                  </span>
                  <span
                    className="al-sectores-why-icon inline-flex h-12 w-12 items-center justify-center rounded-xl"
                    aria-hidden
                  >
                    <Icon className="h-5 w-5 text-[#29AB85]" />
                  </span>
                  <h3 className={cn("mt-5", t.h3Card)}>{item.title}</h3>
                  <p className={cn("mt-3", t.bodySm, "text-cni-on-surface-variant")}>
                    {item.text}
                  </p>
                  <span className="mt-6 inline-flex h-1 w-12 rounded-full bg-gradient-to-r from-[#0E7A7C] via-[#29AB85] to-[#8DC046]" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Marco macro — indicadores verificables */}
      <section className={cn("bg-white", "py-20 md:py-24")}>
        <div className={layout.container}>
          <SectionHeader
            eyebrow={c.statsEyebrow}
            title={
              <>
                {c.statsTitleBefore}{" "}
                <span className="al-sector-accent-text">{c.statsTitleAccent}</span>
              </>
            }
            description={c.statsDescription}
          />

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {c.stats.map((stat, idx) => (
              <article
                key={stat.label}
                className="al-sectores-stat group flex flex-col rounded-2xl border border-cni-primary/8 bg-[#f8f9ff] px-5 py-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#29AB85]/30 hover:shadow-md"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#29AB85]/10">
                  <TrendingUp className="h-4 w-4 text-[#29AB85]" />
                </span>
                <p className={cn("mt-4 font-display text-3xl font-extrabold text-cni-primary md:text-4xl")}>
                  {stat.value}
                </p>
                <p className={cn("mt-2 font-headline text-xs font-bold uppercase tracking-[0.12em] text-cni-secondary")}>
                  {stat.label}
                </p>
                <p className={cn("mt-1 font-body text-[11px] leading-relaxed text-cni-on-surface-variant/80")}>
                  {stat.hint}
                </p>
                <span className="mt-4 font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-on-surface-variant/55">
                  0{idx + 1}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA final — banda institucional oscura */}
      <section className="al-sectores-cta-final relative overflow-hidden bg-[#252A58] py-20 text-white md:py-24">
        <div className="site-footer-mesh pointer-events-none absolute inset-0 opacity-[0.22]" aria-hidden />
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-1/2 -skew-x-12 translate-x-24 bg-[#24436B] opacity-45"
          aria-hidden
        />
        <div className={cn(layout.container, "relative z-10")}>
          <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className={t.eyebrowOnDark}>
                {locale === "es" ? "Acompañamiento CNI" : "CNI support"}
              </p>
              <h2 className={cn("mt-3", t.h2OnDark)}>{c.ctaTitle}</h2>
              <p className={cn("mt-4 text-white/75", t.lead)}>{c.ctaBody}</p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href={L("/asesoria")}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-lg bg-[#29AB85] px-10 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#35A963]",
                )}
              >
                {c.ctaPrimary}
              </Link>
              <Link
                href={L("/recursos")}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-10 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white/10"
              >
                {c.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}