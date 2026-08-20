import Link from "next/link";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { BrandPageHero, brandHeroCta } from "@/src/components/cni/BrandPageHero";
import { PrensaCatalog } from "@/src/components/cni/PrensaCatalog";
import { PAGE_HEROES } from "@/src/lib/pageHeroes";
import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";
import type { AsyncData } from "@/src/lib/asyncData";
import type { NewsArticle } from "@/src/types/cms";

const copy = {
  es: {
    titleA: "Sala de",
    titleB: "prensa",
    description:
      "Noticias, comunicados y eventos oficiales del Consejo Nacional de Inversiones.",
    heroImageAlt: "Sala de prensa del CNI",
    heroCatalog: "Ver noticias",
    heroContact: "Contactar al CNI",
    catalogEyebrow: "Canal oficial",
    catalogTitle: "Noticias y comunicados",
    catalogLead:
      "Filtre por tipo. Vacío no es error: si no hay notas, el listado está en actualización.",
    ctaEyebrow: "Acompañamiento CNI",
    ctaTitle1: "Hable con el",
    ctaTitle2: "equipo CNI",
    ctaDesc: "Asesoría técnica y legal sin costo. No sustituye la decisión de inversión.",
    ctaPrimary: "Contactar al CNI",
    ctaSecondary: "Agendar reunión",
  },
  en: {
    titleA: "Press",
    titleB: "room",
    description: "Official news, communiqués and events from the National Investment Council.",
    heroImageAlt: "CNI press room",
    heroCatalog: "View news",
    heroContact: "Contact CNI",
    catalogEyebrow: "Official channel",
    catalogTitle: "News and communiqués",
    catalogLead: "Filter by type. Empty is not an error: if no items appear, the list is being updated.",
    ctaEyebrow: "CNI support",
    ctaTitle1: "Talk to the",
    ctaTitle2: "CNI team",
    ctaDesc: "Technical and legal advisory at no cost. It does not replace the investment decision.",
    ctaPrimary: "Contact CNI",
    ctaSecondary: "Schedule a meeting",
  },
} as const;

type Props = {
  locale: Locale;
  news: AsyncData<NewsArticle[]>;
};

export function PrensaPageView({ locale, news }: Props) {
  const c = copy[locale];
  const L = (path: string) => withLocale(locale, path);

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <BrandPageHero
        title={
          <>
            {c.titleA} <span className="text-[#32B372]">{c.titleB}</span>
          </>
        }
        description={c.description}
        imageSrc={PAGE_HEROES.prensa.image}
        imageAlt={c.heroImageAlt}
      >
        <a href="#catalogo" className={brandHeroCta(true)}>
          {c.heroCatalog}
        </a>
        <Link href={L("/contacto")} className={brandHeroCta(false)}>
          {c.heroContact}
        </Link>
      </BrandPageHero>

      <section id="catalogo" className={cn("bg-white", layout.section)}>
        <div className={layout.container}>
          <div className="mb-10 max-w-2xl">
            <p className={t.eyebrow}>{c.catalogEyebrow}</p>
            <h2 className={cn("mt-3", t.h2)}>{c.catalogTitle}</h2>
            <div className={cn("mt-4", t.sectionRule)} />
            <p className={cn("mt-6", t.lead)}>{c.catalogLead}</p>
          </div>
          <PrensaCatalog locale={locale} news={news} />
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#000a1e] py-24 text-white">
        <div className="site-footer-mesh pointer-events-none absolute inset-0 opacity-[0.16]" aria-hidden />
        <div className={cn("relative z-10", layout.container)}>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <p className={t.eyebrowOnDark}>{c.ctaEyebrow}</p>
              <h2 className={cn("mt-3 text-white", t.h2OnDark)}>
                {c.ctaTitle1} <span className="text-[#32B372]">{c.ctaTitle2}</span>
              </h2>
              <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-white/80">{c.ctaDesc}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href={L("/contacto")} className={brandHeroCta(true)}>
                  {c.ctaPrimary}
                </Link>
                <Link href={L("/asesoria")} className={brandHeroCta(false)}>
                  {c.ctaSecondary}
                </Link>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <MaterialIcon name="campaign" className="text-5xl text-[#32B372]" />
              <p className="mt-4 font-display text-xl font-extrabold text-white">
                {locale === "es" ? "Información institucional" : "Institutional information"}
              </p>
              <p className="mt-2 font-body text-sm leading-relaxed text-white/70">
                {locale === "es"
                  ? "Solo se publican notas del CMS. Si el listado está vacío, no hay comunicados vigentes."
                  : "Only CMS notes are published. If the list is empty, there are no current releases."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
