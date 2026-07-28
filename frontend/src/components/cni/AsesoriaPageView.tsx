import Script from "next/script";
import { Mail, MapPin, MessageCircle, Phone, Send, ClipboardList } from "lucide-react";
import type { Locale } from "@/src/i18n/config";
import { asesoriaPageCopy } from "@/src/i18n/copy/asesoriaPage";
import { resolveHref } from "@/src/i18n/path";

type Props = {
  locale: Locale;
};

export function AsesoriaPageView({ locale }: Props) {
  const c = asesoriaPageCopy[locale];
  const L = (path: string) => resolveHref(locale, path);

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

  return (
    <div className="flex flex-1 flex-col bg-[#f8f9ff]">
      <Script id="breadcrumb-asesoria" type="application/ld+json">
        {JSON.stringify(breadcrumb)}
      </Script>

      <section className="border-b border-cni-primary/8 bg-white py-14 md:py-16">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
          <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-cni-primary md:text-4xl lg:text-[2.75rem]">
            {c.welcomeTitlePrefix}{" "}
            <span className="text-[#29AB85]">{c.welcomeTitleHighlight}</span>
            {c.welcomeTitleSuffix ? ` ${c.welcomeTitleSuffix}` : ""}
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-cni-primary/70 md:text-lg">
            {c.welcomeDescription}
          </p>
        </div>
      </section>

      <section className="py-14 md:py-16">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
          <div className="overflow-hidden rounded-2xl border border-cni-primary/10 bg-white shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:divide-x lg:divide-cni-primary/8">
              <div className="border-b border-cni-primary/8 bg-[#f8f9ff] p-7 md:p-8 lg:border-b-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cni-primary text-[#29AB85]">
                  <ClipboardList className="h-5 w-5" aria-hidden />
                </div>
                <h2 className="mt-5 font-display text-xl font-extrabold leading-snug text-cni-primary md:text-2xl">
                  {c.formSectionTitle}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-cni-primary/70 md:text-base">
                  {c.formSectionDescription}
                </p>
              </div>

              <form action="#" method="post" className="space-y-6 p-7 md:p-8 lg:p-10" aria-label={c.formTitle}>
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
                    className="w-full rounded-lg border border-cni-primary/10 bg-[#f8f9ff] px-4 py-3 text-sm text-cni-primary focus:border-[#29AB85] focus:outline-none focus:ring-2 focus:ring-[#29AB85]/25"
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
                    className="w-full rounded-lg border border-cni-primary/10 bg-[#f8f9ff] px-4 py-3 text-sm text-cni-primary focus:border-[#29AB85] focus:outline-none focus:ring-2 focus:ring-[#29AB85]/25"
                  />
                </div>

                <p className="rounded-lg border border-cni-primary/8 bg-[#f8f9ff] px-4 py-3 text-xs leading-relaxed text-cni-primary/65">
                  {c.privacyNote}
                </p>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-cni-primary px-8 py-3.5 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#29AB85]"
                >
                  {c.submit}
                  <Send className="h-4 w-4" aria-hidden />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-cni-primary/8 bg-white py-14 md:py-16">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
          <h2 className="text-center font-display text-2xl font-extrabold uppercase tracking-tight text-cni-primary md:text-3xl">
            {c.contactOptionsTitle}
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 bg-cni-gold" />

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            <ContactOptionCard
              icon={<MessageCircle className="h-6 w-6" />}
              title={c.contactOptions.whatsapp.title}
              href={c.contactOptions.whatsapp.href}
              external
              action={c.contactOptions.whatsapp.cta}
              accent="#25D366"
            />
            <ContactOptionCard
              icon={<Phone className="h-6 w-6" />}
              title={c.contactOptions.phone.title}
              href={c.contactOptions.phone.href}
              action={c.contactOptions.phone.display}
              accent="#29AB85"
            />
            <ContactOptionCard
              icon={<MapPin className="h-6 w-6" />}
              title={c.contactOptions.visit.title}
              description={c.contactOptions.visit.address}
              accent="#24436B"
            />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <aside className="rounded-2xl bg-cni-primary p-7 text-white md:p-8">
              <h3 className="font-display text-xl font-extrabold">{c.hqTitle}</h3>
              <ul className="mt-5 space-y-4 text-sm text-white/80">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#29AB85]" aria-hidden />
                  {c.hqAddress}
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#29AB85]" aria-hidden />
                  <a href={c.contactOptions.phone.href} className="hover:text-white">
                    {c.hqPhone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#29AB85]" aria-hidden />
                  <a href={`mailto:${c.hqEmail}`} className="hover:text-white">
                    {c.hqEmail}
                  </a>
                </li>
              </ul>
            </aside>

            <aside className="rounded-2xl border border-cni-primary/10 bg-[#f8f9ff] p-7 md:p-8">
              <h3 className="font-display text-xl font-extrabold text-cni-primary">{c.spsTitle}</h3>
              <p className="mt-3 text-sm leading-relaxed text-cni-primary/70">{c.spsBody}</p>
              <div className="mt-5 space-y-2 text-sm text-cni-primary/75">
                <a href={`mailto:${c.spsEmail}`} className="block font-semibold text-[#0E7A7C] hover:underline">
                  {c.spsEmail}
                </a>
                <a href="tel:+50425616100" className="block hover:text-cni-primary">
                  {c.spsPhone}
                </a>
              </div>
            </aside>
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
        {required ? <span className="ml-1 text-[#29AB85]">*</span> : null}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        className="w-full rounded-lg border border-cni-primary/10 bg-[#f8f9ff] px-4 py-3 text-sm text-cni-primary focus:border-[#29AB85] focus:outline-none focus:ring-2 focus:ring-[#29AB85]/25"
      />
    </div>
  );
}

function ContactOptionCard({
  icon,
  title,
  description,
  href,
  action,
  external = false,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  href?: string;
  action?: string;
  external?: boolean;
  accent: string;
}) {
  const content = (
    <>
      <div
        className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl text-white"
        style={{ backgroundColor: accent }}
      >
        {icon}
      </div>
      <h3 className="font-headline text-sm font-extrabold uppercase leading-snug tracking-wide text-cni-primary">
        {title}
      </h3>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-cni-primary/70">{description}</p>
      ) : null}
      {action ? (
        <p className="mt-4 font-headline text-[11px] font-bold uppercase tracking-[0.14em] text-[#0E7A7C]">
          {action}
        </p>
      ) : null}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="group rounded-2xl border border-cni-primary/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#29AB85]/30 hover:shadow-lg md:p-7"
      >
        {content}
      </a>
    );
  }

  return (
    <article className="rounded-2xl border border-cni-primary/10 bg-white p-6 shadow-sm md:p-7">{content}</article>
  );
}
