import Script from "next/script";
import { breadcrumbJsonLd, type Crumb } from "@/src/lib/seo";

export function BreadcrumbJsonLd({ id, crumbs }: { id: string; crumbs: Crumb[] }) {
  return (
    <Script id={id} type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(breadcrumbJsonLd(crumbs))}
    </Script>
  );
}
