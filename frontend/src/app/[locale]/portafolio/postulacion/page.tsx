import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { designImages } from "@/src/lib/designAssets";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["portafolio-postulacion"]);

const copy = {
  es: {
    eyebrow: "Portal de Inversión Soberana",
    title: "¿TIENES UN PROYECTO DE INVERSIÓN?",
    description:
      "Un proyecto de inversión es una iniciativa lista para desarrollarse, que ya cuenta con estudios técnicos, financieros y de mercado, y que permite conocer con claridad el retorno y los beneficios estratégicos.",
    primaryCta: "Postula tu proyecto",
    secondaryCta: "Descargar guía técnica",
    valueTitle: "¿Por qué postular tu proyecto en el CNI?",
    valueSub: "El Consejo Nacional de Inversiones brinda acompañamiento gratuito y confidencial a inversionistas nacionales e internacionales para facilitar la promoción de proyectos estratégicos.",
    benefits: [
      { icon: "handshake", title: "Acompañamiento integral", text: "Asesoría técnica personalizada durante todo el proceso de estructuración y ejecución." },
      { icon: "enhanced_encryption", title: "Confidencialidad", text: "Protegemos la información de su proyecto con los más altos estándares institucionales." },
      { icon: "hub", title: "Conexión con aliados", text: "Facilitamos el acercamiento con potenciales aliados financieros y estratégicos." },
      { icon: "monitoring", title: "Seguimiento técnico", text: "Monitoreo continuo para asegurar el avance y resolución de cuellos de botella." },
    ],
    formTitle: "Postulación Técnica de Proyecto",
    formSub: "Complete el siguiente formulario estructurado para que un ejecutivo senior del CNI pueda evaluar su iniciativa y contactarle.",
    investorSection: "Datos del Inversionista",
    projectSection: "Detalles Técnicos del Proyecto",
    labels: {
      fullName: "Nombre Completo *",
      company: "Nombre de Empresa *",
      role: "Cargo *",
      email: "Correo Electrónico *",
      website: "Sitio Web",
      country: "País de Origen *",
      projectName: "Nombre del Proyecto *",
      sector: "Sector Estratégico *",
      presence: "¿Tiene presencia en Honduras? *",
      type: "Tipo de Proyecto *",
      amount: "Monto de Inversión (USD) *",
      description: "Descripción Corta del Proyecto *",
      feasibility: "¿Tiene estudios de factibilidad? *",
      stage: "Etapa del Proyecto *",
    },
    placeholders: {
      fullName: "Ej. Juan Pérez",
      company: "Corporación S.A.",
      role: "Director Ejecutivo / CEO",
      email: "contacto@empresa.com",
      website: "https://www.empresa.com",
      country: "Seleccione país",
      projectName: "Título formal de la iniciativa",
      description: "Resumen ejecutivo del alcance y objetivos...",
    },
    sectorOptions: ["Energía", "Infraestructura", "Agroindustria", "Manufactura", "Turismo y Hospitalidad", "Logística y Transporte", "Otros"],
    presenceOptions: ["Sí", "No", "En evaluación"],
    typeOptions: ["Nuevo proyecto (Greenfield)", "Expansión (Brownfield)"],
    amountOptions: ["Menos de 10 millones", "De 10 a 50 millones", "De 50 a 100 millones", "Mayor de 100 millones"],
    feasibilityOptions: ["Sí, completos", "En proceso", "No"],
    stageOptions: ["Estructura de planificación", "Tramitología", "Ejecución y monitoreo", "Operación (Expansión)"],
    privacyText:
      "El CNI se compromete a proteger su privacidad. La información proporcionada será utilizada únicamente para administrar su solicitud y brindarle acompañamiento institucional. Autorizo el almacenamiento y procesamiento de mis datos personales para gestionar esta solicitud.",
    submit: "Enviar Postulación Técnica",
    ctaTitle: "Acelera tu proceso de inversión en Honduras",
    ctaText: "¿Necesita orientación antes de postular? Nuestro equipo de especialistas está disponible para resolver sus dudas y guiarle en el marco legal y técnico del país.",
    ctaButton: "Contacta al CNI para asistencia gratuita",
  },
  en: {
    eyebrow: "Sovereign Investment Portal",
    title: "DO YOU HAVE AN INVESTMENT PROJECT?",
    description:
      "An investment project is an initiative ready to be developed, which already has technical, financial and market studies, and allows you to clearly understand the return and strategic benefits.",
    primaryCta: "Submit your project",
    secondaryCta: "Download technical guide",
    valueTitle: "Why submit your project to the CNI?",
    valueSub: "The National Investment Council provides free and confidential support to national and international investors to facilitate the promotion of strategic projects.",
    benefits: [
      { icon: "handshake", title: "Comprehensive support", text: "Personalized technical advice throughout the entire structuring and execution process." },
      { icon: "enhanced_encryption", title: "Confidentiality", text: "We protect your project information with the highest institutional standards." },
      { icon: "hub", title: "Partner connections", text: "We facilitate connections with potential financial and strategic partners." },
      { icon: "monitoring", title: "Technical monitoring", text: "Continuous monitoring to ensure progress and resolution of bottlenecks." },
    ],
    formTitle: "Technical Project Submission",
    formSub: "Complete the following structured form so that a senior CNI executive can evaluate your initiative and contact you.",
    investorSection: "Investor Information",
    projectSection: "Technical Project Details",
    labels: {
      fullName: "Full Name *",
      company: "Company Name *",
      role: "Position *",
      email: "Email *",
      website: "Website",
      country: "Country of Origin *",
      projectName: "Project Name *",
      sector: "Strategic Sector *",
      presence: "Do you have a presence in Honduras? *",
      type: "Project Type *",
      amount: "Investment Amount (USD) *",
      description: "Short Project Description *",
      feasibility: "Do you have feasibility studies? *",
      stage: "Project Stage *",
    },
    placeholders: {
      fullName: "E.g. John Smith",
      company: "Corporation Inc.",
      role: "Chief Executive Officer / CEO",
      email: "contact@company.com",
      website: "https://www.company.com",
      country: "Select country",
      projectName: "Formal title of the initiative",
      description: "Executive summary of scope and objectives...",
    },
    sectorOptions: ["Energy", "Infrastructure", "Agribusiness", "Manufacturing", "Tourism and Hospitality", "Logistics and Transportation", "Other"],
    presenceOptions: ["Yes", "No", "Under evaluation"],
    typeOptions: ["New project (Greenfield)", "Expansion (Brownfield)"],
    amountOptions: ["Less than 10 million", "10 to 50 million", "50 to 100 million", "Greater than 100 million"],
    feasibilityOptions: ["Yes, complete", "In progress", "No"],
    stageOptions: ["Planning structure", "Procedures", "Execution and monitoring", "Operation (Expansion)"],
    privacyText:
      "The CNI is committed to protecting your privacy. The information provided will be used solely to manage your request and provide institutional support. I authorize the storage and processing of my personal data to manage this request.",
    submit: "Submit Technical Application",
    ctaTitle: "Accelerate your investment process in Honduras",
    ctaText: "Need guidance before applying? Our team of specialists is available to answer your questions and guide you through the country's legal and technical framework.",
    ctaButton: "Contact the CNI for free assistance",
  },
} as const;

export default async function PostulacionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = copy[locale];
  const L = (p: string) => resolveHref(locale, p);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <header className="hero-gradient relative flex min-h-[70vh] items-center overflow-hidden pt-20">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 h-full w-full bg-[radial-gradient(circle_at_70%_30%,_#2e1f00_0%,_transparent_50%)]" />
        </div>
        <div className="container relative z-10 mx-auto px-8 py-20">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="mb-6 inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#e9c176]">{c.eyebrow}</span>
              <h1 className="mb-8 text-5xl font-extrabold leading-tight tracking-tight text-white md:text-7xl">{c.title}</h1>
              <p className="mb-10 max-w-2xl text-lg leading-relaxed text-[#708ab5] md:text-xl">{c.description}</p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#formulario"
                  className="rounded-md bg-[#e9c176] px-8 py-4 text-sm font-extrabold uppercase tracking-wider text-[#110a00] shadow-lg shadow-black/20 transition-transform hover:-translate-y-0.5"
                >
                  {c.primaryCta}
                </a>
                <Link
                  href={L("/recursos")}
                  className="flex items-center gap-3 border-b border-white/20 pb-1 font-bold text-white transition-colors hover:border-[#e9c176]"
                >
                  <MaterialIcon name="description" />
                  {c.secondaryCta}
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:col-span-5 lg:justify-end">
              <div className="group relative">
                <div className="absolute -inset-4 rounded-full bg-[#e9c176]/20 opacity-50 blur-3xl transition-opacity group-hover:opacity-80" />
                <Image
                  src={designImages.postulacion.macaw}
                  alt="Guacamaya"
                  width={400}
                  height={500}
                  className="relative z-10 w-72 drop-shadow-2xl md:w-96"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-[#f8f9fa] px-8 py-24">
        <div className="container mx-auto">
          <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h2 className="mb-4 text-3xl font-extrabold text-[#000a1e] md:text-4xl">{c.valueTitle}</h2>
              <p className="leading-relaxed text-[#44474e]">{c.valueSub}</p>
            </div>
            <div className="mb-2 h-1 w-24 rounded-full bg-[#2e1f00]" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {c.benefits.map((b) => (
              <div key={b.title} className="group rounded-xl border-t-4 border-transparent bg-white p-10 shadow-sm transition-all duration-300 hover:border-[#000a1e] hover:shadow-xl">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#e7e8e9] transition-transform group-hover:scale-110">
                  <MaterialIcon name={b.icon} className="text-3xl text-[#000a1e]" />
                </div>
                <h3 className="mb-4 text-lg font-bold text-[#000a1e]">{b.title}</h3>
                <p className="text-sm leading-relaxed text-[#44474e]">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="formulario" className="border-y border-[#c4c6cf]/10 bg-[#f3f4f5] px-8 py-24">
        <div className="container mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-[#c4c6cf]/10 bg-white shadow-2xl">
            <div className="bg-[#002147] p-8 text-center text-white md:p-12">
              <h2 className="mb-4 text-3xl font-extrabold">{c.formTitle}</h2>
              <p className="mx-auto max-w-2xl text-[#708ab5]">{c.formSub}</p>
            </div>
            <form className="space-y-12 p-8 md:p-12">
              <div>
                <div className="mb-8 flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#000a1e] text-sm font-bold text-white">01</span>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-[#000a1e]">{c.investorSection}</h3>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {[
                    { key: "fullName", type: "text" },
                    { key: "company", type: "text" },
                    { key: "role", type: "text" },
                    { key: "email", type: "email" },
                    { key: "website", type: "url" },
                    { key: "country", type: "text" },
                  ].map((f) => (
                    <div className="space-y-2" key={f.key}>
                      <label className="text-xs font-bold uppercase tracking-wider text-[#44474e]">{c.labels[f.key as keyof typeof c.labels]}</label>
                      <input
                        type={f.type}
                        placeholder={c.placeholders[f.key as keyof typeof c.placeholders]}
                        className="w-full rounded-md border-none bg-[#f3f4f5] p-4 text-[#000a1e] placeholder:text-[#74777f]/50 focus:outline-none focus:ring-2 focus:ring-[#000a1e]/10"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-[#c4c6cf]/20" />

              <div>
                <div className="mb-8 flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#000a1e] text-sm font-bold text-white">02</span>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-[#000a1e]">{c.projectSection}</h3>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#44474e]">{c.labels.projectName}</label>
                    <input
                      type="text"
                      placeholder={c.placeholders.projectName}
                      className="w-full rounded-md border-none bg-[#f3f4f5] p-4 text-[#000a1e] placeholder:text-[#74777f]/50 focus:outline-none focus:ring-2 focus:ring-[#000a1e]/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#44474e]">{c.labels.sector}</label>
                    <select className="w-full appearance-none rounded-md border-none bg-[#f3f4f5] p-4 text-[#000a1e]">
                      {c.sectorOptions.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#44474e]">{c.labels.presence}</label>
                    <div className="mt-2 flex flex-wrap gap-4">
                      {c.presenceOptions.map((o) => (
                        <label key={o} className="flex cursor-pointer items-center gap-2">
                          <input type="radio" name="presencia" className="text-[#000a1e] focus:ring-[#000a1e]" />
                          <span className="text-sm">{o}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#44474e]">{c.labels.type}</label>
                    <select className="w-full rounded-md border-none bg-[#f3f4f5] p-4 text-[#000a1e]">
                      {c.typeOptions.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#44474e]">{c.labels.amount}</label>
                    <select className="w-full rounded-md border-none bg-[#f3f4f5] p-4 text-[#000a1e]">
                      {c.amountOptions.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#44474e]">{c.labels.description}</label>
                    <textarea
                      placeholder={c.placeholders.description}
                      rows={4}
                      className="w-full rounded-md border-none bg-[#f3f4f5] p-4 text-[#000a1e] placeholder:text-[#74777f]/50 focus:outline-none focus:ring-2 focus:ring-[#000a1e]/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#44474e]">{c.labels.feasibility}</label>
                    <select className="w-full rounded-md border-none bg-[#f3f4f5] p-4 text-[#000a1e]">
                      {c.feasibilityOptions.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#44474e]">{c.labels.stage}</label>
                    <select className="w-full rounded-md border-none bg-[#f3f4f5] p-4 text-[#000a1e]">
                      {c.stageOptions.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border-l-4 border-[#2e1f00] bg-[#f3f4f5] p-6">
                <label className="flex cursor-pointer gap-4">
                  <input type="checkbox" className="mt-1 rounded text-[#000a1e] focus:ring-[#000a1e]" />
                  <p className="text-xs leading-relaxed text-[#44474e]">{c.privacyText}</p>
                </label>
              </div>

              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  className="rounded-md bg-[#000a1e] px-12 py-5 text-sm font-extrabold uppercase tracking-widest text-white shadow-xl shadow-[#000a1e]/20 transition-all hover:-translate-y-0.5 hover:bg-[#002147]"
                >
                  {c.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-white px-8 py-24">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-extrabold text-[#000a1e]">{c.ctaTitle}</h2>
          <p className="mb-10 text-lg text-[#44474e]">{c.ctaText}</p>
          <Link
            href={L("/contacto")}
            className="inline-flex items-center gap-4 rounded-md bg-[#2e1f00] px-10 py-5 text-lg font-bold text-[#ffdea5] transition-colors hover:bg-[#110a00]"
          >
            {c.ctaButton}
            <MaterialIcon name="arrow_forward" />
          </Link>
        </div>
      </section>
    </div>
  );
}
