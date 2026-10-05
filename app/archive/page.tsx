import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArchivePage from "@/components/archive-page";
import { isLocked } from "@/lib/wip";

export const metadata: Metadata = {
  title: "Archive — Roman Myronov",
};

export default function Page() {
  if (isLocked("archive")) notFound();
  return <ArchivePage />;
}
