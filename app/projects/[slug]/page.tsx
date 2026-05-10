import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Sparkles } from "lucide-react";
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
          <Link className="project-back-link" href="/">
            Back to solar system
          </Link>
          <p className="eyebrow">{project.codename} mission brief</p>
          <h1>{project.name}</h1>
          <p className="project-detail-copy">{project.description}</p>

          <div className="stack-cluster" aria-label={`${project.name} stack`}>
            {project.stack.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          {project.liveUrl ? (
            <div className="panel-actions project-detail-actions">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
              >
                {project.liveLabel ?? "Visit live site"}
              </a>
            </div>
          ) : null}
        </section>

        <aside className="project-detail-card">
          <h2 className="project-detail-card-title">
            <Sparkles aria-hidden="true" size={18} />
            <span>Highlights</span>
          </h2>
          <ul className="project-highlight-list">
            {project.highlights.map((highlight) => (
              <li key={highlight}>
                <BadgeCheck aria-hidden="true" size={18} />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </aside>

        {project.caseStudy ? (
          <section className="project-case-study">
            <div>
              <p className="eyebrow">Use case</p>
              <h2>{project.caseStudy.heading}</h2>
              <p>{project.caseStudy.overview}</p>
            </div>

            <ul>
              {project.caseStudy.useCases.map((useCase) => (
                <li key={useCase}>{useCase}</li>
              ))}
            </ul>

            {project.caseStudy.privateNote ? (
              <p className="project-private-note">
                {project.caseStudy.privateNote}
              </p>
            ) : null}
          </section>
        ) : null}

        {project.screenshots?.length ? (
          <section className="project-screens">
            {project.screenshots.map((screenshot) => (
              <figure key={screenshot.src}>
                <Image
                  src={screenshot.src}
                  alt={screenshot.alt}
                  width={screenshot.width}
                  height={screenshot.height}
                />
                <figcaption>{screenshot.caption}</figcaption>
              </figure>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
