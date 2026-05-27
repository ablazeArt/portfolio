import { Link } from "next-view-transitions";
import { Rocket } from "lucide-react";

type SolarHudProps = {
  drawerOpen: boolean;
};

export function SolarHud({ drawerOpen }: SolarHudProps) {
  return (
    <div className="system-hud" aria-hidden={drawerOpen ? "true" : undefined}>
      <p className="hud-kicker">Portfolio system</p>
      <h1 aria-label="Explore my orbit of works.">
        <span className="title-line">Explore my</span>
        <span className="title-line">orbit of</span>
        <span className="title-line">works.</span>
      </h1>
      <p className="hud-copy">
        Full-stack software engineer orbiting frontend craft, backend systems,
        and interactive web products.
      </p>
      <Link href="/projects" className="hud-projects-link">
        View all projects
        <Rocket
          aria-hidden="true"
          size={14}
          style={{ transform: "rotate(45deg)" }}
          className="ml-1.5"
        />
      </Link>
    </div>
  );
}
