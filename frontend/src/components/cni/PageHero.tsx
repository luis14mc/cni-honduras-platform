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
        "relative flex items-center overflow-hidden bg-cni-primary",
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
          className="absolute inset-0 object-cover opacity-[0.94]"
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(37, 42, 88, 0.22) 0%, rgba(14, 122, 124, 0.05) 22%, transparent 48%)",
        }}
      />
      <div
        className={cn(
          "relative z-10 mx-auto w-full max-w-screen-2xl px-6 py-16 md:px-10",
          align === "center" && "text-center",
        )}
      >
        <span className="mb-6 inline-flex items-center rounded-sm border border-[#35A963]/40 bg-[#252A58]/20 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[#35A963] backdrop-blur">
          {eyebrow}
        </span>
        <h1
          className="max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          style={{ textShadow: "0 2px 20px rgba(0, 0, 0, 0.25)" }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="mt-6 max-w-2xl text-base font-light leading-relaxed text-white/85 md:text-lg"
            style={{ textShadow: "0 1px 10px rgba(0, 0, 0, 0.2)" }}
          >
            {description}
          </p>
        )}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  );
}
