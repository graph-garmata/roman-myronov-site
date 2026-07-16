import type { Metadata } from "next";
import ArchivePage from "@/components/archive-page";

export const metadata: Metadata = {
  title: "Archive — Roman Myronov",
};

export default function Page() {
  return <ArchivePage />;
}
