import { SuccessStoryEditorView } from "@/src/components/cms/modules/SuccessStoryEditorView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarCasoExitoPage({ params }: PageProps) {
  const { id } = await params;
  return <SuccessStoryEditorView storyId={Number(id)} />;
}
