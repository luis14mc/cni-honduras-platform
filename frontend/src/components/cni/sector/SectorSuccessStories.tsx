import Link from "next/link";
import type { Locale } from "@/src/i18n/config";
import {
  formatSuccessStoryInvestment,
  formatSuccessStoryJobs,
  successStoryDetailHref,
} from "@/src/lib/cmsSuccessStories";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";
import type { SuccessStory } from "@/src/types/investment";
import type { AsyncData } from "@/src/lib/asyncData";
import { sectorTemplateChrome } from "@/src/data/sectorPageContent";

type Props = {
  locale: Locale;
  result: AsyncData<SuccessStory[]>;
};

export function SectorSuccessStories({ locale, result }: Props) {
  const copy = sectorTemplateChrome[locale];
  const items = result.data;
  const isError = result.status === "error";

  return (
    <section className={cn("bg-[#eff4ff]", layout.section)}>
      <div className={layout.container}>
        <header className="mb-12 md:mb-14">
          <p className={t.eyebrow}>{copy.storiesEyebrow}</p>
          <h2 className={cn("mt-3", t.h2)}>{copy.storiesTitle}</h2>
          <div className={cn("mt-4", t.sectionRule)} />
          <p className={cn("mt-6 max-w-2xl", t.lead)}>{copy.storiesLead}</p>
        </header>

        {isError ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-800">
            {copy.storiesError}
          </p>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-cni-primary/10 bg-white px-6 py-10 text-center text-sm text-[#0E7A7C]">
            {copy.storiesEmpty}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((story, index) => (
              <Link
                key={story.slug}
                href={successStoryDetailHref(locale, story.slug)}
                className="al-sector-data-card group flex flex-col rounded-xl border border-cni-primary/8 bg-white p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                {story.company_name ? (
                  <p className="al-sector-pill inline-flex w-fit items-center rounded-full px-3 py-1 font-headline text-[10px] font-bold uppercase tracking-[0.18em]">
                    {story.company_name}
                  </p>
                ) : null}
                <h3 className="mt-5 font-display text-lg font-extrabold leading-snug text-cni-primary">
                  {story.title}
                </h3>
                <p className="mt-3 line-clamp-4 flex-1 font-body text-sm leading-relaxed text-[#0E7A7C]">
                  {story.summary}
                </p>
                <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-cni-primary/8 pt-5">
                  {story.country_origin ? (
                    <div>
                      <dt className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-on-surface-variant/60">
                        {locale === "es" ? "Origen" : "Origin"}
                      </dt>
                      <dd className="mt-1 font-display text-sm font-extrabold text-cni-primary">
                        {story.country_origin}
                      </dd>
                    </div>
                  ) : null}
                  {story.investment_amount &&
                  formatSuccessStoryInvestment(locale, story.investment_amount) ? (
                    <div>
                      <dt className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-on-surface-variant/60">
                        {locale === "es" ? "Inversión" : "Investment"}
                      </dt>
                      <dd className="mt-1 font-display text-sm font-extrabold text-cni-primary">
                        {formatSuccessStoryInvestment(locale, story.investment_amount)}
                      </dd>
                    </div>
                  ) : null}
                  {story.jobs_generated !== null &&
                  formatSuccessStoryJobs(locale, story.jobs_generated) ? (
                    <div className="col-span-2">
                      <dt className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-on-surface-variant/60">
                        {locale === "es" ? "Empleos generados" : "Jobs generated"}
                      </dt>
                      <dd className="mt-1 font-display text-base font-extrabold text-cni-primary">
                        {formatSuccessStoryJobs(locale, story.jobs_generated)}
                      </dd>
                    </div>
                  ) : null}
                </dl>
                <span className="mt-4 font-headline text-[9px] font-bold uppercase tracking-[0.2em] text-cni-on-surface-variant/55">
                  {locale === "es" ? `Caso 0${index + 1}` : `Case 0${index + 1}`}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
