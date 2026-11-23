"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { ResourceDownloadAction } from "@/src/components/cni/ResourceDownloadAction";
import type { Locale } from "@/src/i18n/config";
import {
  documentActionLabel,
  documentOpenUrl,
  formatDocumentDate,
  formatDocumentFileSize,
} from "@/src/lib/cmsDocuments";
import { getSectorBySlug, type SectorSlug } from "@/src/data/investmentSectors";
import type { AsyncData } from "@/src/lib/asyncData";
import type { CmsDocument } from "@/src/types/cms";

const labels = {
  es: {
    search: "Buscar por título o descripción", type: "Tipo", sector: "Sector", language: "Idioma",
    all: "Todos", clear: "Limpiar filtros", es: "Español", en: "Inglés",
    empty: "No hay documentos publicados en esta categoría.",
    noMatch: "No hay documentos con estos filtros.",
    error: "No pudimos cargar los documentos. Intente de nuevo más tarde.",
    count: (n: number) => n === 1 ? "1 documento" : `${n} documentos`,
    unavailable: "Sin archivo",
    kinds: {
      project_sheet: "Ficha de proyecto", opportunity_card: "Ficha de oportunidad",
      sector_portfolio: "Portafolio sectorial", opportunity_portfolio: "Portafolio de oportunidades",
      general: "Documento general",
    },
  },
  en: {
    search: "Search by title or description", type: "Type", sector: "Sector", language: "Language",
    all: "All", clear: "Clear filters", es: "Spanish", en: "English",
    empty: "There are no published documents in this category yet.",
    noMatch: "No documents match these filters.",
    error: "We could not load documents. Please try again later.",
    count: (n: number) => n === 1 ? "1 document" : `${n} documents`,
    unavailable: "No file",
    kinds: {
      project_sheet: "Project sheet", opportunity_card: "Opportunity card",
      sector_portfolio: "Sector portfolio", opportunity_portfolio: "Opportunity portfolio",
      general: "General document",
    },
  },
} as const;

const selectClass = "mt-1.5 h-12 w-full rounded-lg border border-cni-primary/25 bg-white px-3 text-sm text-cni-primary focus-visible:outline-2 focus-visible:outline-[#168654]";
const actionClass = "inline-flex items-center justify-center gap-2 self-start rounded-lg border border-[#334e88]/25 bg-white px-4 py-2.5 text-sm font-bold text-cni-primary hover:border-[#168654] hover:text-[#0e7a7c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#168654]";

function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function RecursosDocsCatalog({ locale, documents }: { locale: Locale; documents: AsyncData<CmsDocument[]> }) {
  const t = labels[locale];
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [sector, setSector] = useState("");
  const [language, setLanguage] = useState("");
  const rows = documents.data;
  const kinds = [...new Set(rows.map((doc) => doc.document_type ?? "general"))].sort();
  const sectors = [...new Set(rows.flatMap((doc) => doc.sector ? [doc.sector] : []))].sort();
  const languages = [...new Set(rows.flatMap((doc) => doc.language ? [doc.language] : []))].sort();
  const search = normalize(query.trim());
  const visible = rows.filter((doc) =>
    (!type || (doc.document_type ?? "general") === type) &&
    (!sector || doc.sector === sector) &&
    (!language || doc.language === language) &&
    (!search || normalize(`${doc.title} ${doc.description}`).includes(search)),
  );

  if (documents.status === "error") {
    return <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-800">{t.error}</p>;
  }
  if (!rows.length) {
    return <p className="rounded-xl border border-dashed border-cni-primary/20 bg-[#f8f9ff] px-6 py-12 text-center text-sm">{t.empty}</p>;
  }

  return (
    <div>
      <div className="grid gap-4 rounded-xl border border-cni-primary/10 bg-[#f8f9ff] p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:p-6">
        <label className="text-sm font-semibold">
          {t.search}
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className={selectClass} />
        </label>
        <label className="text-sm font-semibold">
          {t.type}
          <select value={type} onChange={(event) => setType(event.target.value)} className={selectClass}>
            <option value="">{t.all}</option>
            {kinds.map((kind) => <option key={kind} value={kind}>{t.kinds[kind]}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold">
          {t.sector}
          <select value={sector} onChange={(event) => setSector(event.target.value)} className={selectClass}>
            <option value="">{t.all}</option>
            {sectors.map((slug) => <option key={slug} value={slug}>{getSectorBySlug(locale, slug as SectorSlug)?.name ?? slug}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold">
          {t.language}
          <select value={language} onChange={(event) => setLanguage(event.target.value)} className={selectClass}>
            <option value="">{t.all}</option>
            {languages.map((lang) => <option key={lang} value={lang}>{t[lang]}</option>)}
          </select>
        </label>
      </div>
      <div className="flex items-center justify-between py-4 text-sm">
        <p role="status">{t.count(visible.length)}</p>
        {query || type || sector || language ? (
          <button type="button" className="font-semibold text-[#0e7a7c] underline underline-offset-4" onClick={() => {
            setQuery(""); setType(""); setSector(""); setLanguage("");
          }}>
            {t.clear}
          </button>
        ) : null}
      </div>
      {!visible.length ? (
        <p className="rounded-xl border border-dashed border-cni-primary/20 bg-[#f8f9ff] px-6 py-12 text-center text-sm">{t.noMatch}</p>
      ) : (
        <ul className="divide-y divide-cni-primary/10 rounded-2xl border border-cni-primary/10 bg-[#f8f9ff]">
          {visible.map((doc) => {
            const meta = [
              t.kinds[doc.document_type ?? "general"],
              doc.language ? t[doc.language] : null,
              doc.published_at && Number.isFinite(Date.parse(doc.published_at)) ? formatDocumentDate(locale, doc.published_at) : null,
              doc.file_type?.toUpperCase(),
              doc.file_size_bytes ? formatDocumentFileSize(doc.file_size_bytes, locale) : null,
            ].filter(Boolean).join(" · ");
            return (
              <li key={`${doc.strapi_locale ?? doc.language}-${doc.id}`} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
                <div className="min-w-0">
                  <p className="font-headline text-xs font-semibold text-[#44474d]">{meta}</p>
                  <h3 className="mt-1 font-display text-lg font-extrabold text-cni-primary">{doc.title}</h3>
                  {doc.description && <p className="mt-1 text-sm text-[#44474d]">{doc.description}</p>}
                </div>
                {doc.access === "gated" || documentOpenUrl(doc) ? (
                  <ResourceDownloadAction document={doc} locale={locale} label={documentActionLabel(doc, locale)}
                    className={actionClass} icon={<ArrowUpRight className="h-4 w-4" aria-hidden />} />
                ) : <p className="text-sm text-[#44474d]">{t.unavailable}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
