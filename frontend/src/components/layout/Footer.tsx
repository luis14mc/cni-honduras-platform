"use client";

import { usePathname } from "next/navigation";
import { layoutCopy } from "@/src/i18n/copy/layout";
import type { Locale } from "@/src/i18n/config";
import { getLocaleFromPathname } from "@/src/config/siteNavigation";
import { resolveHref } from "@/src/i18n/path";
import {
  FooterBottomBar,
  FooterBrandColumn,
  FooterGuacamayaCta,
  FooterLinkColumn,
  type FooterCopy,
} from "@/src/components/layout/FooterParts";
import type { InstitutionalLink } from "@/src/types/cms";
import { mapInstitutionalLinkHref } from "@/src/lib/institutionalLinks";

type LoadStatus = "ok" | "error";

type FooterExternalLink = { label: string; href: string };

const footerTranslations: Record<
  Locale,
  FooterCopy & { externalEmpty: string; externalError: string }
> = {
  es: {
    description:
      "Entidad pública de derecho privado encargada de promover y facilitar la inversión nacional y extranjera.",
    investorsTitle: "Inversionistas",
    investorsLinks: [
      { label: "Consejo Nacional de Inversiones", href: "/cni" },
      { label: "Recursos CNI", href: "/recursos" },
      { label: "Preguntas frecuentes", href: "/recursos" },
      { label: "Casos de éxito", href: "/portafolio/casos" },
      { label: "Portafolio de inversiones", href: "/portafolio" },
      { label: "Sala de Prensa", href: "/prensa" },
    ],
    externalTitle: "Enlaces externos",
    externalLinks: [],
    externalEmpty: "No hay enlaces externos publicados.",
    externalError: "No pudimos cargar los enlaces externos.",
    cta: {
      title: "Acelera tu proceso de inversión",
      desc: "Obtenga asesoría personalizada y gratuita para sus proyectos en Honduras.",
      btn: "Contacta al CNI",
    },
    offices: {
      tguTitle: "Tegucigalpa",
      tguAddress: "Centro Cívico Gubernamental, Torre 1, Nivel 12.",
      tguTel: "Tel: (504) 2242-8955",
      tguEmail: "seguimiento@cni.hn",
      spsTitle: "San Pedro Sula",
      spsAddress:
        "Cámara de Comercio e Industria de Cortés. Col. Las Brisas 22 y 24 calle entre 1 y 4ta. avenida Junior.",
      spsTel: "Tel: (504) 2561-6100 ext 109",
      spsEmail: "oficinasps@cni.hn",
    },
    legal: {
      privacy: "Privacidad",
      terms: "Términos",
      transparency: "Transparencia",
      copyright: "Consejo Nacional de Inversiones. Todos los derechos reservados.",
    },
  },
  en: {
    description:
      "Public entity under private law in charge of promoting and facilitating national and foreign investment.",
    investorsTitle: "Investors",
    investorsLinks: [
      { label: "National Investment Council", href: "/cni" },
      { label: "CNI Resources", href: "/recursos" },
      { label: "FAQ", href: "/recursos" },
      { label: "Success Stories", href: "/portafolio/casos" },
      { label: "Investment Portfolio", href: "/portafolio" },
      { label: "Press Room", href: "/prensa" },
    ],
    externalTitle: "External links",
    externalLinks: [],
    externalEmpty: "No external links are published.",
    externalError: "We could not load external links.",
    cta: {
      title: "Accelerate your investment process",
      desc: "Get free, personalized advisory for your projects in Honduras.",
      btn: "Contact CNI",
    },
    offices: {
      tguTitle: "Tegucigalpa",
      tguAddress: "Centro Cívico Gubernamental, Torre 1, Nivel 12.",
      tguTel: "Tel: (504) 2242-8955",
      tguEmail: "seguimiento@cni.hn",
      spsTitle: "San Pedro Sula",
      spsAddress:
        "Cámara de Comercio e Industria de Cortés. Col. Las Brisas 22 y 24 calle entre 1 y 4ta. avenida Junior.",
      spsTel: "Tel: (504) 2561-6100 ext 109",
      spsEmail: "oficinasps@cni.hn",
    },
    legal: {
      privacy: "Privacy",
      terms: "Terms",
      transparency: "Transparency",
      copyright: "National Investment Council. All rights reserved.",
    },
  },
};

type FooterProps = {
  externalLinks?: InstitutionalLink[];
  externalLinksStatus?: LoadStatus;
};

export default function Footer({
  externalLinks = [],
  externalLinksStatus = "ok",
}: FooterProps) {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname ?? "") as Locale;
  const L = (p: string) => resolveHref(locale, p);
  const ft = footerTranslations[locale];
  const resolvedExternalLinks: FooterExternalLink[] = externalLinks.map((link) => ({
    label: link.title,
    href: mapInstitutionalLinkHref(link, locale),
  }));

  const externalColumnContent =
    externalLinksStatus === "error" ? (
      <nav aria-labelledby="footer-external" className="flex flex-col">
        <h4
          id="footer-external"
          className="mb-5 font-headline text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-white/90"
        >
          {ft.externalTitle}
        </h4>
        <p className="font-body text-sm text-white/60" role="status">
          {ft.externalError}
        </p>
      </nav>
    ) : resolvedExternalLinks.length === 0 ? (
      <nav aria-labelledby="footer-external" className="flex flex-col">
        <h4
          id="footer-external"
          className="mb-5 font-headline text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-white/90"
        >
          {ft.externalTitle}
        </h4>
        <p className="font-body text-sm text-white/60" role="status">
          {ft.externalEmpty}
        </p>
      </nav>
    ) : (
      <FooterLinkColumn
        id="footer-external"
        title={ft.externalTitle}
        links={resolvedExternalLinks}
        resolveHref={L}
        external
        columns={2}
      />
    );

  return (
    <footer className="site-footer relative mt-auto w-full overflow-hidden pb-10 text-white" role="contentinfo">
      <div className="site-footer-bg pointer-events-none absolute inset-0" aria-hidden>
        <div className="site-footer-gradient absolute inset-0" />
        <div className="site-footer-mesh absolute inset-0" />
        <div className="site-footer-diagonal-slash absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto max-w-screen-2xl px-6 md:px-10">
        <FooterGuacamayaCta copy={ft} contactHref={L("/contacto")} />

        <div className="mb-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          <FooterBrandColumn
            homeHref={L("/")}
            brandAria={layoutCopy[locale].nav.brandSubtitle}
            copy={ft}
          />

          <FooterLinkColumn
            id="footer-investors"
            title={ft.investorsTitle}
            links={ft.investorsLinks}
            resolveHref={L}
          />

          {externalColumnContent}
        </div>

        <FooterBottomBar copy={ft} resolveHref={L} />
      </div>
    </footer>
  );
}
