import Script from "next/script";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MaterialIcon } from "@/src/components/ui/MaterialIcon";
import { BrandPageHero, brandHeroCta } from "@/src/components/cni/BrandPageHero";
import { asesoriaPageCopy } from "@/src/i18n/copy/asesoriaPage";
import type { Locale } from "@/src/i18n/config";
import { withLocale } from "@/src/i18n/path";
import { designImages } from "@/src/lib/designAssets";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";

type Props = {
  locale: Locale;
};

export function AsesoriaPageView({ locale }: Props) {
  const c = asesoriaPageCopy[locale];
  const L = (path: string) => withLocale(locale, path);
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: locale === "es" ? "Inicio" : "Home", item: L("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "es" ? "Asesoría Gratuita" : "Free Advisory",
        item: L("/asesoria"),
      },
    ],
  };

  const channels = [
    {
      n: "01",
      title: c.contactOptions.whatsapp.title,
      meta: "WhatsApp",
      href: c.contactOptions.whatsapp.href,
      cta: c.contactOptions.whatsapp.cta,
      external: true,
    },
    {
      n: "02",
      title: c.contactOptions.phone.title,
      meta: c.contactOptions.phone.display,
      href: c.contactOptions.phone.href,
      cta: c.channelsCta,
      external: false,
    },
    {
      n: "03",
      title: locale === "es" ? "Correo institucional" : "Institutional email",
      meta: c.hqEmail,
      href: `mailto:${c.hqEmail}`,
      cta: c.channelsCta,
      external: false,
    },
  ];

  return (
    <div className="-mt-28 flex flex-1 flex-col bg-[#f8f9fa]">
      <Script id="breadcrumb-asesoria" type="application/ld+json">
        {JSON.stringify(breadcrumb)}
      </Script>

      <BrandPageHero
        title={
          <>
            {c.titleA} <span className="text-[#32B372]">{c.titleB}</span>
          </>
        }
        description={c.welcomeDescription}
        imageSrc={designImages.cni.heroCity}
        imageAlt={c.heroImageAlt}
      >
        <a href="#solicitud" className={brandHeroCta(true)}>
          {c.heroChannels}
        </a>
        <Link href={L("/cni")} className={brandHeroCta(false)}>
          {c.heroServices}
        </Link>
      </BrandPageHero>

      <section id="solicitud" className={cn("bg-white", layout.section)}>
        <div className={layout.container}>
          <div className="overflow-hidden rounded-2xl border border-cni-primary/10 bg-[#f8f9fa]">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:divide-x lg:divide-cni-primary/8">
              <div className="border-b border-cni-primary/8 bg-white p-7 md:p-8 lg:border-b-0">
                <p className={t.eyebrow}>{c.formEyebrow}</p>
                <h2 className={cn("mt-4", t.h3)}>{c.formSectionTitle}</h2>
                <p className="mt-3 font-body text-sm leading-relaxed text-[#44474d] md:text-base">
                  {c.formSectionDescription}
                </p>
              </div>

              <form action="#" method="post" className="space-y-6 bg-white p-7 md:p-8 lg:p-10" aria-label={c.formTitle}>
                <div>
                  <h3 className={t.h3Card}>{c.formTitle}</h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-[#44474d]">{c.formDescription}</p>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field id="nombre" label={c.labels.name} required />
                  <Field id="empresa" label={c.labels.org} />
                  <Field id="correo" label={c.labels.email} type="email" required />
                  <Field id="telefono" label={c.labels.phone} type="tel" />
                </div>

                <div>
                  <label
                    htmlFor="sector"
                    className="mb-2 block font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-primary/70"
                  >
                    {c.sectorInterest}
                  </label>
                  <select
                    id="sector"
                    name="sector"
                    required
                    className="w-full rounded-lg border border-cni-primary/10 bg-[#f8f9fa] px-4 py-3 font-body text-sm text-cni-primary focus:border-[#32B372] focus:outline-none focus:ring-2 focus:ring-[#32B372]/25"
                  >
                    <option value="">—</option>
                    {c.sectors.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="mensaje"
                    className="mb-2 block font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-primary/70"
                  >
                    {c.labels.message}
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows={5}
                    required
                    placeholder={c.messagePlaceholder}
                    className="w-full rounded-lg border border-cni-primary/10 bg-[#f8f9fa] px-4 py-3 font-body text-sm text-cni-primary focus:border-[#32B372] focus:outline-none focus:ring-2 focus:ring-[#32B372]/25"
                  />
                </div>

                <p className="rounded-lg border border-cni-primary/8 bg-[#f8f9fa] px-4 py-3 font-body text-xs leading-relaxed text-[#74777f]">
                  {c.privacyNote}
                </p>

                <button
                  type="submit"
                  className="rounded bg-[#32B372] px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#000a1e]"
                >
                  {c.submit}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className={cn("bg-[#f3f4f5]", layout.section)}>
        <div className={layout.container}>
          <p className={t.eyebrow}>{c.pillarsEyebrow}</p>
          <h2 className={cn("mt-3", t.h2)}>{c.pillarsTitle}</h2>
          <div className={cn("mt-4", t.sectionRule)} />
          <p className={cn("mt-6 max-w-2xl", t.lead)}>{c.pillarsLead}</p>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {c.pillars.map((pillar) => (
              <Link
                key={pillar.href}
                href={L(pillar.href)}
                className="group flex h-full flex-col rounded-xl border border-[#c5c6cd]/30 bg-white p-8 transition hover:-translate-y-1"
              >
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#32B372]/10 text-[#32B372]">
                  <MaterialIcon name={pillar.icon} className="text-[22px]" />
                </span>
                <h3 className={t.h3Card}>{pillar.title}</h3>
                <p className="mt-3 flex-1 font-body text-sm leading-relaxed text-[#44474d]">{pillar.text}</p>
                <span className="mt-6 font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-[#32B372]">
                  {c.explore}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="canales" className={cn("bg-white", layout.section)}>
        <div className={layout.container}>
          <div className="mb-10 max-w-2xl">
            <p className={t.eyebrow}>{c.channelsEyebrow}</p>
            <h2 className={cn("mt-3", t.h2)}>{c.channelsTitle}</h2>
            <div className={cn("mt-4", t.sectionRule)} />
            <p className={cn("mt-6", t.lead)}>{c.channelsLead}</p>
          </div>
          <div className="divide-y divide-cni-primary/10 overflow-hidden rounded-2xl border border-cni-primary/10 bg-[#f8f9ff]">
            {channels.map((channel) => (
              <a
                key={channel.n}
                href={channel.href}
                target={channel.external ? "_blank" : undefined}
                rel={channel.external ? "noopener noreferrer" : undefined}
                className="group grid grid-cols-1 gap-3 px-6 py-5 transition-colors hover:bg-white md:grid-cols-12 md:items-center md:px-8"
              >
                <span className="font-headline text-[11px] font-bold tracking-[0.18em] text-[#32B372] md:col-span-1">
                  {channel.n}
                </span>
                <div className="md:col-span-8">
                  <p className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-on-surface-variant/55">
                    {channel.meta}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-extrabold text-cni-primary group-hover:text-[#0E7A7C] md:text-xl">
                    {channel.title}
                  </h3>
                </div>
                <span className="inline-flex items-center gap-2 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-cni-primary md:col-span-3 md:justify-end">
                  {channel.cta}
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className={cn("bg-[#f3f4f5]", layout.section)}>
        <div className={layout.container}>
          <p className={t.eyebrow}>{c.officesEyebrow}</p>
          <h2 className={cn("mt-3", t.h2)}>{c.officesTitle}</h2>
          <div className={cn("mt-4", t.sectionRule)} />
          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <article className="rounded-xl border border-[#c5c6cd]/30 bg-[#f8f9fa] p-8">
              <h3 className={t.h3Card}>{c.hqTitle}</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-[#44474d]">{c.hqAddress}</p>
              <a href={c.contactOptions.phone.href} className="mt-4 block font-body text-sm text-[#32B372]">
                {c.hqPhone}
              </a>
              <a href={`mailto:${c.hqEmail}`} className="mt-1 block font-body text-sm text-[#32B372]">
                {c.hqEmail}
              </a>
            </article>
            <article className="rounded-xl border border-[#c5c6cd]/30 bg-[#f8f9fa] p-8">
              <h3 className={t.h3Card}>{c.spsTitle}</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-[#44474d]">{c.spsBody}</p>
              <a href="tel:+50425616100" className="mt-4 block font-body text-sm text-[#32B372]">
                {c.spsPhone}
              </a>
              <a href={`mailto:${c.spsEmail}`} className="mt-1 block font-body text-sm text-[#32B372]">
                {c.spsEmail}
              </a>
            </article>
          </div>
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
                <a href={`mailto:${c.hqEmail}`} className={brandHeroCta(true)}>
                  {c.ctaPrimary}
                </a>
                <a
                  href={c.contactOptions.whatsapp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={brandHeroCta(false)}
                >
                  {c.ctaSecondary}
                </a>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <MaterialIcon name="verified_user" className="text-5xl text-[#32B372]" />
              <p className="mt-4 font-display text-xl font-extrabold text-white">
                {locale === "es" ? "Asesoría sin costo" : "No-cost advisory"}
              </p>
              <p className="mt-2 font-body text-sm leading-relaxed text-white/70">
                {c.contactOptions.visit.address}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  required = false,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-cni-primary/70"
      >
        {label}
        {required ? <span className="ml-1 text-[#32B372]">*</span> : null}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        className="w-full rounded-lg border border-cni-primary/10 bg-[#f8f9fa] px-4 py-3 font-body text-sm text-cni-primary focus:border-[#32B372] focus:outline-none focus:ring-2 focus:ring-[#32B372]/25"
      />
    </div>
  );
}
