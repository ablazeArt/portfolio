import { User } from "lucide-react";
import type { CameraReadout } from "./types";

type CameraReadoutPanelProps = {
  cameraReadout: CameraReadout | null;
  drawerOpen: boolean;
  showCameraReadout: boolean;
  openProfile: () => void;
};

export function CameraReadoutPanel({
  cameraReadout,
  drawerOpen,
  showCameraReadout,
  openProfile,
}: CameraReadoutPanelProps) {
  return (
    <>
      {!drawerOpen ? (
        <div className="system-top-actions">
          <button
            type="button"
            className="profile-toggle"
            onClick={openProfile}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <User size={12} aria-hidden="true" />
            Profile
          </button>
        </div>
      ) : null}

      {!drawerOpen && showCameraReadout && cameraReadout ? (
        <aside className="camera-readout" aria-label="Camera position readout">
          <div>
            <span>camera.position</span>
            <code>{`set(${cameraReadout.camera.join(", ")})`}</code>
          </div>
          <div>
            <span>controls.target</span>
            <code>{`set(${cameraReadout.target.join(", ")})`}</code>
          </div>
          <div>
            <span>system rotation deg</span>
            <code>
              {`x:${cameraReadout.systemRotation[0]} y:${cameraReadout.systemRotation[1]} z:${cameraReadout.systemRotation[2]}`}
            </code>
          </div>
          <div>
            <span>distance</span>
            <code>{cameraReadout.distance}</code>
          </div>
        </aside>
      ) : null}
    </>
  );
}
