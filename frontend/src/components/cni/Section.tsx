import { cn } from "@/src/lib/utils";
import { type as t, layout } from "@/src/lib/typography";

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
    <section id={id} className={cn(layout.section, tones[tone], className)}>
      <div className={cn(layout.container, containerClassName)}>
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
          <span className={cn("mb-3 inline-block", t.eyebrow, "text-cni-secondary")}>
            {eyebrow}
          </span>
        )}
        <h2 className={t.h2}>{title}</h2>
        {description && <p className={cn("mt-4", t.lead)}>{description}</p>}
        {align === "center" && <div className={cn("mx-auto mt-6", t.sectionRule)} />}
      </div>
      {action}
    </div>
  );
}
