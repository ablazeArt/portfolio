"use client";

import { CameraReadoutPanel } from "./solar-system/CameraReadoutPanel";
import { ControlHints } from "./solar-system/ControlHints";
import { DetailsDrawer } from "./solar-system/DetailsDrawer";
import { SolarHud } from "./solar-system/SolarHud";
import { useSolarSystemScene } from "./solar-system/useSolarSystemScene";

export function SolarSystemScene() {
  const {
    activeIndex,
    cameraReadout,
    closeDrawer,
    drawerOpen,
    mountRef,
    profileOpen,
    selectedProject,
    setShowCameraReadout,
    shellClassName,
    showCameraReadout,
  } = useSolarSystemScene();

  return (
    <main className={shellClassName}>
      <div
        ref={mountRef}
        className="three-system-canvas"
        aria-label="3D project solar system"
      />

      <SolarHud drawerOpen={drawerOpen} />
      <ControlHints />
      <CameraReadoutPanel
        cameraReadout={cameraReadout}
        drawerOpen={drawerOpen}
        setShowCameraReadout={setShowCameraReadout}
        showCameraReadout={showCameraReadout}
      />
      <DetailsDrawer
        activeIndex={activeIndex}
        closeDrawer={closeDrawer}
        drawerOpen={drawerOpen}
        profileOpen={profileOpen}
        selectedProject={selectedProject}
      />
    </main>
  );
}
