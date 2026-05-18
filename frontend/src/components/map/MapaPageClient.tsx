"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/src/i18n/config";
import { mapaCopy } from "@/src/i18n/copy/secondaryPages";

const HondurasMap = dynamic(() => import("@/src/components/map/HondurasMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
      <p className="text-sm font-semibold text-slate-600">Cargando mapa / Loading map…</p>
    </div>
  ),
});

export function MapaPageClient({ locale }: { locale: Locale }) {
  const t = mapaCopy[locale];
  return (
    <main className="container mx-auto px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#000a1e]">{t.title}</h1>
      </div>
      <HondurasMap />
    </main>
  );
}
