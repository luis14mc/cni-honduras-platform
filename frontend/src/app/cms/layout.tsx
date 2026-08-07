import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CmsAuthProvider } from "@/src/lib/cms/AuthProvider";
import { CmsToastProvider } from "@/src/components/cms/editor/CmsToastProvider";

export const metadata: Metadata = {
  title: "CMS Editorial · CNI Honduras",
  robots: { index: false, follow: false },
};

// Root of the CMS route tree. Provides the session context to every CMS page
// (login and protected alike). The public site chrome (Navbar/Footer) is not
// applied here because /cms lives outside the [locale] layout.
export default function CmsRootLayout({ children }: { children: ReactNode }) {
  return (
    <CmsAuthProvider>
      <CmsToastProvider>{children}</CmsToastProvider>
    </CmsAuthProvider>
  );
}
