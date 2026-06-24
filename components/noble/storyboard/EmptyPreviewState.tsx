import Image from "next/image";
import { ImageIcon } from "lucide-react";

interface Props {
  onGenerate: () => void;
  disabled?: boolean;
  aspectRatio?: string;
}

export function EmptyPreviewState({ onGenerate, disabled, aspectRatio }: Props) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center rounded-xl"
      style={{ background: "#080f1c", border: "1px dashed rgba(255,255,255,0.07)" }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <ImageIcon size={18} style={{ color: "rgba(255,255,255,0.2)" }} />
      </div>
      <div className="space-y-1">
        <p className="text-xs font-semibold text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
          No image generated yet
        </p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
          Creates the scene visual<br />from the prompt below
        </p>
        {aspectRatio && (
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.15)", fontFamily: "'Inter', sans-serif" }}>
            {aspectRatio}
          </p>
        )}
      </div>
      <button
        onClick={onGenerate}
        disabled={disabled}
        className="px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: "rgba(201,162,39,0.14)",
          color: "#c9a227",
          border: "1px solid rgba(201,162,39,0.25)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        Generate Image
      </button>
    </div>
  );
}
