import DumpScatter, { type DumpMedia } from "@/components/dump-scatter";
import HomeButton from "@/components/home-button";
import { sanityFetch } from "@/sanity/lib/client";
import { DUMP_QUERY } from "@/sanity/lib/queries";

export const metadata = {
  title: "Dump",
};

export default async function DumpPage() {
  const items = (await sanityFetch({ query: DUMP_QUERY })) as DumpMedia[];
  return (
    <>
      <HomeButton />
      <DumpScatter items={items ?? []} />
    </>
  );
}
