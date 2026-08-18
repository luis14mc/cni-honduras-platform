import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { getSuccessStoryBySlug, getSuccessStories } from "@/src/lib/strapi/editorial";
import { StrapiApiError } from "@/src/lib/strapi/client";
import { StrapiBlocks } from "@/src/components/strapi/StrapiBlocks";
import { strapiBlocksHaveContent } from "@/src/lib/strapi/blocks";
import type { SuccessStory } from "@/src/types/investment";
import { buildDetailMetadata } from "@/src/lib/seo";
import { PAGE_HEROES } from "@/src/lib/pageHeroes";
import {
  formatSuccessStoryInvestment,
  formatSuccessStoryJobs,
  successStoryCoverImage,
  successStoryDetailHref,
  successStoryHasCover,
  successStoryHasLogo,
  successStoryHasPersonPhoto,
  successStoryLogoImage,
  successStoryPersonPhoto,
  successStoryPersonRole,
  successStoryDisplayName,
} from "@/src/lib/cmsSuccessStories";

const copy = {
  es: {
    back: "Volver a casos de éxito",
    company: "Empresa",
    sector: "Sector",
    origin: "País de origen",
    investment: "Inversión",
    jobs: "Empleos generados",
    cta: "Contactar al CNI",
    loadError:
      "No pudimos cargar este caso de éxito en este momento. Intente de nuevo más tarde.",
  },
  en: {
    back: "Back to success stories",
    company: "Company",
    sector: "Sector",
    origin: "Country of origin",
    investment: "Investment",
    jobs: "Jobs generated",
    cta: "Contact the CNI",
    loadError: "We could not load this success story right now. Please try again later.",
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
    const story = await getSuccessStoryBySlug(locale, slug);
    return buildDetailMetadata({
      locale,
      slugPath: `/portafolio/casos/${slug}`,
      title: story.title,
      description: story.summary,
      image: successStoryCoverImage(story) || undefined,
    });
  } catch {
    return {};
  }
}

function isRichHtml(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
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

  let story: SuccessStory | null = null;
  let loadError = false;
  try {
    story = await getSuccessStoryBySlug(locale, slug);
  } catch (error) {
    if (error instanceof StrapiApiError && error.status === 404) {
      notFound();
    }
    loadError = true;
  }

  if (loadError || !story) {
    return (
      <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9ff]">
        <div className="mx-auto w-full max-w-3xl px-6 py-32 md:px-12">
          <Link
            href={resolveHref(locale, "/portafolio/casos")}
            className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#35A963]"
          >
            <MaterialIcon name="arrow_back" className="text-sm" />
            {c.back}
          </Link>
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center text-sm text-red-800"
          >
            {c.loadError}
          </div>
        </div>
      </div>
    );
  }

  let related: SuccessStory[] = [];
  try {
    const all = await getSuccessStories(locale);
    related = all.filter((item) => item.slug !== slug).slice(0, 2);
  } catch {
    related = [];
  }

  const body = paragraphs(story.content);
  const useStrapiBlocks = strapiBlocksHaveContent(story.rich_content ?? []);
  const rich = !useStrapiBlocks && isRichHtml(story.content);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9ff]">
      <header className="relative flex min-h-screen items-end overflow-hidden bg-[#000a1e] pb-16 pt-40">
        <div className="absolute inset-0">
          <Image
            src={PAGE_HEROES.casos.image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.42]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#000a1e]/70 via-[#000a1e]/35 to-transparent" />
          <div className="site-footer-mesh pointer-events-none absolute inset-0 opacity-[0.16]" aria-hidden />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-4xl px-8">
          {successStoryHasLogo(story) && (
            <div className="mb-6 inline-flex rounded-lg bg-white/95 p-3">
              <Image
                src={successStoryLogoImage(story)!}
                alt={story.company_name || story.title}
                width={160}
                height={48}
                className="h-10 w-auto object-contain"
              />
            </div>
          )}
          <Link
            href={resolveHref(locale, "/portafolio/casos")}
            className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#35A963]"
          >
            <MaterialIcon name="arrow_back" className="text-sm" />
            {c.back}
          </Link>
          <h1 className="text-4xl font-extrabold text-white md:text-5xl">{story.title}</h1>
          {story.company_name ? (
            <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-white/70">
              {story.company_name}
              {story.sector ? ` · ${story.sector.name}` : ""}
            </p>
          ) : null}
          {story.summary && <p className="mt-4 text-lg text-white/80">{story.summary}</p>}
        </div>
      </header>

      <article className="mx-auto w-full max-w-3xl px-8 py-16">
        {successStoryHasCover(story) ? (
          <div className="relative mb-10 aspect-[16/9] w-full overflow-hidden rounded-xl">
            <Image
              src={successStoryCoverImage(story)!}
              alt={story.title}
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 720px"
            />
          </div>
        ) : null}
        {useStrapiBlocks ? (
          <StrapiBlocks blocks={story.rich_content} />
        ) : rich ? (
          <div
            className="prose prose-lg max-w-none text-[#0E7A7C] prose-headings:text-[#252A58]"
            dangerouslySetInnerHTML={{ __html: story.content }}
          />
        ) : (
          <div className="space-y-6 text-lg leading-relaxed text-[#0E7A7C]">
            {(body.length > 0 ? body : [story.content]).map((item) => (
              <p key={item.slice(0, 48)}>{item}</p>
            ))}
          </div>
        )}

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
          {story.country_origin && (
            <div>
              <dt className="text-xs font-bold uppercase tracking-widest text-[#252A58]">{c.origin}</dt>
              <dd className="mt-1">{story.country_origin}</dd>
            </div>
          )}
          {formatSuccessStoryInvestment(locale, story.investment_amount) && (
            <div>
              <dt className="text-xs font-bold uppercase tracking-widest text-[#252A58]">{c.investment}</dt>
              <dd className="mt-1">{formatSuccessStoryInvestment(locale, story.investment_amount)}</dd>
            </div>
          )}
          {formatSuccessStoryJobs(locale, story.jobs_generated) && (
            <div>
              <dt className="text-xs font-bold uppercase tracking-widest text-[#252A58]">{c.jobs}</dt>
              <dd className="mt-1">{formatSuccessStoryJobs(locale, story.jobs_generated)}</dd>
            </div>
          )}
        </dl>

        {(story.testimonial_quote || successStoryHasPersonPhoto(story)) && (
          <blockquote className="mt-10 flex gap-5 border-l-4 border-[#35A963] bg-white p-8 text-[#252A58]">
            {successStoryHasPersonPhoto(story) ? (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={successStoryPersonPhoto(story)!}
                  alt={successStoryDisplayName(story)}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ) : null}
            <div>
              {story.testimonial_quote ? (
                <p className="italic">&ldquo;{story.testimonial_quote}&rdquo;</p>
              ) : null}
              <footer className="mt-4 not-italic text-sm text-[#0E7A7C]">
                — {successStoryDisplayName(story)}
                {successStoryPersonRole(story) ? `, ${successStoryPersonRole(story)}` : ""}
              </footer>
            </div>
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
                  href={successStoryDetailHref(locale, item.slug)}
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
            href={resolveHref(locale, "/contacto")}
            className="inline-block rounded-md bg-[#252A58] px-10 py-4 font-bold text-white"
          >
            {c.cta}
          </Link>
        </div>
      </section>
    </div>
  );
}
