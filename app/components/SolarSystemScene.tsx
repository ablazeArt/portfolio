"use client";

import { Camera } from "lucide-react";

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
    openProfile,
  } = useSolarSystemScene();

  return (
    <main className={shellClassName}>
      <div
        ref={mountRef}
        className="three-system-canvas"
        aria-label="3D project solar system"
      />

      <SolarHud drawerOpen={drawerOpen} />
      
      {!drawerOpen ? (
        <div className="system-bottom-actions">
          <button
            type="button"
            className={`camera-toggle${showCameraReadout ? " is-active" : ""}`}
            onClick={() => setShowCameraReadout((isVisible) => !isVisible)}
            aria-pressed={showCameraReadout}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Camera size={12} aria-hidden="true" />
            Camera
          </button>
          <ControlHints />
        </div>
      ) : null}

      <CameraReadoutPanel
        cameraReadout={cameraReadout}
        drawerOpen={drawerOpen}
        showCameraReadout={showCameraReadout}
        openProfile={openProfile}
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
