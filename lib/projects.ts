export type Project = {
  slug: string;
  title: string;
  summary: string;
  year: string;
  featured: boolean;
};

export const projects: Project[] = [
  {
    slug: "project-one",
    title: "Project One",
    summary: "A placeholder case study. Replace with a real project write-up.",
    year: "2025",
    featured: true,
  },
  {
    slug: "project-two",
    title: "Project Two",
    summary: "Another placeholder case study waiting for real content.",
    year: "2024",
    featured: true,
  },
  {
    slug: "project-three",
    title: "Project Three",
    summary: "A non-featured project that still gets its own case study page.",
    year: "2023",
    featured: false,
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}
