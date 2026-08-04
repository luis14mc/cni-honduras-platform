import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/src/i18n/config";
import { resolveHref } from "@/src/i18n/path";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { designImages } from "@/src/lib/designAssets";
import {
  resourceCategoryUi,
  type ResourceCategoryMeta,
} from "@/src/data/resourceCategoryMeta";
import type { CmsDocument } from "@/src/types/cms";

type Props = {
  locale: Locale;
  category: ResourceCategoryMeta;
  documents: CmsDocument[];
  loadStatus?: "ok" | "error";
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResourcesCategoryView({
  locale,
  category,
  documents,
  loadStatus = "ok",
}: Props) {
  const ui = resourceCategoryUi[locale];
  const L = (p: string) => resolveHref(locale, p);
  const featured = documents.filter((doc) => doc.is_featured);
  const regular = documents.filter((doc) => !doc.is_featured);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9ff]">
      <header className="relative flex h-[60vh] min-h-[400px] items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={designImages.resourcesDetail.hero}
            alt={category.heroAlt[locale]}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#252A58] via-[#252A58]/80 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-8 lg:px-12">
          <Link
            href={L("/recursos")}
            className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#35A963] hover:text-white"
          >
            <MaterialIcon name="arrow_back" className="text-sm" />
            {ui.backToList}
          </Link>
          <div className="max-w-2xl">
            <span className="mb-4 inline-block text-xs font-bold uppercase tracking-[0.28em] text-[#35A963]/90">
              {ui.eyebrow}
            </span>
            <div className="mb-8 h-1 w-20 bg-[#35A963]" />
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white md:text-6xl">
              {category.title[locale]}
            </h1>
            <p className="max-w-xl text-xl leading-relaxed text-white/80">
              {category.description[locale]}
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-8 py-24 lg:px-12">
        <div className="mb-16 flex flex-col items-end justify-between gap-8 md:flex-row">
          <div className="space-y-4">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#0E7A7C]">
              {ui.directoryEyebrow}
            </span>
            <h2 className="text-4xl font-bold text-[#252A58]">
              {category.directoryTitle[locale]}
            </h2>
          </div>
        </div>

        {loadStatus === "error" ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-white p-10 text-center text-lg text-red-800 shadow-sm"
          >
            {ui.error}
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center text-lg text-[#0E7A7C] shadow-sm">
            {ui.empty}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...featured, ...regular].map((doc) => (
              <article
                key={doc.id}
                className={`group flex flex-col justify-between rounded-xl bg-white p-8 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,10,30,0.06)] ${doc.is_featured ? "border-t-4 border-[#35A963]" : ""}`}
              >
                <div>
                  <div
                    className={`mb-6 overflow-hidden rounded-lg ${doc.is_featured ? "bg-[#0E7A7C]" : "bg-[#24436B]"}`}
                  >
                    {doc.cover_image?.file ? (
                      <img
                        src={doc.cover_image.file}
                        alt={doc.cover_image.alt_text || doc.title}
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center text-[#35A963]">
                        <MaterialIcon name="description" filled className="text-5xl" />
                      </div>
                    )}
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-[#252A58]">{doc.title}</h3>
                  <p className="mb-4 leading-relaxed text-[#0E7A7C]">{doc.description}</p>
                  {doc.file_type && (
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#b6c2d3]">
                      {doc.file_type.toUpperCase()}
                      {doc.file_size_bytes ? ` · ${formatFileSize(doc.file_size_bytes)}` : ""}
                    </p>
                  )}
                </div>
                <div className="mt-8 flex gap-4">
                  <a
                    href={doc.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center rounded-lg bg-[#252A58] py-3 text-sm font-bold text-white transition-transform active:scale-95"
                  >
                    {ui.download}
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#e5eeff] px-8 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#252A58]">
            <MaterialIcon name="support_agent" className="text-4xl text-[#35A963]" />
          </div>
          <h2 className="mb-6 text-4xl font-bold text-[#252A58]">{ui.helpTitle}</h2>
          <p className="mb-10 text-xl leading-relaxed text-[#0E7A7C]">{ui.helpText}</p>
          <div className="flex flex-col justify-center gap-6 sm:flex-row">
            <Link
              href={L("/asesoria")}
              className="rounded-lg bg-[#252A58] px-10 py-4 text-lg font-bold text-white shadow-xl shadow-[#252A58]/20 transition-all hover:-translate-y-1"
            >
              {ui.helpPrimary}
            </Link>
            <Link
              href={L("/recursos")}
              className="rounded-lg border border-[#dce9ff]/30 bg-white px-10 py-4 text-lg font-bold text-[#252A58] transition-all hover:bg-[#f8f9ff]"
            >
              {ui.helpSecondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
