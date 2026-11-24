import { formatNewsDate } from "./homePresentation";
import { newsCategoryLabels } from "@/src/i18n/copy/homeSections";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { newsCardImage } from "@/src/lib/cmsNews";
import { cn } from "@/src/lib/utils";
import { type as t } from "@/src/lib/typography";
import type { HomePageModel } from "./useHomePage";

export function HomeNews({
  locale, latestNewsStatus, L, visibleNews, prensaCopy
}: Pick<HomePageModel, "locale" | "latestNewsStatus" | "L" | "visibleNews" | "prensaCopy">) {
  return (
    <section className="py-14 md:py-20 bg-cni-surface-low border-t border-cni-primary/5">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div className="max-w-2xl">
              <p className={cn(t.eyebrow, "mb-2 text-cni-secondary tracking-[0.25em]")}>
                {prensaCopy.eyebrow}
              </p>
              <h2 className={cn(t.h2Upper, "leading-tight")}>
                {prensaCopy.title}
              </h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-cni-primary/75">
                {prensaCopy.description}
              </p>
            </div>
            <Link
              href={L("/prensa")}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-cni-primary/12 bg-white px-5 py-2.5 font-headline text-[10px] font-extrabold uppercase tracking-[0.14em] text-cni-primary shadow-sm transition-all hover:border-cni-gold/40 hover:text-cni-gold"
            >
              {locale === "es" ? "Sala de prensa" : "Press room"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {latestNewsStatus === "error" ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center text-sm text-red-800"
            >
              {prensaCopy.error}
            </div>
          ) : visibleNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {visibleNews.map((article, idx) => (
                <Link
                  key={article.slug}
                  href={L(`/prensa/${article.slug}`)}
                  className="group flex h-full flex-col overflow-hidden rounded-xl bg-white border border-cni-primary/8 shadow-sm transition-all hover:-translate-y-0.5 hover:border-cni-gold/25 hover:shadow-md"
                >
                  <div className="relative h-44 overflow-hidden bg-cni-primary">
                    <Image
                      src={newsCardImage(article, idx)}
                      alt={article.featured_image?.alt_text || article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-cni-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </div>
                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-cni-surface-low px-2.5 py-0.5 font-headline text-[10px] font-bold uppercase tracking-[0.14em] text-cni-secondary">
                        {newsCategoryLabels[locale][article.category]}
                      </span>
                      <time
                        dateTime={article.published_at}
                        className="text-[11px] font-body text-cni-primary/50"
                      >
                        {formatNewsDate(locale, article.published_at)}
                      </time>
                    </div>
                    <h3 className="font-headline text-base md:text-lg font-extrabold leading-snug text-cni-primary line-clamp-2 group-hover:text-cni-secondary transition-colors">
                      {article.title}
                    </h3>
                    {article.summary ? (
                      <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-cni-primary/60">
                        {article.summary}
                      </p>
                    ) : null}
                    <span className="mt-4 inline-flex items-center gap-2 font-headline text-[10px] font-extrabold uppercase tracking-[0.14em] text-cni-gold">
                      {prensaCopy.readMore}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-cni-primary/15 bg-white px-6 py-12 text-center">
              <p className="font-body text-sm text-cni-primary/60">{prensaCopy.empty}</p>
              <Link
                href={L("/prensa")}
                className="mt-4 inline-flex items-center gap-2 font-headline text-[10px] font-extrabold uppercase tracking-[0.14em] text-cni-primary hover:text-cni-gold"
              >
                {prensaCopy.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>
  );
}
