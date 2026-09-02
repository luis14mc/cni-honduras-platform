import type { ProjectApplicationStatus } from "@/src/lib/cms/editorial/postulaciones";
import { PROJECT_APPLICATION_STATUS_LABELS } from "@/src/lib/cms/editorial/postulaciones";
import { cn } from "@/src/lib/utils";

const STYLES: Record<ProjectApplicationStatus, string> = {
  new: "bg-[#334E88]/10 text-[#334E88]",
  reviewing: "bg-[#E8F1FA] text-[#334E88] ring-1 ring-[#334E88]/20",
  contacted: "bg-[#C5DCF0] text-[#24436B]",
  qualified: "bg-[#32B372]/15 text-[#1a7a4a]",
  rejected: "bg-[#252A58]/10 text-[#252A58]/80",
  converted: "bg-[#8DC046]/20 text-[#4a6b1f]",
};

interface CmsLeadStatusBadgeProps {
  status: ProjectApplicationStatus | string | null | undefined;
  className?: string;
}

export function CmsLeadStatusBadge({ status, className }: CmsLeadStatusBadgeProps) {
  const key = (status ?? "new") as ProjectApplicationStatus;
  const label = PROJECT_APPLICATION_STATUS_LABELS[key] ?? status ?? "—";
  const style = STYLES[key] ?? STYLES.new;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        style,
        className,
      )}
      aria-label={`Estado: ${label}`}
    >
      {label}
    </span>
  );
}
