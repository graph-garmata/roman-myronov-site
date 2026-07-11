import type { Metadata } from "next";
import { layGrotesk, sftSerif } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roman Myronov — Designer and Art Director",
  description: "Portfolio of Roman Myronov, designer and art director.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${layGrotesk.variable} ${sftSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
