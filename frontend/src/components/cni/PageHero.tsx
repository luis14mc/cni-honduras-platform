import Image from "next/image";
import { cn } from "@/src/lib/utils";
import { type as t, layout } from "@/src/lib/typography";

type PageHeroProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  heightClass?: string;
  align?: "left" | "center";
  children?: React.ReactNode;
  imageClassName?: string;
  overlayClassName?: string;
  patternClassName?: string;
  compact?: boolean;
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
  imageClassName = "absolute inset-0 object-cover opacity-[0.94]",
  overlayClassName,
  patternClassName,
  compact = false,
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
          className={imageClassName}
        />
      )}
      <div
        className={cn("absolute inset-0", overlayClassName)}
        style={
          overlayClassName
            ? undefined
            : {
                background:
                  "linear-gradient(to top, rgba(37, 42, 88, 0.22) 0%, rgba(14, 122, 124, 0.05) 22%, transparent 48%)",
              }
        }
      />
      {patternClassName ? (
        <div className={cn("pointer-events-none absolute inset-0", patternClassName)} aria-hidden />
      ) : null}
      <div
        className={cn(
          layout.container,
          compact ? "relative z-10 w-full py-3 max-md:px-4 md:py-10" : "relative z-10 py-16",
          align === "center" && "text-center",
        )}
      >
        {eyebrow && <span className={cn(compact ? "mb-2" : "mb-6", t.heroEyebrow)}>{eyebrow}</span>}
        <h1
          className={cn("max-w-4xl text-white", t.heroTitle, compact && "max-md:text-[1.65rem] max-md:leading-[1.1]")}
          style={{ textShadow: "0 2px 20px rgba(0, 0, 0, 0.25)" }}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn("max-w-2xl text-white/85", t.heroLead, compact ? "mt-2 max-md:text-xs max-md:leading-snug md:mt-3" : "mt-6")}
            style={{ textShadow: "0 1px 10px rgba(0, 0, 0, 0.2)" }}
          >
            {description}
          </p>
        )}
        {children && <div className={compact ? "mt-3 md:mt-7" : "mt-10"}>{children}</div>}
      </div>
    </section>
  );
}
