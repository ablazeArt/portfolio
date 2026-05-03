import type { Dispatch, SetStateAction } from "react";
import type { CameraReadout } from "./types";

type CameraReadoutPanelProps = {
  cameraReadout: CameraReadout | null;
  drawerOpen: boolean;
  setShowCameraReadout: Dispatch<SetStateAction<boolean>>;
  showCameraReadout: boolean;
};

export function CameraReadoutPanel({
  cameraReadout,
  drawerOpen,
  setShowCameraReadout,
  showCameraReadout,
}: CameraReadoutPanelProps) {
  return (
    <>
      {!drawerOpen ? (
        <button
          type="button"
          className={`camera-toggle${showCameraReadout ? " is-active" : ""}`}
          onClick={() => setShowCameraReadout((isVisible) => !isVisible)}
          aria-pressed={showCameraReadout}
        >
          Camera
        </button>
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
