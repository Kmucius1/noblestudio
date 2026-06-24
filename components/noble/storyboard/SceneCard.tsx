import { StatusBadge } from "./StatusBadge";
import { ScenePreview } from "./ScenePreview";
import { SceneDetailsPanel } from "./SceneDetailsPanel";
import { SceneActionBar } from "./SceneActionBar";
import type { NobleVideoScene } from "@/types/noble";

interface Props {
  scene: NobleVideoScene;
  uiStatus: string;
  error?: { type: string; raw: string };
  videoJobId?: string;
  videoJobStartedAt?: number;
  onGenerateImage: (provider?: "higgsfield" | "fal") => void;
  onGenerateVideo: () => void;
  onGenerateVoice: () => void;
  onApprove: () => void;
  aspectRatio?: string;
}

export function SceneCard({
  scene,
  uiStatus,
  error,
  videoJobId,
  videoJobStartedAt,
  onGenerateImage,
  onGenerateVideo,
  onGenerateVoice,
  onApprove,
  aspectRatio,
}: Props) {
  const isGenerating = uiStatus.endsWith("_generating");

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#0b1929", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* ── Card header ── */}
      <div
        className="flex items-center justify-between px-7 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-4">
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{
              background: "linear-gradient(135deg, #c9a227, #e8c547)",
              color: "#0a1628",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {scene.scene_number}
          </span>
          <span
            className="text-base font-semibold text-white"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Scene {scene.scene_number}
          </span>
        </div>
        <StatusBadge status={uiStatus} />
      </div>

      {/* ── Card body: left preview + right details ── */}
      <div className="flex gap-0">
        {/* Left: image/video preview */}
        <div
          className="shrink-0 p-6"
          style={{ width: 280, borderRight: "1px solid rgba(255,255,255,0.06)" }}
        >
          <ScenePreview
            scene={scene}
            uiStatus={uiStatus}
            error={error}
            videoJobId={videoJobId}
            videoJobStartedAt={videoJobStartedAt}
            onGenerateImage={() => onGenerateImage("higgsfield")}
            onRetryImage={() => onGenerateImage("higgsfield")}
            onSwitchProvider={() => onGenerateImage("fal")}
            disabled={isGenerating}
            aspectRatio={aspectRatio}
          />
        </div>

        {/* Right: scene details */}
        <div className="flex-1 p-7 min-w-0">
          <SceneDetailsPanel scene={scene} />
        </div>
      </div>

      {/* ── Action bar ── */}
      <SceneActionBar
        scene={scene}
        uiStatus={uiStatus}
        onGenerateImage={() => onGenerateImage("higgsfield")}
        onGenerateVideo={onGenerateVideo}
        onGenerateVoice={onGenerateVoice}
        onApprove={onApprove}
      />
    </div>
  );
}
