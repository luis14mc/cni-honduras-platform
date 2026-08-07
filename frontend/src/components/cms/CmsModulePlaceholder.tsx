import { Construction } from "lucide-react";
import { CmsSectionHeader } from "@/src/components/cms/CmsSectionHeader";

// Professional shell for modules not yet built. Never a 404.
export function CmsModulePlaceholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <>
      <CmsSectionHeader title={title} description={description} />
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#334E88]/25 bg-white/70 py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#334E88]/10 text-[#334E88]">
          <Construction className="h-7 w-7" aria-hidden />
        </span>
        <div>
          <p className="text-lg font-semibold text-[#252A58]">Módulo en preparación</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-[#252A58]/60">
            Esta sección forma parte del CMS y se habilitará en una próxima entrega.
            La estructura ya está lista para montar el módulo sin reestructurar el sistema.
          </p>
        </div>
        <span className="rounded-full bg-[#32B372]/12 px-3 py-1 text-xs font-semibold text-[#32B372]">
          Foundation lista
        </span>
      </div>
    </>
  );
}
