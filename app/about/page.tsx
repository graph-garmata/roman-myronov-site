import type { Metadata } from "next";
import AboutPage from "@/components/about-page";

export const metadata: Metadata = {
  title: "About — Roman Myronov",
};

export default function Page() {
  return <AboutPage />;
}
