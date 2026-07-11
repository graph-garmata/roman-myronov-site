export type CaseVideo = {
  mp4: string;
  webm: string;
  poster: string;
  alt?: string;
};

export type CaseCell =
  | { kind: "image"; src: string; alt?: string }
  | { kind: "video"; video: CaseVideo }
  | { kind: "vimeo"; vimeoId: string; alt?: string };

export type CaseBlock =
  | { type: "full"; cell: CaseCell }
  | { type: "grid"; cells: CaseCell[] }
  | { type: "copy"; label: string; text: string };

export type Talent = { name: string; role: string };

export type CaseStudy = {
  slug: string;
  name: string;
  scope: string;
  talents: Talent[];
  problem: string;
  blocks: CaseBlock[];
};

const luminar: CaseStudy = {
  slug: "luminar",
  name: "Luminar",
  scope: "Strategy, Naming, Verbal Identity, Visual Identity, Website",
  talents: [
    { name: "Sam Tipikin", role: "Design Director" },
    { name: "Olha Shevchuk", role: "Copywriter" },
  ],
  problem:
    "The client came to us asking for a website. She was a volunteer delivering food, sourcing clothes, organizing events and small outings for elderly people who needed someone to show up for them. It was real, hands-on work, just without any structure behind it.",
  blocks: [
    { type: "full", cell: { kind: "image", src: "/images/luminar/block-1.webp" } },
    {
      type: "grid",
      cells: [
        {
          kind: "video",
          video: {
            mp4: "/images/luminar/block-2.mp4",
            webm: "/images/luminar/block-2.webm",
            poster: "/images/luminar/block-2-poster.jpg",
          },
        },
        { kind: "image", src: "/images/luminar/block-3.webp" },
      ],
    },
    {
      type: "copy",
      label: "Problem",
      text: "The client came to us asking for a website. She was a volunteer delivering food, sourcing clothes, organizing events and small outings for elderly people who needed someone to show up for them. It was real, hands-on work, just without any structure behind it. She wanted to grow it into a foundation. So before any website work started, we began with branding and a strategic session to figure out what this foundation was actually built on. What we found was an idea close to karmic investment, though we never wanted to spell it out that plainly in the brand itself. The premise: young people supporting this foundation aren't just helping elderly people today. They're also, in a sense, investing in their own future — caring for the kind of old age they'll one day have.",
    },
    { type: "full", cell: { kind: "image", src: "/images/luminar/block-4.webp" } },
    { type: "full", cell: { kind: "vimeo", vimeoId: "1204103895" } },
  ],
};

const cases: Record<string, CaseStudy> = {
  luminar,
};

export function getCase(slug: string): CaseStudy | undefined {
  return cases[slug];
}

export function getCaseOrDefault(slug: string): CaseStudy {
  // Only Luminar is fully designed; other slugs reuse it as a template with
  // the requested name so every home "case" link resolves to something.
  const found = cases[slug];
  if (found) return found;
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);
  return { ...luminar, slug, name: title };
}

export const caseSlugs = Object.keys(cases);
