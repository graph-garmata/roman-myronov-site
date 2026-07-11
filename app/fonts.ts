import localFont from "next/font/local";

export const layGrotesk = localFont({
  src: [
    {
      path: "./fonts/LayGrotesk-Trial-Regular.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-lay",
  display: "swap",
});

export const sftSerif = localFont({
  src: [
    {
      path: "./fonts/SFTSchriftedSerif.ttf",
      weight: "300 700",
      style: "normal",
    },
  ],
  variable: "--font-serif",
  display: "swap",
});
