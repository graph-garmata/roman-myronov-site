import { notFound } from "next/navigation";
import DumpScatter, { type DumpMedia } from "@/components/dump-scatter";
import HomeButton from "@/components/home-button";
import { sanityFetch } from "@/sanity/lib/client";
import { DUMP_QUERY } from "@/sanity/lib/queries";
import { isLocked } from "@/lib/wip";

export const metadata = {
  title: "Dump",
};

export default async function DumpPage() {
  if (isLocked("dump")) notFound();
  const items = (await sanityFetch({ query: DUMP_QUERY })) as DumpMedia[];
  return (
    <>
      <HomeButton />
      <DumpScatter items={items ?? []} />
    </>
  );
}
