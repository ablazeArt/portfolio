"use client";

import { useState } from "react";
import { profile } from "@/app/data/profile";

export function ProfilePanel() {
  const [isScrolled, setIsScrolled] = useState(false);

  return (
    <aside
      className={`project-panel profile-panel${isScrolled ? " is-scrolled" : ""}`}
      aria-live="polite"
    >
      <div
        className="panel-scroll-content"
        onScroll={(event) => setIsScrolled(event.currentTarget.scrollTop > 8)}
      >
        <div className="panel-orbit">
          <span>Solar Core</span>
          <span>Profile</span>
        </div>

        <div>
          <p className="panel-kicker">{profile.title}</p>
          <h2>{profile.name}</h2>
          <p className="panel-summary">{profile.goal}</p>
        </div>

        <dl className="mission-stats">
          <div>
            <dt>Base</dt>
            <dd>{profile.location}</dd>
          </div>
          <div>
            <dt>Focus</dt>
            <dd>Full-stack web</dd>
          </div>
        </dl>

        <p className="profile-copy">{profile.summary}</p>

        <section className="profile-section" aria-labelledby="experience-title">
          <h3 id="experience-title">Experience</h3>
          <p>
            <strong>{profile.experience.role}</strong> at{" "}
            {profile.experience.company}
            <span> {profile.experience.period}</span>
          </p>
          <ul className="highlight-list">
            {profile.experience.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>

        <section className="profile-section" aria-labelledby="skills-title">
          <h3 id="skills-title">Core Stack</h3>
          <div className="stack-cluster">
            {profile.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </section>

        <section className="profile-section" aria-labelledby="selected-work-title">
          <h3 id="selected-work-title">Highlight Projects</h3>
          <ul className="highlight-list">
            {profile.selectedWork.map((work) => (
              <li key={work}>{work}</li>
            ))}
          </ul>
        </section>

        <section className="profile-section" aria-labelledby="education-title">
          <h3 id="education-title">Education</h3>
          <p>{profile.education}</p>
        </section>
      </div>
    </aside>
  );
}
