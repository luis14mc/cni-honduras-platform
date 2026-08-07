import { PageEditorView } from "@/src/components/cms/modules/PageEditorView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarPaginaPage({ params }: PageProps) {
  const { id } = await params;
  return <PageEditorView pageId={Number(id)} />;
}
