import Link from "next/link";
import { TrendingUp } from "lucide-react";
import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";
import type { InvestmentOpportunity } from "@/src/types/investment";
import type { AsyncData } from "@/src/lib/asyncData";
import { sectorTemplateChrome } from "@/src/data/sectorPageContent";

type Props = {
  locale: Locale;
  result: AsyncData<InvestmentOpportunity[]>;
};

export function SectorOpportunities({ locale, result }: Props) {
  const copy = sectorTemplateChrome[locale];
  const items = result.data;
  const isError = result.status === "error";

  return (
    <section className={cn("bg-white", layout.section)}>
      <div className={layout.container}>
        <header className="mb-12 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className={t.eyebrow}>{copy.opportunitiesEyebrow}</p>
            <h2 className={cn("mt-3", t.h2)}>{copy.opportunitiesTitle}</h2>
            <div className={cn("mt-4", t.sectionRule)} />
            <p className={cn("mt-6", t.lead)}>{copy.opportunitiesLead}</p>
          </div>
          {!isError && items.length > 0 ? (
            <span className="al-sector-pill inline-flex items-center gap-2 self-start rounded-full px-4 py-2 font-headline text-[10px] font-bold uppercase tracking-[0.18em] md:self-end">
              <TrendingUp className="h-3.5 w-3.5" aria-hidden />
              {items.length}
            </span>
          ) : null}
        </header>

        {isError ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-800">
            {copy.opportunitiesError}
          </p>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-cni-primary/10 bg-[#f8f9ff] px-6 py-10 text-center text-sm text-[#0E7A7C]">
            {copy.opportunitiesEmpty}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((opportunity, index) => (
              <Link
                key={opportunity.slug}
                href={withLocale(locale, `/crecer/oportunidades/${opportunity.slug}`)}
                className="al-sector-data-card group flex flex-col rounded-xl border border-cni-primary/8 bg-[#f8f9ff] p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <span className="al-sector-pill inline-flex items-center rounded-full px-3 py-1 font-headline text-[10px] font-bold uppercase tracking-[0.18em]">
                    {opportunity.code || opportunity.status}
                  </span>
                  <span className="font-headline text-[9px] font-bold uppercase tracking-[0.2em] text-cni-on-surface-variant/55">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-extrabold leading-snug text-cni-primary">
                  {opportunity.title}
                </h3>
                <p className="mt-3 line-clamp-4 flex-1 font-body text-sm leading-relaxed text-[#0E7A7C]">
                  {opportunity.summary || opportunity.description}
                </p>
                <span className="mt-6 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-cni-primary">
                  {copy.opportunitiesCta}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
