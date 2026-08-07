import { NewsEditorView } from "@/src/components/cms/modules/NewsEditorView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarNoticiaPage({ params }: PageProps) {
  const { id } = await params;
  return <NewsEditorView newsId={Number(id)} />;
}
