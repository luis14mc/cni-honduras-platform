"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/src/i18n/config";
import {
  documentActionLabel,
  documentLinkRel,
  documentLinkTarget,
  documentOpenUrl,
  formatDocumentFileSize,
} from "@/src/lib/cmsDocuments";
import type { AsyncData } from "@/src/lib/asyncData";
import type { CmsDocument } from "@/src/types/cms";

const labels = {
  es: {
    search: "Buscar por título o descripción",
    empty: "No hay documentos públicos con este filtro.",
    error: "No pudimos cargar los documentos. Intente de nuevo más tarde.",
    count: (n: number) => (n === 1 ? "1 documento" : `${n} documentos`),
    unavailable: "Sin archivo",
  },
  en: {
    search: "Search by title or description",
    empty: "No public documents match this filter.",
    error: "We could not load documents. Please try again later.",
    count: (n: number) => (n === 1 ? "1 document" : `${n} documents`),
    unavailable: "No file",
  },
} as const;

type Props = {
  locale: Locale;
  documents: AsyncData<CmsDocument[]>;
};

export function RecursosDocsCatalog({ locale, documents }: Props) {
  const t = labels[locale];
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    if (documents.status !== "ok") return [];
    const q = query.trim().toLowerCase();
    if (!q) return documents.data;
    return documents.data.filter((doc) => {
      const haystack = `${doc.title} ${doc.description} ${doc.category}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [documents, query]);

  if (documents.status === "error") {
    return (
      <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-800">
        {t.error}
      </p>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="block max-w-md flex-1">
          <span className="sr-only">{t.search}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.search}
            className="h-12 w-full rounded-lg border border-[#c5c6cd]/50 bg-[#f8f9ff] px-4 font-body text-sm text-cni-primary outline-none ring-[#32B372] focus:ring-2"
          />
        </label>
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
          {visible.map((doc, index) => {
            const openUrl = documentOpenUrl(doc);
            const meta = [
              doc.category,
              doc.file_type ? doc.file_type.toUpperCase() : null,
              doc.file_size_bytes ? formatDocumentFileSize(doc.file_size_bytes, locale) : null,
            ]
              .filter(Boolean)
              .join(" · ");
            const inner = (
              <>
                <span className="font-headline text-[11px] font-bold tracking-[0.18em] text-[#32B372] md:col-span-1">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="md:col-span-8">
                  <p className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-on-surface-variant/55">
                    {meta}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-extrabold text-cni-primary group-hover:text-[#0E7A7C] md:text-xl">
                    {doc.title}
                  </h3>
                  {doc.description ? (
                    <p className="mt-1 line-clamp-2 font-body text-sm text-[#44474d]">{doc.description}</p>
                  ) : null}
                </div>
                <span className="inline-flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-cni-primary md:col-span-3 md:justify-end">
                  {openUrl ? documentActionLabel(doc, locale) : t.unavailable}
                  {openUrl ? <ArrowUpRight className="h-4 w-4" aria-hidden /> : null}
                </span>
              </>
            );
            const className =
              "group grid grid-cols-1 gap-3 px-6 py-5 transition-colors hover:bg-white md:grid-cols-12 md:items-center md:px-8";
            return openUrl ? (
              <a
                key={doc.id}
                href={openUrl}
                target={documentLinkTarget(doc)}
                rel={documentLinkRel(doc)}
                className={className}
              >
                {inner}
              </a>
            ) : (
              <div key={doc.id} className={className}>
                {inner}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
