import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { designImages } from "@/src/lib/designAssets";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.cni);

const copy = {
  es: {
    eyebrow: "Consejo Nacional de Inversiones",
    title: "Servicios estratégicos para el inversionista",
    description:
      "Acompañamiento integral, gratuito y confidencial para activar, escalar y proteger su capital en Honduras.",
    pillarsHeading: "Tres pilares de servicio",
    pillars: [
      {
        icon: "policy",
        title: "Servicios Legales",
        href: "/cni/servicios-legales",
        text: "Asesoría jurídica especializada sobre la Ley de Promoción y Protección de Inversiones (LPPI), regímenes aduaneros especiales y estructuración fiscal corporativa.",
        bullets: ["Marco LPPI y regímenes especiales", "ZOLI y zonas francas", "Estructuración fiscal y due diligence"],
      },
      {
        icon: "engineering",
        title: "Servicios Técnicos",
        href: "/cni/servicios-tecnicos",
        text: "Acompañamiento operativo en la gestión de permisos ambientales, trámites de aduana, licencias sanitarias y mitigación de cuellos de botella burocráticos.",
        bullets: ["Permisos ambientales", "Trámites aduaneros y sanitarios", "Gestión interinstitucional"],
      },
      {
        icon: "analytics",
        title: "Inteligencia de Datos",
        href: "/cni/inteligencia-de-datos",
        text: "Estudios de pre-factibilidad, matrices de costos operativos (energía, salarios, tierra/alquiler) y reportes de mercado a medida.",
        bullets: ["Estudios de pre-factibilidad", "Matrices de costos operativos", "Reportes sectoriales a medida"],
      },
    ],
    ctaTitle: "Active el respaldo institucional del CNI",
    ctaText: "Solicite una asesoría gratuita con uno de nuestros oficiales de inversión.",
    ctaButton: "Solicitar Asesoría Gratuita",
  },
  en: {
    eyebrow: "National Investment Council",
    title: "Strategic services for investors",
    description:
      "Comprehensive, free and confidential support to launch, scale and protect your capital in Honduras.",
    pillarsHeading: "Three pillars of service",
    pillars: [
      {
        icon: "policy",
        title: "Legal Services",
        href: "/en/cni/legal-services",
        text: "Specialized legal advisory on the Investment Promotion and Protection Law (LPPI), special customs regimes and corporate tax structuring.",
        bullets: ["LPPI framework", "Free trade zones (ZOLI)", "Tax structuring & due diligence"],
      },
      {
        icon: "engineering",
        title: "Technical Services",
        href: "/en/cni/technical-services",
        text: "Operational support for environmental permits, customs procedures, sanitary licenses and the mitigation of bureaucratic bottlenecks.",
        bullets: ["Environmental permits", "Customs & sanitary procedures", "Inter-institutional management"],
      },
      {
        icon: "analytics",
        title: "Data Intelligence",
        href: "/en/cni/data-intelligence",
        text: "Pre-feasibility studies, operating cost matrices (energy, wages, land/rent) and tailor-made market reports.",
        bullets: ["Pre-feasibility studies", "Operating cost matrices", "Custom sector reports"],
      },
    ],
    ctaTitle: "Activate the CNI's institutional backing",
    ctaText: "Schedule a free consultation with one of our investment officers.",
    ctaButton: "Request Free Advisory",
  },
} as const;

export default async function CNIServicesHubPage({ params }: { params: Promise<{ locale: string }> }) {
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
      { "@type": "ListItem", position: 2, name: "CNI", item: L("/cni") },
    ],
  };

  return (
    <div className="flex flex-1 flex-col bg-[#f8f9fa]">
      <Script id="breadcrumb-cni" type="application/ld+json">
        {JSON.stringify(breadcrumb)}
      </Script>

      <section className="relative -mt-28 flex min-h-[520px] items-center overflow-hidden bg-[#000a1e] pt-28">
        <Image
          src={designImages.cni.heroCity}
          alt="Vista panorámica de la torre institucional del CNI en el Centro Cívico Gubernamental, Tegucigalpa"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#000a1e] via-[#000a1e]/85 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-6 py-20 md:px-10">
          <span className="mb-6 inline-flex items-center rounded-sm border border-[#e9c176]/40 bg-[#2e1f00]/30 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[#e9c176] backdrop-blur">
            {c.eyebrow}
          </span>
          <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
            {c.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base font-light leading-relaxed text-white/85 md:text-lg">
            {c.description}
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-2xl px-6 py-20 md:px-10">
        <h2 className="text-3xl font-extrabold tracking-tight text-[#000a1e] md:text-4xl">{c.pillarsHeading}</h2>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {c.pillars.map((p) => (
            <article key={p.href} className="flex flex-col gap-5 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5 transition hover:shadow-xl">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#000a1e] text-[#e9c176]">
                <MaterialIcon name={p.icon} className="!text-3xl" />
              </span>
              <h3 className="text-xl font-bold text-[#000a1e]">{p.title}</h3>
              <p className="text-sm leading-relaxed text-[#44474e]">{p.text}</p>
              <ul className="mt-1 space-y-1.5 text-sm text-[#44474e]">
                {p.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <MaterialIcon name="check_circle" className="!text-base text-[#e9c176]" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={L(p.href)}
                className="mt-auto inline-flex w-fit items-center gap-2 border-b border-[#000a1e] pb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#000a1e] transition hover:gap-3 hover:text-[#3a5f94]"
                aria-label={`${p.title} — ${locale === "en" ? "view details" : "ver detalles"}`}
              >
                {locale === "en" ? "Explore service" : "Explorar servicio"}
                <MaterialIcon name="arrow_forward" className="!text-base" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#000a1e] py-20 text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-6 text-center md:px-10">
          <h2 className="w-full text-3xl font-extrabold tracking-tight md:text-4xl">{c.ctaTitle}</h2>
          <p className="w-full text-base text-white/80">{c.ctaText}</p>
          <Link
            href={L("/asesoria")}
            className="mx-auto inline-flex items-center gap-2 rounded-full bg-[#e9c176] px-8 py-3 text-sm font-bold uppercase tracking-[0.2em] text-[#000a1e] transition hover:bg-white"
          >
            {c.ctaButton}
            <MaterialIcon name="arrow_forward" className="!text-base" />
          </Link>
        </div>
      </section>
    </div>
  );
}
