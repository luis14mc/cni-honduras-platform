import React from "react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";

export function PageHeader({
  variant = "hero",
  eyebrow,
  title,
  subtitle,
  description,
  cta,
  className,
}: {
  variant?: "hero" | "card";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  description?: string;
  cta?: { label: string; href: string };
  className?: string;
}) {
  if (variant === "card") {
    return (
      <div className={cn("relative overflow-hidden rounded-3xl border border-slate-200 bg-white", className)}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.10),transparent_55%)]" />
        <div className="relative p-8 sm:p-10">
          {eyebrow ? (
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-700">{eyebrow}</p>
          ) : null}

          <div className="mt-3 space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">{title}</h1>
            {subtitle ? <p className="text-base sm:text-lg font-semibold text-slate-700">{subtitle}</p> : null}
            {description ? <p className="text-sm sm:text-base text-slate-600 max-w-2xl">{description}</p> : null}
          </div>

          {cta ? (
            <div className="mt-7">
              <Link
                href={cta.href}
                className="inline-flex items-center justify-center rounded-full bg-blue-700 px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-blue-700/25 hover:bg-blue-600 transition-colors"
              >
                {cta.label}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950 text-white",
        "topo-pattern grain",
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
      <div className="relative p-8 sm:p-10">
        {eyebrow ? (
          <span className="inline-flex items-center rounded-full bg-blue-600/15 border border-blue-500/25 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-blue-300">
            {eyebrow}
          </span>
        ) : null}

        <div className="mt-3 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{title}</h1>
          {subtitle ? (
            <p className="text-base sm:text-lg font-semibold text-white/80">{subtitle}</p>
          ) : null}
          {description ? <p className="text-sm sm:text-base text-white/65 max-w-2xl">{description}</p> : null}
        </div>

        {cta ? (
          <div className="mt-7">
            <Link
              href={cta.href}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-white shadow-2xl shadow-blue-500/25 transition-colors"
            >
              {cta.label}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

