"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { cn } from "@/src/lib/utils";
import type { AsyncData } from "@/src/lib/asyncData";
import type { NewsArticle, NewsCategory } from "@/src/types/cms";

const CATEGORIES: NewsCategory[] = ["news", "press_release", "event", "announcement", "article"];

const labels = {
  es: {
    all: "Todas",
    empty: "No hay noticias públicas con este filtro.",
    error: "No pudimos cargar las noticias. Intente de nuevo más tarde.",
    cta: "Leer",
    featured: "Destacada",
    count: (n: number) => (n === 1 ? "1 nota" : `${n} notas`),
    category: {
      news: "Noticia",
      press_release: "Comunicado",
      event: "Evento",
      announcement: "Anuncio",
      article: "Artículo",
    } satisfies Record<NewsCategory, string>,
  },
  en: {
    all: "All",
    empty: "No public news matches this filter.",
    error: "We could not load the news. Please try again later.",
    cta: "Read",
    featured: "Featured",
    count: (n: number) => (n === 1 ? "1 item" : `${n} items`),
    category: {
      news: "News",
      press_release: "Press release",
      event: "Event",
      announcement: "Announcement",
      article: "Article",
    } satisfies Record<NewsCategory, string>,
  },
} as const;

function chipClass(active: boolean) {
  return cn(
    "rounded-full px-4 py-2 font-headline text-[11px] font-bold uppercase tracking-[0.16em] transition",
    active ? "bg-[#000a1e] text-white" : "bg-[#f3f4f5] text-cni-primary hover:bg-[#e7e8e9]",
  );
}

function formatDate(locale: Locale, value: string): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-HN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

type Props = {
  locale: Locale;
  news: AsyncData<NewsArticle[]>;
};

export function PrensaCatalog({ locale, news }: Props) {
  const t = labels[locale];
  const L = (path: string) => withLocale(locale, path);
  const [category, setCategory] = useState<string>("all");

  const visible = useMemo(() => {
    if (news.status !== "ok") return [];
    return news.data.filter((article) => {
      if (category === "all") return true;
      return article.category === category;
    });
  }, [category, news]);

  if (news.status === "error") {
    return (
      <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-800">
        {t.error}
      </p>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap gap-2" aria-label={locale === "es" ? "Filtrar por tipo" : "Filter by type"}>
          <button type="button" className={chipClass(category === "all")} onClick={() => setCategory("all")}>
            {t.all}
          </button>
          {CATEGORIES.map((key) => (
            <button
              key={key}
              type="button"
              className={chipClass(category === key)}
              onClick={() => setCategory(key)}
            >
              {t.category[key]}
            </button>
          ))}
        </div>
        <p className="font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-[#74777f]">
          {t.count(visible.length)}
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-cni-primary/15 bg-[#f3f4f5] px-6 py-12 text-center text-sm text-[#44474d]">
          {t.empty}
        </p>
      ) : (
        <div className="divide-y divide-cni-primary/10 overflow-hidden rounded-2xl border border-cni-primary/10 bg-[#f8f9ff]">
          {visible.map((article, index) => {
            const meta = [
              t.category[article.category],
              formatDate(locale, article.published_at),
              article.is_featured ? t.featured : null,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <Link
                key={article.slug}
                href={L(`/prensa/${article.slug}`)}
                className="group grid grid-cols-1 gap-3 px-6 py-5 transition-colors hover:bg-white md:grid-cols-12 md:items-center md:px-8"
              >
                <span className="font-headline text-[11px] font-bold tracking-[0.18em] text-[#32B372] md:col-span-1">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="md:col-span-8">
                  <p className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-on-surface-variant/55">
                    {meta}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-extrabold text-cni-primary group-hover:text-[#0E7A7C] md:text-xl">
                    {article.title}
                  </h3>
                  {article.summary ? (
                    <p className="mt-1 line-clamp-2 font-body text-sm text-[#44474d]">{article.summary}</p>
                  ) : null}
                </div>
                <span className="inline-flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-cni-primary md:col-span-3 md:justify-end">
                  {t.cta}
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
