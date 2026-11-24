import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { HomePageModel } from "./useHomePage";

export function HomeWhyHonduras({
  locale, hc, L, whyHondurasIndex, totalWhyHondurasSlides, moveWhyHonduras
}: Pick<HomePageModel, "locale" | "hc" | "L" | "whyHondurasIndex" | "totalWhyHondurasSlides" | "moveWhyHonduras">) {
  return (
    <section className="py-32 bg-cni-primary text-white overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Left Column: Institutional Image */}
            <div className="flex w-full flex-col items-center gap-10">
              <Link
                href={L("/portafolio/mapa")}
                aria-label={locale === "es" ? "Ir al mapa de inversiones" : "Go to the investment map"}
                className="relative group w-full h-full flex items-center justify-center"
              >
                {/* Decorative elements */}
                <div className="absolute -inset-4 border border-cni-gold/20 rounded-[40px] group-hover:scale-105 group-hover:border-cni-gold/40 transition-all duration-700 pointer-events-none"></div>
                <div className="absolute -inset-8 border border-white/5 rounded-[50px] group-hover:scale-105 transition-all duration-1000 pointer-events-none"></div>

                <div className="relative w-full aspect-square md:h-[600px] overflow-visible flex items-center justify-center p-4">

                  {/* Ambient Radial Glow Behind the Map */}
                  <div className="absolute w-[280px] h-[280px] md:w-[450px] md:h-[450px] bg-gradient-to-tr from-cni-gold/20 to-cni-primary/40 rounded-full blur-[60px] md:blur-[90px] pointer-events-none group-hover:bg-cni-gold/30 group-hover:scale-110 transition-all duration-1000 z-0"></div>

                  <Image
                    alt={locale === "es" ? "Mapa de Honduras" : "Map of Honduras"}
                    className="object-contain p-4 transition-all duration-700 group-hover:scale-[1.03] group-hover:-translate-y-2 z-10 drop-shadow-[0_20px_20px_rgba(233,193,118,0.15)]"
                    src="/images/home/mapa-nuevo.png"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />

                </div>
              </Link>

              <Link
                href={L("/portafolio/mapa")}
                className="inline-flex items-center gap-3 rounded-full bg-cni-gold px-6 py-3 font-headline text-xs font-bold uppercase tracking-[0.18em] text-cni-primary shadow-md transition-all hover:bg-white hover:scale-105"
              >
                {locale === "es" ? "Ver Mapa de Inversiones" : "View Investment Map"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            {/* Right Column: Carousel Content */}
            <div className="flex flex-col w-full">
              <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight uppercase mb-12">
                {locale === "es" ? (
                  <>¿Por qué <span className="text-cni-gold">Honduras?</span></>
                ) : (
                  <>Why <span className="text-cni-gold">Honduras?</span></>
                )}
              </h2>

              <div className="relative overflow-hidden w-full">
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${whyHondurasIndex * 100}%)` }}
                >
                  {hc.porque.cards.map((card, i) => (
                    <div key={i} className="min-w-full">
                      <span className="font-display text-7xl font-extrabold text-white/10 mb-6 block select-none">
                        0{i + 1}
                      </span>
                      <h3 className="font-headline text-3xl font-bold uppercase mb-6 tracking-wide text-cni-gold">
                        {card.title}
                      </h3>
                      <p className="text-white/70 font-body leading-relaxed text-lg max-w-lg">
                        {card.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-8 mt-16">
                <div className="flex gap-3">
                  <button
                    onClick={() => moveWhyHonduras(-1)}
                    className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-cni-gold hover:text-cni-primary hover:border-cni-gold transition-all"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <button
                    onClick={() => moveWhyHonduras(1)}
                    className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-cni-gold hover:text-cni-primary hover:border-cni-gold transition-all"
                  >
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  {[...Array(totalWhyHondurasSlides)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-300 ${i === whyHondurasIndex ? "w-8 bg-cni-gold" : "w-8 bg-white/20"
                        }`}
                    />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
  );
}
