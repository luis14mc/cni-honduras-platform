import type { ReactNode } from "react";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import { HtmlLang } from "@/src/components/layout/HtmlLang";
import type { Locale } from "@/src/i18n/config";
import { layoutCopy } from "@/src/i18n/copy/layout";

type Props = {
  locale: Locale;
  children: ReactNode;
};

export function SiteLayout({ locale, children }: Props) {
  const skip = layoutCopy[locale].skipToContent;

  return (
    <>
      <HtmlLang locale={locale} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-[#3a5f94] focus:px-4 focus:py-2 focus:text-white"
      >
        {skip}
      </a>
      <Navbar />
      <main id="main-content" className="flex flex-1 flex-col pt-28">
        {children}
      </main>
      <Footer />
    </>
  );
}
