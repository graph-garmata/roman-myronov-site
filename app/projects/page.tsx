import Link from "next/link";
import { projects } from "@/lib/projects";

export const metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return (
    <>
      <h1>Projects</h1>
      <p className="lead">
        Selected work. Each project links to its own case study page.
      </p>

      <section className="section">
        <ul className="card-list">
          {projects.map((project) => (
            <li key={project.slug}>
              <Link href={`/projects/${project.slug}`} className="card">
                <span>
                  <span className="card-title">{project.title}</span>
                  <span className="card-summary">{project.summary}</span>
                </span>
                <span className="card-year">{project.year}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
