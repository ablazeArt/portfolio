"use client";

import { useEffect, useState } from "react";
import { Activity, Orbit } from "lucide-react";

export default function TelemetryReadout() {
  const [time, setTime] = useState("");
  const planets = ["MERCURY", "VENUS", "EARTH", "MARS", "JUPITER", "SATURN", "URANUS", "NEPTUNE"];
  const [planetIndex, setPlanetIndex] = useState(2); // Starts at Earth

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const stardate = (now.getFullYear() + now.getMonth() / 12 + now.getDate() / 365).toFixed(4);
      const timeStr = now.toLocaleTimeString("en-US", { hour12: false });
      setTime(`STARDATE: ${stardate} // ${timeStr}`);
    };
    
    updateClock();
    const interval = setInterval(updateClock, 1000);

    const scanInterval = setInterval(() => {
      setPlanetIndex((prev) => (prev + 1) % planets.length);
    }, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(scanInterval);
    };
  }, []);

  return (
    <div className="projects-telemetry" aria-label="System Telemetry">
      <div className="telemetry-item system-status">
        <span className="pulse-dot" aria-hidden="true" />
        <Activity size={12} className="telemetry-icon pulse-icon" />
        <span>SYS: NOMINAL</span>
      </div>
      <span className="telemetry-separator">|</span>
      <div className="telemetry-item system-coords">
        <Orbit size={12} className="telemetry-icon rotate-icon" />
        <span>SCANNING: SOL // {planets[planetIndex]}</span>
      </div>
      <span className="telemetry-separator">|</span>
      <div className="telemetry-item system-time">
        <span>{time}</span>
      </div>
    </div>
  );
}
