import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, User } from "lucide-react";
import { portfolioProjects } from "@/app/data/projects";
import ProjectsSlider from "./ProjectsSlider";
import TelemetryReadout from "./TelemetryReadout";

export const metadata: Metadata = {
  title: "Projects | Fuart Madnurak",
  description:
    "A readable, auto-scrolling overview of Fuart Madnurak's project work.",
};

const slideScreenDimensions: Record<string, { width: number; height: number }> =
  {
    "cloudviu.webp": { width: 1440, height: 1080 },
    "conver-dpu.webp": { width: 1440, height: 1080 },
    "ctrlg.webp": { width: 1440, height: 1080 },
    "emmind.webp": { width: 1080, height: 720 },
    "samitivej-commux.webp": { width: 1440, height: 1080 },
    "vote69.webp": { width: 1080, height: 608 },
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

const slideImageFrameStyles: Record<string, CSSProperties> = {
  emmind: {
    transform: "scale(1.08)",
  },
  thvote69: {
    transform: "scale(1.22)",
  },
};

function getProjectSlideScreen(
  project: (typeof portfolioProjects)[number],
  screenshot: NonNullable<
    (typeof portfolioProjects)[number]["screenshots"]
  >[number],
) {
  const filename =
    slideScreenFiles[project.slug] ??
    (screenshot.src.split("/").at(-1) ?? "").replace(/\.(png|jpg)$/, ".webp");
  const dimensions = slideScreenDimensions[filename] ?? {
    width: screenshot.width,
    height: screenshot.height,
  };

  return {
    ...screenshot,
    src: `/project-slide-screens/${filename}`,
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
          href={`/projects/${project.slug}?from=projects`}
          className="projects-auto-media"
          data-project={project.slug}
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
              style={{
                objectFit: "cover",
                ...slideImageFrameStyles[project.slug],
              }}
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

        <TelemetryReadout />

        <div className="projects-topbar-actions">
          <Link href="/?profile=true" className="projects-profile-btn">
            <User size={13} aria-hidden="true" />
            Profile
          </Link>
          <span className="projects-topbar-count">
            {portfolioProjects.length} missions
          </span>
        </div>
      </nav>

      <ProjectsSlider>
        <div className="projects-auto-track">
          <div className="projects-auto-group">
            <ProjectRailItems />
          </div>
          <div className="projects-auto-group" aria-hidden="true">
            <ProjectRailItems duplicate />
          </div>
        </div>
      </ProjectsSlider>
    </main>
  );
}
