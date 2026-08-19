import Link from "next/link";
import { BrandPageHero, brandHeroCta } from "@/src/components/cni/BrandPageHero";
import { RecursosDocsCatalog } from "@/src/components/cni/RecursosDocsCatalog";
import { documentCoverFallback } from "@/src/lib/cmsDocuments";
import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";
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

export function ResourcesCategoryView({
  locale,
  category,
  documents,
  loadStatus = "ok",
}: Props) {
  const ui = resourceCategoryUi[locale];
  const L = (path: string) => withLocale(locale, path);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <BrandPageHero
        kicker={
          <Link
            href={L("/recursos")}
            className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-white/70 transition hover:text-white"
          >
            ← {ui.backToList}
          </Link>
        }
        title={category.title[locale]}
        description={category.description[locale]}
        imageSrc={documentCoverFallback()}
        imageAlt={category.heroAlt[locale]}
      >
        <a href="#directorio" className={brandHeroCta(true)}>
          {locale === "es" ? "Ver directorio" : "View directory"}
        </a>
        <Link href={L("/contacto")} className={brandHeroCta(false)}>
          {locale === "es" ? "Contactar al CNI" : "Contact CNI"}
        </Link>
      </BrandPageHero>

      <section id="directorio" className={cn("bg-white", layout.section)}>
        <div className={layout.container}>
          <p className={t.eyebrow}>{ui.directoryEyebrow}</p>
          <h2 className={cn("mt-3", t.h2)}>{category.directoryTitle[locale]}</h2>
          <div className={cn("mt-4", t.sectionRule)} />
          <p className={cn("mt-6 max-w-2xl", t.lead)}>
            {locale === "es"
              ? "Filtre por título. Vacío no es error: si no hay documentos, la categoría está en actualización."
              : "Filter by title. Empty is not an error: if no documents appear, the category is being updated."}
          </p>
          <div className="mt-10">
            <RecursosDocsCatalog
              locale={locale}
              documents={{ status: loadStatus, data: documents }}
            />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#000a1e] py-24 text-white">
        <div className="site-footer-mesh pointer-events-none absolute inset-0 opacity-[0.16]" aria-hidden />
        <div className={cn("relative z-10", layout.container)}>
          <p className={t.eyebrowOnDark}>
            {locale === "es" ? "Acompañamiento CNI" : "CNI support"}
          </p>
          <h2 className={cn("mt-3 max-w-3xl text-white", t.h2OnDark)}>{ui.helpTitle}</h2>
          <p className="mt-6 max-w-xl font-body text-lg text-white/80">{ui.helpText}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={L("/asesoria")} className={brandHeroCta(true)}>
              {ui.helpPrimary}
            </Link>
            <Link href={L("/recursos")} className={brandHeroCta(false)}>
              {ui.helpSecondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
