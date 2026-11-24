import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { type as t } from "@/src/lib/typography";
import type { HomePageModel } from "./useHomePage";

export function HomeSuccessStories({
  locale, featuredStoriesStatus, L, shell, testimonialsCopy, countryLabel, testimonialCards, caseHref
}: Pick<HomePageModel, "locale" | "featuredStoriesStatus" | "L" | "shell" | "testimonialsCopy" | "countryLabel" | "testimonialCards" | "caseHref">) {
  return (
    <section className="relative py-14 md:py-20 bg-white border-t border-cni-primary/5 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{ backgroundImage: shell.dotGridSubtle, backgroundSize: "24px 24px" }}
        />
        <div className="relative max-w-screen-xl mx-auto px-8">
          <div className="mb-8 md:mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className={cn(t.eyebrow, "mb-2 text-cni-secondary tracking-[0.25em]")}>
                {testimonialsCopy.eyebrow}
              </p>
              <h2 className={cn(t.h2Upper, "leading-tight")}>
                {testimonialsCopy.title}
              </h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-cni-primary/65">
                {testimonialsCopy.description}
              </p>
            </div>
            <Link
              href={L("/portafolio/casos")}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-cni-primary/12 bg-white px-5 py-2.5 font-headline text-[10px] font-extrabold uppercase tracking-[0.14em] text-cni-primary shadow-sm transition-all hover:border-cni-gold/40 hover:text-cni-gold"
            >
              {testimonialsCopy.cta}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {featuredStoriesStatus === "error" ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center text-sm text-red-800"
            >
              {testimonialsCopy.error}
            </div>
          ) : testimonialCards.length === 0 ? (
            <div className="rounded-xl border border-dashed border-cni-primary/15 bg-[#f8f9ff] px-6 py-12 text-center text-sm text-cni-primary/60">
              {testimonialsCopy.empty}
            </div>
          ) : (
            <div
              className={cn(
                "grid grid-cols-1 gap-5 md:gap-6",
                testimonialCards.length > 1 ? "md:grid-cols-12" : "md:grid-cols-12",
              )}
            >
              {/* Featured case (always first) — editorial magazine layout */}
              <Link
                href={caseHref(testimonialCards[0].slug)}
                className={cn(
                  "al-success-featured group relative flex flex-col overflow-hidden rounded-2xl border border-cni-primary/10 bg-[#f8f9ff] shadow-sm transition-all",
                  "hover:-translate-y-0.5 hover:border-cni-gold/35 hover:shadow-lg",
                  testimonialCards.length > 1 ? "md:col-span-7" : "md:col-span-12",
                )}
                style={
                  testimonialCards[0].sectorColor
                    ? ({ ["--success-accent" as string]: testimonialCards[0].sectorColor } as React.CSSProperties)
                    : undefined
                }
              >
                <div className="relative h-56 md:h-64 overflow-hidden bg-gradient-to-br from-[#252A58] via-[#0E7A7C] to-[#35A963]">
                  {testimonialCards[0].photo ? (
                    <Image
                      src={testimonialCards[0].photo}
                      alt={testimonialCards[0].caseTitle}
                      fill
                      sizes="(max-width: 768px) 100vw, 60vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <span className="font-display text-7xl md:text-8xl font-extrabold uppercase tracking-tighter text-white/15">
                        {testimonialCards[0].initials}
                      </span>
                    </div>
                  )}
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-[#252A58]/85 via-[#252A58]/30 to-transparent"
                  />
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-5 md:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      {testimonialCards[0].sectorName ? (
                        <span
                          className="rounded-full px-3 py-1 font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-sm backdrop-blur-sm"
                          style={{ backgroundColor: "color-mix(in srgb, var(--success-accent, #35a963) 88%, transparent)" }}
                        >
                          {testimonialCards[0].sectorName}
                        </span>
                      ) : null}
                    </div>
                    {testimonialCards[0].country ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                        <span
                          aria-hidden
                          className="inline-block h-1.5 w-1.5 rounded-full bg-[#35A963]"
                        />
                        {countryLabel(testimonialCards[0].country)}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="absolute inset-x-0 bottom-0 p-5 md:p-6 font-display text-2xl md:text-3xl font-extrabold leading-tight text-white md:max-w-md">
                    {testimonialCards[0].caseTitle}
                  </h3>
                </div>

                <div className="relative flex flex-1 flex-col p-6 md:p-8">
                  <span
                    aria-hidden
                    className="al-success-quote-mark pointer-events-none absolute -top-2 right-5 md:right-8 font-display text-7xl md:text-8xl font-extrabold leading-none text-[var(--success-accent,#35A963)]/15 select-none"
                  >
                    &ldquo;
                  </span>
                  <p className="al-success-quote relative font-display text-lg md:text-xl font-medium leading-snug text-cni-primary md:max-w-xl">
                    {testimonialCards[0].quote}
                  </p>

                  <div className="mt-6 flex flex-wrap items-end justify-between gap-5 border-t border-cni-primary/10 pt-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cni-primary/10 ring-2 ring-white shadow-sm">
                        {testimonialCards[0].personPhoto ? (
                          <Image
                            src={testimonialCards[0].personPhoto}
                            alt={testimonialCards[0].authorName || testimonialCards[0].name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="font-headline text-[10px] font-bold uppercase text-cni-primary">
                            {testimonialCards[0].initials}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-headline text-xs font-extrabold uppercase tracking-wide text-cni-primary">
                          {testimonialCards[0].authorName || testimonialCards[0].name}
                        </p>
                        {testimonialCards[0].authorRole ? (
                          <p className="truncate text-[11px] text-cni-primary/55">
                            {testimonialCards[0].authorRole}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {(testimonialCards[0].investment || testimonialCards[0].jobs) && (
                      <dl className="flex flex-wrap items-stretch gap-5 md:gap-6">
                        {testimonialCards[0].investment ? (
                          <div className="flex flex-col">
                            <dt className="font-headline text-[9px] font-bold uppercase tracking-[0.22em] text-cni-primary/55">
                              {locale === "es" ? "Inversión" : "Investment"}
                            </dt>
                            <dd className="font-display text-lg font-extrabold text-cni-primary">
                              {testimonialCards[0].investment}
                            </dd>
                          </div>
                        ) : null}
                        {testimonialCards[0].jobs ? (
                          <div className="flex flex-col">
                            <dt className="font-headline text-[9px] font-bold uppercase tracking-[0.22em] text-cni-primary/55">
                              {locale === "es" ? "Empleos" : "Jobs"}
                            </dt>
                            <dd className="font-display text-lg font-extrabold text-cni-primary">
                              {testimonialCards[0].jobs}
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    )}
                  </div>

                  <span className="mt-6 inline-flex items-center gap-2 font-headline text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--success-accent,#35A963)] transition-all group-hover:gap-3">
                    {testimonialsCopy.ctaFeatured}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </Link>

              {/* Secondary cases — compact editorial cards */}
              {testimonialCards.slice(1).map((card) => (
                <Link
                  key={card.slug}
                  href={caseHref(card.slug)}
                  className="al-success-card group flex flex-col rounded-2xl border border-cni-primary/10 bg-[#f8f9ff] p-6 md:p-7 transition-all hover:-translate-y-0.5 hover:border-cni-gold/30 hover:bg-white hover:shadow-md md:col-span-5"
                >
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="al-success-logo flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-cni-primary/10 bg-white px-2 py-2">
                      {card.logo ? (
                        <Image
                          src={card.logo}
                          alt={card.logoAlt}
                          width={56}
                          height={56}
                          className="h-9 w-auto max-h-full max-w-full object-contain"
                          sizes="56px"
                        />
                      ) : (
                        <span className="font-headline text-xs font-extrabold uppercase tracking-widest text-cni-primary/70">
                          {card.initials}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {card.sectorName ? (
                        <span
                          className="rounded-full px-2.5 py-0.5 font-headline text-[9px] font-bold uppercase tracking-[0.18em] text-white"
                          style={{
                            backgroundColor: card.sectorColor
                              ? `color-mix(in srgb, ${card.sectorColor} 88%, transparent)`
                              : "#0E7A7C",
                          }}
                        >
                          {card.sectorName}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <p className="font-body text-sm leading-relaxed text-cni-primary/80 italic line-clamp-4">
                    &ldquo;{card.quote}&rdquo;
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-cni-primary/10 pt-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cni-primary/10 ring-2 ring-white shadow-sm">
                        {card.personPhoto ? (
                          <Image
                            src={card.personPhoto}
                            alt={card.authorName || card.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="font-headline text-[10px] font-bold uppercase text-cni-primary">
                            {card.initials}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-headline text-[11px] font-extrabold uppercase tracking-wide text-cni-primary">
                          {card.authorName || card.name}
                        </p>
                        {card.authorRole ? (
                          <p className="truncate text-[11px] text-cni-primary/55">
                            {card.authorRole}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <ArrowRight
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-cni-primary/40 transition-all group-hover:translate-x-0.5 group-hover:text-cni-gold"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
  );
}
