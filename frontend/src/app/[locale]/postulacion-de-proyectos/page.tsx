import { redirect } from "next/navigation";

export default async function LegacyProjectSubmission({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(locale === "en" ? "/en/submit-your-project" : "/postula-tu-proyecto");
}
