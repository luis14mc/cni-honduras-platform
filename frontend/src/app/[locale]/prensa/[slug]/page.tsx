import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { designImages } from "@/src/lib/designAssets";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";

const copy = {
  es: {
    eyebrow: "Comunicado de Prensa",
    backToArchive: "Volver a la Sala de Prensa",
    relatedTitle: "Otras Noticias",
    relatedSubtitle: "Más historias y comunicados del CNI.",
    seeAll: "Ver todo el archivo",
    viewArticle: "Ver noticia",
    ctaTitle: "Acelera tu proceso de inversión en Honduras",
    ctaDesc: "Nuestro equipo de asesores técnicos y legales está listo para acompañar tu visión de negocio.",
    ctaButton: "Contacta al CNI para asistencia gratuita",
  },
  en: {
    eyebrow: "Press Release",
    backToArchive: "Back to Press Room",
    relatedTitle: "Other News",
    relatedSubtitle: "More CNI stories and communiqués.",
    seeAll: "View full archive",
    viewArticle: "View article",
    ctaTitle: "Accelerate your investment process in Honduras",
    ctaDesc: "Our team of technical and legal advisors is ready to support your business vision.",
    ctaButton: "Contact the CNI for free assistance",
  },
} as const;

const articleBodyEs = (title: string) => [
  `El Consejo Nacional de Inversiones informa sobre los avances relacionados con "${title.toLowerCase()}", una iniciativa estratégica enmarcada en el plan nacional de promoción de inversiones.`,
  "La articulación entre sector público y privado se ha convertido en el motor de las gestiones recientes del CNI, fortaleciendo el ecosistema de atracción de capital de alto impacto.",
  "Como parte de su mandato institucional, el CNI continúa promoviendo Honduras como un destino confiable, competitivo y con seguridad jurídica para inversionistas nacionales y extranjeros.",
];

const articleBodyEn = (title: string) => [
  `The National Investment Council reports on the progress related to "${title.toLowerCase()}", a strategic initiative framed in the national investment promotion plan.`,
  "Articulation between the public and private sectors has become the engine of the CNI's recent efforts, strengthening the ecosystem of attracting high-impact capital.",
  "As part of its institutional mandate, the CNI continues to promote Honduras as a reliable, competitive destination with legal security for national and foreign investors.",
];

export default async function PrensaArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = copy[locale];
  const L = (p: string) => resolveHref(locale, p);

  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const body = locale === "es" ? articleBodyEs(title) : articleBodyEn(title);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <header className="relative flex min-h-[60vh] items-center overflow-hidden bg-[#000a1e] pb-24 pt-40">
        <div className="absolute inset-0 z-0">
          <Image src={designImages.prensa.hero} alt={title} fill priority sizes="100vw" className="object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000a1e] via-[#000a1e]/60 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-4xl px-6 md:px-12">
          <Link
            href={L("/prensa")}
            className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#e9c176] hover:text-white"
          >
            <MaterialIcon name="arrow_back" className="text-sm" />
            {c.backToArchive}
          </Link>
          <span className="mb-6 inline-block rounded-sm bg-[#2e1f00] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#ffdea5]">
            {c.eyebrow}
          </span>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">{title}</h1>
        </div>
      </header>

      <article className="bg-white py-20">
        <div className="mx-auto max-w-3xl space-y-6 px-6 text-lg leading-relaxed text-[#44474e] md:px-12">
          {body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className="mt-12 rounded-xl border-l-4 border-[#e9c176] bg-[#f3f4f5] p-8 italic">
            {locale === "es"
              ? "“Honduras se encuentra preparada para recibir capital de clase mundial con un marco regulatorio competitivo y procesos optimizados.” — Junta Directiva CNI"
              : "“Honduras is ready to receive world-class capital with a competitive regulatory framework and optimized processes.” — CNI Board of Directors"}
          </div>
        </div>
      </article>

      <section className="bg-[#f3f4f5] py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#000a1e]">{c.relatedTitle}</h2>
              <p className="mt-2 text-[#44474e]">{c.relatedSubtitle}</p>
            </div>
            <Link href={L("/prensa")} className="hidden font-bold text-[#3a5f94] underline-offset-4 hover:underline md:block">
              {c.seeAll}
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {[
              { img: designImages.prensa.article1, title: locale === "es" ? "Expo Construye 2026" : "Expo Construye 2026" },
              { img: designImages.prensa.article2, title: locale === "es" ? "Conferencia Sinergias UE-CA" : "EU-CA Synergies Conference" },
            ].map((r) => (
              <Link href={L(`/prensa/${r.title.toLowerCase().replace(/\s+/g, "-")}`)} key={r.title} className="group cursor-pointer">
                <div className="relative mb-6 aspect-video overflow-hidden rounded-xl">
                  <Image src={r.img} alt={r.title} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-[#000a1e] transition-colors group-hover:text-[#3a5f94]">{r.title}</h3>
                <span className="inline-flex items-center text-sm font-bold uppercase tracking-wide text-[#000a1e]">
                  {c.viewArticle} <MaterialIcon name="arrow_forward" className="ml-2 text-sm" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#e1e3e4] py-20">
        <div className="container mx-auto px-6 text-center md:px-12">
          <div className="mx-auto max-w-2xl rounded-2xl bg-white p-12 shadow-xl shadow-[#000a1e]/5">
            <h2 className="mb-6 text-3xl font-extrabold text-[#000a1e]">{c.ctaTitle}</h2>
            <p className="mb-10 text-lg text-[#44474e]">{c.ctaDesc}</p>
            <Link
              href={L("/contacto")}
              className="inline-block rounded-md bg-[#000a1e] px-10 py-4 text-lg font-bold text-white shadow-lg shadow-[#000a1e]/20 transition-colors duration-200 hover:bg-[#002147] active:scale-95"
            >
              {c.ctaButton}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
