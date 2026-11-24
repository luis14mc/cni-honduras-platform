import { statValueSize, statBackTextSize } from "./homePresentation";
import Image from "next/image";
import { cn } from "@/src/lib/utils";
import { type as t } from "@/src/lib/typography";
import type { HomePageModel } from "./useHomePage";

export function HomeFigures({
  locale
}: Pick<HomePageModel, "locale">) {
  return (
    <section className="relative py-24 md:py-32 bg-cni-primary overflow-hidden">
        <div className="al-figures-bg absolute inset-0 pointer-events-none" aria-hidden>
          <div className="al-figures-orb al-figures-orb--teal" />
          <div className="al-figures-orb al-figures-orb--green" />
          <div className="al-figures-orb al-figures-orb--accent" />
          <div className="al-figures-shine" />
          <div className="al-figures-beam" />
        </div>

        <div className="max-w-screen-2xl mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">

            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <div className="border-l border-white/20 pl-6 md:pl-8">
                <h2 className={cn(t.h2Upper, "text-white leading-[1.05] lg:text-[3.25rem]")}>
                  <span className="text-cni-gold block mb-1">Honduras</span>
                  {locale === "es" ? "en cifras" : "in figures"}
                </h2>
                <div className="h-1 w-20 bg-cni-gold mt-6" />
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[
                  {
                    value: "112,777",
                    label: "Km² de Extensión Territorial",
                    iconSrc: "/home_index/iconos-cifras/extension-1.svg",
                    backText:
                      "Honduras se destaca como el segundo país más grande de Centroamérica, ofreciendo una ubicación estratégica, vastos recursos naturales y un entorno ideal para la inversión.",
                  },
                  {
                    value: "Más de 9.89 M",
                    label: "de Habitantes. fuerza laboral joven y dinámica",
                    iconSrc: "/home_index/iconos-cifras/ubicacion-1.svg",
                    backText:
                      "Honduras cuenta con una fuerza laboral joven y dinámica, con una edad promedio de 31 años y 7.0 millones de personas en edad de trabajar, lista para impulsar el crecimiento empresarial.",
                  },
                  {
                    value: "Más de 108,250 Egresados",
                    label: "En educación superior(2021 - 2024)",
                    iconSrc: "/home_index/iconos-cifras/educacion-1.svg",
                    backText:
                      "Con 21 instituciones de educación superior, Honduras forma talento diversificado en ciencias sociales (28 %), ciencias administrativas (20 %), ingenierías y TIC (15 %), y en ciencias de la salud (8 %), además de otras áreas, posgrados y técnicos altamente capacitados.",
                  },
                  {
                    value: "Más del 58.6%",
                    label: "de la energía proviene de fuentes renovables",
                    iconSrc: "/home_index/iconos-cifras/energia-1.svg",
                    backText:
                      "Honduras cuenta con una matriz diversificada que incluye 10 tipos de energéticos para la generación eléctrica.",
                  },
                  {
                    value: "En 2024 el 35.3%",
                    label: "de las exportaciones totales correspondieron a productos textiles",
                    iconSrc: "/home_index/iconos-cifras/textiles-1.svg",
                    backText:
                      "Honduras cuenta con una matriz diversificada que incluye 10 tipos de energéticos para la generación eléctrica.",
                  },
                  {
                    value: "11 tratados de Libre Comercio",
                    label: "que abarcan 45 naciones",
                    iconSrc: "/home_index/iconos-cifras/aviones-1.svg",
                    backText:
                      "Honduras exporta más de 3,200 productos al año a más de 120 países en todo el mundo, respaldado por 11 tratados de libre comercio que abarcan más de 45 naciones, facilitando el acceso a mercados globales estratégicos.",
                  },
                ].map((stat, i) => (
                  <div key={i} className="flip-card w-full aspect-square">
                    <div className="flip-card-inner h-full shadow-xl rounded-xl">

                      {/* Front */}
                      <div className="flip-card-front bg-white/[0.04] backdrop-blur-[2px] p-5 md:p-7 border border-white/10 rounded-xl flex flex-col items-center justify-center text-center">
                        <Image
                          src={stat.iconSrc}
                          alt=""
                          aria-hidden
                          width={56}
                          height={56}
                          className="mb-4 h-11 w-auto md:h-12 object-contain shrink-0"
                        />
                        <div className="flex min-h-[3.25rem] md:min-h-[3.75rem] items-center justify-center mb-2 px-1">
                          <span
                            className={cn(
                              "font-display font-extrabold text-white text-balance leading-tight",
                              statValueSize(stat.value),
                            )}
                          >
                            {stat.value}
                          </span>
                        </div>
                        <p className="font-headline text-[11px] md:text-xs font-semibold uppercase tracking-wide text-white/65 leading-snug px-1">
                          {stat.label}
                        </p>
                      </div>

                      {/* Back */}
                      <div className="flip-card-back bg-cni-gold p-5 md:p-7 rounded-xl flex flex-col items-center justify-center text-center overflow-hidden relative">
                        <Image
                          src={stat.iconSrc}
                          alt=""
                          aria-hidden
                          width={128}
                          height={128}
                          className="pointer-events-none absolute inset-0 m-auto h-24 w-auto opacity-[0.12] select-none md:h-28"
                        />

                        <p
                          className={cn(
                            "font-body text-cni-primary font-medium text-balance relative z-10 px-1",
                            statBackTextSize(stat.backText),
                          )}
                        >
                          {stat.backText}
                        </p>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
  );
}
