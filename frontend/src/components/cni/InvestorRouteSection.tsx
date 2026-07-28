import Image from "next/image";
import logoCni from "@/src/img/logos/Logo_CNI.png";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";

export type InvestorRouteStep = {
  n: number;
  label: string;
  labelPosition?: "above" | "below";
  icon: "cni" | string;
  color: string;
};

type Props = {
  eyebrow: string;
  titlePrefix: string;
  titleHighlight: string;
  steps: readonly InvestorRouteStep[];
};

function StepIcon({ icon, color }: { icon: InvestorRouteStep["icon"]; color: string }) {
  if (icon === "cni") {
    return (
      <Image
        src={logoCni}
        alt=""
        aria-hidden
        className="h-9 w-auto object-contain md:h-10"
        sizes="72px"
      />
    );
  }

  return <MaterialIcon name={icon} className="text-[2rem] md:text-[2.25rem]" style={{ color }} />;
}

function RouteStep({
  step,
  isLast,
}: {
  step: InvestorRouteStep;
  isLast: boolean;
}) {
  return (
    <li className="relative flex min-w-0 flex-1 flex-col">
      {!isLast && (
        <div
          className="pointer-events-none absolute left-[calc(50%+3.5rem)] top-12 hidden h-px w-[calc(100%-7rem)] bg-gradient-to-r from-[#29AB85]/40 to-[#0E7A7C]/20 xl:block"
          aria-hidden
        />
      )}

      <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-[#252A58]/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#29AB85]/30 hover:shadow-lg">
        <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: step.color }} />

        <div className="flex flex-1 flex-col p-5 md:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-extrabold text-white shadow-sm"
              style={{ backgroundColor: step.color }}
            >
              {step.n}
            </span>
            <span
              className="font-display text-4xl font-extrabold leading-none tabular-nums opacity-[0.07]"
              style={{ color: step.color }}
              aria-hidden
            >
              {String(step.n).padStart(2, "0")}
            </span>
          </div>

          <div
            className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border transition-colors duration-300 group-hover:border-transparent"
            style={{
              backgroundColor: `${step.color}12`,
              borderColor: `${step.color}25`,
            }}
          >
            <StepIcon icon={step.icon} color={step.color} />
          </div>

          <h3 className={t.h3Card}>{step.label}</h3>
        </div>
      </article>
    </li>
  );
}

export function InvestorRouteSection({ eyebrow, titlePrefix, titleHighlight, steps }: Props) {
  return (
    <section className={cn("border-t border-[#252A58]/10 bg-[#f8f9ff]", layout.section)}>
      <div className={layout.container}>
        <header className="mx-auto max-w-3xl text-center">
          <p className={t.eyebrow}>{eyebrow}</p>
          <h2 className={cn("mt-3", t.h2)}>
            {titlePrefix}{" "}
            <span className="text-[#29AB85]">{titleHighlight}</span>
          </h2>
          <div className={cn("mx-auto mt-4", t.sectionRule)} />
        </header>

        <ol className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:flex lg:items-stretch lg:gap-4 xl:gap-5">
          {steps.map((step, index) => (
            <RouteStep key={step.n} step={step} isLast={index === steps.length - 1} />
          ))}
        </ol>
      </div>
    </section>
  );
}
