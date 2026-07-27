import React from "react";
import { cn } from "@/src/lib/utils";

export function SovereignHero({
  imageUrl,
  eyebrow,
  title,
  accent,
  description,
  heightClass = "h-[450px] md:h-[520px]",
  align = "left",
}: {
  imageUrl: string;
  eyebrow?: string;
  title: string;
  accent?: string;
  description?: string;
  heightClass?: string;
  align?: "left" | "center";
}) {
  return (
    <section className={cn("relative flex items-center overflow-hidden", heightClass)}>
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${imageUrl}')` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(37, 42, 88, 0.35) 0%, rgba(14, 122, 124, 0.12) 45%, transparent 72%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full">
        <div className={cn("max-w-screen-2xl mx-auto px-8", align === "center" && "text-center")}>
          <div className={cn("max-w-4xl", align === "center" && "mx-auto")}>
            {eyebrow ? (
              <span
                className={cn(
                  "inline-block py-1 px-3 mb-6",
                  "bg-[#0E7A7C]/35 text-[#35A963]",
                  "text-[11px] font-black uppercase tracking-[0.18em] rounded",
                )}
              >
                {eyebrow}
              </span>
            ) : null}

            <h1 className="text-white font-extrabold tracking-tighter leading-none text-5xl md:text-7xl">
              {title}{" "}
              {accent ? <span className="text-[#35A963]">{accent}</span> : null}
            </h1>

            {description ? (
              <p className={cn("mt-6 text-white/80 text-lg md:text-xl font-light leading-relaxed", align === "center" && "mx-auto")}>
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

