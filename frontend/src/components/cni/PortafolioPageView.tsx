import Link from "next/link";
import { ArrowRight, FileText, PanelsTopLeft } from "lucide-react";
import { PageHero } from "@/src/components/cni/PageHero";
import { designImages } from "@/src/lib/designAssets";
import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";

const copy = {
  es: {
    title: "PORTAFOLIO DE INVERSIONES",
    description: "Explore las oportunidades de inversión de Honduras organizadas por tipo y sector.",
    eyebrow: "Inversión en Honduras",
    sectionTitle: "Explore el portafolio",
    sectionDescription: "Seleccione el tipo de recurso que desea consultar.",
    cards: [
      {
        title: "Fichas de Proyectos",
        description: "Consulte las fichas de proyectos organizadas por sector de inversión.",
        cta: "Ver fichas de proyectos",
        href: "/portafolio/fichas-proyectos",
        icon: FileText,
      },
      {
        title: "Opportunity Cards",
        description: "Explore las tarjetas de oportunidades organizadas por sector de inversión.",
        cta: "Ver Opportunity Cards",
        href: "/portafolio/opportunity-cards",
        icon: PanelsTopLeft,
      },
    ],
  },
  en: {
    title: "INVESTMENT PORTFOLIO",
    description: "Explore investment opportunities in Honduras organized by type and sector.",
    eyebrow: "Investment in Honduras",
    sectionTitle: "Explore the portfolio",
    sectionDescription: "Select the type of resource you want to view.",
    cards: [
      {
        title: "Project Sheets",
        description: "View project sheets organized by investment sector.",
        cta: "View project sheets",
        href: "/portafolio/fichas-proyectos",
        icon: FileText,
      },
      {
        title: "Opportunity Cards",
        description: "Explore opportunity cards organized by investment sector.",
        cta: "View Opportunity Cards",
        href: "/portafolio/opportunity-cards",
        icon: PanelsTopLeft,
      },
    ],
  },
} as const;

export function PortafolioPageView({ locale }: { locale: Locale }) {
  const c = copy[locale];

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <PageHero
        eyebrow={c.eyebrow}
        title={c.title}
        description={c.description}
        imageSrc={designImages.portfolio.hero}
        imageAlt=""
        heightClass="min-h-[560px] pt-28 md:min-h-[680px]"
        imageClassName="absolute inset-0 object-cover opacity-45"
        overlayClassName="bg-gradient-to-r from-[#000a1e]/90 via-[#000a1e]/65 to-[#000a1e]/25"
      />

      <section className={cn("bg-white", layout.section)} aria-labelledby="portfolio-options-title">
        <div className={layout.container}>
          <div className="max-w-2xl">
            <h2 id="portfolio-options-title" className={t.h2}>{c.sectionTitle}</h2>
            <div className={cn("mt-4", t.sectionRule)} />
            <p className={cn("mt-6", t.lead)}>{c.sectionDescription}</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {c.cards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.href}
                  href={withLocale(locale, card.href)}
                  className="group flex min-h-72 flex-col rounded-xl border border-cni-primary/10 bg-[#f8f9ff] p-7 shadow-sm transition hover:-translate-y-1 hover:border-[#32B372]/40 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#32B372] sm:p-9"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-cni-primary text-white" aria-hidden>
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className={cn("mt-7", t.h3)}>{card.title}</h3>
                  <p className="mt-4 flex-1 font-body text-base leading-relaxed text-cni-primary/70">{card.description}</p>
                  <span className="mt-8 inline-flex items-center gap-2 font-headline text-xs font-bold uppercase tracking-[0.16em] text-[#168654]">
                    {card.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
