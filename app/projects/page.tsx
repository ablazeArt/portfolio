import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { portfolioProjects } from "@/app/data/projects";

export const metadata: Metadata = {
  title: "Projects | Ablaze Portfolio",
  description: "Selected project missions from Fuart Madnurak's portfolio.",
};

const orbitSlots = [
  { angle: -166, size: "clamp(112px, 16vmin, 180px)" },
  { angle: -112, size: "clamp(86px, 11vmin, 132px)" },
  { angle: -66, size: "clamp(98px, 12vmin, 148px)" },
  { angle: -12, size: "clamp(104px, 13vmin, 158px)" },
  { angle: 45, size: "clamp(88px, 11vmin, 132px)" },
  { angle: 101, size: "clamp(100px, 12vmin, 150px)" },
  { angle: 153, size: "clamp(82px, 10vmin, 124px)" },
];

export default function ProjectsOverviewPage() {
  return (
    <main className="projects-overview">
      <div className="projects-overview-shell">
        <section className="projects-showcase" aria-labelledby="projects-title">
          <div className="projects-orbit-center">
            <p className="eyebrow">Selected missions</p>
            <h2 id="projects-title">Projects in orbit</h2>
            <p>
              Full-stack software engineer orbiting frontend craft, backend
              systems, and interactive web products.
            </p>
          </div>

          <div className="projects-orbit-stage" aria-label="Selected project orbit">
            <div className="projects-orbit-ring">
              {portfolioProjects.map((project, index) => {
                const screenshot = project.screenshots?.[0];
                const slot = orbitSlots[index % orbitSlots.length];

                return (
                  <Link
                    key={project.slug}
                    href={`/projects/${project.slug}`}
                    className="project-orbit-item"
                    aria-label={`Open ${project.name} mission brief`}
                    style={{
                      "--orbit-angle": `${slot.angle}deg`,
                      "--orbit-counter-angle": `${slot.angle * -1}deg`,
                      "--orbit-item-size": slot.size,
                      "--project-accent": project.visual.color,
                      "--project-glow": project.visual.glow,
                    } as CSSProperties}
                  >
                    <span className="project-orbit-card">
                      <span className="project-orbit-thumb">
                        {screenshot ? (
                          <Image
                            src={screenshot.src}
                            alt={screenshot.alt}
                            width={screenshot.width}
                            height={screenshot.height}
                            loading="eager"
                            className="project-orbit-image"
                          />
                        ) : (
                          <span className="project-card-placeholder">
                            <span>No image available</span>
                          </span>
                        )}
                      </span>
                      <span className="project-orbit-title">{project.name}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
