import { cn } from "@/src/lib/utils";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  id?: string;
  tone?: "surface" | "white" | "low" | "primary";
};

const tones: Record<NonNullable<SectionProps["tone"]>, string> = {
  surface: "bg-[var(--background)] text-cni-primary",
  white: "bg-white text-cni-primary",
  low: "bg-cni-surface-low text-cni-primary",
  primary: "bg-cni-primary text-white",
};

export function Section({
  children,
  className,
  containerClassName,
  id,
  tone = "surface",
}: SectionProps) {
  return (
    <section id={id} className={cn("py-20 md:py-24", tones[tone], className)}>
      <div className={cn("mx-auto max-w-screen-2xl px-6 md:px-10", containerClassName)}>
        {children}
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  action,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-12 flex flex-col gap-6 md:mb-16",
        action ? "md:flex-row md:items-end md:justify-between" : align === "center" ? "items-center text-center" : "",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <span className="mb-3 inline-block text-[0.7rem] font-bold uppercase tracking-[0.25em] text-cni-secondary">
            {eyebrow}
          </span>
        )}
        <h2 className="text-3xl font-extrabold tracking-tight text-cni-primary md:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-base leading-relaxed text-cni-on-surface-variant">{description}</p>
        )}
        {align === "center" && <div className="mx-auto mt-6 h-1 w-20 bg-cni-gold" />}
      </div>
      {action}
    </div>
  );
}
