import Link from "next/link";
import { getFeaturedProjects } from "@/lib/projects";

export default function HomePage() {
  const featured = getFeaturedProjects();

  return (
    <>
      <h1>Your Name</h1>
      <p className="lead">
        Placeholder introduction. A one-line description of who you are and what
        you make. Replace this with something real.
      </p>

      <section className="section">
        <h2 className="section-title">Featured Projects</h2>
        <ul className="card-list">
          {featured.map((project) => (
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
        <p className="lead" style={{ marginTop: "1rem" }}>
          <Link href="/projects">View all projects →</Link>
        </p>
      </section>
    </>
  );
}
