import { SectorEditorView } from "@/src/components/cms/modules/SectorEditorView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarSectorPage({ params }: PageProps) {
  const { id } = await params;
  return <SectorEditorView sectorId={Number(id)} />;
}
