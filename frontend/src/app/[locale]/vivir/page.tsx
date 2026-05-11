import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  HeartPulse,
  Home,
  Plane,
  ShieldCheck,
  Sun,
  Users,
} from "lucide-react";
import { PageHero } from "@/src/components/cni/PageHero";
import { Section, SectionHeader } from "@/src/components/cni/Section";
import { isLocale } from "@/src/i18n/config";
import type { Locale } from "@/src/i18n/config";
import { vivirPageCopy } from "@/src/i18n/copy/vivirPage";
import { withLocale } from "@/src/i18n/path";

const PILAR_ICONS = [HeartPulse, GraduationCap, ShieldCheck, Home, Sun, Users] as const;

export default async function VivirPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = vivirPageCopy[locale];
  const L = (path: string) => withLocale(locale, path);

  const pillars = c.pillars.map((p, i) => ({ ...p, Icon: PILAR_ICONS[i] ?? HeartPulse }));

  return (
    <div className="flex flex-1 flex-col bg-[#f8f9fa]">
      <div className="-mt-28">
        <PageHero
          eyebrow={c.heroEyebrow}
          title={
            <>
              {c.heroTitleBefore} <span className="text-[#e9c176]">{c.heroTitleAccent}</span>
            </>
          }
          description={c.heroDescription}
          imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuBDym3MZJfZSAvzPVPyWQzSkF8_eaIzMP-_CkshdaV-PiQt3VZ6u0jMeiqP3dqgHJ1WfNMhZziUQc2XBjQlDSITIcAZ3FOz9BoeyMwL-uBta1Ud3LbtrYYYMQN7B9cM0smTpRPjrFVaTqzEwcPdLz7qGdntiupn7kQVO7ICeKVaoA6HAiUjlEt1cbN_Co0vGgdChy6Wc0VaoECWvDPTnlv7kdBLnG-SZc68iU0dZiAsEYtDQGyR6a2_tYu1jToIJGsOvMZyE2icPuvx"
          imageAlt={c.heroImageAlt}
          heightClass="min-h-[560px] md:min-h-[640px]"
        />
      </div>

      <Section tone="surface" className="-mt-20 relative z-20 py-0">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {c.stats.map((s) => (
            <div key={s.label} className="rounded-xl border-l-4 border-[#e9c176] bg-white p-6 tonal-depth-layering">
              <p className="text-3xl font-extrabold text-[#000a1e] md:text-4xl">{s.value}</p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#44474e]">{s.label}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeader eyebrow={c.pillarsEyebrow} title={c.pillarsTitle} description={c.pillarsDescription} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map(({ Icon, title, text }) => (
            <article
              key={title}
              className="group relative overflow-hidden rounded-xl bg-white p-8 tonal-depth-layering transition-all hover:bg-[#000a1e]"
            >
              <Icon className="mb-6 h-9 w-9 text-[#3a5f94] transition-colors group-hover:text-[#e9c176]" />
              <h3 className="text-lg font-bold text-[#000a1e] transition-colors group-hover:text-white">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#44474e] transition-colors group-hover:text-white/75">{text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="low">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[5/4] overflow-hidden rounded-2xl tonal-depth-layering">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkCReyMlu5txoM82_F50m_vO-mYxWK5isFIx_MsBjpsxz8DTtuw2sYNAuCxPjwGtvQ76qmCzwQ6N_quucqRy0brZERIDXudGPOfei3Z4mO785mAFtIveZfyzpbHbzWMw9XnJPtRpl5fv9cN53AXgYLtAr8pqbcH4g_qFJbU2jdoXhYPZ_Q68mpE9mQPUrPe3bNl5Z98TS3BGspKU7lpOC67_Wwr75az98QPbAR-RFr3LXxlnnEmni5qWv16e7T-exhgO4gJdfWfw_F"
              alt={c.coastImageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#000a1e]/60 via-transparent to-transparent" />
          </div>
          <div>
            <SectionHeader eyebrow={c.zonesEyebrow} title={c.zonesTitle} description={c.zonesDescription} />
            <ul className="space-y-4 text-sm text-[#44474e]">
              <li className="flex items-start gap-3">
                <Plane className="mt-0.5 h-4 w-4 shrink-0 text-[#3a5f94]" />
                {c.bullets[0]}
              </li>
              <li className="flex items-start gap-3">
                <Home className="mt-0.5 h-4 w-4 shrink-0 text-[#3a5f94]" />
                {c.bullets[1]}
              </li>
              <li className="flex items-start gap-3">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-[#3a5f94]" />
                {c.bullets[2]}
              </li>
            </ul>
            <Link
              href={L("/asesoria")}
              className="mt-10 inline-flex items-center justify-center gap-2 rounded-md bg-[#000a1e] px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#002147]"
            >
              {c.ctaAdvisor}
            </Link>
          </div>
        </div>
      </Section>

      <Section tone="primary" className="relative overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-1/3 skew-x-12 -translate-x-20 bg-[#002147] opacity-50" />
        <div className="relative z-10 grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">{c.ctaTitle}</h2>
            <p className="mt-4 text-lg text-white/75">{c.ctaBody}</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row md:justify-end">
            <Link
              href={L("/invertir")}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#e9c176] px-10 py-4 text-xs font-bold uppercase tracking-widest text-[#191c1d] transition hover:brightness-95"
            >
              {c.ctaSectors}
            </Link>
            <Link
              href={L("/cni")}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white/5 px-10 py-4 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white/10"
            >
              {c.ctaCni}
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
