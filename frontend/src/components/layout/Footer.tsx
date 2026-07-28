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

const footerTranslations: Record<Locale, FooterCopy> = {
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
    externalLinks: [
      { label: "Presidencia", href: "https://www.presidencia.gob.hn" },
      { label: "COHEP", href: "https://cohep.com" },
      { label: "BCH", href: "https://www.bch.hn" },
      { label: "INE", href: "https://www.ine.gob.hn" },
      { label: "Aduanas", href: "https://www.aduanas.gob.hn" },
      { label: "Fedecamaras", href: "https://www.fedecamaras.com" },
      { label: "SDE", href: "https://sde.gob.hn" },
      { label: "SERNA", href: "https://www.miambiente.gob.hn" },
      { label: "ANDI", href: "https://andi.hn" },
      { label: "WAIPA", href: "https://waipa.org" },
    ],
    cta: {
      title: "Acelera tu proceso de inversión",
      desc: "Obtenga asesoría personalizada y gratuita para sus proyectos en Honduras.",
      btn: "Contacta al CNI",
    },
    offices: {
      tguTitle: "Tegucigalpa",
      tguAddress: "Colonia Lomas del Guijarro Sur, Calle Roma, Edificio Torre Alianza II, Nivel 5.",
      tguTel: "Tel: +504 2232-3535",
      spsTitle: "San Pedro Sula",
      spsAddress:
        "Barrio Los Andes, 2da Calle, entre 10 y 11 Ave. Edificio Cámara de Comercio e Industrias de Cortés.",
      spsTel: "Tel: +504 2561-6100",
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
    externalLinks: [
      { label: "Presidency", href: "https://www.presidencia.gob.hn" },
      { label: "COHEP", href: "https://cohep.com" },
      { label: "BCH", href: "https://www.bch.hn" },
      { label: "INE", href: "https://www.ine.gob.hn" },
      { label: "Aduanas", href: "https://www.aduanas.gob.hn" },
      { label: "Fedecamaras", href: "https://www.fedecamaras.com" },
      { label: "SDE", href: "https://sde.gob.hn" },
      { label: "SERNA", href: "https://www.miambiente.gob.hn" },
      { label: "ANDI", href: "https://andi.hn" },
      { label: "WAIPA", href: "https://waipa.org" },
    ],
    cta: {
      title: "Accelerate your investment process",
      desc: "Get free, personalized advisory for your projects in Honduras.",
      btn: "Contact CNI",
    },
    offices: {
      tguTitle: "Tegucigalpa",
      tguAddress: "Colonia Lomas del Guijarro Sur, Calle Roma, Edificio Torre Alianza II, Nivel 5.",
      tguTel: "Tel: +504 2232-3535",
      spsTitle: "San Pedro Sula",
      spsAddress:
        "Barrio Los Andes, 2da Calle, entre 10 y 11 Ave. Edificio Cámara de Comercio e Industrias de Cortés.",
      spsTel: "Tel: +504 2561-6100",
    },
    legal: {
      privacy: "Privacy",
      terms: "Terms",
      transparency: "Transparency",
      copyright: "National Investment Council. All rights reserved.",
    },
  },
};

export default function Footer() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname ?? "") as Locale;
  const L = (p: string) => resolveHref(locale, p);
  const ft = footerTranslations[locale];

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

          <FooterLinkColumn
            id="footer-external"
            title={ft.externalTitle}
            links={ft.externalLinks}
            resolveHref={L}
            external
            columns={2}
          />
        </div>

        <FooterBottomBar copy={ft} resolveHref={L} />
      </div>
    </footer>
  );
}
