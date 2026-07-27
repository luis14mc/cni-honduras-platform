import { notFound } from "next/navigation";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { PageHero } from "@/src/components/cni/PageHero";
import { Section, SectionHeader } from "@/src/components/cni/Section";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { asesoriaPageCopy } from "@/src/i18n/copy/asesoriaPage";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.contacto);

export default async function AsesoriaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const c = asesoriaPageCopy[raw as Locale];

  return (
    <div className="flex flex-1 flex-col bg-[#f8f9ff]">
      <div className="-mt-28">
        <PageHero
          eyebrow={c.heroEyebrow}
          title={c.heroTitle}
          description={c.heroDescription}
          heightClass="min-h-[420px] md:min-h-[460px]"
        />
      </div>

      <Section tone="surface">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeader eyebrow={c.formEyebrow} title={c.formTitle} description={c.formDescription} />
            <form action="#" method="post" className="space-y-6 rounded-xl bg-white p-8 tonal-depth-layering md:p-10">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Field id="nombre" label={c.labels.name} required />
                <Field id="empresa" label={c.labels.org} />
                <Field id="correo" label={c.labels.email} type="email" required />
                <Field id="telefono" label={c.labels.phone} type="tel" />
              </div>
              <div>
                <label htmlFor="sector" className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#0E7A7C]">
                  {c.sectorInterest}
                </label>
                <select
                  id="sector"
                  name="sector"
                  className="w-full rounded-md border border-[#dce9ff]/40 bg-[#eff4ff] px-4 py-3 text-sm text-[#252A58] focus:border-[#0E7A7C] focus:outline-none focus:ring-2 focus:ring-[#0E7A7C]/30"
                >
                  {c.sectors.map((s) => (
                    <option key={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="mensaje" className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#0E7A7C]">
                  {c.labels.message}
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows={5}
                  required
                  placeholder={c.messagePlaceholder}
                  className="w-full rounded-md border border-[#dce9ff]/40 bg-[#eff4ff] px-4 py-3 text-sm text-[#252A58] focus:border-[#0E7A7C] focus:outline-none focus:ring-2 focus:ring-[#0E7A7C]/30"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-br from-[#0E7A7C] to-[#24436B] px-10 py-4 text-xs font-bold uppercase tracking-widest text-white transition hover:brightness-110"
              >
                {c.submit}
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          <aside className="space-y-6 lg:col-span-5">
            <div className="rounded-xl bg-[#252A58] p-8 text-white">
              <h3 className="text-xl font-bold">{c.hqTitle}</h3>
              <ul className="mt-6 space-y-4 text-sm text-white/80">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-[#35A963]" />
                  Centro Cívico Gubernamental (CCG), Torre 1, Piso 12. Tegucigalpa, Honduras.
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 text-[#35A963]" />
                  (504) 2242-8955
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-[#35A963]" />
                  <a className="hover:underline" href="mailto:info@cni.hn">
                    info@cni.hn
                  </a>
                </li>
              </ul>
            </div>
            <div className="rounded-xl border-l-4 border-[#35A963] bg-white p-8 tonal-depth-layering">
              <h3 className="text-lg font-bold text-[#252A58]">{c.spsTitle}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#0E7A7C]">{c.spsBody}</p>
              <p className="mt-4 text-sm text-[#0E7A7C]">
                <a className="font-bold text-[#0E7A7C] hover:underline" href="mailto:oficinasps@cni.hn">
                  oficinasps@cni.hn
                </a>
                <br />
                (504) 2561-6100 ext. 109
              </p>
            </div>
          </aside>
        </div>
      </Section>
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  required = false,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#0E7A7C]">
        {label}
        {required && <span className="ml-1 text-[#0E7A7C]">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        className="w-full rounded-md border border-[#dce9ff]/40 bg-[#eff4ff] px-4 py-3 text-sm text-[#252A58] focus:border-[#0E7A7C] focus:outline-none focus:ring-2 focus:ring-[#0E7A7C]/30"
      />
    </div>
  );
}
