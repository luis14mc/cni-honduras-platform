import { SectorIcon } from "@/src/components/cni/SectorIcon";
import type { SectorSlug } from "@/src/data/investmentSectors";
import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";
import { getYoutubeEmbedUrl } from "@/src/lib/youtubeEmbed";

type Props = {
  slug: SectorSlug;
  title: string;
  description: string;
  videoUrl: string | null;
  videoTitle: string;
};

export function SectorIntro({ slug, title, description, videoUrl, videoTitle }: Props) {
  const embedSrc = getYoutubeEmbedUrl(videoUrl);
  const paragraphs = description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <section className={cn("al-sector-intro", layout.section)}>
      <div className={layout.container}>
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="mb-8 flex items-center gap-5">
              <span
                className="al-sector-intro-logo flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-2xl md:h-20 md:w-20"
                aria-hidden
              >
                <SectorIcon slug={slug} size={64} />
              </span>
              <p className="al-sector-intro-eyebrow font-headline text-[11px] font-bold uppercase tracking-[0.22em]">
                01
              </p>
            </div>
            <h2 className={cn("mt-1", t.h2)}>{title}</h2>
            <div className="al-sector-intro-rule mt-4 h-1 w-16" aria-hidden />
            <div className="mt-6 space-y-4">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className={t.lead}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          {embedSrc ? (
            <div className="lg:col-span-7">
              <div className="al-sector-video overflow-hidden rounded-2xl border border-cni-primary/10 bg-[#252A58] shadow-xl">
                <div className="relative aspect-video w-full">
                  <iframe
                    src={embedSrc}
                    title={videoTitle}
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
