"use client";

import { useEffect, useRef, useState } from "react";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";

export type InvestorRouteStep = {
  n: number;
  label: string;
  description?: string;
  icon: string;
  color: string;
};

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  steps: readonly InvestorRouteStep[];
};

function useInView<T extends HTMLElement>(rootMargin = "-15% 0px -15% 0px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, inView] as const;
}

function StepIcon({ icon }: { icon: string }) {
  return (
    <span
      className={cn(
        "route-icon relative flex h-14 w-14 items-center justify-center rounded-full border border-transparent bg-[#252A58] text-white",
        "shadow-[0_10px_24px_-12px_rgba(37,42,88,0.55)]",
        "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "group-hover/nav:scale-105 group-hover/nav:bg-[#29AB85] group-hover/nav:shadow-[0_14px_30px_-12px_rgba(41,171,133,0.55)]",
      )}
    >
      <MaterialIcon name={icon} className="text-[1.75rem]" />
    </span>
  );
}

type StepRowProps = {
  step: InvestorRouteStep;
  index: number;
  inView: boolean;
};

function StepRow({ step, index, inView }: StepRowProps) {
  const isLeft = index % 2 === 0;
  const sideAlign = isLeft ? "lg:text-right lg:items-end" : "lg:text-left lg:items-start";
  const delay = inView ? `${index * 140}ms` : "0ms";

  return (
    <li
      className="route-step relative grid grid-cols-[3.5rem_1fr] items-start gap-x-4 lg:grid-cols-[1fr_5rem_1fr] lg:gap-x-8"
      data-side={isLeft ? "left" : "right"}
    >
      <div
        className={cn(
          "route-content col-start-2 flex flex-col gap-3 text-center lg:col-start-1 lg:row-start-1",
          "lg:pr-10",
          sideAlign,
          inView && "route-content--in-view",
        )}
        style={{ transitionDelay: delay }}
      >
        <div
          className={cn(
            "flex flex-col",
            isLeft ? "lg:items-end" : "lg:items-start",
          )}
        >
          <h3
            className={cn(
              "font-display text-2xl font-extrabold leading-tight text-[#252A58] md:text-3xl",
            )}
          >
            <span className="text-[#0E7A7C]">{step.n}.</span> {step.label}
          </h3>
          {step.description && (
            <p
              className={cn(
                "mt-3 max-w-md text-sm leading-relaxed text-[#64748B] md:text-[15px]",
              )}
            >
              {step.description}
            </p>
          )}
        </div>
      </div>

      <div
        className={cn(
          "route-node col-start-1 flex items-start justify-center lg:col-start-2 lg:row-start-1 lg:justify-center",
          inView && "route-node--in-view",
        )}
        style={{ transitionDelay: delay }}
      >
        <div className="route-node-inner group/nav relative flex flex-col items-center">
          <StepIcon icon={step.icon} />
        </div>
      </div>

      <div
        className={cn(
          "route-spacer hidden lg:row-start-1 lg:block",
          isLeft ? "lg:col-start-3" : "lg:col-start-1",
        )}
        aria-hidden
      />
    </li>
  );
}

export function InvestorRouteSection({ eyebrow, title, description, steps }: Props) {
  const [sectionRef, inView] = useInView<HTMLDivElement>("-20% 0px -20% 0px");

  return (
    <section
      id="ruta-inversionista"
      className="relative overflow-hidden border-t border-[#252A58]/10 bg-[#f8f9ff]"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-[#29AB85]/8 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-[#0E7A7C]/8 blur-3xl" />
      </div>

      <div ref={sectionRef} className={cn("relative", layout.section)}>
        <div className={layout.container}>
          <header className="mx-auto max-w-3xl text-center">
            <p
              className={cn(
                "route-reveal inline-flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.22em] text-[#29AB85]",
                inView && "route-reveal--in-view",
              )}
            >
              <span className="h-px w-6 bg-[#29AB85]/60" />
              {eyebrow}
              <span className="h-px w-6 bg-[#29AB85]/60" />
            </p>
            <h2
              className={cn(
                "route-reveal mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight text-[#252A58] md:text-5xl",
                inView && "route-reveal--in-view",
              )}
              style={{ transitionDelay: inView ? "120ms" : "0ms" }}
            >
              {title}
            </h2>
            {description && (
              <p
                className={cn(
                  "route-reveal mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#0E7A7C] md:text-lg",
                  inView && "route-reveal--in-view",
                )}
                style={{ transitionDelay: inView ? "240ms" : "0ms" }}
              >
                {description}
              </p>
            )}
          </header>

          <div className="route-track relative mx-auto mt-16 max-w-5xl md:mt-20">
            <div
              className={cn(
                "route-line pointer-events-none absolute top-0 left-[1.75rem] w-px -translate-x-1/2 bg-[#dce9ff] lg:left-1/2",
                inView && "route-line--in-view",
              )}
              aria-hidden
            />

            <ol className="flex flex-col gap-12 lg:gap-16">
              {steps.map((step, index) => (
                <StepRow
                  key={step.n}
                  step={step}
                  index={index}
                  inView={inView}
                />
              ))}
            </ol>
          </div>
        </div>
      </div>

      <style jsx>{`
        .route-reveal {
          opacity: 0;
          transform: translateY(14px);
          transition:
            opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .route-reveal--in-view {
          opacity: 1;
          transform: translateY(0);
        }

        .route-line {
          top: 1.75rem;
          height: calc(100% - 3.5rem);
          transform-origin: top;
          transform: scaleY(0);
          transition: transform 1400ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .route-line--in-view {
          transform: scaleY(1);
        }

        .route-content {
          opacity: 0;
          transform: translateY(20px);
          transition:
            opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .route-content--in-view {
          opacity: 1;
          transform: translateY(0);
        }

        .route-node {
          opacity: 0;
          transform: translateY(20px);
          transition:
            opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .route-node--in-view {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .route-reveal,
          .route-content,
          .route-node,
          .route-line {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
