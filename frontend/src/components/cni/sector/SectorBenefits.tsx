import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import type { SectorBenefit } from "@/src/data/sectorPageContent";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";

type Props = {
  title: string;
  items: readonly SectorBenefit[];
};

export function SectorBenefits({ title, items }: Props) {
  if (!items.length) return null;

  return (
    <section className={cn("bg-[#eff4ff]", layout.section, "border-y border-cni-primary/5")}>
      <div className={layout.container}>
        <header className="mb-12 max-w-3xl md:mb-16">
          <p className={t.eyebrow}>02</p>
          <h2 className={cn("mt-3", t.h2)}>{title}</h2>
          <div className={cn("mt-4", t.sectionRule)} />
        </header>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.map((item, index) => (
            <article
              key={item.title}
              className="al-sector-advantage group flex h-full flex-col rounded-2xl bg-white p-7 shadow-sm transition-shadow hover:shadow-xl"
            >
              <span
                className="al-sector-advantage-num mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                aria-hidden
              >
                <MaterialIcon name={item.icon} className="text-[22px]" />
              </span>
              <p className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-cni-on-surface-variant/55">
                0{index + 1}
              </p>
              <h3 className="mt-2 font-display text-lg font-extrabold leading-snug text-cni-primary md:text-xl">
                {item.title}
              </h3>
              <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-[#0E7A7C] md:text-base">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
