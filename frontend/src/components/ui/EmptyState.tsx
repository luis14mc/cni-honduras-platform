import React from "react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";

export function EmptyState({
  title,
  description,
  cta,
  className,
}: {
  title: string;
  description: string;
  cta?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-dashed border-slate-200 bg-white p-8",
        "shadow-sm",
        className,
      )}
    >
      <h2 className="text-base font-extrabold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600 max-w-2xl font-medium">{description}</p>
      {cta ? (
        <div className="mt-6">
          <Link
            href={cta.href}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {cta.label}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

