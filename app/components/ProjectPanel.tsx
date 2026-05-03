"use client";

import Link from "next/link";
import { useState } from "react";
import type { PortfolioProject } from "@/app/data/projects";

type ProjectPanelProps = {
  project: PortfolioProject;
  activeIndex: number;
  total: number;
};

export function ProjectPanel({
  project,
  activeIndex,
  total,
}: ProjectPanelProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  return (
    <aside
      className={`project-panel${isScrolled ? " is-scrolled" : ""}`}
      aria-live="polite"
    >
      <div
        className="panel-scroll-content"
        onScroll={(event) => setIsScrolled(event.currentTarget.scrollTop > 8)}
      >
        <div className="panel-orbit">
          <span>Mission {String(activeIndex + 1).padStart(2, "0")}</span>
          <span>
            {activeIndex + 1}/{total}
          </span>
        </div>

        <div>
          <p className="panel-kicker">{project.category}</p>
          <h2>{project.name}</h2>
          <p className="panel-summary">{project.summary}</p>
        </div>

        <dl className="mission-stats">
          <div>
            <dt>Status</dt>
            <dd>{project.status}</dd>
          </div>
          <div>
            <dt>Year</dt>
            <dd>{project.year}</dd>
          </div>
        </dl>

        <div className="stack-cluster" aria-label={`${project.name} stack`}>
          {project.stack.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>

        <ul className="highlight-list">
          {project.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>

        <div className="panel-actions">
          <Link href={`/projects/${project.slug}`}>Open mission brief</Link>
          <a href="#mission-index-title">Browse all planets</a>
        </div>
      </div>
    </aside>
  );
}
