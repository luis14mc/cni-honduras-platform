import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectorIcon } from "@/src/components/cni/SectorIcon";
import type { SectorMetric } from "@/src/data/sectorPageContent";
import type { SectorSlug } from "@/src/data/investmentSectors";
import { layout } from "@/src/lib/typography";

type Props = {
  slug: SectorSlug;
  name: string;
  headline: string;
  metrics: readonly SectorMetric[];
  photoSrc: string;
  backHref: string;
  backLabel: string;
};

export function SectorHero({
  slug,
  name,
  headline,
  metrics,
  photoSrc,
  backHref,
  backLabel,
}: Props) {
  return (
    <header className="al-sector-hero relative -mt-28 flex min-h-screen flex-col justify-end overflow-hidden bg-cni-primary pt-32 md:pt-28">
      <div className="absolute inset-0">
        <Image
          src={photoSrc}
          alt={name}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.78]"
        />
        <div className="absolute inset-0 bg-[#1a1f3d]/65" />
        <div className="absolute inset-0 al-sector-hero-overlay" />
        <div className="al-sector-hero-mesh pointer-events-none absolute inset-0 opacity-30" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e22]/70 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 w-full pb-10 pt-16 md:pb-14 md:pt-20">
        <div className={layout.container}>
          <Link
            href={backHref}
            className="al-sector-back-link mb-8 inline-flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 transition hover:text-white md:mb-10"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" aria-hidden />
            {backLabel}
          </Link>

          <div className="mb-6 flex items-center gap-4">
            <span
              className="al-sector-icon-frame flex h-16 w-16 items-center justify-center rounded-2xl backdrop-blur-md md:h-20 md:w-20"
              aria-hidden
            >
              <SectorIcon slug={slug} size={56} className="text-white" />
            </span>
            <p className="al-sector-eyebrow inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-headline text-[10px] font-bold uppercase tracking-[0.22em] backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {name}
            </p>
          </div>

          <h1
            className="max-w-5xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.1rem]"
            style={{ textShadow: "0 2px 24px rgba(0, 0, 0, 0.55)" }}
          >
            {headline}
          </h1>

          <div
            className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/10 sm:grid-cols-3"
            role="list"
          >
            {metrics.map((metric) => (
              <div
                key={`${metric.value}-${metric.label}`}
                role="listitem"
                className="al-sector-stat bg-[#252A58]/55 px-5 py-6 backdrop-blur-md md:px-6 md:py-7"
              >
                <p className="font-display text-3xl font-extrabold leading-none text-white md:text-4xl">
                  <span className="al-sector-accent-text">{metric.value}</span>
                </p>
                <p className="mt-3 font-body text-sm leading-relaxed text-white/80">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
