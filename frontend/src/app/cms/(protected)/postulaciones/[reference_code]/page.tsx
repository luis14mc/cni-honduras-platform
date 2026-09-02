import { PostulacionDetailView } from "@/src/components/cms/modules/PostulacionDetailView";

type PageProps = {
  params: Promise<{ reference_code: string }>;
};

export default async function PostulacionDetailPage({ params }: PageProps) {
  const { reference_code } = await params;
  return <PostulacionDetailView referenceCode={reference_code} />;
}
