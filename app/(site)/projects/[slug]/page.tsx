import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/lib/projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  return { title: project ? project.title : "Project" };
}

export default async function ProjectCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <>
      <Link href="/projects" className="back-link">
        ← Back to projects
      </Link>
      <h1>{project.title}</h1>
      <p className="lead">
        {project.summary} ({project.year})
      </p>

      <section className="section">
        <h2 className="section-title">Overview</h2>
        <p className="lead">
          Placeholder case study content. Describe the problem, your role, the
          process, and the outcome here.
        </p>
      </section>
    </>
  );
}
