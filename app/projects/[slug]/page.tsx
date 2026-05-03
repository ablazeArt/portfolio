import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProjectBySlug,
  portfolioProjects,
} from "@/app/data/projects";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return portfolioProjects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project not found | Ablaze Portfolio",
    };
  }

  return {
    title: `${project.name} | Ablaze Portfolio`,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="project-detail">
      <div className="project-detail-shell">
        <section>
          <Link href="/">Back to solar system</Link>
          <p className="eyebrow">{project.codename} mission brief</p>
          <h1>{project.name}</h1>
          <p className="project-detail-copy">{project.description}</p>

          <div className="stack-cluster" aria-label={`${project.name} stack`}>
            {project.stack.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>

        <aside className="project-detail-card">
          <h2>Highlights</h2>
          <ul>
            {project.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}
