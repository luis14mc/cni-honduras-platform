import React from "react";
import { cn } from "@/src/lib/utils";

export function TonalCard({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "article";
}) {
  const Comp = as as any;
  return (
    <Comp
      className={cn(
        "rounded-xl bg-white",
        "shadow-[0_20px_40px_rgba(0,10,30,0.04)]",
        className,
      )}
    >
      {children}
    </Comp>
  );
}

export function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white/70 backdrop-blur-2xl",
        "shadow-[0_20px_40px_rgba(0,10,30,0.04)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

