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
    </div>
  );
}
