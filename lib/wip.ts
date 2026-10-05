// Pages still being built. On the live site they're locked — their Home nav
// tabs show an "underway" note instead of opening (components/home.tsx), and
// their routes 404 — while local dev and Vercel preview deployments keep them
// fully open to keep working on. To launch one, take it out of this list.
const WIP_PAGES = ["archive", "dump"];

// NEXT_PUBLIC_VERCEL_ENV is set by Vercel at build time ("production",
// "preview" or "development"); it's unset in a local `next build`, which
// therefore locks like production does.
const open =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

export const isLocked = (page: string) => !open && WIP_PAGES.includes(page);
