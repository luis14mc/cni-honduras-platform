import Image from "next/image";
import { Download } from "lucide-react";
import type { Locale } from "@/src/i18n/config";
import type { SectorGuideContent } from "@/src/data/sectorPageContent";
import { sectorTemplateChrome } from "@/src/data/sectorPageContent";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";

type Props = {
  locale: Locale;
  guide: SectorGuideContent | null;
};

export function SectorGuide({ locale, guide }: Props) {
  if (!guide) return null;
  const copy = sectorTemplateChrome[locale];

  return (
    <section className={cn("bg-[#eff4ff]", layout.section, "border-y border-cni-primary/5")}>
      <div className={layout.container}>
        <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-cni-primary/8 bg-white shadow-sm md:grid-cols-12">
          <div className="relative aspect-[4/3] md:col-span-5 md:aspect-auto md:min-h-[280px]">
            <Image src={guide.image} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 40vw" />
          </div>
          <div className="flex flex-col justify-center px-8 py-10 md:col-span-7 md:px-12">
            <p className={t.eyebrow}>{copy.guideEyebrow}</p>
            <h2 className={cn("mt-3", t.h2)}>{guide.title || copy.guideFallbackTitle}</h2>
            {guide.description ? <p className={cn("mt-4 max-w-xl", t.lead)}>{guide.description}</p> : null}
            <a
              href={guide.fileUrl}
              download
              className="al-sector-cta-primary mt-8 inline-flex w-fit items-center gap-2 rounded-lg px-8 py-4 font-headline text-[11px] font-bold uppercase tracking-[0.16em] transition"
            >
              {copy.guideCta}
              <Download className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
