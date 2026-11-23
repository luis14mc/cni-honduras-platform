import { breadcrumbJsonLd, type Crumb } from "@/src/lib/seo";
import { JsonLd } from "./JsonLd";

export function BreadcrumbJsonLd({ id, crumbs }: { id: string; crumbs: Crumb[] }) {
  return <JsonLd id={id} value={breadcrumbJsonLd(crumbs)} />;
}
