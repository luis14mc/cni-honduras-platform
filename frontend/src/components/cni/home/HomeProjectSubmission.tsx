import Link from "next/link";
import Image from "next/image";
import { cn } from "@/src/lib/utils";
import { type as t } from "@/src/lib/typography";
import type { HomePageModel } from "./useHomePage";

export function HomeProjectSubmission({
  locale, hc, L, postExtra
}: Pick<HomePageModel, "locale" | "hc" | "L" | "postExtra">) {
  return (
    <section className="py-28 px-8 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-20">
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
              <span className="material-symbols-outlined">send</span>
            </Link>
          </div>

          <div className="lg:w-1/2 relative w-full">
            <div className="aspect-video bg-cni-primary overflow-hidden shadow-2xl relative">
              <Image
                alt="Colaboración profesional"
                className="object-cover opacity-50"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqlhU_RbYvkxBlYzAj4-JtinsyOxfbNJWy3dijV5GdOD--pP85WIxoiQ7Sk0Q-lRYx5sMe7kzQ9jIcHdOVm2s-dmhYYOGr1LHnyFIi9Jph5IoX_fNsF4hHqhdugIzWl9t7eGGor3MD99NX2QA6-mO-uxN97DKeH2m9pItMpoZlymNvIiga0_Uokz5xO5dN_fospS89vsPMohMijrLWO6LVrvX4k3OiF6ww07a2JJFkhX614J_rk3IE27CvkIR0gvbFmNDamGonIFU"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-8 -left-4 md:-left-8 bg-cni-gold p-10 text-cni-primary max-w-xs shadow-xl">
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
