import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Manrope } from "next/font/google";
import "@/src/app/globals.css";
import { cn } from "@/src/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["300", "400", "500", "600"] });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", weight: ["600", "700", "800"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cni.hn";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CNI Honduras · Consejo Nacional de Inversiones",
    template: "%s · CNI Honduras",
  },
  description:
    "Portal oficial del Consejo Nacional de Inversiones de Honduras. Promovemos la Inversión Extranjera Directa (IED), nearshoring y comercio exterior con asesoría legal, técnica e inteligencia de datos sin costo.",
  keywords: [
    "Honduras Investment",
    "FDI Honduras",
    "Inversión Extranjera Directa Honduras",
    "Consejo Nacional de Inversiones",
    "CNI Honduras",
    "Nearshoring Centroamérica",
    "Tratados de Libre Comercio Honduras",
    "ZOLI",
    "LPPI",
    "Invertir en Honduras",
    "Tegucigalpa investment",
    "Caribbean Basin Initiative",
  ],
  applicationName: "CNI Honduras",
  authors: [{ name: "Consejo Nacional de Inversiones de Honduras" }],
  creator: "Consejo Nacional de Inversiones",
  publisher: "Gobierno de la República de Honduras",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: {
    canonical: "/",
    languages: { es: "/", en: "/en" },
  },
  openGraph: {
    type: "website",
    locale: "es_HN",
    alternateLocale: ["en_US"],
    siteName: "CNI Honduras",
    title: "CNI Honduras · Consejo Nacional de Inversiones",
    description:
      "Promovemos y protegemos la Inversión Extranjera Directa en Honduras. Sectores estratégicos: agroindustria, manufactura, turismo, energía renovable e infraestructura.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    site: "@cni_honduras",
    creator: "@cni_honduras",
    title: "CNI Honduras · Consejo Nacional de Inversiones",
    description:
      "Promovemos y protegemos la Inversión Extranjera Directa en Honduras. Tu socio institucional para invertir, crecer y vivir.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "government",
};

export const viewport: Viewport = {
  themeColor: "#000a1e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const governmentOrganizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "GovernmentOrganization",
  name: "Consejo Nacional de Inversiones de Honduras",
  alternateName: ["CNI Honduras", "CNI", "National Investment Council of Honduras"],
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "Órgano rector del Estado de Honduras que identifica oportunidades de inversión en sectores priorizados, brindando seguridad jurídica y acompañamiento técnico al capital nacional y extranjero.",
  foundingLocation: {
    "@type": "Place",
    name: "Tegucigalpa, Honduras",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Centro Cívico Gubernamental (CCG), Torre 1, Piso 12",
    addressLocality: "Tegucigalpa",
    addressRegion: "Francisco Morazán",
    addressCountry: "HN",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "investor relations",
      email: "info@cni.hn",
      availableLanguage: ["Spanish", "English"],
      areaServed: "HN",
    },
  ],
  areaServed: { "@type": "Country", name: "Honduras" },
  sameAs: [
    "https://www.facebook.com/CNIHonduras",
    "https://twitter.com/cni_honduras",
    "https://www.linkedin.com/company/cni-honduras",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CNI Honduras",
  url: SITE_URL,
  inLanguage: ["es-HN", "en"],
  publisher: { "@type": "GovernmentOrganization", name: "Consejo Nacional de Inversiones de Honduras" },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/recursos?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("scroll-smooth", inter.variable, manrope.variable)}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate" hrefLang="es" href={SITE_URL} />
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}/en`} />
        <link rel="alternate" hrefLang="x-default" href={SITE_URL} />
      </head>
      <body className="flex min-h-screen flex-col bg-[#f8f9fa] font-sans text-[#191c1d] antialiased">
        <Script id="ld-government-organization" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(governmentOrganizationJsonLd)}
        </Script>
        <Script id="ld-website" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(websiteJsonLd)}
        </Script>
        {children}
      </body>
    </html>
  );
}
