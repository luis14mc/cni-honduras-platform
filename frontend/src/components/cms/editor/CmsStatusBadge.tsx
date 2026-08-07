import type { PublishStatus } from "@/src/lib/cms/editorial/types";
import { cn } from "@/src/lib/utils";

const LABELS: Record<PublishStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

const STYLES: Record<PublishStatus, string> = {
  draft: "bg-[#334E88]/10 text-[#334E88]",
  published: "bg-[#32B372]/15 text-[#1a7a4a]",
  archived: "bg-[#252A58]/10 text-[#252A58]/70",
};

interface CmsStatusBadgeProps {
  status: PublishStatus | string | null | undefined;
  className?: string;
}

export function CmsStatusBadge({ status, className }: CmsStatusBadgeProps) {
  const key = (status ?? "draft") as PublishStatus;
  const label = LABELS[key] ?? status ?? "—";
  const style = STYLES[key] ?? STYLES.draft;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        style,
        className,
      )}
    >
      {label}
    </span>
  );
}
