import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { type as t } from "@/src/lib/typography";
import type { HomePageModel } from "./useHomePage";

export function HomeStrategicSectors({
  locale, sectorsStatus, L, sectorsData
}: Pick<HomePageModel, "locale" | "sectorsStatus" | "L" | "sectorsData">) {
  return (
    <section className="py-24 md:py-28 bg-cni-surface-low">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="mb-12 md:mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className={cn(t.h2Upper, "leading-tight")}>
                {locale === "es" ? "Sectores Estratégicos" : "Strategic Sectors"}
              </h2>
              <div className="h-1 w-20 bg-cni-gold mt-4" />
            </div>
            <Link
              href={L("/invertir")}
              className="inline-flex items-center gap-2 font-headline text-[11px] font-extrabold uppercase tracking-[0.15em] text-cni-primary transition-colors hover:text-cni-gold"
            >
              {locale === "es" ? "Ver todos los sectores" : "View all sectors"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectorsStatus === "error" ? (
              <div
                role="alert"
                className="sm:col-span-2 lg:col-span-3 rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center text-sm text-red-800"
              >
                {locale === "es"
                  ? "No pudimos cargar los sectores. Intente de nuevo más tarde."
                  : "We could not load sectors right now. Please try again later."}
              </div>
            ) : sectorsData.length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-dashed border-cni-primary/15 bg-white px-6 py-12 text-center text-sm text-cni-primary/60">
                {locale === "es"
                  ? "Próximamente publicaremos los sectores priorizados."
                  : "Priority sectors will be published here soon."}
              </div>
            ) : (
              sectorsData.map((sector) => (
              <Link
                key={sector.slug}
                href={sector.href}
                className="al-sector-card group relative flex min-h-[340px] flex-col overflow-hidden rounded-2xl bg-white p-7 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  boxShadow: "0 4px 24px rgba(37, 42, 88, 0.06)",
                  ["--sector-accent" as string]: sector.accent,
                }}
              >
                <div
                  className="absolute left-0 top-8 bottom-8 w-1.5 rounded-r-full transition-all duration-300 group-hover:top-6 group-hover:bottom-6 group-hover:w-2"
                  style={{ backgroundColor: sector.accent }}
                  aria-hidden
                />

                <div
                  className="absolute inset-x-0 top-0 h-1 opacity-80"
                  style={{ backgroundColor: sector.accent }}
                  aria-hidden
                />

                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-[0.08]"
                  aria-hidden
                >
                  <Image src={sector.img} alt="" fill sizes="33vw" className="object-cover" />
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, ${sector.accent}33 0%, transparent 55%)` }}
                  />
                </div>

                <div className="relative flex flex-1 flex-col pl-4">
                  <div
                    className="mb-6 flex h-[100px] w-[100px] md:h-[112px] md:w-[112px] items-center justify-center rounded-2xl border-2 transition-transform duration-300 group-hover:scale-105"
                    style={{
                      backgroundColor: `${sector.accent}18`,
                      borderColor: `${sector.accent}40`,
                    }}
                  >
                    <Image
                      src={sector.iconSrc}
                      alt=""
                      width={88}
                      height={88}
                      className="h-[76px] w-[76px] md:h-[88px] md:w-[88px] object-contain"
                    />
                  </div>

                  <h3
                    className="font-display text-lg font-extrabold uppercase tracking-tight"
                    style={{ color: sector.accent }}
                  >
                    {sector.name}
                  </h3>

                  <p className="mt-3 flex-1 text-sm leading-relaxed text-cni-primary/70 line-clamp-4">
                    {sector.desc}
                  </p>

                  <span
                    className="mt-6 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-all duration-300 group-hover:gap-3"
                    style={{ color: sector.accent }}
                  >
                    {locale === "es" ? "Ver detalles" : "View details"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))
            )}
          </div>
        </div>
      </section>
  );
}
