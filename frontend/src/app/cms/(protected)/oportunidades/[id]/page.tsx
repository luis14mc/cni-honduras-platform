import { OpportunityEditorView } from "@/src/components/cms/modules/OpportunityEditorView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarOportunidadPage({ params }: PageProps) {
  const { id } = await params;
  return <OpportunityEditorView opportunityId={Number(id)} />;
}
