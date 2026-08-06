import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { designImages } from "@/src/lib/designAssets";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { getDocuments } from "@/src/services/cms";
import {
  documentActionLabel,
  documentLinkRel,
  documentLinkTarget,
  documentOpenUrl,
  formatDocumentFileSize,
} from "@/src/lib/cmsDocuments";
import type { CmsDocument } from "@/src/types/cms";
import { loadAsyncData } from "@/src/lib/asyncData";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.recursos);

const copy = {
  es: {
    title: "Librería de Recursos",
    description:
      "Bienvenido al Centro de Recursos de Invest Honduras. Aquí encontrará una colección de herramientas, guías y documentos diseñados para apoyar a inversionistas y empresarios en el desarrollo económico nacional.",
    searchPlaceholder: "Buscar documentos, leyes o guías...",
    categoriesEyebrow: "Navegación",
    categoriesTitle: "Categorías Especializadas",
    categories: [
      { icon: "account_balance", title: "Recursos Institucionales", text: "Información fundamental sobre el Consejo Nacional de Inversiones y memorias anuales.", cta: "Explorar Recursos", href: "/recursos/institucional" },
      { icon: "folder_managed", title: "Portafolio de Inversiones", text: "Catálogo detallado de proyectos estratégicos y sectores con alto potencial de crecimiento.", cta: "Ver Portafolio", href: "/portafolio" },
      { icon: "lightbulb", title: "Oportunidades de Inversión", text: "Análisis de mercado y ventanas de oportunidad para capitales nacionales y extranjeros.", cta: "Ver Oportunidades", href: "/invertir" },
      { icon: "construction", title: "Recursos para la Inversión", text: "Guías técnicas y manuales de procedimientos para facilitar el aterrizaje de capital.", cta: "Descargar Guías", href: "/recursos/tecnicos" },
      { icon: "gavel", title: "Recursos Legales", text: "Compendio actualizado de leyes, decretos y marcos regulatorios del país.", cta: "Marco Legal", href: "/cni/servicios-legales" },
      { icon: "article", title: "Otros Documentos", text: "Formularios diversos, plantillas y material de consulta general.", cta: "Ver Biblioteca", href: "/recursos/biblioteca" },
      { icon: "analytics", title: "Estudios CNI", text: "Estudios sectoriales y análisis de mercado para inversionistas.", cta: "Ver Estudios", href: "/recursos/estudios" },
    ],
    highlightsEyebrow: "Actualizados",
    highlightsTitle: "Documentos Destacados",
    viewAll: "Ver categoría institucional",
    empty: "Próximamente publicaremos documentos destacados desde el CMS.",
    error: "No pudimos cargar los documentos destacados. Intente de nuevo más tarde.",
    preview: "Vista previa",
    download: "Descargar",
    ctaTitle: "¿Necesita asesoría técnica personalizada?",
    ctaDesc: "Acelere su proceso de inversión en Honduras. El equipo del CNI está listo para brindarle asistencia técnica y legal de forma gratuita.",
    ctaPrimary: "Contactar Asesoría Gratuita",
    ctaSecondary: "Agendar Reunión Virtual",
  },
  en: {
    title: "Resource Library",
    description:
      "Welcome to the Invest Honduras Resource Center. Here you will find a collection of tools, guides and documents designed to support investors and entrepreneurs in national economic development.",
    searchPlaceholder: "Search documents, laws or guides...",
    categoriesEyebrow: "Navigation",
    categoriesTitle: "Specialized Categories",
    categories: [
      { icon: "account_balance", title: "Institutional Resources", text: "Fundamental information about the National Investment Council and annual reports.", cta: "Explore Resources", href: "/recursos/institucional" },
      { icon: "folder_managed", title: "Investment Portfolio", text: "Detailed catalog of strategic projects and high-growth sectors.", cta: "View Portfolio", href: "/portafolio" },
      { icon: "lightbulb", title: "Investment Opportunities", text: "Market analysis and opportunity windows for national and foreign capital.", cta: "View Opportunities", href: "/invertir" },
      { icon: "construction", title: "Investment Resources", text: "Technical guides and procedure manuals to facilitate capital landing.", cta: "Download Guides", href: "/recursos/tecnicos" },
      { icon: "gavel", title: "Legal Resources", text: "Updated compendium of laws, decrees and regulatory frameworks.", cta: "Legal Framework", href: "/cni/servicios-legales" },
      { icon: "article", title: "Other Documents", text: "Various forms, templates and general consultation material.", cta: "View Library", href: "/recursos/biblioteca" },
      { icon: "analytics", title: "CNI Studies", text: "Sector studies and market analysis for investors.", cta: "View Studies", href: "/recursos/estudios" },
    ],
    highlightsEyebrow: "Updated",
    highlightsTitle: "Featured Documents",
    viewAll: "View institutional category",
    empty: "Featured documents will be published from the CMS soon.",
    error: "We could not load featured documents right now. Please try again later.",
    preview: "Preview",
    download: "Download",
    ctaTitle: "Need personalized technical advice?",
    ctaDesc: "Accelerate your investment process in Honduras. The CNI team is ready to provide free technical and legal assistance.",
    ctaPrimary: "Contact Free Advisory",
    ctaSecondary: "Schedule Virtual Meeting",
  },
} as const;

export default async function RecursosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = copy[locale];
  const L = (p: string) => resolveHref(locale, p);
  const featuredResult = await loadAsyncData(
    () => getDocuments({ featured: true, locale }),
    [] as CmsDocument[],
  );
  const highlights = featuredResult.data.slice(0, 6);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9ff]">
      <section className="relative flex h-[500px] items-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <Image src={designImages.recursos.hero} alt="Recursos" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 hero-gradient opacity-80" />
        </div>
        <div className="container relative z-10 mx-auto px-8">
          <div className="max-w-3xl">
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white md:text-6xl">{c.title}</h1>
            <p className="mb-10 text-lg font-light leading-relaxed text-[#d6e3ff]">{c.description}</p>
            <div className="relative max-w-2xl">
              <input
                className="h-16 w-full rounded-lg border-none bg-white pl-14 pr-6 text-[#252A58] shadow-xl transition-all focus:ring-2 focus:ring-[#35A963]"
                placeholder={c.searchPlaceholder}
                type="text"
              />
              <MaterialIcon name="search" className="absolute left-5 top-1/2 -translate-y-1/2 text-[#252A58]/50" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f8f9ff] px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b6c2d3]">{c.categoriesEyebrow}</span>
            <h2 className="mt-2 text-4xl font-extrabold text-[#252A58]">{c.categoriesTitle}</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {c.categories.map((cat) => (
              <div
                key={cat.title}
                className="group flex h-full flex-col rounded-xl bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-[#24436B]">
                  <MaterialIcon name={cat.icon} className="text-3xl text-[#35A963]" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-[#252A58]">{cat.title}</h3>
                <p className="mb-8 grow text-[#0E7A7C]">{cat.text}</p>
                <Link
                  href={cat.href ? L(cat.href) : "#"}
                  className="inline-flex items-center font-bold text-[#252A58] transition-colors group-hover:text-[#0E7A7C]"
                >
                  {cat.cta}
                  <MaterialIcon name="arrow_forward" className="ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eff4ff] px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row">
            <div>
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b6c2d3]">{c.highlightsEyebrow}</span>
              <h2 className="mt-2 text-4xl font-extrabold text-[#252A58]">{c.highlightsTitle}</h2>
            </div>
            <Link
              href={L("/recursos/institucional")}
              className="flex items-center rounded-md bg-[#252A58] px-8 py-3 font-bold text-white transition-all hover:bg-[#24436B]"
            >
              {c.viewAll}
              <MaterialIcon name="open_in_new" className="ml-2" />
            </Link>
          </div>
          {featuredResult.status === "error" ? (
            <div role="alert" className="rounded-xl border border-red-200 bg-white p-10 text-center text-red-800 shadow-sm">
              {c.error}
            </div>
          ) : highlights.length === 0 ? (
            <div className="rounded-xl bg-white p-10 text-center text-[#0E7A7C] shadow-sm">{c.empty}</div>
          ) : (
            <div className="flex flex-col space-y-6">
              {highlights.map((doc) => {
                const openUrl = documentOpenUrl(doc);
                return (
                <div
                  key={doc.id}
                  className="group flex flex-col items-center overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md md:flex-row"
                >
                  <div className="relative flex h-48 w-full shrink-0 flex-col items-center justify-center overflow-hidden bg-[#24436B] p-6 text-center md:w-64">
                    {doc.cover_image?.file ? (
                      <img
                        src={doc.cover_image.file}
                        alt={doc.cover_image.alt_text || doc.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <>
                        <MaterialIcon name="description" className="mb-2 text-5xl text-[#35A963]" />
                        <span className="text-xs font-bold uppercase tracking-widest text-white">
                          {doc.file_type ? doc.file_type.toUpperCase() : doc.category}
                          {doc.file_size_bytes ? ` · ${formatDocumentFileSize(doc.file_size_bytes, locale)}` : ""}
                        </span>
                      </>
                    )}
                    {doc.is_featured && (
                      <span className="absolute left-3 top-3 rounded-sm bg-[#35A963] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#261900]">
                        {locale === "es" ? "Destacado" : "Featured"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-grow flex-col items-center justify-between gap-6 p-8 md:flex-row">
                    <div>
                      <h4 className="mb-2 text-xl font-bold text-[#252A58]">{doc.title}</h4>
                      <p className="max-w-xl text-[#0E7A7C]">{doc.description}</p>
                    </div>
                    {openUrl ? (
                      <div className="flex shrink-0 gap-4">
                        <a
                          href={openUrl}
                          target={documentLinkTarget(doc)}
                          rel={documentLinkRel(doc)}
                          className="flex items-center rounded-md border border-[#dce9ff] px-5 py-2 font-semibold text-[#252A58] transition-colors hover:bg-[#dce9ff]"
                        >
                          <MaterialIcon name="visibility" className="mr-2 text-xl" /> {c.preview}
                        </a>
                        <a
                          href={openUrl}
                          target={documentLinkTarget(doc)}
                          rel={documentLinkRel(doc)}
                          className="flex items-center rounded-md bg-[#252A58] px-5 py-2 font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
                        >
                          <MaterialIcon name="download" className="mr-2 text-xl" /> {documentActionLabel(doc, locale)}
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden px-8 py-24">
        <div className="absolute inset-0 z-0">
          <Image src={designImages.recursos.cta} alt="CTA" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[#252A58]/90" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <h2 className="mb-8 text-4xl font-extrabold tracking-tight text-white md:text-5xl">{c.ctaTitle}</h2>
          <p className="mx-auto mb-12 max-w-2xl text-xl font-light leading-relaxed text-[#d6e3ff]">{c.ctaDesc}</p>
          <div className="flex flex-col justify-center gap-6 sm:flex-row">
            <Link
              href={L("/contacto")}
              className="rounded-md bg-[#35A963] px-10 py-5 text-sm font-extrabold uppercase tracking-widest text-[#261900] shadow-2xl transition-transform duration-150 hover:scale-105"
            >
              {c.ctaPrimary}
            </Link>
            <Link
              href={L("/contacto")}
              className="rounded-md border-2 border-[#d6e3ff] px-10 py-5 text-sm font-extrabold uppercase tracking-widest text-white transition-all hover:bg-[#d6e3ff] hover:text-[#252A58]"
            >
              {c.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
