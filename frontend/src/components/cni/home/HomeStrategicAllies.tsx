import Image from "next/image";
import { cn } from "@/src/lib/utils";
import { type as t } from "@/src/lib/typography";
import {
  strategicAlliesLevel1,
  strategicAlliesLevel2,
  strategicAllyLogoSize,
} from "@/src/data/strategicAllies";
import type { HomePageModel } from "./useHomePage";

export function HomeStrategicAllies({
  locale
}: Pick<HomePageModel, "locale">) {
  return (
    <section className="py-28 md:py-32 overflow-hidden border-y relative al-allies-carousel border-transparent">
        <div className="al-allies-mesh absolute inset-0 pointer-events-none" aria-hidden />
        <div className="al-allies-vignette pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative z-10 al-allies-inner">
          <div className="text-center mb-16 md:mb-20 flex flex-col items-center px-8">
            <h2 className={cn(t.h2Upper, "text-white")}>
              {locale === "es" ? "Nuestros Aliados Estratégicos" : "Our Strategic Allies"}
            </h2>
            <div className="h-1.5 w-24 bg-cni-gold mt-6" />
          </div>

        <div className="space-y-12 md:space-y-14">
          {/* Row 1 — aliados nivel 1 (230×130 px uniformes) */}
          <div className="al-allies-track flex overflow-hidden">
            <div className="flex shrink-0 animate-marquee items-center gap-12 md:gap-16 pr-12 md:pr-16">
              {strategicAlliesLevel1.map((ally) => (
                <div key={ally.src} className="shrink-0 select-none al-allies-logo al-allies-logo--level1">
                  <Image
                    src={ally.src}
                    alt={ally.name}
                    width={strategicAllyLogoSize.width}
                    height={strategicAllyLogoSize.height}
                    className="al-allies-logo-img h-[130px] w-[230px] object-contain md:h-[156px] md:w-[276px]"
                    sizes="276px"
                  />
                </div>
              ))}
            </div>
            <div aria-hidden="true" className="flex shrink-0 animate-marquee items-center gap-12 md:gap-16 pr-12 md:pr-16">
              {strategicAlliesLevel1.map((ally) => (
                <div key={`rep-${ally.src}`} className="shrink-0 select-none al-allies-logo al-allies-logo--level1">
                  <Image
                    src={ally.src}
                    alt=""
                    width={strategicAllyLogoSize.width}
                    height={strategicAllyLogoSize.height}
                    className="al-allies-logo-img h-[130px] w-[230px] object-contain md:h-[156px] md:w-[276px]"
                    sizes="276px"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 — aliados nivel 2 (230×130 px uniformes) */}
          <div className="al-allies-track flex overflow-hidden">
            <div className="flex shrink-0 animate-marquee-reverse items-center gap-12 md:gap-16 pr-12 md:pr-16">
              {strategicAlliesLevel2.map((ally) => (
                <div key={ally.src} className="shrink-0 select-none al-allies-logo al-allies-logo--level1">
                  <Image
                    src={ally.src}
                    alt={ally.name}
                    width={strategicAllyLogoSize.width}
                    height={strategicAllyLogoSize.height}
                    className="al-allies-logo-img h-[130px] w-[230px] object-contain md:h-[156px] md:w-[276px]"
                    sizes="276px"
                  />
                </div>
              ))}
            </div>
            <div aria-hidden="true" className="flex shrink-0 animate-marquee-reverse items-center gap-12 md:gap-16 pr-12 md:pr-16">
              {strategicAlliesLevel2.map((ally) => (
                <div key={`rep-${ally.src}`} className="shrink-0 select-none al-allies-logo al-allies-logo--level1">
                  <Image
                    src={ally.src}
                    alt=""
                    width={strategicAllyLogoSize.width}
                    height={strategicAllyLogoSize.height}
                    className="al-allies-logo-img h-[130px] w-[230px] object-contain md:h-[156px] md:w-[276px]"
                    sizes="276px"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </section>
  );
}
