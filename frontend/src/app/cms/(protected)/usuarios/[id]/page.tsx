import { UserEditorView } from "@/src/components/cms/modules/UserEditorView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarUsuarioPage({ params }: PageProps) {
  const { id } = await params;
  return <UserEditorView userId={Number(id)} />;
}
