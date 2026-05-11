import React from "react";
import { cn } from "@/src/lib/utils";

export function FeatureCard({
  title,
  description,
  icon,
  className,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl p-8 border border-slate-100 bg-slate-50 hover:bg-white transition-colors",
        "hover:shadow-2xl hover:shadow-blue-500/5",
        className,
      )}
    >
      {icon ? (
        <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-white p-4 text-blue-600 shadow-sm">
          {icon}
        </div>
      ) : null}
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 font-medium">{description}</p>
    </div>
  );
}

