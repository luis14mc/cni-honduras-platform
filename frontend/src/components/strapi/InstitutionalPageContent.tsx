import { StrapiBlocks } from "@/src/components/strapi/StrapiBlocks";
import type { Locale } from "@/src/i18n/config";
import type { mapInstitutionalPage } from "@/src/lib/strapi/editorial";

type Page = NonNullable<ReturnType<typeof mapInstitutionalPage>>;

export function InstitutionalPageContent({ page, locale }: { page: Page; locale: Locale }) {
  return (
    <article className="mx-auto w-full max-w-4xl px-6 py-12 md:py-16">
      <h1 className="font-headline text-4xl font-bold md:text-5xl">{page.title}</h1>
      {page.summary && <p className="mt-4 text-lg">{page.summary}</p>}
      <StrapiBlocks blocks={page.content} className="mt-8 space-y-6" locale={locale} />
    </article>
  );
}
