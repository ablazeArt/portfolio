import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { portfolioProjects } from "@/app/data/projects";

export const metadata: Metadata = {
  title: "Projects | Fuart Madnurak",
  description:
    "A readable, auto-scrolling overview of Fuart Madnurak's project work.",
};

const slideScreenDimensions: Record<string, { width: number; height: number }> =
  {
    "cloudviu.webp": { width: 1080, height: 810 },
    "conver-dpu.webp": { width: 1080, height: 810 },
    "ctrlg.webp": { width: 1080, height: 810 },
    "emmind.webp": { width: 1080, height: 810 },
    "samitivej-commux.webp": { width: 464, height: 348 },
    "vote69.webp": { width: 1080, height: 810 },
    "whallet.webp": { width: 1440, height: 1080 },
  };

const slideScreenFiles: Record<string, string> = {
  emmind: "emmind.webp",
  thvote69: "vote69.webp",
  "ctrl-g": "ctrlg.webp",
  whallet: "whallet.webp",
  "conver-dpu": "conver-dpu.webp",
  cloudviu: "cloudviu.webp",
  "samitivej-benefits": "samitivej-commux.webp",
};

function getProjectSlideScreen(
  project: (typeof portfolioProjects)[number],
  screenshot: NonNullable<
    (typeof portfolioProjects)[number]["screenshots"]
  >[number],
) {
  const filename =
    slideScreenFiles[project.slug] ?? screenshot.src.split("/").at(-1).replace(/\.(png|jpg)$/, ".webp");
  const dimensions = slideScreenDimensions[filename] ?? {
    width: screenshot.width,
    height: screenshot.height,
  };

  return {
    ...screenshot,
    src: `/project-slide-screens-2/${filename}`,
    ...dimensions,
  };
}

function ProjectRailItems({ duplicate = false }: { duplicate?: boolean }) {
  return portfolioProjects.map((project, index) => {
    const screenshot = project.screenshots?.[0]
      ? getProjectSlideScreen(project, project.screenshots[0])
      : undefined;
    const accentStyle = {
      "--project-accent": project.visual.color,
      "--project-glow": project.visual.glow,
    } as CSSProperties;

    return (
      <article
        key={duplicate ? `${project.slug}-duplicate` : project.slug}
        className="projects-auto-card"
        style={accentStyle}
        aria-hidden={duplicate ? "true" : undefined}
      >
        <div className="projects-auto-copy">
          <p className="projects-auto-meta">
            Mission {String(index + 1).padStart(2, "0")} · {project.codename}
          </p>
          <h2>{project.name}</h2>
          <p className="projects-auto-subtitle">
            {project.category} · {project.year} · {project.status}
          </p>
          <p className="projects-auto-summary">{project.summary}</p>
        </div>

        <Link
          href={`/projects/${project.slug}`}
          className="projects-auto-media"
          tabIndex={duplicate ? -1 : undefined}
          aria-label={`Open ${project.name} mission brief`}
        >
          {screenshot ? (
            <Image
              src={screenshot.src}
              alt={screenshot.alt}
              fill
              sizes="(max-width: 760px) 88vw, 34vw"
              quality={95}
              priority={index < 3 && !duplicate}
            />
          ) : (
            <span>{project.codename}</span>
          )}
          <span className="projects-auto-brief">Open mission brief</span>
        </Link>

        {project.liveUrl && !duplicate ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="projects-auto-live"
          >
            <ExternalLink aria-hidden="true" size={15} />
            {project.liveLabel ?? "Live site"}
          </a>
        ) : null}
      </article>
    );
  });
}

export default function ProjectsPage() {
  return (
    <main className="projects-index">
      <nav className="projects-topbar" aria-label="Projects navigation">
        <Link href="/" className="projects-index-back">
          <ArrowLeft aria-hidden="true" size={16} />
          Enter solar system
        </Link>

        <div className="projects-topbar-tabs" aria-label="Project filters">
          <span>
            Selected <sup>({portfolioProjects.length})</sup>
          </span>
          <span>Archive</span>
          <span>Published</span>
        </div>

        <span className="projects-topbar-count">
          {portfolioProjects.length} missions
        </span>
      </nav>

      <section
        className="projects-auto-section"
        aria-label="Auto-scrolling projects"
      >
        <div className="projects-auto-track">
          <div className="projects-auto-group">
            <ProjectRailItems />
          </div>
          <div className="projects-auto-group" aria-hidden="true">
            <ProjectRailItems duplicate />
          </div>
        </div>
      </section>
    </main>
  );
}
