import Image from "next/image";
import Script from "next/script";
import { Download, ExternalLink, FileText, ScrollText } from "lucide-react";
import { InstagramEmbeds } from "@/src/components/cni/InstagramEmbeds";
import { InvestorEntryMap } from "@/src/components/cni/InvestorEntryMap";
import { MigratoryFacilitiesHero } from "@/src/components/cni/MigratoryFacilitiesHero";
import { Section, SectionHeader } from "@/src/components/cni/Section";
import type { Locale } from "@/src/i18n/config";
import {
  MIGRATORY_DOCUMENTS,
  MIGRATORY_SOCIAL_POSTS,
  facilidadesMigratoriasPageCopy,
  migratoryDocumentHref,
} from "@/src/i18n/copy/facilidadesMigratoriasPage";
import { resolveHref } from "@/src/i18n/path";

const DOC_ICONS = {
  solicitud: FileText,
  acta: ScrollText,
  comunicado: FileText,
} as const;

type Props = {
  locale: Locale;
};

export function FacilidadesMigratoriasPageView({ locale }: Props) {
  const c = facilidadesMigratoriasPageCopy[locale];
  const L = (path: string) => resolveHref(locale, path);

  const socialPosts = MIGRATORY_SOCIAL_POSTS.map((post) => ({
    href: post.href,
    officialLabel: locale === "es" ? "Publicación oficial" : "Official post",
    title: post.label[locale],
  }));

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: locale === "es" ? "Inicio" : "Home", item: L("/") },
      { "@type": "ListItem", position: 2, name: c.heroTitle, item: L("/facilidades-migratorias") },
    ],
  };

  return (
    <div className="flex flex-1 flex-col bg-[#f8f9ff]">
      <Script id="breadcrumb-facilidades-migratorias" type="application/ld+json">
        {JSON.stringify(breadcrumb)}
      </Script>

      <MigratoryFacilitiesHero title={c.heroTitle} description={c.heroDescription} />

      <Section tone="surface" id="recursos-migratorios">
        <SectionHeader
          eyebrow={c.documentsEyebrow}
          title={c.documentsTitle}
          description={c.documentsDescription}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {c.documents.map((doc) => {
            const Icon = DOC_ICONS[doc.id];
            const href = migratoryDocumentHref(doc.id);
            return (
              <article
                key={doc.id}
                className="group flex h-full flex-col rounded-2xl border border-cni-primary/10 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-[#29AB85]/30 hover:shadow-lg hover:shadow-cni-primary/5"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f8f9ff] text-[#0E7A7C] ring-1 ring-cni-primary/8">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="font-display text-xl font-extrabold text-cni-primary">{doc.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-cni-primary/70">{doc.description}</p>
                <ul className="mt-5 space-y-2 border-t border-cni-primary/8 pt-5">
                  {doc.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2 text-sm text-cni-primary/75">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#29AB85]" aria-hidden />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.14em] text-cni-primary transition-colors group-hover:text-[#29AB85]"
                >
                  {doc.cta}
                  <Download className="h-3.5 w-3.5" aria-hidden />
                </a>
              </article>
            );
          })}
        </div>

        <aside className="mt-8 rounded-2xl border border-[#29AB85]/25 bg-[#29AB85]/8 p-6 md:p-7">
          <h3 className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-[#0E7A7C]">
            {c.importantNoteTitle}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-cni-primary/80 md:text-base">{c.importantNote}</p>
        </aside>
      </Section>

      <Section tone="white" id="comunicado-oficial">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
          <div>
            <p className="font-headline text-[10px] font-bold uppercase tracking-[0.22em] text-[#29AB85]">
              {c.updateEyebrow}
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-tight text-cni-primary">
              {c.updateTitle}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-cni-primary/70 md:text-base">{c.updateDescription}</p>

            <div className="mt-6 rounded-xl border border-cni-primary/10 bg-[#f8f9ff] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cni-primary text-white">
                  <Image
                    src="/home_index/imagenes/despacho_logo.png"
                    alt=""
                    width={28}
                    height={36}
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <div>
                  <p className="font-headline text-sm font-extrabold uppercase tracking-wide text-cni-primary">
                    {c.updateDocTitle}
                  </p>
                  <p className="mt-1 text-xs text-cni-primary/60">{c.updateDocMeta}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={MIGRATORY_DOCUMENTS.comunicado}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-cni-primary px-5 py-2.5 font-headline text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#29AB85]"
                >
                  {c.openPdf}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
                <a
                  href={MIGRATORY_DOCUMENTS.comunicado}
                  download
                  className="inline-flex items-center gap-2 rounded-md border border-cni-primary/15 px-5 py-2.5 font-headline text-[10px] font-bold uppercase tracking-[0.14em] text-cni-primary transition hover:border-[#29AB85] hover:text-[#29AB85]"
                >
                  {c.downloadPdf}
                  <Download className="h-3.5 w-3.5" aria-hidden />
                </a>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-cni-primary/10 bg-white shadow-sm">
            <iframe
              title={c.updateDocTitle}
              src={`${MIGRATORY_DOCUMENTS.comunicado}#toolbar=1&navpanes=0`}
              className="h-[min(70vh,720px)] w-full bg-white"
            />
            <p className="border-t border-cni-primary/8 px-4 py-3 text-xs text-cni-primary/60">
              {c.pdfFallback}{" "}
              <a
                href={MIGRATORY_DOCUMENTS.comunicado}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#0E7A7C] underline-offset-2 hover:underline"
              >
                {c.openPdf}
              </a>
            </p>
          </div>
        </div>
      </Section>

      <Section tone="low">
        <SectionHeader eyebrow={c.infoEyebrow} title={c.infoTitle} description={c.infoDescription} />
        <div className="space-y-4">
          {c.infoItems.map((item, index) => (
            <article
              key={item.title}
              className="grid grid-cols-1 gap-4 rounded-2xl border border-cni-primary/8 bg-white p-6 md:grid-cols-[4rem_minmax(0,1fr)] md:gap-6 md:p-7"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cni-primary font-display text-lg font-extrabold text-[#29AB85] md:h-14 md:w-14 md:text-xl">
                {index + 1}
              </div>
              <div>
                <h3 className="font-display text-xl font-extrabold text-cni-primary">{item.title}</h3>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-cni-primary/75 md:text-base">
                  {item.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {item.bullets ? (
                  <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2 text-sm text-cni-primary/75">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#29AB85]" aria-hidden />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="white">
        <InvestorEntryMap locale={locale} />
      </Section>

      <Section tone="surface">
        <SectionHeader eyebrow={c.socialEyebrow} title={c.socialTitle} description={c.socialDescription} />
        <InstagramEmbeds
          posts={socialPosts}
          moreHref="https://www.instagram.com/promocionhn/"
          moreLabel={c.socialMore}
        />
      </Section>
    </div>
  );
}
