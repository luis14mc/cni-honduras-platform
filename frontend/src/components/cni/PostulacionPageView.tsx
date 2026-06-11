"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { postulacionPageCopy } from "@/src/i18n/copy/postulacionPage";
import { type Locale } from "@/src/i18n/config";
import { getSectors } from "@/src/data/investmentSectors";
import { resolveHref } from "@/src/i18n/path";
import { submitProjectApplication } from "@/src/services/forms";
import type { ProjectApplicationPayload } from "@/src/types/forms";

type SubmitState = "idle" | "submitting" | "success" | "error";

type FormState = {
  full_name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  project_name: string;
  sector: string;
  project_location: string;
  investment_range: string;
  expected_jobs: string;
  details: string;
  consent: boolean;
};

const initialForm: FormState = {
  full_name: "",
  email: "",
  phone: "",
  company: "",
  country: "",
  project_name: "",
  sector: "",
  project_location: "",
  investment_range: "",
  expected_jobs: "",
  details: "",
  consent: false,
};

const copy = {
  es: {
    sections: {
      contact: "Datos de contacto",
      project: "Información del proyecto",
    },
    labels: {
      full_name: "Nombre completo",
      email: "Correo electrónico",
      phone: "Teléfono",
      company: "Empresa / institución",
      country: "País",
      project_name: "Nombre del proyecto",
      sector: "Sector",
      project_location: "Ubicación del proyecto",
      investment_range: "Rango de inversión estimado",
      expected_jobs: "Empleos estimados",
      details: "Descripción del proyecto",
      consent: "Autorizo al CNI a contactarme para dar seguimiento a esta postulación.",
      submit: "Enviar postulación",
      submitAnother: "Enviar otro proyecto",
    },
    placeholders: {
      full_name: "Nombre y apellido",
      email: "correo@empresa.com",
      phone: "+504 0000-0000",
      company: "Nombre de empresa o institución",
      country: "País de origen",
      project_name: "Nombre comercial o descriptivo",
      project_location: "Ciudad, departamento o zona de interés",
      expected_jobs: "Ej. 120",
      details: "Cuéntenos qué se ejecutará, etapa actual, necesidades y potencial de inversión.",
      select: "Seleccione...",
    },
    investmentRanges: [
      "Menos de US$1 millón",
      "US$1 millón a US$5 millones",
      "US$5 millones a US$10 millones",
      "US$10 millones a US$50 millones",
      "Más de US$50 millones",
      "Por definir",
    ],
    success:
      "Su proyecto ha sido recibido correctamente. El equipo del CNI revisará la información y se pondrá en contacto.",
    error:
      "No pudimos recibir la postulación en este momento. Por favor intente nuevamente o contacte al CNI para asistencia.",
    validation: {
      required: "Este campo es obligatorio.",
      email: "Ingrese un correo electrónico válido.",
      consent: "Debe autorizar el contacto para enviar la postulación.",
    },
    advisoryTitle: "¿Necesita acompañamiento antes de postular?",
    advisoryText:
      "El CNI brinda asesoría gratuita para orientar proyectos de inversión, resolver consultas técnicas y facilitar su ruta institucional.",
    advisoryCta: "Solicitar asesoría gratuita",
  },
  en: {
    sections: {
      contact: "Contact information",
      project: "Project information",
    },
    labels: {
      full_name: "Full name",
      email: "Email address",
      phone: "Phone",
      company: "Company / institution",
      country: "Country",
      project_name: "Project name",
      sector: "Sector",
      project_location: "Project location",
      investment_range: "Estimated investment range",
      expected_jobs: "Estimated jobs",
      details: "Project description",
      consent: "I authorize CNI to contact me to follow up on this application.",
      submit: "Submit project",
      submitAnother: "Submit another project",
    },
    placeholders: {
      full_name: "First and last name",
      email: "email@company.com",
      phone: "+1 000 000 0000",
      company: "Company or institution name",
      country: "Country of origin",
      project_name: "Commercial or descriptive name",
      project_location: "City, department, or target area",
      expected_jobs: "E.g. 120",
      details: "Tell us what will be executed, current stage, needs, and investment potential.",
      select: "Select...",
    },
    investmentRanges: [
      "Under US$1 million",
      "US$1 million to US$5 million",
      "US$5 million to US$10 million",
      "US$10 million to US$50 million",
      "Over US$50 million",
      "To be defined",
    ],
    success:
      "Your project has been received successfully. The CNI team will review the information and contact you.",
    error:
      "We could not receive the application at this time. Please try again or contact CNI for assistance.",
    validation: {
      required: "This field is required.",
      email: "Enter a valid email address.",
      consent: "You must authorize contact to submit the application.",
    },
    advisoryTitle: "Need guidance before applying?",
    advisoryText:
      "CNI provides free advisory to orient investment projects, answer technical questions, and facilitate your institutional path.",
    advisoryCta: "Request free advisory",
  },
} as const;

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-sm font-medium text-red-700">{message}</p>;
}

export function PostulacionPageView({ locale }: { locale: Locale }) {
  const c = postulacionPageCopy[locale];
  const t = copy[locale];
  const L = (path: string) => resolveHref(locale, path);
  const sectors = useMemo(() => getSectors(locale), [locale]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const setValue = (field: keyof FormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (submitState === "error") setSubmitState("idle");
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.full_name.trim()) nextErrors.full_name = t.validation.required;
    if (!form.email.trim()) nextErrors.email = t.validation.required;
    else if (!isEmail(form.email)) nextErrors.email = t.validation.email;
    if (!form.sector.trim()) nextErrors.sector = t.validation.required;
    if (!form.details.trim()) nextErrors.details = t.validation.required;
    if (!form.consent) nextErrors.consent = t.validation.consent;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitState("submitting");
    const expectedJobs = Number.parseInt(form.expected_jobs, 10);
    const payload: ProjectApplicationPayload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company.trim(),
      country: form.country.trim(),
      project_name: form.project_name.trim(),
      sector: form.sector,
      project_location: form.project_location.trim(),
      investment_range: form.investment_range,
      expected_jobs: Number.isFinite(expectedJobs) ? expectedJobs : null,
      details: form.details.trim(),
      message: form.details.trim(),
      consent: form.consent,
      source: "website_project_application",
    };

    try {
      await submitProjectApplication(payload);
      setSubmitState("success");
      setForm(initialForm);
    } catch {
      setSubmitState("error");
    }
  };

  return (
    <main className="min-h-screen bg-cni-surface-low pb-20">
      <section className="relative overflow-hidden bg-cni-primary px-6 py-24 text-white md:py-32 lg:px-8">
        <div className="absolute right-0 top-0 h-full w-1/2 translate-x-1/4 skew-x-[-20deg] bg-cni-gold/10" />
        <div className="relative z-10 mx-auto max-w-screen-xl">
          <p className="mb-4 font-headline text-sm font-bold uppercase tracking-widest text-cni-gold">
            {c.hero.eyebrow}
          </p>
          <h1 className="mb-6 font-display text-5xl font-extrabold leading-tight md:text-7xl">
            {c.hero.title}
          </h1>
          <p className="max-w-3xl text-xl font-light leading-relaxed text-white/90 md:text-2xl">
            {c.hero.description}
          </p>
        </div>
      </section>

      <div className="mx-auto mt-16 grid max-w-screen-xl grid-cols-1 gap-10 px-6 lg:grid-cols-12 lg:gap-14 lg:px-8">
        <aside className="lg:col-span-4">
          <div className="sticky top-32 space-y-8">
            <div>
              <h2 className="mb-5 font-display text-4xl font-bold text-cni-primary">
                {c.benefits.title}
              </h2>
              <p className="font-body leading-relaxed text-on-surface-variant">
                {c.benefits.subtitle}
              </p>
            </div>
            <div className="space-y-6">
              {c.benefits.list.map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cni-primary/5 text-cni-primary">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="mb-1 font-headline text-lg font-bold text-cni-primary">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-on-surface-variant">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-cni-gold/30 bg-white p-7 shadow-sm">
              <h3 className="mb-3 font-headline text-xl font-extrabold text-cni-primary">
                {t.advisoryTitle}
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">{t.advisoryText}</p>
              <Link
                href={L("/asesoria")}
                className="inline-flex items-center gap-2 font-headline text-xs font-extrabold uppercase tracking-[0.18em] text-cni-primary hover:text-cni-secondary"
              >
                {t.advisoryCta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </aside>

        <section className="lg:col-span-8">
          <div className="rounded-[28px] border border-cni-primary/5 bg-white p-6 shadow-2xl md:p-10 lg:p-12">
            <div className="mb-8">
              <h2 className="font-display text-3xl font-bold text-cni-primary">
                {c.form.title}
              </h2>
            </div>

            {submitState === "success" ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
                <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-green-600" aria-hidden />
                <p className="mx-auto max-w-2xl text-lg font-bold leading-relaxed text-green-900">
                  {t.success}
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitState("idle")}
                  className="mt-8 rounded-xl bg-cni-primary px-8 py-3 font-headline text-xs font-extrabold uppercase tracking-[0.18em] text-white transition-colors hover:bg-cni-gold hover:text-cni-primary"
                >
                  {t.labels.submitAnother}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-10">
                <div>
                  <h3 className="mb-6 border-b border-cni-primary/10 pb-3 font-headline text-xl font-bold text-cni-primary">
                    {t.sections.contact}
                  </h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-on-surface">
                        {t.labels.full_name} <span className="text-red-600">*</span>
                      </span>
                      <input
                        value={form.full_name}
                        onChange={(event) => setValue("full_name", event.target.value)}
                        placeholder={t.placeholders.full_name}
                        className="w-full rounded-xl border border-cni-primary/20 bg-cni-surface-low px-4 py-3 outline-none transition focus:border-cni-primary focus:ring-1 focus:ring-cni-primary"
                      />
                      <FieldError message={errors.full_name} />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-on-surface">
                        {t.labels.email} <span className="text-red-600">*</span>
                      </span>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) => setValue("email", event.target.value)}
                        placeholder={t.placeholders.email}
                        className="w-full rounded-xl border border-cni-primary/20 bg-cni-surface-low px-4 py-3 outline-none transition focus:border-cni-primary focus:ring-1 focus:ring-cni-primary"
                      />
                      <FieldError message={errors.email} />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-on-surface">{t.labels.phone}</span>
                      <input
                        value={form.phone}
                        onChange={(event) => setValue("phone", event.target.value)}
                        placeholder={t.placeholders.phone}
                        className="w-full rounded-xl border border-cni-primary/20 bg-cni-surface-low px-4 py-3 outline-none transition focus:border-cni-primary focus:ring-1 focus:ring-cni-primary"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-on-surface">{t.labels.company}</span>
                      <input
                        value={form.company}
                        onChange={(event) => setValue("company", event.target.value)}
                        placeholder={t.placeholders.company}
                        className="w-full rounded-xl border border-cni-primary/20 bg-cni-surface-low px-4 py-3 outline-none transition focus:border-cni-primary focus:ring-1 focus:ring-cni-primary"
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-bold text-on-surface">{t.labels.country}</span>
                      <input
                        value={form.country}
                        onChange={(event) => setValue("country", event.target.value)}
                        placeholder={t.placeholders.country}
                        className="w-full rounded-xl border border-cni-primary/20 bg-cni-surface-low px-4 py-3 outline-none transition focus:border-cni-primary focus:ring-1 focus:ring-cni-primary"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="mb-6 border-b border-cni-primary/10 pb-3 font-headline text-xl font-bold text-cni-primary">
                    {t.sections.project}
                  </h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-bold text-on-surface">{t.labels.project_name}</span>
                      <input
                        value={form.project_name}
                        onChange={(event) => setValue("project_name", event.target.value)}
                        placeholder={t.placeholders.project_name}
                        className="w-full rounded-xl border border-cni-primary/20 bg-cni-surface-low px-4 py-3 outline-none transition focus:border-cni-primary focus:ring-1 focus:ring-cni-primary"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-on-surface">
                        {t.labels.sector} <span className="text-red-600">*</span>
                      </span>
                      <select
                        value={form.sector}
                        onChange={(event) => setValue("sector", event.target.value)}
                        className="w-full rounded-xl border border-cni-primary/20 bg-cni-surface-low px-4 py-3 outline-none transition focus:border-cni-primary focus:ring-1 focus:ring-cni-primary"
                      >
                        <option value="">{t.placeholders.select}</option>
                        {sectors.map((sector) => (
                          <option key={sector.slug} value={sector.slug}>
                            {sector.name}
                          </option>
                        ))}
                      </select>
                      <FieldError message={errors.sector} />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-on-surface">{t.labels.project_location}</span>
                      <input
                        value={form.project_location}
                        onChange={(event) => setValue("project_location", event.target.value)}
                        placeholder={t.placeholders.project_location}
                        className="w-full rounded-xl border border-cni-primary/20 bg-cni-surface-low px-4 py-3 outline-none transition focus:border-cni-primary focus:ring-1 focus:ring-cni-primary"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-on-surface">{t.labels.investment_range}</span>
                      <select
                        value={form.investment_range}
                        onChange={(event) => setValue("investment_range", event.target.value)}
                        className="w-full rounded-xl border border-cni-primary/20 bg-cni-surface-low px-4 py-3 outline-none transition focus:border-cni-primary focus:ring-1 focus:ring-cni-primary"
                      >
                        <option value="">{t.placeholders.select}</option>
                        {t.investmentRanges.map((range) => (
                          <option key={range} value={range}>
                            {range}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-on-surface">{t.labels.expected_jobs}</span>
                      <input
                        type="number"
                        min="0"
                        value={form.expected_jobs}
                        onChange={(event) => setValue("expected_jobs", event.target.value)}
                        placeholder={t.placeholders.expected_jobs}
                        className="w-full rounded-xl border border-cni-primary/20 bg-cni-surface-low px-4 py-3 outline-none transition focus:border-cni-primary focus:ring-1 focus:ring-cni-primary"
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-bold text-on-surface">
                        {t.labels.details} <span className="text-red-600">*</span>
                      </span>
                      <textarea
                        rows={6}
                        value={form.details}
                        onChange={(event) => setValue("details", event.target.value)}
                        placeholder={t.placeholders.details}
                        className="w-full rounded-xl border border-cni-primary/20 bg-cni-surface-low px-4 py-3 outline-none transition focus:border-cni-primary focus:ring-1 focus:ring-cni-primary"
                      />
                      <FieldError message={errors.details} />
                    </label>
                  </div>
                </div>

                <div className="border-t border-cni-primary/10 pt-6">
                  <label className="flex cursor-pointer items-start gap-4">
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={(event) => setValue("consent", event.target.checked)}
                      className="mt-1 h-5 w-5 rounded border-cni-primary/30 text-cni-primary focus:ring-cni-primary"
                    />
                    <span className="text-sm leading-relaxed text-on-surface-variant">
                      <strong className="mb-1 block text-on-surface">
                        {c.form.labels.consent} <span className="text-red-600">*</span>
                      </strong>
                      {t.labels.consent}
                    </span>
                  </label>
                  <FieldError message={errors.consent} />

                  {submitState === "error" && (
                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-900">
                      {t.error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitState === "submitting"}
                    className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-cni-primary px-8 py-4 font-headline text-xs font-extrabold uppercase tracking-[0.2em] text-white transition-colors hover:bg-cni-gold hover:text-cni-primary disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitState === "submitting" ? (
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    ) : (
                      <ArrowRight className="h-5 w-5" aria-hidden />
                    )}
                    {t.labels.submit}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
