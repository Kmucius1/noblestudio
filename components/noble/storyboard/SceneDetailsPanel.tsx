import type { NobleVideoScene } from "@/types/noble";

interface Props {
  scene: NobleVideoScene;
}

function DetailBlock({ label, value, large }: { label: string; value?: string; large?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <p
        className="text-xs font-bold tracking-widest uppercase mb-2"
        style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif", letterSpacing: "0.1em" }}
      >
        {label}
      </p>
      <p
        className="leading-relaxed"
        style={{
          fontSize: large ? "15px" : "13px",
          color: large ? "#dce8f4" : "#7a93aa",
          fontFamily: "'Inter', sans-serif",
          lineHeight: 1.65,
        }}
      >
        {value}
      </p>
    </div>
  );
}

export function SceneDetailsPanel({ scene }: Props) {
  return (
    <div className="flex flex-col gap-6 h-full">
      <DetailBlock label="Script Line"  value={scene.script_line}   large />
      <DetailBlock label="Caption"      value={scene.caption_text}  large />

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>
        <DetailBlock label="Visual Prompt" value={scene.visual_prompt} />
      </div>

      <div
        className="grid grid-cols-2 gap-x-8 gap-y-5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}
      >
        <DetailBlock label="Camera"          value={scene.camera_direction} />
        <DetailBlock label="Noble Action"    value={scene.noble_action} />
        <DetailBlock label="Background"      value={scene.background} />
        <DetailBlock label="Voice Direction" value={scene.voice_direction} />
      </div>
    </div>
  );
}
