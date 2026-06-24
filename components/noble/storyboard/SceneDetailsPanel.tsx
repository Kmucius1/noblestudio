import type { NobleVideoScene } from "@/types/noble";

interface Props {
  scene: NobleVideoScene;
}

function DetailBlock({ label, value, large }: { label: string; value?: string; large?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <p
        className="text-xs font-bold tracking-widest uppercase mb-1.5"
        style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif" }}
      >
        {label}
      </p>
      <p
        className={large ? "text-sm leading-relaxed" : "text-xs leading-relaxed"}
        style={{ color: large ? "#e2eaf4" : "#8899aa", fontFamily: "'Inter', sans-serif" }}
      >
        {value}
      </p>
    </div>
  );
}

export function SceneDetailsPanel({ scene }: Props) {
  return (
    <div className="flex flex-col gap-5 h-full">
      <DetailBlock label="Script Line" value={scene.script_line} large />
      <DetailBlock label="Caption" value={scene.caption_text} large />

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px" }}>
        <DetailBlock label="Visual Prompt" value={scene.visual_prompt} />
      </div>

      <div
        className="grid grid-cols-2 gap-x-6 gap-y-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px" }}
      >
        <DetailBlock label="Camera" value={scene.camera_direction} />
        <DetailBlock label="Noble Action" value={scene.noble_action} />
        <DetailBlock label="Background" value={scene.background} />
        <DetailBlock label="Voice Direction" value={scene.voice_direction} />
      </div>
    </div>
  );
}
