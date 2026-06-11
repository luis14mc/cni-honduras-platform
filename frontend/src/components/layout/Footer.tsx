"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { layoutCopy } from "@/src/i18n/copy/layout";
import type { Locale } from "@/src/i18n/config";
import { getLocaleFromPathname, normalizePath } from "@/src/config/siteNavigation";
import { resolveHref } from "@/src/i18n/path";
import { CniLogo } from "@/src/components/layout/CniLogo";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

// Custom SVG for X brand logo (formerly Twitter)
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// Localized copy for the premium footer elements
const footerTranslations = {
  es: {
    description: "Entidad pública de derecho privado encargada de promover y facilitar la inversión nacional y extranjera.",
    investorsTitle: "Inversionistas",
    investorsLinks: [
      { label: "Consejo Nacional de Inversiones", href: "/cni" },
      { label: "Recursos CNI", href: "/recursos" },
      { label: "Preguntas frecuentes", href: "/recursos" },
      { label: "Casos de éxito", href: "/portafolio/casos" },
      { label: "Portafolio de inversiones", href: "/portafolio" },
      { label: "Sala de Prensa", href: "/prensa" },
    ],
    externalTitle: "Enlaces Externos",
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
      btn: "Contacta al CNI"
    },
    offices: {
      tguTitle: "Tegucigalpa",
      tguAddress: "Colonia Lomas del Guijarro Sur, Calle Roma, Edificio Torre Alianza II, Nivel 5.",
      tguTel: "Tel: +504 2232-3535",
      spsTitle: "San Pedro Sula",
      spsAddress: "Barrio Los Andes, 2da Calle, entre 10 y 11 Ave. Edificio Cámara de Comercio e Industrias de Cortés.",
      spsTel: "Tel: +504 2561-6100"
    },
    legal: {
      privacy: "Privacidad",
      terms: "Términos",
      transparency: "Transparencia",
      copyright: "Consejo Nacional de Inversiones. Todos los derechos reservados."
    }
  },
  en: {
    description: "Public entity under private law in charge of promoting and facilitating national and foreign investment.",
    investorsTitle: "Investors",
    investorsLinks: [
      { label: "National Investment Council", href: "/cni" },
      { label: "CNI Resources", href: "/recursos" },
      { label: "FAQ", href: "/recursos" },
      { label: "Success Stories", href: "/portafolio/casos" },
      { label: "Investment Portfolio", href: "/portafolio" },
      { label: "Press Room", href: "/prensa" },
    ],
    externalTitle: "External Links",
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
      btn: "Contact CNI"
    },
    offices: {
      tguTitle: "Tegucigalpa",
      tguAddress: "Colonia Lomas del Guijarro Sur, Calle Roma, Edificio Torre Alianza II, Nivel 5.",
      tguTel: "Tel: +504 2232-3535",
      spsTitle: "San Pedro Sula",
      spsAddress: "Barrio Los Andes, 2da Calle, entre 10 y 11 Ave. Edificio Cámara de Comercio e Industrias de Cortés.",
      spsTel: "Tel: +504 2561-6100"
    },
    legal: {
      privacy: "Privacy",
      terms: "Terms",
      transparency: "Transparency",
      copyright: "National Investment Council. All rights reserved."
    }
  }
};

export default function Footer() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname ?? "") as Locale;
  const L = (p: string) => resolveHref(locale, p);
  const ft = footerTranslations[locale];

  const normalized = normalizePath(pathname ?? "");

  // Detect preceding section background to blend the wave divider cleanly
  let waveFillColor = "#ffffff"; // default to white
  if (normalized === "/" || normalized === "/en" || normalized === "/es") {
    waveFillColor = "var(--cni-surface-low)"; // `#f3f4f5`
  } else if (normalized.startsWith("/prensa/") || normalized.startsWith("/en/prensa/") || normalized.startsWith("/es/prensa/")) {
    waveFillColor = "#e1e3e4"; // prensa details ends with bg-[#e1e3e4]
  } else if (normalized === "/prensa" || normalized === "/en/prensa" || normalized === "/es/prensa") {
    waveFillColor = "#f8f9fa"; // prensa list ends with bg-[#f8f9fa]
  } else if (normalized === "/contacto" || normalized === "/en/contacto" || normalized === "/es/contacto") {
    waveFillColor = "#f8f9fa"; // contacto page ends with bg-[#f8f9fa]
  } else if (
    normalized === "/cni" || normalized === "/en/cni" || normalized === "/es/cni" ||
    normalized.startsWith("/cni/inteligencia-de-datos") || normalized.startsWith("/en/cni/inteligencia-de-datos") || normalized.startsWith("/es/cni/inteligencia-de-datos") ||
    normalized.startsWith("/cni/servicios-legales") || normalized.startsWith("/en/cni/servicios-legales") || normalized.startsWith("/es/cni/servicios-legales")
  ) {
    waveFillColor = "#000a1e"; // ends with primary navy
  }

  return (
    <footer
      className="relative w-full bg-[#000a1e] text-white pt-24 pb-12 overflow-hidden mt-auto"
      role="contentinfo"
    >
      {/* Wave Divider */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none select-none">
        <svg
          className="relative block w-full h-[80px]"
          data-name="Layer 1"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            style={{ fill: waveFillColor }}
          ></path>
        </svg>
      </div>

      {/* Dot Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, rgba(233, 193, 118, 0.2) 1px, transparent 0)",
            backgroundSize: "32px 32px"
          }}
        ></div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-8 relative z-10">
        
        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">
          
          {/* Column 1: Identity & Social */}
          <div className="lg:col-span-3">
            <CniLogo 
              href={L("/")} 
              ariaLabel={layoutCopy[locale].nav.brandSubtitle} 
              variant="light" 
              className="mb-8"
              imageClassName="h-16 md:h-20 lg:h-24"
            />
            <p className="text-white/60 font-body text-sm leading-relaxed mb-8 max-w-xs">
              {ft.description}
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-4">
              {[
                { Icon: Facebook, href: "https://www.facebook.com/CNIHonduras" },
                { Icon: Instagram, href: "https://www.instagram.com" },
                { Icon: XIcon, href: "https://twitter.com/cni_honduras" },
                { Icon: Linkedin, href: "https://www.linkedin.com/company/cni-honduras" },
                { Icon: Youtube, href: "https://www.youtube.com" }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-cni-gold hover:text-cni-primary hover:border-cni-gold transition-all"
                >
                  <social.Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Investors Links */}
          <nav aria-labelledby="footer-investors" className="lg:col-span-2">
            <h4 id="footer-investors" className="font-headline text-xs font-extrabold uppercase tracking-[0.2em] text-cni-gold mb-8">
              {ft.investorsTitle}
            </h4>
            <ul className="space-y-4 font-body text-sm text-white/70">
              {ft.investorsLinks.map((item, idx) => (
                <li key={idx}>
                  <Link href={L(item.href)} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3: External Links (Double column layout) */}
          <nav aria-labelledby="footer-external" className="lg:col-span-3">
            <h4 id="footer-external" className="font-headline text-xs font-extrabold uppercase tracking-[0.2em] text-cni-gold mb-8">
              {ft.externalTitle}
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 font-body text-[11px] font-semibold uppercase tracking-wider text-white/50">
              {ft.externalLinks.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cni-gold transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          {/* Column 4: Premium CTA Box */}
          <div className="lg:col-span-4">
            <div className="bg-white/5 border border-white/10 p-8 rounded-xl relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-display text-xl font-extrabold uppercase text-white mb-4 leading-tight">
                  {ft.cta.title}
                </h4>
                <p className="text-white/60 text-sm mb-8">
                  {ft.cta.desc}
                </p>
                <Link
                  href={L("/contacto")}
                  className="w-full bg-cni-gold text-cni-primary py-4 rounded-DEFAULT font-headline font-extrabold text-[11px] uppercase tracking-[0.2em] hover:bg-white hover:text-cni-primary transition-all text-center block"
                >
                  {ft.cta.btn}
                </Link>
              </div>
              <div className="absolute -bottom-4 -right-4 opacity-20 group-hover:opacity-40 transition-opacity select-none pointer-events-none">
                <span className="material-symbols-outlined text-[120px] text-cni-gold">
                  support_agent
                </span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Bottom Bar (Addresses & Copyright) */}
        <div className="pt-12 border-t border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div className="space-y-4">
              <p className="font-headline text-[10px] font-extrabold uppercase tracking-widest text-cni-gold">
                {ft.offices.tguTitle}
              </p>
              <p className="text-white/50 text-xs leading-relaxed">
                {ft.offices.tguAddress}
                <br />
                {ft.offices.tguTel}
              </p>
            </div>
            
            <div className="space-y-4">
              <p className="font-headline text-[10px] font-extrabold uppercase tracking-widest text-cni-gold">
                {ft.offices.spsTitle}
              </p>
              <p className="text-white/50 text-xs leading-relaxed">
                {ft.offices.spsAddress}
                <br />
                {ft.offices.spsTel}
              </p>
            </div>
            
            <div className="lg:text-right flex flex-col lg:items-end justify-between h-full min-h-[70px]">
              <p className="text-white/40 text-[10px] uppercase tracking-widest">
                © {new Date().getFullYear()} {ft.legal.copyright}
              </p>
              <div className="flex gap-6 mt-4 text-[10px] font-bold uppercase tracking-widest text-white/30">
                <Link href={L("/recursos")} className="hover:text-white transition-colors">
                  {ft.legal.privacy}
                </Link>
                <Link href={L("/recursos")} className="hover:text-white transition-colors">
                  {ft.legal.terms}
                </Link>
                <Link href={L("/recursos")} className="hover:text-white transition-colors">
                  {ft.legal.transparency}
                </Link>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </footer>
  );
}
