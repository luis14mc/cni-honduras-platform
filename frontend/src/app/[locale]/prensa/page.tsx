import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isLocale, type Locale } from "@/src/i18n/config";
import { designImages } from "@/src/lib/designAssets";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { makeGenerateMetadata } from "@/src/lib/seo";
import { PAGE_SEO } from "@/src/config/pageSeo";
import { getNews } from "@/src/lib/strapi/editorial";
import type { NewsArticle, NewsCategory } from "@/src/types/cms";
import { loadAsyncData } from "@/src/lib/asyncData";

export const generateMetadata = makeGenerateMetadata(PAGE_SEO.prensa);

const copy = {
  es: {
    eyebrow: "Canal Oficial",
    title: "Sala de Prensa",
    description:
      "Manténgase informado sobre las últimas noticias, eventos y comunicados del Consejo Nacional de Inversiones (CNI). Transparencia y visión estratégica para el desarrollo de Honduras.",
    featuredTitle: "Noticia destacada",
    archiveTitle: "Noticias y comunicados",
    empty: "Próximamente publicaremos noticias y comunicados oficiales del CNI.",
    error:
      "No pudimos cargar las noticias en este momento. Intente de nuevo más tarde.",
    readArticle: "Explorar",
    newsletterTitle: "Siga el pulso de la inversión en Honduras",
    newsletterDesc:
      "Reciba los boletines oficiales y actualizaciones de prensa directamente en su bandeja de entrada. Información estratégica para la toma de decisiones.",
    newsletterPlaceholder: "Su correo electrónico profesional",
    newsletterCta: "Suscribirse",
    newsletterDisclaimer:
      "Al suscribirse, acepta nuestra Política de Privacidad y el tratamiento de sus datos con fines informativos.",
  },
  en: {
    eyebrow: "Official Channel",
    title: "Press Room",
    description:
      "Stay informed about the latest news, events and communiqués from the National Investment Council (CNI). Transparency and strategic vision for Honduras's development.",
    featuredTitle: "Featured news",
    archiveTitle: "News and communiqués",
    empty: "Official CNI news and press releases will be published here soon.",
    error: "We could not load the news right now. Please try again later.",
    readArticle: "Explore",
    newsletterTitle: "Follow the pulse of investment in Honduras",
    newsletterDesc:
      "Receive official newsletters and press updates directly in your inbox. Strategic information for decision-making.",
    newsletterPlaceholder: "Your professional email",
    newsletterCta: "Subscribe",
    newsletterDisclaimer:
      "By subscribing, you accept our Privacy Policy and the treatment of your data for informational purposes.",
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
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function mediaUrl(article: NewsArticle): string | null {
  return article.featured_image?.file_url || article.featured_image?.file || null;
}

export default async function PrensaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = copy[locale];
  const L = (p: string) => resolveHref(locale, p);
  const newsResult = await loadAsyncData(() => getNews(locale), [] as NewsArticle[]);
  const articles = newsResult.data;
  const featured = articles.find((article) => article.is_featured);
  const archive = featured ? articles.filter((article) => article.slug !== featured.slug) : articles;

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9ff]">
      <section className="relative flex h-[60vh] items-center overflow-hidden premium-gradient">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[#252A58]/60" />
          <Image src={designImages.prensa.hero} alt="Press" fill priority sizes="100vw" className="object-cover" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-8">
          <div className="max-w-2xl">
            <span className="mb-6 inline-block rounded-sm bg-[#35A963] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#261900]">
              {c.eyebrow}
            </span>
            <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tighter text-white md:text-6xl">
              {c.title}
            </h1>
            <p className="text-lg font-light leading-relaxed text-white/80">{c.description}</p>
          </div>
        </div>
      </section>

      {newsResult.status !== "error" && featured && (
        <section className="bg-[#f8f9ff] px-8 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 border-l-4 border-[#35A963] pl-6">
              <h2 className="text-3xl font-bold tracking-tight text-[#252A58]">{c.featuredTitle}</h2>
            </div>
            <Link
              href={L(`/prensa/${featured.slug}`)}
              className="group grid overflow-hidden rounded-xl bg-white shadow-2xl shadow-[#252A58]/5 transition-all hover:-translate-y-1 lg:grid-cols-12"
            >
              <div className="relative min-h-[360px] bg-[#252A58] lg:col-span-7">
                {mediaUrl(featured) ? (
                  <img
                    src={mediaUrl(featured) ?? ""}
                    alt={featured.title}
                    className="h-full min-h-[360px] w-full object-cover transition-all duration-700 group-hover:scale-[1.02]"
                  />
                ) : (
                  <Image
                    src={designImages.prensa.feature}
                    alt={featured.title}
                    fill
                    sizes="(min-width:1024px) 58vw, 100vw"
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#252A58]/80 via-transparent to-transparent" />
              </div>
              <div className="flex flex-col justify-center p-10 lg:col-span-5">
                <div className="mb-4 flex flex-wrap items-center gap-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#0E7A7C]">
                    {categoryLabels[locale][featured.category]}
                  </span>
                  <span className="text-xs text-[#b6c2d3]">{formatDate(locale, featured.published_at)}</span>
                </div>
                <h3 className="mb-4 text-3xl font-bold leading-tight text-[#252A58] transition-colors group-hover:text-[#0E7A7C]">
                  {featured.title}
                </h3>
                <p className="line-clamp-4 text-[#0E7A7C]">{featured.summary}</p>
              </div>
            </Link>
          </div>
        </section>
      )}

      <section id="archive" className="bg-[#eff4ff] px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-4xl font-extrabold tracking-tight text-[#252A58]">{c.archiveTitle}</h2>
          {newsResult.status === "error" ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-white p-10 text-center text-lg font-medium text-red-800 shadow-md"
            >
              {c.error}
            </div>
          ) : articles.length === 0 ? (
            <div className="rounded-xl bg-white p-10 text-center text-lg font-medium text-[#0E7A7C] shadow-md">
              {c.empty}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
              {archive.map((article) => (
                <Link
                  key={article.slug}
                  href={L(`/prensa/${article.slug}`)}
                  className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl"
                >
                  <div className="h-56 overflow-hidden bg-[#dce9ff]">
                    {mediaUrl(article) ? (
                      <img
                        src={mediaUrl(article) ?? ""}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <Image
                        src={designImages.prensa.article1}
                        alt={article.title}
                        width={600}
                        height={400}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        unoptimized
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-8">
                    <div className="mb-4 flex items-center gap-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#0E7A7C]">
                        {categoryLabels[locale][article.category]}
                      </span>
                      <span className="text-xs text-[#b6c2d3]">{formatDate(locale, article.published_at)}</span>
                    </div>
                    <h3 className="mb-4 text-xl font-bold leading-tight text-[#252A58]">{article.title}</h3>
                    <p className="mb-8 line-clamp-3 text-sm text-[#0E7A7C]">{article.summary}</p>
                    <div className="mt-auto border-t border-[#dce9ff] pt-6">
                      <span className="flex items-center gap-2 font-bold text-[#252A58]">
                        {c.readArticle}
                        <MaterialIcon name="north_east" className="text-sm" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-[#e5eeff] bg-[#f8f9ff] px-8 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-extrabold leading-tight text-[#252A58]">{c.newsletterTitle}</h2>
          <p className="mx-auto mb-10 max-w-2xl text-[#0E7A7C]">{c.newsletterDesc}</p>
          <form className="mx-auto flex max-w-xl flex-col gap-4 sm:flex-row">
            <input
              className="flex-1 rounded-lg border-none bg-[#dce9ff] px-6 py-4 transition-all focus:ring-2 focus:ring-[#0E7A7C]/20"
              placeholder={c.newsletterPlaceholder}
              type="email"
            />
            <button
              type="button"
              className="rounded-lg bg-[#252A58] px-10 py-4 font-bold text-white shadow-lg shadow-[#252A58]/10 transition-all hover:bg-[#0E7A7C]"
            >
              {c.newsletterCta}
            </button>
          </form>
          <p className="mt-6 text-xs text-[#b6c2d3]">{c.newsletterDisclaimer}</p>
        </div>
      </section>
    </div>
  );
}
