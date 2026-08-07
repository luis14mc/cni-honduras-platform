import { DocumentEditorView } from "@/src/components/cms/modules/DocumentEditorView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarDocumentoPage({ params }: PageProps) {
  const { id } = await params;
  return <DocumentEditorView documentId={Number(id)} />;
}
