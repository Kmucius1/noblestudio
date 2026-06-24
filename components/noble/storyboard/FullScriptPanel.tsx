"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";

interface Props {
  script: string;
  onRegenerate?: () => void;
  regenerating?: boolean;
}

export function FullScriptPanel({ script, onRegenerate, regenerating }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#0d1a2e", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 flex-1 text-left"
        >
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif" }}
          >
            Full Script
          </span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'Inter', sans-serif" }}>
            {open ? "Hide" : "Expand"}
          </span>
          {open
            ? <ChevronUp size={14} style={{ color: "rgba(255,255,255,0.25)" }} />
            : <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.25)" }} />
          }
        </button>

        {onRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ml-4"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.07)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <RotateCcw size={11} className={regenerating ? "animate-spin" : ""} />
            {regenerating ? "Regenerating…" : "Regenerate Scenes"}
          </button>
        )}
      </div>

      {/* Expanded content */}
      {open && (
        <div
          className="px-6 pb-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p
            className="text-sm leading-relaxed pt-5"
            style={{ color: "#ccd6e0", fontFamily: "'Inter', sans-serif", whiteSpace: "pre-wrap" }}
          >
            {script}
          </p>
        </div>
      )}
    </div>
  );
}
