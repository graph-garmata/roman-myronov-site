import type { Metadata } from "next";
import CasePage from "@/components/case-page";
import { getCaseOrDefault } from "@/lib/cases";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseOrDefault(slug);
  return { title: `${study.name} — Case` };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCaseOrDefault(slug);
  return <CasePage study={study} />;
}
