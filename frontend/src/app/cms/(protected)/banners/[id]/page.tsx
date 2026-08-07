import { BannerEditorView } from "@/src/components/cms/modules/BannerEditorView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarBannerPage({ params }: PageProps) {
  const { id } = await params;
  return <BannerEditorView bannerId={Number(id)} />;
}
