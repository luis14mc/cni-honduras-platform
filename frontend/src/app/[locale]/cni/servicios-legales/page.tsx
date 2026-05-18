import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { designImages } from "@/src/lib/designAssets";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["cni-servicios-legales"]);

const copy = {
  es: {
    eyebrow: "Asesoría Estratégica",
    title: "Servicios Legales",
    description:
      "Acompañamos a los inversionistas a través de la Ruta de Inversión con un marco legal sólido y transparente para el desarrollo de proyectos en Honduras.",
    introTitle: "Orientación Continua para la Seguridad Jurídica",
    intro1:
      "El Consejo Nacional de Inversiones (CNI) proporciona una gama completa de servicios legales diseñados para apoyar a los inversionistas en cada fase de su establecimiento. Nuestro objetivo es ofrecer asesoría continua y orientada para facilitar el desarrollo exitoso de proyectos de inversión.",
    intro2:
      "Brindamos apoyo legal integral y asistencia técnica en trámites administrativos para garantizar que su capital opere bajo los más altos estándares de protección institucional.",
    portfolioTitle: "Portafolio de Servicios Legales",
    portfolioWatermark: "CNI PORTFOLIO",
    services: [
      { icon: "business_center", title: "Constitución de Empresas", text: "Instruimos el proceso completo para la formación legal de sociedades en Honduras, asegurando que su estructura corporativa sea óptima para el inicio de operaciones.", action: "Saber más", variant: "wide-light" },
      { icon: "gavel", title: "Marco Legal Vigente", text: "Esclarecimiento de dudas sobre la normativa nacional y beneficios fiscales específicos según su rubro industrial.", action: "Asesoría Especializada", variant: "dark" },
      { icon: "timeline", title: "Instalación y Desarrollo", text: "Acompañamiento en las etapas de pre-inversión, inversión y post-inversión para asegurar el cumplimiento de metas operativas.", variant: "highest" },
      { icon: "troubleshoot", title: "Solución de Obstáculos", text: "Identificamos y resolvemos barreras en la tramitología administrativa mediante colaboración legal e institucional directa.", variant: "tertiary" },
    ],
    lppiTitle: "Beneficios de la Ley LPPI",
    lppiSub: "Ley para la Promoción y Protección de Inversiones (Decreto 51-2011). Mecanismos diseñados para la facilitación y seguridad jurídica.",
    mechanisms: [
      { n: "01", title: "Gestión de Beneficios Fiscales", text: "Régimen de gastos preoperativos y depreciación acelerada para nuevos proyectos en regiones de interés prioritario. Optimización de la carga tributaria para acelerar el retorno de inversión.", cta: "Descargar Formulario de Solicitud" },
      { n: "02", title: "Proyectos de Interés Nacional (Fast Track)", text: "Declaratoria mediante Consejo de Ministros que habilita un Certificado de Incorporación y Viabilidad. Este mecanismo consolida todos los permisos requeridos, permitiendo el inicio inmediato de operaciones sin trámites adicionales.", cta: "" },
      { n: "03", title: "Régimen Preventivo de Conflictos", text: "Protección preventiva sobre bienes inmuebles destinados a la inversión, garantizando que los derechos de propiedad se mantengan íntegros frente a reclamaciones externas sin posesión.", cta: "" },
      { n: "04", title: "Garantía para Bienes en Litigio", text: "El Estado garantiza la conclusión de proyectos de inversión realizados sobre inmuebles en litigio, brindando continuidad operativa y seguridad al inversionista ante procesos reivindicatorios.", cta: "" },
    ],
    docsTitle: "Acceda a la Documentación Técnica y Legal",
    docsDesc:
      "Descargue nuestra guía oficial de beneficios legales o consulte el Compendio de Leyes 2024 actualizado para una visión completa del ecosistema hondureño.",
    docsPrimary: "Guía Oficial LPPI",
    docsSecondary: "Compendio de Leyes 2024",
    zonesTitle: "Regímenes de Zonas Especiales",
    zonesSub: "Incentivos estratégicos para fortalecer la competitividad exportadora y la generación de empleo.",
    zoli: {
      title: "Zonas Libres",
      text: "Facilidades a la industria, comercio y servicios mediante exoneraciones fiscales totales de ISV, Impuesto sobre la Renta y tributos municipales.",
      items: ["Reexportación libre de impuestos", "Exoneración total de Impuesto sobre la Renta", "Crédito fiscal por costos de instalación"],
      cta: "Ver Requisitos de Inscripción",
    },
    rit: {
      title: "Importación Temporal",
      text: "Mecanismo diseñado para fomentar exportaciones permitiendo el ingreso de materias primas y maquinaria con suspensión de derechos aduaneros.",
      items: ["Suspensión de derechos aduaneros y consulares", "Exoneración ISR por 10 años en exportación", "Aplicable a insumos y muestras de producción"],
      cta: "Ver Requisitos de Inscripción",
    },
    ctaTitle: "Acelera tu proceso de inversión",
    ctaSub: "Nuestro equipo legal está listo para brindarle asistencia personalizada y gratuita para garantizar el éxito de su proyecto.",
    ctaButton: "Contactar al CNI para asistencia gratuita",
  },
  en: {
    eyebrow: "Strategic Advisory",
    title: "Legal Services",
    description:
      "We accompany investors throughout the Investment Route with a solid and transparent legal framework for the development of projects in Honduras.",
    introTitle: "Continuous Guidance for Legal Security",
    intro1:
      "The National Investment Council (CNI) provides a full range of legal services designed to support investors in each phase of their establishment. Our goal is to offer continuous, focused advice to facilitate the successful development of investment projects.",
    intro2:
      "We provide comprehensive legal support and technical assistance in administrative procedures to ensure that your capital operates under the highest standards of institutional protection.",
    portfolioTitle: "Legal Services Portfolio",
    portfolioWatermark: "CNI PORTFOLIO",
    services: [
      { icon: "business_center", title: "Company Incorporation", text: "We guide the complete process for the legal formation of companies in Honduras, ensuring that your corporate structure is optimal for starting operations.", action: "Learn more", variant: "wide-light" },
      { icon: "gavel", title: "Current Legal Framework", text: "Clarification on national regulations and specific tax benefits according to your industrial sector.", action: "Specialized Advisory", variant: "dark" },
      { icon: "timeline", title: "Installation and Development", text: "Accompaniment in the pre-investment, investment and post-investment stages to ensure compliance with operational goals.", variant: "highest" },
      { icon: "troubleshoot", title: "Obstacle Resolution", text: "We identify and resolve barriers in administrative procedures through direct legal and institutional collaboration.", variant: "tertiary" },
    ],
    lppiTitle: "LPPI Law Benefits",
    lppiSub: "Investment Promotion and Protection Law (Decree 51-2011). Mechanisms designed for facilitation and legal security.",
    mechanisms: [
      { n: "01", title: "Tax Benefits Management", text: "Pre-operational expense regime and accelerated depreciation for new projects in priority interest regions. Tax burden optimization to accelerate return on investment.", cta: "Download Application Form" },
      { n: "02", title: "National Interest Projects (Fast Track)", text: "Declaration through the Council of Ministers that enables an Incorporation and Viability Certificate. This mechanism consolidates all required permits, allowing immediate start of operations without additional procedures.", cta: "" },
      { n: "03", title: "Preventive Conflict Regime", text: "Preventive protection over real estate intended for investment, ensuring that property rights remain intact against external claims without possession.", cta: "" },
      { n: "04", title: "Guarantee for Litigious Properties", text: "The State guarantees the conclusion of investment projects carried out on properties in litigation, providing operational continuity and security to the investor against vindication processes.", cta: "" },
    ],
    docsTitle: "Access Technical and Legal Documentation",
    docsDesc: "Download our official legal benefits guide or consult the updated 2024 Laws Compendium for a complete view of the Honduran ecosystem.",
    docsPrimary: "Official LPPI Guide",
    docsSecondary: "2024 Laws Compendium",
    zonesTitle: "Special Zone Regimes",
    zonesSub: "Strategic incentives to strengthen export competitiveness and job creation.",
    zoli: {
      title: "Free Zones",
      text: "Facilities for industry, commerce and services through total tax exemptions of ISV, Income Tax and municipal taxes.",
      items: ["Tax-free re-exportation", "Total Income Tax exemption", "Tax credit for installation costs"],
      cta: "View Registration Requirements",
    },
    rit: {
      title: "Temporary Import",
      text: "Mechanism designed to encourage exports by allowing the entry of raw materials and machinery with suspension of customs duties.",
      items: ["Suspension of customs and consular duties", "10-year Income Tax exemption on exports", "Applicable to inputs and production samples"],
      cta: "View Registration Requirements",
    },
    ctaTitle: "Accelerate your investment process",
    ctaSub: "Our legal team is ready to provide you with personalized and free assistance to ensure the success of your project.",
    ctaButton: "Contact the CNI for free assistance",
  },
} as const;

export default async function ServiciosLegalesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = copy[locale];
  const L = (p: string) => resolveHref(locale, p);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <section className="relative flex h-[819px] items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src={designImages.servicios.legal} alt="Legal" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 sovereign-gradient opacity-80" />
        </div>
        <div className="container relative z-10 mx-auto px-8">
          <div className="max-w-4xl">
            <span className="mb-4 block text-sm uppercase tracking-widest text-[#e9c176]">{c.eyebrow}</span>
            <h1 className="mb-6 text-6xl font-extrabold leading-tight tracking-tighter text-white md:text-8xl">{c.title}</h1>
            <p className="max-w-2xl text-xl font-light leading-relaxed text-[#708ab5] md:text-2xl">{c.description}</p>
          </div>
        </div>
      </section>

      <section className="bg-[#f8f9fa] py-24">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-12">
            <div className="md:col-span-7">
              <h2 className="mb-8 text-4xl font-bold tracking-tight text-[#000a1e]">{c.introTitle}</h2>
              <p className="mb-6 text-lg leading-relaxed text-[#44474e]">{c.intro1}</p>
              <p className="text-lg leading-relaxed text-[#44474e]">{c.intro2}</p>
            </div>
            <div className="flex justify-end md:col-span-5">
              <div className="group relative h-80 w-full overflow-hidden rounded-xl bg-[#e7e8e9] shadow-2xl">
                <Image src={designImages.servicios.legalHandshake} alt="Handshake" fill sizes="(min-width:768px) 40vw, 100vw" className="object-cover grayscale transition-all duration-700 hover:grayscale-0" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f3f4f5] py-24">
        <div className="container mx-auto px-8">
          <div className="mb-16 flex items-end justify-between">
            <h2 className="text-4xl font-bold tracking-tight text-[#000a1e]">{c.portfolioTitle}</h2>
            <span className="select-none text-7xl font-bold text-[#000a1e] opacity-5">{c.portfolioWatermark}</span>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {c.services.map((s) => {
              const base = "flex flex-col justify-between rounded-xl p-10 transition-all hover:-translate-y-1";
              if (s.variant === "wide-light") {
                return (
                  <div key={s.title} className={`${base} bg-white md:col-span-2`}>
                    <div>
                      <MaterialIcon name={s.icon} filled className="mb-6 block text-4xl text-[#e9c176]" />
                      <h3 className="mb-4 text-2xl font-bold text-[#000a1e]">{s.title}</h3>
                      <p className="max-w-xl text-lg leading-relaxed text-[#44474e]">{s.text}</p>
                    </div>
                    <div className="group mt-8 flex cursor-pointer items-center gap-2 font-semibold text-[#3a5f94]">
                      <span>{s.action}</span>
                      <MaterialIcon name="arrow_forward" className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                );
              }
              if (s.variant === "dark") {
                return (
                  <div key={s.title} className={`${base} bg-[#000a1e] text-white`}>
                    <div>
                      <MaterialIcon name={s.icon} className="mb-6 block text-4xl text-[#e9c176]" />
                      <h3 className="mb-4 text-2xl font-bold">{s.title}</h3>
                      <p className="leading-relaxed text-[#708ab5]">{s.text}</p>
                    </div>
                    <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                      <span className="text-sm opacity-60">{s.action}</span>
                      <MaterialIcon name="verified" className="opacity-60" />
                    </div>
                  </div>
                );
              }
              if (s.variant === "highest") {
                return (
                  <div key={s.title} className={`${base} bg-[#e1e3e4]`}>
                    <div>
                      <MaterialIcon name={s.icon} className="mb-6 block text-4xl text-[#3a5f94]" />
                      <h3 className="mb-4 text-2xl font-bold text-[#000a1e]">{s.title}</h3>
                      <p className="leading-relaxed text-[#44474e]">{s.text}</p>
                    </div>
                  </div>
                );
              }
              return (
                <div key={s.title} className={`${base} bg-[#2e1f00] text-[#5d4201] md:col-span-2 md:flex-row md:gap-8 md:items-center`}>
                  <div className="flex-1">
                    <MaterialIcon name={s.icon} className="mb-6 block text-4xl text-[#e9c176]" />
                    <h3 className="mb-4 text-2xl font-bold text-[#e9c176]">{s.title}</h3>
                    <p className="text-lg leading-relaxed text-white opacity-80">{s.text}</p>
                  </div>
                  <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-black/20 md:w-1/3">
                    <MaterialIcon name="support_agent" className="text-5xl text-white opacity-40" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="container mx-auto px-8">
          <div className="mb-20 max-w-3xl">
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-[#000a1e]">{c.lppiTitle}</h2>
            <p className="text-xl text-[#44474e]">{c.lppiSub}</p>
          </div>
          <div className="space-y-12">
            {c.mechanisms.map((m) => (
              <div key={m.n} className="flex flex-col items-start gap-12 border-b border-[#e7e8e9] py-12 last:border-none md:flex-row">
                <div className="flex-shrink-0">
                  <span className="text-6xl font-extrabold text-[#e9c176] opacity-40">{m.n}</span>
                </div>
                <div className="flex-grow">
                  <h3 className="mb-4 text-2xl font-bold text-[#000a1e]">{m.title}</h3>
                  <p className="mb-6 max-w-4xl text-lg leading-relaxed text-[#44474e]">{m.text}</p>
                  {m.cta && (
                    <button type="button" className="flex items-center gap-2 font-bold text-[#000a1e] transition-all hover:gap-4">
                      <MaterialIcon name="qr_code_2" />
                      <span>{m.cta}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#000a1e] py-24 text-white">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
            <div>
              <h2 className="mb-8 text-4xl font-bold leading-tight">{c.docsTitle}</h2>
              <p className="mb-10 text-xl font-light text-[#708ab5]">{c.docsDesc}</p>
              <div className="flex flex-col gap-6 sm:flex-row">
                <a href="#" className="inline-flex items-center justify-center gap-3 rounded-md bg-[#e9c176] px-8 py-4 font-bold text-[#000a1e] transition-all hover:bg-white">
                  <MaterialIcon name="download" />
                  {c.docsPrimary}
                </a>
                <a href="#" className="inline-flex items-center justify-center gap-3 rounded-md bg-white/10 px-8 py-4 font-bold text-white transition-all hover:bg-white/20">
                  <MaterialIcon name="menu_book" />
                  {c.docsSecondary}
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-[#e9c176]/10 blur-3xl" />
              <Image src={designImages.servicios.legalDocs} alt="Legal Docs" width={700} height={500} className="relative z-10 rounded-xl shadow-2xl" unoptimized />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f8f9fa] py-24">
        <div className="container mx-auto px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-4xl font-bold text-[#000a1e]">{c.zonesTitle}</h2>
            <p className="text-[#44474e]">{c.zonesSub}</p>
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {[
              { tag: "ZOLI", bg: "bg-[#000a1e]", icon: "factory", data: c.zoli },
              { tag: "RIT", bg: "bg-[#3a5f94]", icon: "inventory_2", data: c.rit },
            ].map((z) => (
              <div key={z.tag} className="overflow-hidden rounded-2xl bg-[#f3f4f5] shadow-sm transition-shadow duration-500 hover:shadow-xl">
                <div className="p-12">
                  <div className="mb-8 flex items-start justify-between">
                    <span className={`rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest text-white ${z.bg}`}>{z.tag}</span>
                    <MaterialIcon name={z.icon} className="text-4xl text-[#e9c176]" />
                  </div>
                  <h3 className="mb-6 text-3xl font-bold text-[#000a1e]">{z.data.title}</h3>
                  <p className="mb-8 leading-relaxed text-[#44474e]">{z.data.text}</p>
                  <ul className="mb-10 space-y-4">
                    {z.data.items.map((it) => (
                      <li key={it} className="flex gap-3 text-[#191c1d]">
                        <MaterialIcon name="check_circle" className="text-sm text-[#3a5f94]" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={L("/tramites")}
                    className="block w-full rounded-md border border-[#c4c6cf] py-4 text-center font-bold text-[#000a1e] transition-all hover:bg-[#000a1e] hover:text-white"
                  >
                    {z.data.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-32">
        <div className="absolute inset-0 sovereign-gradient" />
        <div className="container relative z-10 mx-auto px-8 text-center">
          <h2 className="mb-8 text-5xl font-extrabold tracking-tighter text-white md:text-6xl">{c.ctaTitle}</h2>
          <p className="mx-auto mb-12 max-w-2xl text-xl font-light text-[#708ab5] md:text-2xl">{c.ctaSub}</p>
          <Link
            href={L("/contacto")}
            className="rounded-md bg-[#e9c176] px-10 py-5 text-lg font-bold text-[#000a1e] transition-transform duration-300 hover:scale-105"
          >
            {c.ctaButton}
          </Link>
        </div>
      </section>
    </div>
  );
}
