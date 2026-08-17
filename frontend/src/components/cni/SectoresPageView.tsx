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

function quickStats(
  slug: SectorSlug,
  locale: Locale,
): ReadonlyArray<{ value: string; label: string }> {
  switch (slug) {
    case "agroindustria":
      return locale === "es"
        ? [
            { value: "$1.2B", label: "IED sectorial · ref." },
            { value: "14%", label: "Aporte al PIB" },
          ]
        : [
            { value: "$1.2B", label: "Sector FDI · ref." },
            { value: "14%", label: "GDP share" },
          ];
    case "manufactura":
      return locale === "es"
        ? [
            { value: "48h", label: "Ventana a EE.UU." },
            { value: "ZOLI", label: "Régimen de zonas libres" },
          ]
        : [
            { value: "48h", label: "U.S. window" },
            { value: "ZOLI", label: "Free-zone regime" },
          ];
    case "turismo":
      return locale === "es"
        ? [
            { value: "2M+", label: "Visitantes anuales · ref." },
            { value: "ZOLT", label: "Zonas turísticas" },
          ]
        : [
            { value: "2M+", label: "Annual visitors · ref." },
            { value: "ZOLT", label: "Tourist zones" },
          ];
    case "energia":
      return locale === "es"
        ? [
            { value: "58.6%", label: "Matriz limpia" },
            { value: "LPPI", label: "Incentivos fiscales" },
          ]
        : [
            { value: "58.6%", label: "Clean matrix" },
            { value: "LPPI", label: "Fiscal incentives" },
          ];
    case "infraestructura":
      return locale === "es"
        ? [
            { value: "78.6%", label: "Movimiento portuario" },
            { value: "APP", label: "Modelo público-privado" },
          ]
        : [
            { value: "78.6%", label: "Port throughput" },
            { value: "PPP", label: "Public-private model" },
          ];
    case "logistica":
      return locale === "es"
        ? [
            { value: "2", label: "Costas conectadas" },
            { value: "Hub", label: "Regional activo" },
          ]
        : [
            { value: "2", label: "Connected coasts" },
            { value: "Hub", label: "Active regional" },
          ];
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

      {/* 2. Catálogo sectorial — feature rows alternados (estilo editorial) */}
      <section className="bg-[#f8f9ff] py-section-padding-y">
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
          />

          <div className="mt-16 flex flex-col gap-16 lg:gap-24">
            {loadStatus === "error" ? (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-red-800"
              >
                {errorMessage}
              </div>
            ) : sectors.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-cni-primary/15 bg-white p-10 text-center text-cni-primary/70">
                {emptyMessage}
              </div>
            ) : (
              sectors.map((sector, idx) => {
              const slug = sector.slug as SectorSlug;
              const palette = SECTOR_ACCENTS[slug];
              if (!palette) return null;
              const photoSrc = sectorPhotoHeaders[slug] ?? sector.image;
              const stats = quickStats(slug, locale);
              const reverse = idx % 2 === 1;

              return (
                <Link
                  key={sector.slug}
                  id={sector.slug}
                  href={getSectorHref(locale, slug)}
                  className="al-sector-feature group relative flex flex-col overflow-hidden rounded-[20px] bg-[#252A58] shadow-[0_20px_50px_-20px_rgba(15,28,48,0.6)] transition-shadow duration-500 hover:shadow-[0_30px_70px_-18px_rgba(15,28,48,0.7)] lg:flex-row"
                  style={
                    {
                      "--sector-accent": palette.accent,
                      "--sector-soft": palette.soft,
                      "--sector-border": palette.border,
                    } as CSSProperties
                  }
                >
                  {/* Imagen — 7/12 en desktop */}
                  <div
                    className={cn(
                      "relative h-[300px] overflow-hidden sm:h-[400px] lg:h-auto lg:w-7/12",
                      reverse && "lg:order-2",
                    )}
                  >
                    <Image
                      src={photoSrc}
                      alt={sector.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0 bg-[#252A58]/20 mix-blend-multiply transition-colors duration-500 group-hover:bg-[#252A58]/10"
                      aria-hidden
                    />
                  </div>

                  {/* Contenido — 5/12 en desktop */}
                  <div
                    className={cn(
                      "relative flex flex-col gap-8 pb-10 pt-0 sm:pb-12 lg:w-5/12 lg:pb-14",
                      reverse ? "lg:order-1 lg:pr-14" : "lg:pl-14",
                    )}
                  >
                    {/* Línea de acento vertical en el borde exterior */}
                    <span
                      className={cn(
                        "absolute top-0 bottom-0 w-[3px]",
                        reverse ? "right-0" : "left-0",
                      )}
                      style={{ backgroundColor: palette.accent }}
                      aria-hidden
                    />

                    {/* Tira blanca desde el borde superior del card hasta el ícono */}
                    <div className={cn("flex w-full", reverse ? "justify-end" : "justify-start")}>
                      <div
                        className="relative -mt-px inline-flex w-24 flex-col items-center justify-end rounded-b-2xl bg-white px-3 pb-4 pt-10 shadow-[0_14px_32px_-14px_rgba(0,0,0,0.55)] transition-transform duration-500 ease-out group-hover:-translate-y-1"
                        style={{
                          border: `1px solid ${palette.accent}55`,
                          borderTop: "none",
                        }}
                      >
                        <SectorIcon slug={slug} size={72} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-6">
                      <h3
                        className="max-w-md break-words font-display text-3xl font-extrabold leading-tight text-white transition-colors duration-300 lg:text-[40px]"
                        style={{ letterSpacing: "-0.02em" }}
                      >
                        {sector.name}
                      </h3>

                      <p className="max-w-md font-body text-base leading-relaxed text-white/70 lg:text-lg">
                        {sector.short}
                      </p>
                    </div>

                    {/* Stats — 2 columnas con divisor superior */}
                    <div className="grid grid-cols-2 gap-6 border-t border-white/15 pt-6">
                      {stats.map((s, i) => (
                        <div key={`${s.value}-${i}`}>
                          <p className="font-display text-[36px] font-extrabold leading-none text-white lg:text-[40px]">
                            {s.value}
                          </p>
                          <p
                            className="mt-2 font-headline text-[10px] font-bold uppercase tracking-[0.18em] lg:text-[11px]"
                            style={{ color: palette.accent }}
                          >
                            {s.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* CTA — anclado al fondo */}
                    <span
                      className="mt-auto inline-flex items-center gap-2 self-start font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300"
                    >
                      {c.cardCta}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
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
                  className="al-sectores-tile group relative flex flex-col overflow-hidden rounded-2xl border border-[#252A58]/8 bg-white p-8 shadow-[0_1px_0_rgba(37,42,88,0.04),0_18px_40px_-22px_rgba(37,42,88,0.18)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-22px_rgba(37,42,88,0.28)]"
                >
                  <span className="pointer-events-none absolute right-6 top-5 font-display text-3xl font-extrabold leading-none tabular-nums text-[#29AB85]/20">
                    0{idx + 1}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="h-px w-6 bg-[#29AB85]" />
                    <p className="font-headline text-[10px] font-bold uppercase tracking-[0.22em] text-[#29AB85]">
                      {c.whyEyebrow}
                    </p>
                  </div>

                  <span
                    className="al-sectores-why-icon mt-5 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                    aria-hidden
                  >
                    <Icon className="h-5 w-5 text-[#29AB85]" />
                  </span>
                  <h3 className={cn("mt-5", t.h3Card)}>{item.title}</h3>
                  <p className={cn("mt-3", t.bodySm, "text-cni-on-surface-variant")}>
                    {item.text}
                  </p>
                  <span className="mt-auto inline-flex h-1 w-12 rounded-full bg-gradient-to-r from-[#0E7A7C] via-[#29AB85] to-[#8DC046]" />
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

          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
            {c.stats.map((stat, idx) => (
              <article
                key={stat.label}
                className="al-sectores-tile group relative flex flex-col overflow-hidden rounded-2xl border border-[#252A58]/8 bg-white p-6 shadow-[0_1px_0_rgba(37,42,88,0.04),0_18px_40px_-22px_rgba(37,42,88,0.18)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-22px_rgba(37,42,88,0.28)]"
              >
                <span className="pointer-events-none absolute right-5 top-4 font-display text-2xl font-extrabold leading-none tabular-nums text-[#29AB85]/20">
                  0{idx + 1}
                </span>

                <div className="flex items-center gap-2">
                  <span className="h-px w-5 bg-[#29AB85]" />
                  <p className="font-headline text-[10px] font-bold uppercase tracking-[0.22em] text-[#29AB85]">
                    {c.statsEyebrow}
                  </p>
                </div>

                <span className="mt-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#29AB85]/10">
                  <TrendingUp className="h-4 w-4 text-[#29AB85]" />
                </span>
                <p className="mt-5 font-display text-3xl font-extrabold leading-none text-cni-primary md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-3 font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-secondary">
                  {stat.label}
                </p>
                <p className="mt-2 font-body text-[11px] leading-relaxed text-cni-on-surface-variant/80">
                  {stat.hint}
                </p>
                <span className="mt-auto inline-flex h-1 w-10 rounded-full bg-gradient-to-r from-[#0E7A7C] via-[#29AB85] to-[#8DC046]" />
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