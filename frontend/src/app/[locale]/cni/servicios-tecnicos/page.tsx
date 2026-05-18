import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { designImages } from "@/src/lib/designAssets";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["cni-servicios-tecnicos"]);

const copy = {
  es: {
    eyebrow: "Excelencia en Gestión",
    title: "Servicios Técnicos",
    description:
      "Brindamos un apoyo integral en el ciclo de vida de sus proyectos. Facilitamos el establecimiento y éxito de su inversión en Honduras mediante asesoría estratégica de alto nivel.",
    ctaHero: "Comenzar Asesoría",
    portfolioTitle: "Portafolio de Servicios",
    services: {
      perfil: {
        title: "Perfil del Proyecto",
        text: "Apoyo en la estructuración y desarrollo de perfiles de los proyectos de inversión, definiendo objetivos, alcances y necesidades técnicas fundamentales.",
        cta: "Recibir Asesoría Gratuita",
      },
      financiera: {
        title: "Asesoría Económica-Financiera",
        text: "Análisis financieros detallados para evaluar rentabilidad, considerando incentivos fiscales y beneficios soberanos.",
        cta: "Consultar",
      },
      tramites: {
        title: "Asesoría en Trámites y Regulaciones",
        text: "Orientación técnica experta sobre la normativa nacional y procesos administrativos requeridos.",
        cta: "Ver más",
      },
      promocion: {
        title: "Promoción de Proyectos",
        text: "Incorporación estratégica en nuestro portafolio global para captación de capital nacional y extranjero.",
        cta: "Solicitar",
      },
      red: {
        title: "Red de Contactos",
        text: "Acceso privilegiado a stakeholders del sector y acompañamiento especializado en networking.",
        cta: "Conectar",
      },
    },
    pdfBadge: "Guía Oficial",
    pdfSize: "PDF · 4.2 MB",
    downloadTitle: "Descarga la Guía Oficial",
    downloadDesc:
      "Obtenga todos los detalles técnicos y operativos sobre nuestros servicios de asistencia técnica en un documento diseñado para facilitar su toma de decisiones.",
    downloadButton: "Click para descargar",
    ctaTitle: "Acelera tu proceso de inversión en Honduras",
    ctaText: "Nuestro equipo de especialistas está listo para transformar sus objetivos en realidades tangibles. El momento de invertir es ahora.",
    ctaButton: "Contactar al CNI",
    ctaFootnote: "Asistencia Gratuita 24/7",
  },
  en: {
    eyebrow: "Management Excellence",
    title: "Technical Services",
    description:
      "We provide comprehensive support across your project's life cycle. We facilitate the establishment and success of your investment in Honduras through high-level strategic advisory.",
    ctaHero: "Begin Advisory",
    portfolioTitle: "Services Portfolio",
    services: {
      perfil: {
        title: "Project Profile",
        text: "Support in structuring and developing investment project profiles, defining objectives, scopes and fundamental technical needs.",
        cta: "Receive Free Advisory",
      },
      financiera: {
        title: "Economic-Financial Advisory",
        text: "Detailed financial analysis to assess profitability, considering tax incentives and sovereign benefits.",
        cta: "Consult",
      },
      tramites: {
        title: "Procedures and Regulations Advisory",
        text: "Expert technical guidance on national regulations and required administrative processes.",
        cta: "See more",
      },
      promocion: {
        title: "Project Promotion",
        text: "Strategic incorporation into our global portfolio for raising national and foreign capital.",
        cta: "Request",
      },
      red: {
        title: "Contact Network",
        text: "Privileged access to sector stakeholders and specialized networking accompaniment.",
        cta: "Connect",
      },
    },
    pdfBadge: "Official Guide",
    pdfSize: "PDF · 4.2 MB",
    downloadTitle: "Download the Official Guide",
    downloadDesc:
      "Obtain all the technical and operational details about our technical assistance services in a document designed to facilitate your decision-making.",
    downloadButton: "Click to download",
    ctaTitle: "Accelerate your investment process in Honduras",
    ctaText: "Our team of specialists is ready to transform your objectives into tangible realities. The time to invest is now.",
    ctaButton: "Contact the CNI",
    ctaFootnote: "Free 24/7 Assistance",
  },
} as const;

export default async function ServiciosTecnicosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = copy[locale];
  const L = (p: string) => resolveHref(locale, p);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <section className="relative flex min-h-[70vh] items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src={designImages.servicios.technical} alt="Technical" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[#000a1e]/70" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-8 py-24">
          <div className="max-w-2xl">
            <span className="mb-6 inline-block rounded-sm bg-[#2e1f00] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#e9c176]">
              {c.eyebrow}
            </span>
            <h1 className="mb-8 text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">{c.title}</h1>
            <p className="mb-10 text-xl leading-relaxed text-[#e1e3e4]/90">{c.description}</p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={L("/contacto")}
                className="flex items-center gap-2 rounded-md bg-[#ffdea5] px-8 py-4 font-bold text-[#2e1f00] transition-colors hover:bg-[#e9c176] active:scale-95"
              >
                {c.ctaHero}
                <MaterialIcon name="arrow_forward" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 py-32">
        <div className="mb-16">
          <h2 className="mb-4 text-4xl font-bold text-[#000a1e]">{c.portfolioTitle}</h2>
          <div className="h-1 w-20 bg-[#e9c176]" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="group relative col-span-1 overflow-hidden rounded-xl bg-white p-10 transition-all hover:bg-[#f3f4f5] md:col-span-8">
            <div className="relative z-10">
              <MaterialIcon name="account_tree" filled className="mb-6 block text-4xl text-[#3a5f94]" />
              <h3 className="mb-4 text-2xl font-bold text-[#000a1e]">{c.services.perfil.title}</h3>
              <p className="mb-8 max-w-md leading-relaxed text-[#44474e]">{c.services.perfil.text}</p>
              <Link href={L("/contacto")} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3a5f94] group-hover:text-[#000a1e]">
                {c.services.perfil.cta}
                <MaterialIcon name="north_east" className="text-sm" />
              </Link>
            </div>
            <div className="absolute bottom-0 right-0 opacity-10 transition-opacity group-hover:opacity-20">
              <MaterialIcon name="description" className="text-[12rem]" weight={100} />
            </div>
          </div>

          <div className="col-span-1 flex flex-col justify-between rounded-xl border-b-4 border-[#e9c176] bg-[#002147] p-10 text-[#708ab5] md:col-span-4">
            <div>
              <MaterialIcon name="payments" className="mb-6 block text-4xl text-[#e9c176]" />
              <h3 className="mb-4 text-2xl font-bold text-white">{c.services.financiera.title}</h3>
              <p className="text-sm leading-relaxed opacity-90">{c.services.financiera.text}</p>
            </div>
            <Link href={L("/contacto")} className="mt-8 flex items-center gap-2 font-bold text-[#e9c176] transition-transform hover:translate-x-2">
              {c.services.financiera.cta}
              <MaterialIcon name="trending_up" />
            </Link>
          </div>

          <div className="col-span-1 flex flex-col justify-between rounded-xl bg-[#e7e8e9] p-10 md:col-span-4">
            <div>
              <MaterialIcon name="gavel" className="mb-6 block text-4xl text-[#000a1e]" />
              <h3 className="mb-4 text-xl font-bold text-[#000a1e]">{c.services.tramites.title}</h3>
              <p className="text-sm text-[#44474e]">{c.services.tramites.text}</p>
            </div>
            <Link href={L("/tramites")} className="mt-8 w-fit border-b border-[#000a1e] text-xs font-bold uppercase text-[#000a1e]">
              {c.services.tramites.cta}
            </Link>
          </div>

          <div className="group col-span-1 flex flex-col justify-between rounded-xl bg-white p-10 md:col-span-4">
            <div>
              <MaterialIcon name="campaign" className="mb-6 block text-4xl text-[#3a5f94] transition-transform group-hover:scale-110" />
              <h3 className="mb-4 text-xl font-bold text-[#000a1e]">{c.services.promocion.title}</h3>
              <p className="text-sm text-[#44474e]">{c.services.promocion.text}</p>
            </div>
            <Link href={L("/portafolio")} className="mt-8 flex items-center gap-2 font-bold text-[#3a5f94]">
              {c.services.promocion.cta}
            </Link>
          </div>

          <div className="group col-span-1 flex flex-col justify-between rounded-xl bg-white p-10 md:col-span-4">
            <div>
              <MaterialIcon name="hub" className="mb-6 block text-4xl text-[#3a5f94] transition-transform group-hover:scale-110" />
              <h3 className="mb-4 text-xl font-bold text-[#000a1e]">{c.services.red.title}</h3>
              <p className="text-sm text-[#44474e]">{c.services.red.text}</p>
            </div>
            <Link href={L("/contacto")} className="mt-8 flex items-center gap-2 font-bold text-[#3a5f94]">
              {c.services.red.cta}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-[#c4c6cf]/10 bg-[#f3f4f5] py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-8 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <Image src={designImages.servicios.technicalDoc} alt="Recursos técnicos" width={800} height={400} className="h-[400px] w-full object-cover" unoptimized />
            <div className="absolute inset-0 flex items-center justify-center bg-[#000a1e]/20">
              <div className="flex items-center gap-4 rounded-xl bg-white/90 p-6 shadow-xl backdrop-blur-md">
                <MaterialIcon name="picture_as_pdf" className="text-4xl text-[#000a1e]" />
                <div>
                  <p className="font-bold text-[#000a1e]">{c.pdfBadge}</p>
                  <p className="text-xs text-[#44474e]">{c.pdfSize}</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="mb-6 text-3xl font-bold text-[#000a1e]">{c.downloadTitle}</h2>
            <p className="mb-8 text-lg leading-relaxed text-[#44474e]">{c.downloadDesc}</p>
            <a href="#" className="inline-flex items-center gap-4 rounded-md bg-[#000a1e] px-10 py-5 font-bold text-white shadow-xl shadow-[#000a1e]/10 transition-all hover:bg-[#002147]">
              {c.downloadButton}
              <MaterialIcon name="download" />
            </a>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-32">
        <div className="absolute right-0 top-0 hidden h-full w-1/2 translate-x-32 -skew-x-12 bg-[#e7e8e9] lg:block" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col justify-between gap-12 px-8 lg:flex-row lg:items-center">
          <div className="lg:w-1/2">
            <h2 className="mb-6 text-4xl font-bold leading-tight text-[#000a1e] md:text-5xl">{c.ctaTitle}</h2>
            <p className="text-xl text-[#44474e]">{c.ctaText}</p>
          </div>
          <div className="flex flex-col gap-4">
            <Link
              href={L("/contacto")}
              className="rounded-md bg-gradient-to-r from-[#2e1f00] to-[#002147] px-12 py-6 text-center text-lg font-extrabold text-white shadow-2xl transition-transform hover:scale-105"
            >
              {c.ctaButton}
            </Link>
            <p className="text-center text-xs font-bold uppercase tracking-widest text-[#44474e] opacity-70">{c.ctaFootnote}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
