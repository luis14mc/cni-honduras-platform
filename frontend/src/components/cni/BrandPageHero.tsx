import Image from "next/image";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";

type Props = {
  title: React.ReactNode;
  description: string;
  imageSrc: string;
  imageAlt: string;
  kicker?: React.ReactNode;
  children?: React.ReactNode;
};

export function BrandPageHero({ title, description, imageSrc, imageAlt, kicker, children }: Props) {
  return (
    <header className="relative flex min-h-screen items-center overflow-hidden bg-[#000a1e] pt-32 pb-24 text-white">
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.42]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#000a1e]/70 via-[#000a1e]/35 to-transparent" />
        <div className="site-footer-mesh pointer-events-none absolute inset-0 opacity-[0.16]" aria-hidden />
      </div>
      <div className={cn("relative z-10 w-full", layout.container)}>
        <div className="max-w-3xl">
          {kicker ? <div className="mb-6">{kicker}</div> : null}
          <h1 className={cn("text-white", t.heroTitle)}>{title}</h1>
          <p className={cn("mt-6 max-w-2xl text-white/80", t.heroLead)}>{description}</p>
          {children ? <div className="mt-10 flex flex-wrap gap-3">{children}</div> : null}
        </div>
      </div>
    </header>
  );
}

export function brandHeroCta(filled = true) {
  return filled
    ? "rounded bg-[#32B372] px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#000a1e]"
    : "rounded border border-white px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#000a1e]";
}
