import type { Metadata } from "next";
import CasePage from "@/components/case-page";
import CasePlaceholder from "@/components/case-placeholder";
import { getCase, getCaseMeta } from "@/lib/cases";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = getCaseMeta(slug);
  return { title: `${meta.name} — Case` };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = getCaseMeta(slug);
  if (meta.done) {
    const study = getCase(meta.slug)!;
    return <CasePage study={study} />;
  }
  return <CasePlaceholder meta={meta} />;
}
