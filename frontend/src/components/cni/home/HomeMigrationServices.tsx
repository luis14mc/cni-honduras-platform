import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { type as t } from "@/src/lib/typography";
import type { HomePageModel } from "./useHomePage";

export function HomeMigrationServices({
  hc, L
}: Pick<HomePageModel, "hc" | "L">) {
  return (
    <section className="border-y border-cni-primary/8 bg-[#f8f9ff] py-14 md:py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-8 md:flex-row md:items-center md:gap-14">
          <div className="flex shrink-0 items-center justify-center rounded-2xl bg-cni-primary px-8 py-7 shadow-lg shadow-cni-primary/15 md:px-10 md:py-8">
            <Image
              src="/home_index/imagenes/despacho_logo.png"
              alt={hc.facilidadesMigratorias.logoAlt}
              width={220}
              height={280}
              className="h-auto w-[9.5rem] object-contain md:w-[11rem]"
              priority={false}
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <p className={cn("mb-3", t.eyebrow, "!text-[#16744F]")}>
              {hc.facilidadesMigratorias.eyebrow}
            </p>
            <h2 className={t.h2Upper}>
              {hc.facilidadesMigratorias.title}
            </h2>
            <p className={cn("mx-auto mt-4 max-w-xl md:mx-0", t.lead, "text-cni-primary/70")}>
              {hc.facilidadesMigratorias.description}
            </p>
            <Link
              href={L("/facilidades-migratorias")}
              className="mt-8 inline-flex items-center gap-3 bg-cni-primary px-8 py-3.5 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-all hover:bg-[#29AB85] hover:shadow-lg hover:shadow-[#29AB85]/20"
            >
              {hc.facilidadesMigratorias.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
  );
}
