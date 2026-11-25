import Link from "next/link";
import Image from "next/image";
import { cn } from "@/src/lib/utils";
import { type as t } from "@/src/lib/typography";
import type { HomePageModel } from "./useHomePage";

export function HomeProjectSubmission({
  locale, hc, L, postExtra
}: Pick<HomePageModel, "locale" | "hc" | "L" | "postExtra">) {
  return (
    <section data-home-advisory className="py-16 px-4 sm:px-8 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
          <div className="lg:w-1/2">
            <h2 className={cn(t.h2Upper, "mb-8 leading-[1.1]")}>
              {locale === "es" ? (
                <>¿TIENES UN PROYECTO <br /><span className="text-[#16744F]">DE INVERSIÓN?</span></>
              ) : (
                <>Project <br /><span className="text-[#16744F]">Submission</span></>
              )}
            </h2>
            <p className={cn(t.lead, "mb-10")}>
              {hc.postulacion.description}
            </p>
            <Link
              href={L("/postula-tu-proyecto")}
              className="bg-cni-primary text-white px-10 py-4 rounded-DEFAULT font-headline font-bold text-[12px] tracking-[0.2em] uppercase hover:bg-cni-gold hover:text-cni-primary transition-all inline-flex items-center gap-4"
            >
              {postExtra.ctaProject}
              <span aria-hidden="true" className="material-symbols-outlined">send</span>
            </Link>
          </div>

          <div className="lg:w-1/2 relative w-full">
            <div className="aspect-video bg-cni-primary overflow-hidden shadow-2xl relative rounded-lg lg:rounded-none">
              <Image
                alt=""
                className="object-cover opacity-75 lg:hidden"
                src="/images/hero/home/logistica.webp"
                fill
                sizes="(max-width: 1023px) 100vw, 0px"
              />
              <Image
                alt=""
                className="hidden object-cover opacity-50 lg:block"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqlhU_RbYvkxBlYzAj4-JtinsyOxfbNJWy3dijV5GdOD--pP85WIxoiQ7Sk0Q-lRYx5sMe7kzQ9jIcHdOVm2s-dmhYYOGr1LHnyFIi9Jph5IoX_fNsF4hHqhdugIzWl9t7eGGor3MD99NX2QA6-mO-uxN97DKeH2m9pItMpoZlymNvIiga0_Uokz5xO5dN_fospS89vsPMohMijrLWO6LVrvX4k3OiF6ww07a2JJFkhX614J_rk3IE27CvkIR0gvbFmNDamGonIFU"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="relative mx-auto -mt-5 w-[calc(100%-2rem)] max-w-xs bg-cni-gold p-6 text-cni-primary shadow-xl lg:absolute lg:-bottom-8 lg:-left-8 lg:mx-0 lg:mt-0 lg:w-auto lg:p-10">
              <p className="font-headline text-[10px] font-extrabold uppercase tracking-[0.3em] mb-3">
                {postExtra.advisoryTitle}
              </p>
              <p className="font-body text-sm font-medium leading-relaxed">
                {postExtra.advisoryDesc}
              </p>
            </div>
          </div>
        </div>
      </section>
  );
}
