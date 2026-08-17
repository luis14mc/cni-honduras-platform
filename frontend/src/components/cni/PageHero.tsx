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
          layout.container,
          "relative z-10 py-16",
          align === "center" && "text-center",
        )}
      >
        {eyebrow && <span className={cn("mb-6", t.heroEyebrow)}>{eyebrow}</span>}
        <h1
          className={cn("max-w-4xl text-white", t.heroTitle)}
          style={{ textShadow: "0 2px 20px rgba(0, 0, 0, 0.25)" }}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn("mt-6 max-w-2xl text-white/85", t.heroLead)}
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
