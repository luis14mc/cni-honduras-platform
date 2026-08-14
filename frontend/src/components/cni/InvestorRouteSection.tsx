"use client";

import { useEffect, useRef, useState } from "react";
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

function useInView<T extends HTMLElement>(rootMargin = "-10% 0px -10% 0px") {
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

type StepCardProps = {
  step: InvestorRouteStep;
  index: number;
  total: number;
  inView: boolean;
};

function StepCard({ step, index, total, inView }: StepCardProps) {
  return (
    <li
      className={cn(
        "route-step group relative flex min-w-0 flex-1 flex-col",
        inView && "route-step--in-view",
      )}
      style={{ transitionDelay: inView ? `${index * 110}ms` : "0ms" }}
    >
      <article
        className={cn(
          "route-card relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#252A58]/10 bg-white p-6 md:p-7",
          "shadow-[0_1px_0_rgba(37,42,88,0.04),0_18px_40px_-22px_rgba(37,42,88,0.18)]",
          "transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "hover:-translate-y-1.5 hover:border-[#29AB85]/40",
          "hover:shadow-[0_1px_0_rgba(41,171,133,0.15),0_28px_56px_-22px_rgba(41,171,133,0.28)]",
        )}
      >
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100"
          style={{ backgroundColor: step.color }}
          aria-hidden
        />

        <div className="flex items-start justify-between">
          <div className="route-badge relative inline-flex items-center gap-2.5">
            <span
              className="relative flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(37,42,88,0.45)]"
              style={{ backgroundColor: step.color }}
            >
              <span
                className="pointer-events-none absolute -inset-1 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle, ${step.color}55 0%, transparent 70%)`,
                }}
                aria-hidden
              />
              <span className="relative">{step.n}</span>
            </span>
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-[#64748B]">
              Paso
            </span>
          </div>
          <span
            className="font-display text-3xl font-extrabold leading-none tabular-nums text-[#252A58]/[0.06]"
            aria-hidden
          >
            {String(step.n).padStart(2, "0")}
          </span>
        </div>

        <div
          className={cn(
            "route-icon relative mt-6 flex h-16 w-16 items-center justify-center rounded-2xl border transition-all duration-500",
            "group-hover:scale-[1.04] group-hover:border-transparent",
          )}
          style={{
            backgroundColor: `${step.color}0F`,
            borderColor: `${step.color}22`,
          }}
        >
          <span
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `linear-gradient(135deg, ${step.color}1A 0%, ${step.color}05 100%)`,
            }}
            aria-hidden
          />
          <span
            className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-60"
            style={{ backgroundColor: step.color }}
            aria-hidden
          />
          <span className="relative">
            <StepIcon icon={step.icon} color={step.color} />
          </span>
        </div>

        <h3 className={cn("mt-6 text-[#252A58]", t.h3Card)}>{step.label}</h3>

        <div
          className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#0E7A7C] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden
        >
          <span className="h-px w-6" style={{ backgroundColor: step.color }} />
          {index < total - 1 ? "Siguiente paso" : "Cierre institucional"}
        </div>
      </article>
    </li>
  );
}

function TimelineTrack({ steps, inView }: { steps: readonly InvestorRouteStep[]; inView: boolean }) {
  return (
    <div className="relative mx-auto mb-12 hidden max-w-5xl lg:block">
      <div className="relative h-14">
        <div className="absolute left-[2.5rem] right-[2.5rem] top-1/2 -translate-y-1/2">
          <div className="absolute inset-0 h-px bg-gradient-to-r from-[#252A58]/10 via-[#0E7A7C]/12 to-[#252A58]/10" />
          <div
            className={cn(
              "timeline-progress absolute inset-y-0 left-0 h-px bg-gradient-to-r from-[#29AB85] via-[#35A963] to-[#8DC046] transition-[width] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              inView ? "w-full" : "w-0",
            )}
            style={{
              boxShadow: "0 0 12px rgba(41,171,133,0.45)",
            }}
          />
        </div>
        <ol className="relative z-10 flex items-center justify-between">
          {steps.map((step, index) => (
            <li
              key={step.n}
              className={cn(
                "timeline-node flex h-14 w-14 items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                inView ? "scale-100 opacity-100" : "scale-50 opacity-0",
              )}
              style={{ transitionDelay: inView ? `${index * 140}ms` : "0ms" }}
            >
              <span
                className="absolute h-14 w-14 rounded-full opacity-0 blur-md transition-opacity duration-500"
                style={{ backgroundColor: step.color, opacity: inView ? 0.18 : 0 }}
                aria-hidden
              />
              <span
                className="relative flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-[0_0_0_3px_white,0_0_0_4px_rgba(37,42,88,0.08)]"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: step.color }}
                />
              </span>
              <span
                className="absolute inline-flex h-5 w-5 animate-[route-ping_2.4s_ease-out_infinite] rounded-full opacity-0"
                style={{
                  backgroundColor: step.color,
                  animationDelay: `${index * 220}ms`,
                  animationFillMode: "both",
                }}
                aria-hidden
              />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function InvestorRouteSection({ eyebrow, titlePrefix, titleHighlight, steps }: Props) {
  const [sectionRef, sectionInView] = useInView<HTMLDivElement>("-15% 0px -15% 0px");

  return (
    <section
      id="ruta-inversionista"
      className="relative overflow-hidden border-t border-[#252A58]/10 bg-[#f8f9ff]"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-32 top-12 h-72 w-72 rounded-full bg-[#29AB85]/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[#0E7A7C]/10 blur-3xl" />
      </div>

      <div ref={sectionRef} className={cn("relative", layout.section)}>
        <div className={layout.container}>
          <header className="mx-auto max-w-3xl text-center">
            <p
              className={cn(
                "route-reveal inline-flex items-center gap-2 rounded-full border border-[#29AB85]/30 bg-white/60 px-4 py-1.5 backdrop-blur-sm",
                t.eyebrow,
                sectionInView && "route-reveal--in-view",
              )}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-[route-pulse_2s_ease-in-out_infinite] rounded-full bg-[#29AB85] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#29AB85]" />
              </span>
              {eyebrow}
            </p>
            <h2
              className={cn(
                "route-reveal mt-5 text-[#252A58]",
                t.h2,
                sectionInView && "route-reveal--in-view",
              )}
              style={{ transitionDelay: sectionInView ? "120ms" : "0ms" }}
            >
              {titlePrefix}{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#29AB85] via-[#35A963] to-[#8DC046] bg-clip-text text-transparent">
                  {titleHighlight}
                </span>
                <span
                  className={cn(
                    "route-underline absolute -bottom-1 left-0 h-[3px] rounded-full bg-gradient-to-r from-[#29AB85] via-[#35A963] to-[#8DC046]",
                    sectionInView ? "route-underline--in-view" : "w-0",
                  )}
                  style={{ transitionDelay: sectionInView ? "640ms" : "0ms" }}
                  aria-hidden
                />
              </span>
            </h2>
            <p
              className={cn(
                "route-reveal mx-auto mt-5 max-w-2xl text-[#0E7A7C]",
                t.lead,
                sectionInView && "route-reveal--in-view",
              )}
              style={{ transitionDelay: sectionInView ? "240ms" : "0ms" }}
            >
              Cinco hitos sincronizados con el CNI. La ruta se activa, se mide y se acompaña
              desde el primer contacto hasta el aftercare.
            </p>
          </header>

          <TimelineTrack steps={steps} inView={sectionInView} />

          <ol className="relative grid gap-5 sm:grid-cols-2 lg:flex lg:items-stretch lg:gap-5 xl:gap-6">
            {steps.map((step, index) => (
              <StepCard
                key={step.n}
                step={step}
                index={index}
                total={steps.length}
                inView={sectionInView}
              />
            ))}
          </ol>
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

        .route-underline {
          width: 0;
          transition: width 900ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .route-underline--in-view {
          width: 100%;
        }

        .route-step {
          opacity: 0;
          transform: translateY(28px);
          transition:
            opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .route-step--in-view {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes route-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.75;
          }
          50% {
            transform: scale(2.4);
            opacity: 0;
          }
        }

        @keyframes route-ping {
          0% {
            transform: scale(1);
            opacity: 0.55;
          }
          80%,
          100% {
            transform: scale(3.4);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .route-reveal,
          .route-step {
            opacity: 1;
            transform: none;
            transition: none;
          }
          .route-underline {
            width: 100%;
            transition: none;
          }
          .timeline-progress {
            width: 100% !important;
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
