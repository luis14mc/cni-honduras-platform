import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { designImages } from "@/src/lib/designAssets";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { getSuccessStories } from "@/src/services/investment";
import type { SuccessStory } from "@/src/types/investment";
import { loadAsyncData } from "@/src/lib/asyncData";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO["portafolio-casos"]);

const copy = {
  es: {
    eyebrow: "Ecosistema de Inversión",
    titleA: "Casos de",
    titleB: "Éxito",
    description:
      "Descubra cómo corporaciones globales y visionarios locales han prosperado en Honduras con el acompañamiento del CNI.",
    empty: "Próximamente publicaremos casos de éxito desde el CMS institucional.",
    error: "No pudimos cargar los casos de éxito. Intente de nuevo más tarde.",
    viewCase: "Ver caso",
    ctaTitle: "Crea tu caso de éxito con la asistencia gratuita del CNI",
    ctaPrimary: "Contactar al CNI",
  },
  en: {
    eyebrow: "Investment Ecosystem",
    titleA: "Success",
    titleB: "Stories",
    description:
      "Discover how global corporations and local visionaries have thrived in Honduras with CNI support.",
    empty: "Success stories will be published soon from the institutional CMS.",
    error: "We could not load success stories right now. Please try again later.",
    viewCase: "View case",
    ctaTitle: "Build your success story with free CNI assistance",
    ctaPrimary: "Contact the CNI",
  },
} as const;

export default async function CasosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = copy[locale];
  const L = (p: string) => resolveHref(locale, p);
  const storiesResult = await loadAsyncData(
    () => getSuccessStories({ locale }),
    [] as SuccessStory[],
  );
  const stories = storiesResult.data;
  const featured = stories.find((story) => story.is_featured) ?? stories[0];
  const others = featured ? stories.filter((story) => story.slug !== featured.slug) : stories;

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9ff]">
      <section className="relative flex min-h-[50vh] items-center overflow-hidden premium-gradient pt-24">
        <div className="absolute inset-0 opacity-40">
          <Image src={designImages.casos.sinclair} alt="" fill className="object-cover" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-8 py-16">
          <span className="mb-4 inline-block rounded-sm bg-[#35A963] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#261900]">
            {c.eyebrow}
          </span>
          <h1 className="text-5xl font-extrabold text-white md:text-6xl">
            {c.titleA} <span className="text-[#35A963]">{c.titleB}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">{c.description}</p>
        </div>
      </section>

      <section className="px-8 py-24">
        <div className="mx-auto max-w-7xl">
          {storiesResult.status === "error" ? (
            <div role="alert" className="rounded-xl border border-red-200 bg-white p-10 text-center text-lg text-red-800 shadow-md">
              {c.error}
            </div>
          ) : stories.length === 0 ? (
            <div className="rounded-xl bg-white p-10 text-center text-lg text-[#0E7A7C] shadow-md">
              {c.empty}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...(featured ? [featured] : []), ...others].map((story) => (
                <Link
                  key={story.slug}
                  href={L(`/portafolio/casos/${story.slug}`)}
                  className="group overflow-hidden rounded-xl bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-52 bg-[#252A58]">
                    {story.image ? (
                      <img src={story.image} alt={story.title} className="h-full w-full object-cover" />
                    ) : (
                      <Image src={designImages.casos.sinclair} alt={story.title} fill className="object-cover" />
                    )}
                  </div>
                  <div className="p-6">
                    {story.sector && (
                      <span className="text-xs font-bold uppercase tracking-widest text-[#0E7A7C]">
                        {story.sector.name}
                      </span>
                    )}
                    <h3 className="mt-2 text-xl font-bold text-[#252A58] group-hover:text-[#0E7A7C]">
                      {story.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm text-[#0E7A7C]">{story.summary}</p>
                    <span className="mt-4 inline-flex items-center gap-2 font-bold text-[#252A58]">
                      {c.viewCase}
                      <MaterialIcon name="north_east" className="text-sm" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#d3e4fe] px-8 py-20">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-12 text-center shadow-xl">
          <h2 className="mb-6 text-3xl font-extrabold text-[#252A58]">{c.ctaTitle}</h2>
          <Link
            href={L("/contacto")}
            className="inline-block rounded-md bg-[#252A58] px-10 py-4 text-lg font-bold text-white"
          >
            {c.ctaPrimary}
          </Link>
        </div>
      </section>
    </div>
  );
}
