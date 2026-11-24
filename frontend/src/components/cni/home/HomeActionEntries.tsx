import Link from "next/link";
import type { HomePageModel } from "./useHomePage";

export function HomeActionEntries({
  L, actionCards
}: Pick<HomePageModel, "L" | "actionCards">) {
  return (
    <section className="py-12 px-8 -mt-24 relative z-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 shadow-2xl rounded-[32px] overflow-hidden relative">

          {/* Yin-Yang Curved Divider (desktop only) */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-48 pointer-events-none hidden lg:block z-10">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <path
                d="M 0 0 L 60 0 C 52 30, 48 70, 40 100 L 0 100 Z"
                className="fill-cni-primary"
              />
              <path
                d="M 100 0 L 60 0 C 52 30, 48 70, 40 100 L 100 100 Z"
                className="fill-white"
              />
            </svg>
          </div>

          <Link
            href={L("/invertir")}
            className="group relative overflow-hidden bg-cni-primary text-white p-8 md:p-12 flex flex-col items-center text-center border-b lg:border-b-0 lg:border-r border-cni-gold/20 rounded-t-[32px] lg:rounded-t-none lg:rounded-l-[32px] transition-all duration-500"
          >
            <span className="material-symbols-outlined text-[110px] text-cni-gold/30 group-hover:text-cni-gold group-hover:scale-110 transition-all duration-500 mb-6 select-none">
              add_circle
            </span>
            <h2 className="font-display text-3xl font-extrabold uppercase mb-4 tracking-tight">
              {actionCards.investTitle}
            </h2>
            <p className="font-body text-sm max-w-sm leading-relaxed mb-8 text-white/70">
              {actionCards.investDesc}
            </p>
            <span className="inline-flex items-center gap-2 font-headline font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-full bg-white text-cni-primary group-hover:bg-white/90 group-hover:scale-105 transition-all duration-500 shadow-md">
              {actionCards.moreInfo}
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </span>
          </Link>

          <Link
            href={L("/crecer")}
            className="group relative overflow-hidden bg-white text-cni-primary p-8 md:p-12 flex flex-col items-center text-center rounded-b-[32px] lg:rounded-b-none lg:rounded-r-[32px] transition-all duration-500"
          >
            <span className="material-symbols-outlined text-[110px] text-cni-primary/10 group-hover:text-cni-primary group-hover:scale-110 transition-all duration-500 mb-6 select-none">
              trending_up
            </span>
            <h2 className="font-display text-3xl font-extrabold uppercase mb-4 tracking-tight transition-colors duration-500">
              {actionCards.growTitle}
            </h2>
            <p className="font-body text-sm max-w-sm leading-relaxed mb-8 text-on-surface-variant">
              {actionCards.growDesc}
            </p>
            <span className="inline-flex items-center gap-2 font-headline font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-full bg-cni-primary text-white group-hover:bg-cni-gold group-hover:text-cni-primary group-hover:scale-105 transition-all duration-500 shadow-md">
              {actionCards.moreInfo}
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </span>
          </Link>
        </div>
      </section>
  );
}
