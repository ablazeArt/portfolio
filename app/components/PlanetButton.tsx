import type { CSSProperties } from "react";
import type { PortfolioProject } from "@/app/data/projects";

type PlanetButtonProps = {
  project: PortfolioProject;
  isSelected: boolean;
  onSelect: () => void;
};

type PlanetStyle = CSSProperties & Record<`--${string}`, string>;

export function PlanetButton({
  project,
  isSelected,
  onSelect,
}: PlanetButtonProps) {
  const style: PlanetStyle = {
    "--planet-x": project.orbit.x,
    "--planet-y": project.orbit.y,
    "--planet-size": `${project.visual.size}px`,
    "--planet-color": project.visual.color,
    "--planet-glow": project.visual.glow,
    "--orbit-duration": project.orbit.duration,
    "--orbit-delay": project.orbit.delay,
  } satisfies PlanetStyle;

  return (
    <button
      type="button"
      className={`planet-button${isSelected ? " is-selected" : ""}`}
      style={style}
      data-label-side={project.orbit.labelSide}
      data-ring={project.visual.ring ? "true" : undefined}
      aria-pressed={isSelected}
      aria-label={`Open project ${project.name}`}
      aria-describedby={`${project.slug}-summary`}
      onClick={onSelect}
    >
      <span className="planet-body" aria-hidden="true" />
      <span className="planet-label" aria-hidden="true">
        <span>{project.codename}</span>
        <small>{project.category}</small>
      </span>
      <span id={`${project.slug}-summary`} className="sr-only">
        {project.summary}
      </span>
    </button>
  );
}
