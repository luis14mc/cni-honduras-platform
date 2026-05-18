import { notFound } from "next/navigation";
import Script from "next/script";
import Image from "next/image";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { designImages } from "@/src/lib/designAssets";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.asesoria);

const copy = {
  es: {
    eyebrow: "Consejo Nacional de Inversiones",
    title: "Asesoría gratuita para su proyecto de inversión",
    description:
      "Canal directo y estrictamente confidencial con los oficiales de inversión del CNI. Sin costo, sin compromiso.",
    benefitsTitle: "¿Qué incluye su asesoría?",
    benefits: [
      { icon: "shield_lock", title: "Confidencialidad absoluta", text: "Cláusula NDA estándar; manejo discrecional de información estratégica." },
      { icon: "groups", title: "Equipo experto", text: "Acceso a oficiales de inversión con experiencia sectorial específica." },
      { icon: "verified", title: "Sin costo", text: "Servicio 100% gratuito como parte de la política de promoción del Estado." },
      { icon: "schedule", title: "Respuesta rápida", text: "Primer contacto en menos de 48 horas hábiles tras su solicitud." },
    ],
    formTitle: "Solicite su asesoría",
    formSubtitle: "Complete el formulario; un oficial le contactará en menos de 48 horas.",
    labelName: "Nombre completo",
    labelCompany: "Empresa / Organización",
    labelCountry: "País de origen",
    labelEmail: "Correo corporativo",
    labelPhone: "Teléfono (con código país)",
    labelSector: "Sector de interés",
    labelSize: "Inversión estimada (USD)",
    labelMessage: "Cuéntenos sobre su proyecto",
    sectors: ["Agroindustria", "Manufactura y Textil", "Turismo Sustentable", "Energía Renovable", "Infraestructura", "BPO / Call Centers", "Otro"],
    sizes: ["< 1M", "1M - 5M", "5M - 25M", "25M - 100M", "> 100M"],
    submit: "Enviar Solicitud Confidencial",
    privacy: "Sus datos son tratados bajo la Ley de Protección de Datos de Honduras y nunca serán compartidos sin su autorización.",
  },
  en: {
    eyebrow: "National Investment Council",
    title: "Free advisory for your investment project",
    description: "Direct and strictly confidential channel with CNI investment officers. No cost, no commitment.",
    benefitsTitle: "What does your advisory include?",
    benefits: [
      { icon: "shield_lock", title: "Strict confidentiality", text: "Standard NDA; discretionary handling of strategic information." },
      { icon: "groups", title: "Expert team", text: "Access to investment officers with sector-specific expertise." },
      { icon: "verified", title: "Zero cost", text: "100% free service as part of the State's promotion policy." },
      { icon: "schedule", title: "Fast response", text: "First contact within 48 business hours of your request." },
    ],
    formTitle: "Request your advisory",
    formSubtitle: "Complete the form; an officer will contact you within 48 hours.",
    labelName: "Full name",
    labelCompany: "Company / Organization",
    labelCountry: "Country of origin",
    labelEmail: "Corporate email",
    labelPhone: "Phone (with country code)",
    labelSector: "Sector of interest",
    labelSize: "Estimated investment (USD)",
    labelMessage: "Tell us about your project",
    sectors: ["Agroindustry", "Manufacturing & Textile", "Sustainable Tourism", "Renewable Energy", "Infrastructure", "BPO / Call Centers", "Other"],
    sizes: ["< 1M", "1M - 5M", "5M - 25M", "25M - 100M", "> 100M"],
    submit: "Send Confidential Request",
    privacy: "Your data is handled under Honduras's Data Protection Law and will never be shared without authorization.",
  },
} as const;

export default async function AsesoriaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = copy[locale];
  const L = (p: string) => resolveHref(locale, p);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: locale === "es" ? "Inicio" : "Home", item: L("/") },
      { "@type": "ListItem", position: 2, name: locale === "es" ? "Asesoría Gratuita" : "Free Advisory", item: L("/asesoria") },
    ],
  };

  return (
    <div className="flex flex-1 flex-col bg-[#f8f9fa]">
      <Script id="breadcrumb-asesoria" type="application/ld+json">
        {JSON.stringify(breadcrumb)}
      </Script>

      <section className="relative -mt-28 flex min-h-[480px] items-center overflow-hidden bg-[#000a1e] pt-28">
        <Image
          src={designImages.porQue.investor}
          alt="Oficial de inversión del CNI reuniéndose con ejecutivos extranjeros en sala institucional"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#000a1e] via-[#000a1e]/85 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-6 py-16 md:px-10">
          <span className="mb-6 inline-flex items-center rounded-sm border border-[#e9c176]/40 bg-[#2e1f00]/30 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[#e9c176] backdrop-blur">
            {c.eyebrow}
          </span>
          <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
            {c.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base font-light leading-relaxed text-white/85 md:text-lg">{c.description}</p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-2xl px-6 py-20 md:px-10">
        <h2 className="text-3xl font-extrabold tracking-tight text-[#000a1e] md:text-4xl">{c.benefitsTitle}</h2>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {c.benefits.map((b) => (
            <article key={b.title} className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#000a1e] text-[#e9c176]">
                <MaterialIcon name={b.icon} className="!text-2xl" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-[#000a1e]">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#44474e]">{b.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-20" id="formulario">
        <div className="mx-auto grid w-full max-w-screen-2xl gap-12 px-6 md:px-10 lg:grid-cols-[1fr_1.4fr]">
          <aside className="space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#000a1e] md:text-4xl">{c.formTitle}</h2>
            <p className="text-base leading-relaxed text-[#44474e]">{c.formSubtitle}</p>
            <p className="rounded-lg bg-[#f8f9fa] p-5 text-xs leading-relaxed text-[#44474e] ring-1 ring-black/5">
              <MaterialIcon name="lock" className="!text-base align-middle text-[#3a5f94]" /> {c.privacy}
            </p>
          </aside>
          <form
            className="grid grid-cols-1 gap-5 rounded-2xl bg-[#f8f9fa] p-8 ring-1 ring-black/5 md:grid-cols-2"
            aria-label={c.formTitle}
          >
            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#000a1e]">{c.labelName}</span>
              <input type="text" required className="rounded-md border border-black/10 bg-white px-4 py-3 text-sm focus:border-[#000a1e] focus:outline-none focus:ring-2 focus:ring-[#e9c176]/40" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#000a1e]">{c.labelCompany}</span>
              <input type="text" required className="rounded-md border border-black/10 bg-white px-4 py-3 text-sm focus:border-[#000a1e] focus:outline-none focus:ring-2 focus:ring-[#e9c176]/40" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#000a1e]">{c.labelCountry}</span>
              <input type="text" required className="rounded-md border border-black/10 bg-white px-4 py-3 text-sm focus:border-[#000a1e] focus:outline-none focus:ring-2 focus:ring-[#e9c176]/40" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#000a1e]">{c.labelEmail}</span>
              <input type="email" required className="rounded-md border border-black/10 bg-white px-4 py-3 text-sm focus:border-[#000a1e] focus:outline-none focus:ring-2 focus:ring-[#e9c176]/40" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#000a1e]">{c.labelPhone}</span>
              <input type="tel" className="rounded-md border border-black/10 bg-white px-4 py-3 text-sm focus:border-[#000a1e] focus:outline-none focus:ring-2 focus:ring-[#e9c176]/40" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#000a1e]">{c.labelSector}</span>
              <select required className="rounded-md border border-black/10 bg-white px-4 py-3 text-sm focus:border-[#000a1e] focus:outline-none focus:ring-2 focus:ring-[#e9c176]/40">
                <option value="">—</option>
                {c.sectors.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#000a1e]">{c.labelSize}</span>
              <select className="rounded-md border border-black/10 bg-white px-4 py-3 text-sm focus:border-[#000a1e] focus:outline-none focus:ring-2 focus:ring-[#e9c176]/40">
                <option value="">—</option>
                {c.sizes.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#000a1e]">{c.labelMessage}</span>
              <textarea rows={5} className="rounded-md border border-black/10 bg-white px-4 py-3 text-sm focus:border-[#000a1e] focus:outline-none focus:ring-2 focus:ring-[#e9c176]/40" />
            </label>
            <button
              type="submit"
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-[#000a1e] px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#e9c176] transition hover:bg-[#3a5f94] md:col-span-2"
            >
              {c.submit}
              <MaterialIcon name="arrow_forward" className="!text-base" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
