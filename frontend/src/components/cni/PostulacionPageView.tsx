"use client";

import React, { useState } from "react";
import { postulacionPageCopy } from "@/src/i18n/copy/postulacionPage";
import { type Locale } from "@/src/i18n/config";

export function PostulacionPageView({ locale }: { locale: Locale }) {
  const c = postulacionPageCopy[locale];
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Here we would connect to an actual endpoint
  };

  return (
    <main className="min-h-screen bg-cni-surface pb-20">
      {/* Hero Section */}
      <section className="bg-cni-primary text-white py-24 md:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-cni-gold/10 skew-x-[-20deg] translate-x-1/4" />
        <div className="max-w-screen-xl mx-auto px-6 lg:px-8 relative z-10 text-center md:text-left">
          <p className="font-headline font-bold tracking-widest uppercase text-cni-gold mb-4 text-sm">
            {c.hero.eyebrow}
          </p>
          <h1 className="font-display font-extrabold text-5xl md:text-7xl mb-6 leading-tight">
            {c.hero.title}
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-3xl opacity-90 text-pretty">
            {c.hero.description}
          </p>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 lg:px-8 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Column: Benefits */}
        <div className="lg:col-span-4">
          <div className="sticky top-32">
            <h2 className="font-display text-4xl font-bold text-cni-primary mb-6">
              {c.benefits.title}
            </h2>
            <p className="text-on-surface-variant font-body mb-10 leading-relaxed text-pretty">
              {c.benefits.subtitle}
            </p>
            
            <div className="space-y-8">
              {c.benefits.list.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start group">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-cni-primary/5 flex items-center justify-center group-hover:bg-cni-gold/20 transition-colors">
                    <span className="material-symbols-outlined text-cni-primary group-hover:text-cni-gold transition-colors">
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-cni-primary text-lg mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-2xl border border-cni-primary/5">
            <h3 className="font-display text-3xl font-bold text-cni-primary mb-8 text-center md:text-left">
              {c.form.title}
            </h3>

            {isSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center flex flex-col items-center">
                <span className="material-symbols-outlined text-green-500 text-6xl mb-4">check_circle</span>
                <p className="text-green-800 font-headline font-bold text-xl">{c.form.successMsg}</p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="mt-6 text-cni-primary underline font-bold"
                >
                  Enviar otra respuesta
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-12">
                
                {/* Personal Data Section */}
                <div>
                  <h4 className="font-headline font-bold text-xl text-cni-primary border-b border-cni-primary/10 pb-2 mb-6">
                    {c.form.sections.personal}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-2">{c.form.labels.name} <span className="text-red-500">*</span></label>
                      <input required type="text" className="w-full bg-cni-surface-low border border-cni-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cni-primary focus:ring-1 focus:ring-cni-primary transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-2">{c.form.labels.lastName} <span className="text-red-500">*</span></label>
                      <input required type="text" className="w-full bg-cni-surface-low border border-cni-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cni-primary focus:ring-1 focus:ring-cni-primary transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-2">{c.form.labels.company} <span className="text-red-500">*</span></label>
                      <input required type="text" className="w-full bg-cni-surface-low border border-cni-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cni-primary focus:ring-1 focus:ring-cni-primary transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-2">{c.form.labels.role} <span className="text-red-500">*</span></label>
                      <input required type="text" className="w-full bg-cni-surface-low border border-cni-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cni-primary focus:ring-1 focus:ring-cni-primary transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-2">{c.form.labels.email} <span className="text-red-500">*</span></label>
                      <input required type="email" className="w-full bg-cni-surface-low border border-cni-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cni-primary focus:ring-1 focus:ring-cni-primary transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-2">{c.form.labels.website}</label>
                      <input type="url" className="w-full bg-cni-surface-low border border-cni-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cni-primary focus:ring-1 focus:ring-cni-primary transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-on-surface mb-2">{c.form.labels.country} <span className="text-red-500">*</span></label>
                      <input required type="text" className="w-full bg-cni-surface-low border border-cni-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cni-primary focus:ring-1 focus:ring-cni-primary transition-all" />
                    </div>
                  </div>
                </div>

                {/* Project Data Section */}
                <div>
                  <h4 className="font-headline font-bold text-xl text-cni-primary border-b border-cni-primary/10 pb-2 mb-6">
                    {c.form.sections.project}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-on-surface mb-2">{c.form.labels.projectName}</label>
                      <input type="text" className="w-full bg-cni-surface-low border border-cni-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cni-primary focus:ring-1 focus:ring-cni-primary transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-2">{c.form.labels.sector} <span className="text-red-500">*</span></label>
                      <select required className="w-full bg-cni-surface-low border border-cni-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cni-primary focus:ring-1 focus:ring-cni-primary transition-all">
                        <option value="">Seleccione...</option>
                        {c.form.options.sectors.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-2">{c.form.labels.presenceInHonduras} <span className="text-red-500">*</span></label>
                      <select required className="w-full bg-cni-surface-low border border-cni-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cni-primary focus:ring-1 focus:ring-cni-primary transition-all">
                        <option value="">Seleccione...</option>
                        {c.form.options.presence.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-2">{c.form.labels.projectType} <span className="text-red-500">*</span></label>
                      <select required className="w-full bg-cni-surface-low border border-cni-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cni-primary focus:ring-1 focus:ring-cni-primary transition-all">
                        <option value="">Seleccione...</option>
                        {c.form.options.projectTypes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-2">{c.form.labels.investmentAmount} <span className="text-red-500">*</span></label>
                      <select required className="w-full bg-cni-surface-low border border-cni-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cni-primary focus:ring-1 focus:ring-cni-primary transition-all">
                        <option value="">Seleccione...</option>
                        {c.form.options.amounts.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-on-surface mb-2">{c.form.labels.shortDesc} <span className="text-red-500">*</span></label>
                      <textarea required rows={4} className="w-full bg-cni-surface-low border border-cni-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cni-primary focus:ring-1 focus:ring-cni-primary transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-2">{c.form.labels.feasibilityStudies} <span className="text-red-500">*</span></label>
                      <select required className="w-full bg-cni-surface-low border border-cni-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cni-primary focus:ring-1 focus:ring-cni-primary transition-all">
                        <option value="">Seleccione...</option>
                        {c.form.options.studies.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-2">{c.form.labels.completionDate}</label>
                      <input type="date" className="w-full bg-cni-surface-low border border-cni-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:border-cni-primary focus:ring-1 focus:ring-cni-primary transition-all" />
                    </div>
                    
                    <div className="md:col-span-2 bg-cni-gold/10 border border-cni-gold/30 rounded-xl p-6 my-2">
                      <h5 className="font-bold text-cni-primary mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-cni-gold">info</span>
                        Aviso
                      </h5>
                      <p className="text-sm text-on-surface-variant whitespace-pre-line">
                        {c.form.opportunityCardNote}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-on-surface mb-2">{c.form.labels.projectStage} <span className="text-red-500">*</span></label>
                      <div className="space-y-3 mt-4">
                        {c.form.options.stages.map(s => (
                          <label key={s} className="flex items-center gap-3 cursor-pointer">
                            <input required type="radio" name="projectStage" value={s} className="w-5 h-5 text-cni-primary focus:ring-cni-primary" />
                            <span className="text-on-surface">{s}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consent & Submit */}
                <div className="pt-6 border-t border-cni-primary/10">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input required type="checkbox" className="mt-1 w-5 h-5 text-cni-primary focus:ring-cni-primary rounded" />
                    <span className="text-sm text-on-surface-variant leading-relaxed text-pretty">
                      <strong className="text-on-surface block mb-1">{c.form.labels.consent} <span className="text-red-500">*</span></strong>
                      {c.form.consentText}
                    </span>
                  </label>
                  
                  <button type="submit" className="mt-10 w-full bg-cni-primary text-white font-headline font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-cni-gold hover:text-cni-primary transition-colors flex items-center justify-center gap-2">
                    {c.form.labels.submit}
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
