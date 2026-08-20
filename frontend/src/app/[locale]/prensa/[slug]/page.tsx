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
import { brandHeroCta } from "@/src/components/cni/BrandPageHero";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";
import type { NewsArticle, NewsCategory } from "@/src/types/cms";

const copy = {
  es: {
    backToArchive: "Volver a la Sala de Prensa",
    source: "Fuente",
    author: "Autor",
    externalLink: "Ver enlace externo",
    loadError:
      "No pudimos cargar esta noticia en este momento. Intente de nuevo más tarde.",
    ctaEyebrow: "Acompañamiento CNI",
    ctaTitle1: "Hable con el",
    ctaTitle2: "equipo CNI",
    ctaDesc: "Asesoría técnica y legal sin costo. No sustituye la decisión de inversión.",
    ctaPrimary: "Contactar al CNI",
    ctaSecondary: "Sala de prensa",
  },
  en: {
    backToArchive: "Back to Press Room",
    source: "Source",
    author: "Author",
    externalLink: "Open external link",
    loadError: "We could not load this article right now. Please try again later.",
    ctaEyebrow: "CNI support",
    ctaTitle1: "Talk to the",
    ctaTitle2: "CNI team",
    ctaDesc: "Technical and legal advisory at no cost. It does not replace the investment decision.",
    ctaPrimary: "Contact CNI",
    ctaSecondary: "Press room",
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
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <header className="relative flex min-h-screen items-end overflow-hidden bg-[#000a1e] pb-16 pt-40">
        <div className="absolute inset-0">
          <Image
            src={PAGE_HEROES.prensaArticle.image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.42]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#000a1e]/70 via-[#000a1e]/35 to-transparent" />
          <div className="site-footer-mesh pointer-events-none absolute inset-0 opacity-[0.16]" aria-hidden />
        </div>
        <div className={cn("relative z-10 w-full", layout.container)}>
          <div className="max-w-4xl">
            <Link
              href={L("/prensa")}
              className="mb-6 inline-flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-[#32B372] hover:text-white"
            >
              <MaterialIcon name="arrow_back" className="text-sm" />
              {c.backToArchive}
            </Link>
            <p className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
              {categoryLabels[locale][article.category]} · {formatDate(locale, article.published_at)}
            </p>
            <h1 className={cn("mt-4 text-white", t.heroTitle)}>{article.title}</h1>
            {article.summary ? (
              <p className={cn("mt-6 max-w-2xl text-white/80", t.heroLead)}>{article.summary}</p>
            ) : null}
          </div>
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

      <section className="relative overflow-hidden bg-[#000a1e] py-24 text-white">
        <div className="site-footer-mesh pointer-events-none absolute inset-0 opacity-[0.16]" aria-hidden />
        <div className={cn("relative z-10", layout.container)}>
          <p className={t.eyebrowOnDark}>{c.ctaEyebrow}</p>
          <h2 className={cn("mt-3 text-white", t.h2OnDark)}>
            {c.ctaTitle1} <span className="text-[#32B372]">{c.ctaTitle2}</span>
          </h2>
          <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-white/80">{c.ctaDesc}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={L("/contacto")} className={brandHeroCta(true)}>
              {c.ctaPrimary}
            </Link>
            <Link href={L("/prensa")} className={brandHeroCta(false)}>
              {c.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
