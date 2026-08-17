import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { buildNewsArticleMetadata, loadNewsArticle } from "@/src/lib/cmsNews";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { NewsBlocksRenderer } from "@/src/components/news/NewsBlocksRenderer";
import { StrapiBlocks } from "@/src/components/strapi/StrapiBlocks";
import {
  blocksHaveRenderableContent,
  ensureBlocks,
} from "@/src/lib/newsBlocks";
import { strapiBlocksHaveContent } from "@/src/lib/strapi/blocks";
import { resolveMediaFileUrl } from "@/src/lib/mediaUrl";
import { PAGE_HEROES } from "@/src/lib/pageHeroes";
import type { NewsArticle, NewsCategory } from "@/src/types/cms";

const copy = {
  es: {
    backToArchive: "Volver a la Sala de Prensa",
    source: "Fuente",
    author: "Autor",
    externalLink: "Ver enlace externo",
    loadError:
      "No pudimos cargar esta noticia en este momento. Intente de nuevo más tarde.",
    ctaTitle: "Acelera tu proceso de inversión en Honduras",
    ctaDesc: "Nuestro equipo de asesores técnicos y legales está listo para acompañar tu visión de negocio.",
    ctaButton: "Contacta al CNI para asistencia gratuita",
  },
  en: {
    backToArchive: "Back to Press Room",
    source: "Source",
    author: "Author",
    externalLink: "Open external link",
    loadError: "We could not load this article right now. Please try again later.",
    ctaTitle: "Accelerate your investment process in Honduras",
    ctaDesc: "Our team of technical and legal advisors is ready to support your business vision.",
    ctaButton: "Contact the CNI for free assistance",
  },
} as const;

const categoryLabels: Record<Locale, Record<NewsCategory, string>> = {
  es: {
    news: "Noticia",
    press_release: "Comunicado",
    event: "Evento",
    announcement: "Anuncio",
    article: "Artículo",
  },
  en: {
    news: "News",
    press_release: "Press release",
    event: "Event",
    announcement: "Announcement",
    article: "Article",
  },
};

function formatDate(locale: Locale, value: string): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-HN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function mediaUrl(article: NewsArticle): string | null {
  return resolveMediaFileUrl(article.featured_image?.file_url || article.featured_image?.file) || null;
}

function legacyParagraphs(content: string): string[] {
  return content
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  return buildNewsArticleMetadata(slug, raw as Locale);
}

function PrensaArticleError({
  message,
  backLabel,
  backHref,
}: {
  message: string;
  backLabel: string;
  backHref: string;
}) {
  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9ff]">
      <div className="mx-auto w-full max-w-3xl px-6 py-32 md:px-12">
        <Link
          href={backHref}
          className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#35A963] hover:text-[#252A58]"
        >
          <MaterialIcon name="arrow_back" className="text-sm" />
          {backLabel}
        </Link>
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center text-sm text-red-800"
        >
          {message}
        </div>
      </div>
    </div>
  );
}

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
  const result = await loadNewsArticle(slug, locale);

  if (result.status === "not_found") {
    notFound();
  }

  if (result.status === "error") {
    return (
      <PrensaArticleError
        message={c.loadError}
        backLabel={c.backToArchive}
        backHref={L("/prensa")}
      />
    );
  }

  const article = result.article;
  const strapiBlocks = article.rich_content ?? [];
  const useStrapiBlocks = strapiBlocksHaveContent(strapiBlocks);
  const blocks = ensureBlocks(article.content_blocks);
  const useBlocks = !useStrapiBlocks && blocksHaveRenderableContent(blocks);
  const body = legacyParagraphs(article.content);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9ff]">
      <header className="relative flex min-h-[60vh] items-center overflow-hidden bg-[#252A58] pb-24 pt-40">
        <div className="absolute inset-0 z-0">
          <Image
            src={PAGE_HEROES.prensaArticle.image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#252A58] via-[#252A58]/60 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-4xl px-6 md:px-12">
          <Link
            href={L("/prensa")}
            className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#35A963] hover:text-white"
          >
            <MaterialIcon name="arrow_back" className="text-sm" />
            {c.backToArchive}
          </Link>
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <span className="inline-block rounded-sm bg-[#0E7A7C] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#8DC046]">
              {categoryLabels[locale][article.category]}
            </span>
            <span className="text-sm font-medium text-white/70">{formatDate(locale, article.published_at)}</span>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
            {article.title}
          </h1>
          {article.summary && <p className="mt-6 text-lg leading-relaxed text-white/80">{article.summary}</p>}
        </div>
      </header>

      <article className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-6 md:px-12">
          {mediaUrl(article) && (
            <img src={mediaUrl(article) ?? ""} alt={article.title} className="mb-10 w-full rounded-xl object-cover" />
          )}
          {useStrapiBlocks ? (
            <StrapiBlocks blocks={strapiBlocks} />
          ) : useBlocks ? (
            <NewsBlocksRenderer blocks={blocks} />
          ) : (
            <div className="space-y-6 text-lg leading-relaxed text-[#0E7A7C]">
              {(body.length > 0 ? body : [article.content]).map((item) => (
                <p key={item.slice(0, 48)}>{item}</p>
              ))}
            </div>
          )}
          <div className="mt-12 rounded-xl border-l-4 border-[#35A963] bg-[#eff4ff] p-8">
            <dl className="grid gap-4 text-sm text-[#0E7A7C] sm:grid-cols-2">
              {article.source && (
                <div>
                  <dt className="font-bold uppercase tracking-widest text-[#252A58]">{c.source}</dt>
                  <dd className="mt-1">{article.source}</dd>
                </div>
              )}
              {article.author_name && (
                <div>
                  <dt className="font-bold uppercase tracking-widest text-[#252A58]">{c.author}</dt>
                  <dd className="mt-1">{article.author_name}</dd>
                </div>
              )}
            </dl>
            {article.external_url && (
              <a
                href={article.external_url}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 font-bold text-[#0E7A7C] underline-offset-4 hover:underline"
              >
                {c.externalLink}
                <MaterialIcon name="open_in_new" className="text-sm" />
              </a>
            )}
          </div>
        </div>
      </article>

      <section className="bg-[#d3e4fe] py-20">
        <div className="container mx-auto px-6 text-center md:px-12">
          <div className="mx-auto max-w-2xl rounded-2xl bg-white p-12 shadow-xl shadow-[#252A58]/5">
            <h2 className="mb-6 text-3xl font-extrabold text-[#252A58]">{c.ctaTitle}</h2>
            <p className="mb-10 text-lg text-[#0E7A7C]">{c.ctaDesc}</p>
            <Link
              href={L("/contacto")}
              className="inline-block rounded-md bg-[#252A58] px-10 py-4 text-lg font-bold text-white shadow-lg shadow-[#252A58]/20 transition-colors duration-200 hover:bg-[#24436B] active:scale-95"
            >
              {c.ctaButton}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
