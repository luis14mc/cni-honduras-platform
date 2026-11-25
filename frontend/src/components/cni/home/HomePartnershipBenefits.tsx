import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { type as t } from "@/src/lib/typography";
import type { HomePageModel } from "./useHomePage";

export function HomePartnershipBenefits({
  locale, L, partnerBenefits
}: Pick<HomePageModel, "locale" | "L" | "partnerBenefits">) {
  return (
    <section className="py-24 md:py-28 bg-white overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <div className="al-partner-panel relative overflow-hidden rounded-2xl bg-gradient-to-br from-cni-primary via-[#1e2348] to-cni-primary-container p-8 md:p-10 text-white">
                <div className="al-partner-panel-glow pointer-events-none absolute inset-0" aria-hidden />
                <h2 className={cn(t.h2OnDark, "leading-[1.1]")}>
                  {locale === "es" ? (
                    <>
                      CNI tu socio estratégico para{" "}
                      <span className="text-[#29AB85]">invertir y crecer</span> en Honduras
                    </>
                  ) : (
                    <>
                      CNI your strategic partner to{" "}
                      <span className="text-[#29AB85]">invest and grow</span> in Honduras
                    </>
                  )}
                </h2>
                <div className="relative h-1 w-16 bg-cni-gold mt-6" />
                <Link
                  href={L("/cni")}
                  className="relative mt-8 inline-flex items-center gap-2 font-headline text-[11px] font-extrabold uppercase tracking-[0.15em] text-white transition-colors hover:text-[#29AB85]"
                >
                  {locale === "es" ? "Conocer la CNI" : "About CNI"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {partnerBenefits.map((item, idx) => (
                <div
                  key={item.title}
                  className="al-partner-benefit group relative flex items-center gap-4 overflow-hidden rounded-xl border border-cni-primary/8 bg-[#f8f9ff] p-5 md:p-6 transition-all duration-300 hover:border-[#29AB85]/30 hover:shadow-lg hover:shadow-cni-primary/5"
                >
                  <span className="pointer-events-none absolute -right-1 -top-2 font-display text-6xl font-extrabold leading-none text-cni-primary/[0.04] transition-colors group-hover:text-[#29AB85]/10">
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-cni-primary shadow-sm ring-1 ring-cni-primary/8 transition-colors duration-300 group-hover:bg-cni-primary group-hover:text-[#29AB85]">
                    <span aria-hidden="true" className="material-symbols-outlined text-[24px]">{item.icon}</span>
                  </div>

                  <div className="relative min-w-0 flex-1">
                    <p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-cni-secondary">
                      {String(idx + 1).padStart(2, "0")}
                    </p>
                    <h3 className="font-headline text-base font-extrabold text-cni-primary">{item.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
  );
}
