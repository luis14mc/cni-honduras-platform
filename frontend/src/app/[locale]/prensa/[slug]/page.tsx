import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { designImages } from "@/src/lib/designAssets";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { getNewsArticle } from "@/src/services/cms";
import type { NewsArticle, NewsCategory } from "@/src/types/cms";

const copy = {
  es: {
    backToArchive: "Volver a la Sala de Prensa",
    source: "Fuente",
    author: "Autor",
    externalLink: "Ver enlace externo",
    ctaTitle: "Acelera tu proceso de inversión en Honduras",
    ctaDesc: "Nuestro equipo de asesores técnicos y legales está listo para acompañar tu visión de negocio.",
    ctaButton: "Contacta al CNI para asistencia gratuita",
  },
  en: {
    backToArchive: "Back to Press Room",
    source: "Source",
    author: "Author",
    externalLink: "Open external link",
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

async function loadArticle(slug: string): Promise<NewsArticle | null> {
  try {
    return await getNewsArticle(slug);
  } catch {
    return null;
  }
}

function formatDate(locale: Locale, value: string): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-HN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function mediaUrl(article: NewsArticle): string | null {
  return article.featured_image?.file || null;
}

function paragraphs(content: string): string[] {
  return content
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
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
  const article = await loadArticle(slug);
  if (!article) notFound();

  const body = paragraphs(article.content);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <header className="relative flex min-h-[60vh] items-center overflow-hidden bg-[#000a1e] pb-24 pt-40">
        <div className="absolute inset-0 z-0">
          {mediaUrl(article) ? (
            <img src={mediaUrl(article) ?? ""} alt={article.title} className="h-full w-full object-cover opacity-50" />
          ) : (
            <Image src={designImages.prensa.hero} alt={article.title} fill priority sizes="100vw" className="object-cover opacity-50" />
          )}
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
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <span className="inline-block rounded-sm bg-[#2e1f00] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#ffdea5]">
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
          <div className="space-y-6 text-lg leading-relaxed text-[#44474e]">
            {(body.length > 0 ? body : [article.content]).map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <div className="mt-12 rounded-xl border-l-4 border-[#e9c176] bg-[#f3f4f5] p-8">
            <dl className="grid gap-4 text-sm text-[#44474e] sm:grid-cols-2">
              {article.source && (
                <div>
                  <dt className="font-bold uppercase tracking-widest text-[#000a1e]">{c.source}</dt>
                  <dd className="mt-1">{article.source}</dd>
                </div>
              )}
              {article.author_name && (
                <div>
                  <dt className="font-bold uppercase tracking-widest text-[#000a1e]">{c.author}</dt>
                  <dd className="mt-1">{article.author_name}</dd>
                </div>
              )}
            </dl>
            {article.external_url && (
              <a
                href={article.external_url}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 font-bold text-[#3a5f94] underline-offset-4 hover:underline"
              >
                {c.externalLink}
                <MaterialIcon name="open_in_new" className="text-sm" />
              </a>
            )}
          </div>
        </div>
      </article>

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
