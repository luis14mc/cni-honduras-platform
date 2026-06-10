import React from "react";
import Link from "next/link";
import { estudiosPageCopy } from "@/src/i18n/copy/estudiosPage";
import { type Locale } from "@/src/i18n/config";

export function EstudiosPageView({ locale }: { locale: Locale }) {
  const c = estudiosPageCopy[locale];

  return (
    <main className="min-h-screen bg-cni-surface pb-20">
      {/* Hero Section */}
      <section className="bg-cni-primary text-white py-24 md:py-32 relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-cni-gold/10 skew-x-[-20deg] translate-x-1/4" />
        
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8 relative z-10 text-center md:text-left">
          <p className="font-headline font-bold tracking-widest uppercase text-cni-gold mb-4 text-sm">
            {c.heroEyebrow}
          </p>
          <h1 className="font-display font-extrabold text-5xl md:text-7xl mb-6 leading-tight">
            {c.heroTitle}
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-3xl opacity-90 mb-10 text-pretty">
            {c.heroSubtitle}
          </p>
          <p className="text-base md:text-lg opacity-80 max-w-4xl text-pretty leading-relaxed">
            {c.heroDescription}
          </p>
        </div>
      </section>

      {/* Grid de Estudios */}
      <section className="py-20 bg-cni-surface-low" id="estudios">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8">
          <h2 className="font-display text-4xl font-bold text-cni-primary mb-12 text-center">
            {c.gridTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {c.sectors.map((sector) => (
              <div 
                key={sector.id} 
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-cni-primary/5 flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 rounded-full bg-cni-primary/5 flex items-center justify-center mb-6 group-hover:bg-cni-gold/10 transition-colors">
                  <span className="material-symbols-outlined text-4xl text-cni-primary group-hover:text-cni-gold transition-colors">
                    {sector.icon}
                  </span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-cni-primary mb-6">
                  {sector.name}
                </h3>
                
                <a 
                  href={sector.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto w-full inline-flex items-center justify-center gap-2 bg-cni-primary text-white py-3 px-6 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-cni-gold transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">download</span>
                  {c.downloadBtn}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-cni-gold" />
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-cni-primary mb-10 max-w-3xl mx-auto">
            {c.ctaTitle}
          </h2>
          <Link
            href={`/${locale}/contacto`}
            className="inline-flex items-center gap-2 bg-white text-cni-primary px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform"
          >
            {c.ctaBtn}
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
