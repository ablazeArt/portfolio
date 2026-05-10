"use client";

import { useState } from "react";
import { profile } from "@/app/data/profile";
import { Briefcase, Code, GraduationCap, Layers, MapPin, Star } from "lucide-react";

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
            <dt className="flex items-center gap-1"><MapPin size={16} /> Base</dt>
            <dd>{profile.location}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1"><Code size={16} /> Focus</dt>
            <dd>Full-stack web</dd>
          </div>
        </dl>

        <p className="profile-copy">{profile.summary}</p>

        <section className="profile-section" aria-labelledby="experience-title">
          <h3 id="experience-title" className="flex items-center gap-2"><Briefcase size={20} /> Experience</h3>
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
          <h3 id="skills-title" className="flex items-center gap-2"><Layers size={20} /> Core Stack</h3>
          <div className="stack-cluster">
            {profile.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </section>

        <section className="profile-section" aria-labelledby="selected-work-title">
          <h3 id="selected-work-title" className="flex items-center gap-2"><Star size={20} /> Highlight Projects</h3>
          <ul className="highlight-list">
            {profile.selectedWork.map((work) => (
              <li key={work}>{work}</li>
            ))}
          </ul>
        </section>

        <section className="profile-section" aria-labelledby="education-title">
          <h3 id="education-title" className="flex items-center gap-2"><GraduationCap size={20} /> Education</h3>
          <p>{profile.education}</p>
        </section>
      </div>
    </aside>
  );
}
