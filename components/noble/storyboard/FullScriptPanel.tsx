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
      style={{ background: "#0b1929", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center justify-between px-7 py-5">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 flex-1 text-left"
        >
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif", letterSpacing: "0.1em" }}
          >
            Full Script
          </span>
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Inter', sans-serif" }}>
            {open ? "Hide" : "Expand"}
          </span>
          {open
            ? <ChevronUp size={15} style={{ color: "rgba(255,255,255,0.3)" }} />
            : <ChevronDown size={15} style={{ color: "rgba(255,255,255,0.3)" }} />
          }
        </button>

        {onRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            className="flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ml-4"
            style={{
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <RotateCcw size={13} className={regenerating ? "animate-spin" : ""} />
            {regenerating ? "Regenerating…" : "Regenerate Scenes"}
          </button>
        )}
      </div>

      {open && (
        <div className="px-7 pb-7" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p
            className="text-sm leading-loose pt-6"
            style={{ color: "#c8d8e8", fontFamily: "'Inter', sans-serif", whiteSpace: "pre-wrap" }}
          >
            {script}
          </p>
        </div>
      )}
    </div>
  );
}
