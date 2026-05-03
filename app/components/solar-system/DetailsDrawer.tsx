import { ProfilePanel } from "@/app/components/ProfilePanel";
import { ProjectPanel } from "@/app/components/ProjectPanel";
import { portfolioProjects, type PortfolioProject } from "@/app/data/projects";

type DetailsDrawerProps = {
  activeIndex: number;
  closeDrawer: () => void;
  drawerOpen: boolean;
  profileOpen: boolean;
  selectedProject: PortfolioProject | null;
};

export function DetailsDrawer({
  activeIndex,
  closeDrawer,
  drawerOpen,
  profileOpen,
  selectedProject,
}: DetailsDrawerProps) {
  if (!drawerOpen) {
    return null;
  }

  return (
    <div className="project-drawer-wrap">
      <button
        type="button"
        className="drawer-close"
        onClick={closeDrawer}
        aria-label="Close details"
      >
        Close
      </button>
      {profileOpen ? (
        <ProfilePanel />
      ) : selectedProject ? (
        <ProjectPanel
          project={selectedProject}
          activeIndex={activeIndex}
          total={portfolioProjects.length}
        />
      ) : null}
    </div>
  );
}
