import { layout, type as t } from "@/src/lib/typography";
import { cn } from "@/src/lib/utils";
import { getYoutubeEmbedUrl } from "@/src/lib/youtubeEmbed";

type Props = {
  title: string;
  description: string;
  videoUrl: string | null;
  videoTitle: string;
};

export function SectorIntro({ title, description, videoUrl, videoTitle }: Props) {
  const embedSrc = getYoutubeEmbedUrl(videoUrl);

  return (
    <section className={cn("bg-white", layout.section)}>
      <div className={layout.container}>
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className={t.eyebrow}>01</p>
            <h2 className={cn("mt-3", t.h2)}>{title}</h2>
            <div className={cn("mt-4", t.sectionRule)} />
            <p className={cn("mt-6", t.lead)}>{description}</p>
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
