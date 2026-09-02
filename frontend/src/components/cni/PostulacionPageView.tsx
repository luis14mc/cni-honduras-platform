"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { ApiError } from "@/src/lib/api";
import { apiFieldErrors, beginSubmission, buildProjectApplicationPayload, emptyProjectSubmission, firstInvalidField, resetMunicipalityOnDepartmentChange, validateProjectSubmission, type FieldErrors, type ProjectSubmissionField, type ProjectSubmissionValues } from "@/src/lib/projectSubmission";
import { postulacionPageCopy } from "@/src/i18n/copy/postulacionPage";
import type { Locale } from "@/src/i18n/config";
import { resolveHref } from "@/src/i18n/path";
import { getDepartmentGeoJson, getMunicipalityGeoJson } from "@/src/services/investmentMap";
import { submitProjectApplication } from "@/src/services/forms";

type Option = { slug: string; name: string };
type State = "idle" | "submitting" | "success" | "validation-error" | "server-error";
const inputClass = "w-full rounded-xl border border-cni-primary/20 bg-cni-surface-low px-4 py-3 outline-none transition focus:border-cni-primary focus:ring-1 focus:ring-cni-primary disabled:cursor-not-allowed disabled:opacity-60";

export function PostulacionPageView({ locale, sectors, sectorsStatus = "ok" }: { locale: Locale; sectors: ReadonlyArray<Option>; sectorsStatus?: "ok" | "error" }) {
  const c = postulacionPageCopy[locale];
  const [form, setForm] = useState<ProjectSubmissionValues>(emptyProjectSubmission);
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [reference, setReference] = useState("");
  const [departments, setDepartments] = useState<Option[]>([]);
  const [municipalities, setMunicipalities] = useState<Option[]>([]);
  const [departmentsState, setDepartmentsState] = useState<"loading" | "ok" | "error">("loading");
  const [municipalitiesState, setMunicipalitiesState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const submittingRef = useRef(false);
  const municipalityRequestRef = useRef(0);

  useEffect(() => { getDepartmentGeoJson().then((data) => { setDepartments(data.features.map(({ properties }) => properties).filter((item) => item.is_active !== false).sort((a, b) => a.name.localeCompare(b.name))); setDepartmentsState("ok"); }).catch(() => setDepartmentsState("error")); }, []);

  const setValue = (field: ProjectSubmissionField, value: string | boolean) => { setForm((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: undefined })); if (state === "server-error" || state === "validation-error") setState("idle"); };
  const changeDepartment = async (department: string) => {
    const requestId = ++municipalityRequestRef.current;
    setForm((current) => resetMunicipalityOnDepartmentChange(current, department));
    setErrors((current) => ({ ...current, department: undefined, municipality: undefined }));
    setMunicipalities([]);
    if (!department) { setMunicipalitiesState("idle"); return; }
    setMunicipalitiesState("loading");
    try { const data = await getMunicipalityGeoJson(department); if (requestId !== municipalityRequestRef.current) return; setMunicipalities(data.features.map(({ properties }) => properties).sort((a, b) => a.name.localeCompare(b.name))); setMunicipalitiesState("ok"); } catch { if (requestId === municipalityRequestRef.current) setMunicipalitiesState("error"); }
  };
  const focusFirst = (nextErrors: FieldErrors) => requestAnimationFrame(() => document.getElementById(firstInvalidField(nextErrors) ?? "")?.focus());
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const guard = beginSubmission(submittingRef.current); if (!guard.allowed) return;
    const nextErrors = validateProjectSubmission(form, c.validation);
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); setState("validation-error"); focusFirst(nextErrors); return; }
    submittingRef.current = true; setState("submitting");
    try { const response = await submitProjectApplication(buildProjectApplicationPayload(form)); setReference(response.reference_code); setState("success"); }
    catch (error) { const fieldErrors = error instanceof ApiError ? apiFieldErrors(error.data) : {}; setErrors(fieldErrors); setState("server-error"); if (Object.keys(fieldErrors).length) focusFirst(fieldErrors); }
    finally { submittingRef.current = false; }
  };
  const fieldProps = (field: ProjectSubmissionField) => ({ id: field, name: field, "aria-invalid": Boolean(errors[field]), "aria-describedby": errors[field] ? `${field}-error` : undefined });
  const errorText = (field: ProjectSubmissionField) => errors[field] ? <p id={`${field}-error`} className="mt-2 text-sm font-semibold text-red-700">{errors[field]}</p> : null;
  const label = (field: Exclude<ProjectSubmissionField, "company_fax">, optional = false) => <span className="mb-2 block text-sm font-bold text-on-surface">{c.labels[field]} <span className="font-normal text-on-surface-variant">({optional ? c.optional : c.required})</span></span>;
  const section = (title: string, children: React.ReactNode) => <fieldset className="space-y-6"><legend className="mb-6 w-full border-b border-cni-primary/10 pb-3 font-headline text-xl font-bold text-cni-primary">{title}</legend>{children}</fieldset>;

  return <main className="min-h-screen bg-cni-surface-low pb-20">
    <header className="relative overflow-hidden bg-cni-primary px-6 py-24 text-white md:py-32"><div className="absolute right-0 top-0 h-full w-1/2 translate-x-1/4 skew-x-[-20deg] bg-cni-gold/10"/><div className="relative mx-auto max-w-screen-xl"><p className="mb-4 text-sm font-bold tracking-widest text-cni-gold">{c.hero.eyebrow}</p><h1 className="mb-6 font-display text-5xl font-extrabold md:text-7xl">{c.hero.title}</h1><p className="max-w-3xl text-xl text-white/90">{c.hero.description}</p></div></header>
    <div className="mx-auto mt-16 grid max-w-screen-xl gap-10 px-6 lg:grid-cols-12 lg:px-8"><aside className="lg:col-span-4"><div className="sticky top-32"><h2 className="mb-4 font-display text-3xl font-bold text-cni-primary">{c.intro.title}</h2><p className="mb-10 leading-relaxed text-on-surface-variant">{c.intro.text}</p><h3 className="mb-4 font-bold text-cni-primary">{c.benefits.title}</h3><ul className="space-y-4">{c.benefits.list.map((item) => <li className="flex gap-3" key={item}><CheckCircle2 className="h-5 w-5 shrink-0 text-cni-secondary" aria-hidden/>{item}</li>)}</ul></div></aside>
      <section className="lg:col-span-8"><div className="rounded-[28px] bg-white p-6 shadow-2xl md:p-10">
      {state === "success" ? <div className="py-10 text-center" role="status"><CheckCircle2 className="mx-auto mb-5 h-16 w-16 text-green-600"/><h2 className="text-2xl font-bold text-cni-primary">{c.success}</h2><p className="mt-4 text-on-surface-variant">{c.labels.reference}: <strong className="text-cni-primary">{reference}</strong></p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link className="rounded-xl bg-cni-primary px-6 py-3 font-bold text-white" href={resolveHref(locale, "/portafolio")}>{c.labels.portfolio}</Link><Link className="rounded-xl border border-cni-primary px-6 py-3 font-bold text-cni-primary" href={resolveHref(locale, "/")}>{c.labels.home}</Link><button className="rounded-xl px-6 py-3 font-bold text-cni-primary underline" onClick={() => { setForm(emptyProjectSubmission); setReference(""); setState("idle"); }}>{c.labels.submitAnother}</button></div></div> :
      <form onSubmit={submit} noValidate className="space-y-10">
        {section(c.sections.contact, <div className="grid gap-6 md:grid-cols-2">{(["contact_name","email","phone","country"] as const).map((field) => <label key={field}>{label(field)}<input {...fieldProps(field)} type={field === "email" ? "email" : field === "phone" ? "tel" : "text"} maxLength={field === "email" ? 254 : 150} value={form[field]} placeholder={c.placeholders[field]} onChange={(e) => setValue(field, e.target.value)} className={inputClass}/>{errorText(field)}</label>)}</div>)}
        {section(c.sections.company, <div className="grid gap-6 md:grid-cols-2"><label>{label("company_name")}<input {...fieldProps("company_name")} maxLength={200} value={form.company_name} placeholder={c.placeholders.company_name} onChange={(e) => setValue("company_name", e.target.value)} className={inputClass}/>{errorText("company_name")}</label><label>{label("website", true)}<input {...fieldProps("website")} type="url" maxLength={500} value={form.website} placeholder={c.placeholders.website} onChange={(e) => setValue("website", e.target.value)} className={inputClass}/>{errorText("website")}</label></div>)}
        {section(c.sections.project, <div className="grid gap-6 md:grid-cols-2"><label>{label("project_name")}<input {...fieldProps("project_name")} maxLength={200} value={form.project_name} placeholder={c.placeholders.project_name} onChange={(e) => setValue("project_name", e.target.value)} className={inputClass}/>{errorText("project_name")}</label><label>{label("sector")}<select {...fieldProps("sector")} value={form.sector} disabled={sectorsStatus === "error"} onChange={(e) => setValue("sector", e.target.value)} className={inputClass}><option value="">{sectorsStatus === "error" ? c.sectorError : c.placeholders.select}</option>{sectors.map((o) => <option key={o.slug} value={o.slug}>{o.name}</option>)}</select>{errorText("sector")}</label><label className="md:col-span-2">{label("project_description")}<textarea {...fieldProps("project_description")} rows={6} maxLength={5000} value={form.project_description} placeholder={c.placeholders.project_description} onChange={(e) => setValue("project_description", e.target.value)} className={inputClass}/>{errorText("project_description")}</label></div>)}
        {section(c.sections.investment, <div className="grid gap-6 md:grid-cols-2"><label>{label("investment_range")}<select {...fieldProps("investment_range")} value={form.investment_range} onChange={(e) => setValue("investment_range", e.target.value)} className={inputClass}><option value="">{c.placeholders.select}</option>{c.ranges.map((range, i) => <option key={range} value={range}>{c.rangeLabels[i]}</option>)}</select>{errorText("investment_range")}</label><label>{label("estimated_jobs", true)}<input {...fieldProps("estimated_jobs")} type="number" min="0" step="1" value={form.estimated_jobs} placeholder={c.placeholders.estimated_jobs} onChange={(e) => setValue("estimated_jobs", e.target.value)} className={inputClass}/>{errorText("estimated_jobs")}</label></div>)}
        {section(c.sections.location, <div className="grid gap-6 md:grid-cols-2"><label>{label("department")}<select {...fieldProps("department")} value={form.department} disabled={departmentsState !== "ok"} onChange={(e) => void changeDepartment(e.target.value)} className={inputClass}><option value="">{departmentsState === "loading" ? c.loadingDepartments : departmentsState === "error" ? c.geoError : c.placeholders.selectDepartment}</option>{departments.map((o) => <option key={o.slug} value={o.slug}>{o.name}</option>)}</select>{errorText("department")}</label><label>{label("municipality", true)}<select {...fieldProps("municipality")} value={form.municipality} disabled={!form.department || municipalitiesState !== "ok"} onChange={(e) => setValue("municipality", e.target.value)} className={inputClass}><option value="">{!form.department ? c.municipalityDisabled : municipalitiesState === "loading" ? c.loadingMunicipalities : municipalitiesState === "error" ? c.municipalityError : c.placeholders.selectMunicipality}</option>{municipalities.map((o) => <option key={o.slug} value={o.slug}>{o.name}</option>)}</select>{errorText("municipality")}</label></div>)}
        {section(c.sections.consent, <div><label className="flex items-start gap-4"><input {...fieldProps("consent")} type="checkbox" checked={form.consent} onChange={(e) => setValue("consent", e.target.checked)} className="mt-1 h-5 w-5"/><span className="text-sm leading-relaxed">{c.labels.consent} ({c.required})</span></label>{errorText("consent")}<div className="sr-only" aria-hidden><label htmlFor="company_fax">Company fax</label><input id="company_fax" name="company_fax" autoComplete="off" tabIndex={-1} maxLength={0} value={form.company_fax} onChange={(e) => setValue("company_fax", e.target.value)}/></div>{state === "server-error" && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 font-semibold text-red-900">{c.serverError}</p>}<button type="submit" disabled={state === "submitting"} className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-cni-primary px-8 py-4 font-extrabold uppercase tracking-widest text-white disabled:opacity-60">{state === "submitting" ? <Loader2 className="h-5 w-5 animate-spin"/> : <ArrowRight className="h-5 w-5"/>}{state === "submitting" ? c.submitting : c.labels.submit}</button></div>)}
      </form>}</div></section></div>
  </main>;
}
