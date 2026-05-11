import Image from "next/image";
import { cn } from "@/src/lib/utils";

type PageHeroProps = {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  heightClass?: string;
  align?: "left" | "center";
  children?: React.ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt = "",
  heightClass = "min-h-[420px] md:min-h-[520px]",
  align = "left",
  children,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative flex items-center overflow-hidden bg-[#000a1e]",
        heightClass,
      )}
    >
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 object-cover opacity-60"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-[#000a1e]/90 via-[#000a1e]/60 to-[#000a1e]/20" />
      <div className="absolute inset-0 hero-gradient mix-blend-multiply opacity-40" />
      <div
        className={cn(
          "relative z-10 mx-auto w-full max-w-screen-2xl px-6 py-16 md:px-10",
          align === "center" && "text-center",
        )}
      >
        <span
          className={cn(
            "mb-6 inline-flex items-center rounded-sm border border-[#e9c176]/40 bg-[#2e1f00]/30 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[#e9c176] backdrop-blur",
          )}
        >
          {eyebrow}
        </span>
        <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          {title}
        </h1>
        {description && (
          <p className="mt-6 max-w-2xl text-base font-light leading-relaxed text-white/85 md:text-lg">
            {description}
          </p>
        )}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  );
}
