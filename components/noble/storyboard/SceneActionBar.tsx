import { ImageIcon, Video, Mic, CheckCircle2, RefreshCw } from "lucide-react";
import type { NobleVideoScene } from "@/types/noble";

interface Props {
  scene: NobleVideoScene;
  uiStatus: string;
  onGenerateImage: () => void;
  onGenerateVideo: () => void;
  onGenerateVoice: () => void;
  onApprove: () => void;
}

interface ActionButton {
  label: string;
  loadingLabel?: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  disabledReason?: string;
  active?: boolean;
  variant: "gold" | "green" | "muted" | "approved";
}

export function SceneActionBar({ scene, uiStatus, onGenerateImage, onGenerateVideo, onGenerateVoice, onApprove }: Props) {
  const isGenerating = uiStatus.endsWith("_generating");
  const hasImage  = !!scene.image_url;
  const hasVideo  = !!scene.video_url;
  const isApproved = uiStatus === "approved" || scene.status === "approved";

  const buttons: ActionButton[] = [
    {
      label:        hasImage ? "Regenerate Image" : "Generate Image",
      loadingLabel: "Generating…",
      icon:         hasImage ? <RefreshCw size={15} /> : <ImageIcon size={15} />,
      onClick:      onGenerateImage,
      disabled:     isGenerating,
      variant:      "gold",
    },
    {
      label:         hasVideo ? "Regenerate Video" : "Generate Video",
      loadingLabel:  "Generating…",
      icon:          <Video size={15} />,
      onClick:       onGenerateVideo,
      disabled:      isGenerating || !hasImage,
      disabledReason: !hasImage ? "Generate an image first" : undefined,
      variant:       "green",
    },
    {
      label:        "Add Voice",
      loadingLabel: "Recording…",
      icon:         <Mic size={15} />,
      onClick:      onGenerateVoice,
      disabled:     isGenerating,
      variant:      "muted",
    },
    {
      label:   isApproved ? "Approved" : "Approve Scene",
      icon:    <CheckCircle2 size={15} />,
      onClick: onApprove,
      disabled: isGenerating || isApproved,
      active:  isApproved,
      variant: "approved",
    },
  ];

  const styleMap = {
    gold: {
      base:   { background: "rgba(201,162,39,0.1)",  color: "#c9a227", border: "1px solid rgba(201,162,39,0.22)" },
      active: { background: "rgba(201,162,39,0.18)", color: "#e4b93a", border: "1px solid rgba(201,162,39,0.4)" },
    },
    green: {
      base:   { background: "rgba(64,145,108,0.08)",  color: "#40916c", border: "1px solid rgba(64,145,108,0.18)" },
      active: { background: "rgba(64,145,108,0.16)",  color: "#6ee7b7", border: "1px solid rgba(64,145,108,0.3)" },
    },
    muted: {
      base:   { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" },
      active: { background: "rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.14)" },
    },
    approved: {
      base:   { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)",  border: "1px solid rgba(255,255,255,0.08)" },
      active: { background: "rgba(228,185,58,0.12)",  color: "#e4b93a",                border: "1px solid rgba(228,185,58,0.3)" },
    },
  };

  return (
    <div
      className="flex items-center gap-3 px-7 py-5"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      {buttons.map((btn) => {
        const isThisGenerating =
          (btn.label.includes("Image")) && uiStatus === "image_generating" ||
          (btn.label.includes("Video")) && uiStatus === "video_generating" ||
          (btn.label.includes("Voice")) && uiStatus === "voice_generating";

        const styles = styleMap[btn.variant];
        const st = btn.active ? styles.active : styles.base;

        return (
          <div key={btn.label} className="relative group">
            <button
              onClick={btn.onClick}
              disabled={btn.disabled}
              className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ ...st, fontFamily: "'Inter', sans-serif" }}
            >
              {btn.icon}
              {isThisGenerating && btn.loadingLabel ? btn.loadingLabel : btn.label}
            </button>
            {btn.disabled && btn.disabledReason && (
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-3 py-2 rounded-xl text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10"
                style={{
                  background: "#0d1628",
                  color: "rgba(255,255,255,0.6)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {btn.disabledReason}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
