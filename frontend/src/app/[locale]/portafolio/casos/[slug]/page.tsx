import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { designImages } from "@/src/lib/designAssets";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { getSuccessStory, getSuccessStories } from "@/src/services/investment";
import { buildDetailMetadata } from "@/src/lib/seo";

const copy = {
  es: {
    back: "Volver a casos de éxito",
    company: "Empresa",
    sector: "Sector",
    investment: "Inversión",
    jobs: "Empleos generados",
    cta: "Contactar al CNI",
  },
  en: {
    back: "Back to success stories",
    company: "Company",
    sector: "Sector",
    investment: "Investment",
    jobs: "Jobs generated",
    cta: "Contact the CNI",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? (raw as Locale) : "es";
  try {
    const story = await getSuccessStory(slug, { locale });
    return buildDetailMetadata({
      locale,
      slugPath: `/portafolio/casos/${slug}`,
      title: story.title,
      description: story.summary,
      image: story.image,
    });
  } catch {
    return {};
  }
}

function paragraphs(content: string): string[] {
  return content
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function CasoDetallePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = copy[locale];
  const L = (p: string) => resolveHref(locale, p);

  let story;
  try {
    story = await getSuccessStory(slug, { locale });
  } catch {
    notFound();
  }

  let related = [];
  try {
    const all = await getSuccessStories({ locale });
    related = all.filter((item) => item.slug !== slug).slice(0, 2);
  } catch {
    related = [];
  }

  const body = paragraphs(story.content);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9ff]">
      <header className="relative flex min-h-[50vh] items-end overflow-hidden bg-[#252A58] pb-16 pt-40">
        <div className="absolute inset-0">
          {story.image ? (
            <img src={story.image} alt={story.title} className="h-full w-full object-cover opacity-50" />
          ) : (
            <Image src={designImages.casos.sinclair} alt={story.title} fill className="object-cover opacity-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#252A58] via-[#252A58]/70 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-4xl px-8">
          <Link
            href={L("/portafolio/casos")}
            className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#35A963]"
          >
            <MaterialIcon name="arrow_back" className="text-sm" />
            {c.back}
          </Link>
          <h1 className="text-4xl font-extrabold text-white md:text-5xl">{story.title}</h1>
          {story.summary && <p className="mt-4 text-lg text-white/80">{story.summary}</p>}
        </div>
      </header>

      <article className="mx-auto w-full max-w-3xl px-8 py-16">
        <div className="space-y-6 text-lg leading-relaxed text-[#0E7A7C]">
          {(body.length > 0 ? body : [story.content]).map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>

        <dl className="mt-10 grid gap-4 rounded-xl bg-white p-8 shadow-sm sm:grid-cols-2">
          {story.company_name && (
            <div>
              <dt className="text-xs font-bold uppercase tracking-widest text-[#252A58]">{c.company}</dt>
              <dd className="mt-1">{story.company_name}</dd>
            </div>
          )}
          {story.sector && (
            <div>
              <dt className="text-xs font-bold uppercase tracking-widest text-[#252A58]">{c.sector}</dt>
              <dd className="mt-1">{story.sector.name}</dd>
            </div>
          )}
        </dl>

        {story.testimonial_quote && (
          <blockquote className="mt-10 border-l-4 border-[#35A963] bg-white p-8 italic text-[#252A58]">
            &ldquo;{story.testimonial_quote}&rdquo;
            {story.testimonial_author && (
              <footer className="mt-4 not-italic text-sm text-[#0E7A7C]">— {story.testimonial_author}</footer>
            )}
          </blockquote>
        )}
      </article>

      {related.length > 0 && (
        <section className="border-t border-[#dce9ff] bg-white px-8 py-16">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 md:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={L(`/portafolio/casos/${item.slug}`)}
                  className="rounded-xl border border-[#dce9ff] p-6 hover:border-[#35A963]"
                >
                  <h3 className="font-bold text-[#252A58]">{item.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[#0E7A7C]">{item.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-8 py-16">
        <div className="mx-auto max-w-xl text-center">
          <Link
            href={L("/contacto")}
            className="inline-block rounded-md bg-[#252A58] px-10 py-4 font-bold text-white"
          >
            {c.cta}
          </Link>
        </div>
      </section>
    </div>
  );
}
