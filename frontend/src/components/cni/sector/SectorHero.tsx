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
    <header className="al-sector-hero relative -mt-28 flex min-h-screen flex-col justify-end bg-cni-primary pt-32 md:pt-28">
      <div className="absolute inset-0 overflow-hidden">
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
            className="max-w-5xl text-balance font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.35rem]"
            style={{ textShadow: "0 2px 24px rgba(0, 0, 0, 0.55)" }}
          >
            {headline}
          </h1>

          <ul className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-3 md:items-stretch md:gap-4 lg:gap-5">
            {metrics.map((metric) => (
              <li
                key={`${metric.value}-${metric.label}`}
                className="al-sector-stat flex h-full min-w-0 flex-col rounded-2xl border border-white/15 bg-[#252A58]/60 px-5 py-5 backdrop-blur-md md:px-5 md:py-6 lg:px-6"
              >
                <p className="font-display text-[1.7rem] font-extrabold leading-none tracking-tight text-white lg:text-[2.15rem]">
                  <span className="al-sector-accent-text">{metric.value}</span>
                </p>
                <p className="mt-3 font-body text-sm leading-snug text-pretty text-white/80 md:text-[13px] lg:text-sm">
                  {metric.label}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
