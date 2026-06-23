"use client";

import { useState } from "react";
import type { NobleVideoProject, NobleVideoScene, NobleExport } from "@/types/noble";

interface Props {
  project: NobleVideoProject;
  scenes: NobleVideoScene[];
  exports: NobleExport[];
}

export default function FinalEditor({ project, scenes: initialScenes, exports: initialExports }: Props) {
  const [scenes, setScenes] = useState(initialScenes);
  const [exports, setExports] = useState(initialExports);
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");

  const approvedScenes = scenes.filter((s) => s.status === "approved");
  const totalScenes = scenes.length;

  function moveScene(index: number, direction: "up" | "down") {
    const newScenes = [...scenes];
    const swap = direction === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= newScenes.length) return;
    [newScenes[index], newScenes[swap]] = [newScenes[swap], newScenes[index]];
    setScenes(newScenes);
  }

  async function handleExport() {
    setExporting(true);
    setExportStatus("Queuing render...");

    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: project.id,
          aspect_ratio: project.aspect_ratio,
          format: "mp4",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setExportStatus(data.message ?? "Export queued!");
      setExports((prev) => [data, ...prev]);
    } catch (err) {
      setExportStatus(`Error: ${err}`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Final Editor</h1>
          <p style={{ color: "#8899aa" }}>{project.title} · {project.aspect_ratio} · {project.duration_seconds}s</p>
        </div>
        <a href={`/projects/${project.id}/storyboard`} className="text-sm" style={{ color: "#c9a227" }}>
          ← Back to Storyboard
        </a>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Scene Order */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Scene Order</h2>
            <span className="text-sm" style={{ color: "#8899aa" }}>
              {approvedScenes.length}/{totalScenes} approved
            </span>
          </div>

          <div className="space-y-3">
            {scenes.map((scene, i) => (
              <div
                key={scene.id}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: "#0e1c33", border: `1px solid ${scene.status === "approved" ? "rgba(201,162,39,0.2)" : "#132040"}` }}
              >
                <span className="text-xs font-bold w-6 text-center" style={{ color: "#c9a227" }}>{i + 1}</span>

                {scene.image_url ? (
                  <img src={scene.image_url} alt="" className="w-16 h-10 object-cover rounded-lg shrink-0" />
                ) : (
                  <div className="w-16 h-10 rounded-lg shrink-0" style={{ background: "#132040" }} />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{scene.script_line}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: "#8899aa" }}>{scene.caption_text}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {scene.voice_url && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(64,145,108,0.2)", color: "#40916c" }}>Voice</span>}
                  {scene.video_url && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(201,162,39,0.2)", color: "#c9a227" }}>Video</span>}
                  {scene.status === "approved" && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(201,162,39,0.2)", color: "#e8c547" }}>✓</span>}
                </div>

                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => moveScene(i, "up")} disabled={i === 0} className="text-xs px-2 py-0.5 rounded transition-colors disabled:opacity-30" style={{ color: "#8899aa" }}>↑</button>
                  <button onClick={() => moveScene(i, "down")} disabled={i === scenes.length - 1} className="text-xs px-2 py-0.5 rounded transition-colors disabled:opacity-30" style={{ color: "#8899aa" }}>↓</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Panel */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Export</h2>

          <div className="rounded-2xl p-5 mb-4" style={{ background: "#0e1c33" }}>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span style={{ color: "#8899aa" }}>Format</span>
                <span className="text-white font-medium">MP4</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#8899aa" }}>Aspect Ratio</span>
                <span className="text-white font-medium">{project.aspect_ratio}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#8899aa" }}>Duration</span>
                <span className="text-white font-medium">{project.duration_seconds}s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#8899aa" }}>Approved Scenes</span>
                <span style={{ color: approvedScenes.length === totalScenes ? "#40916c" : "#c9a227" }} className="font-medium">
                  {approvedScenes.length}/{totalScenes}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-xs" style={{ color: "#8899aa" }}>
              <p>✓ Noble voiceover</p>
              <p>✓ Captions overlay</p>
              <p>✓ EHM logo watermark</p>
              <p>✓ CTA end card</p>
              <p className="opacity-50">⏳ FFmpeg render worker</p>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting || approvedScenes.length === 0}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #c9a227, #e8c547)", color: "#0a1628" }}
            >
              {exporting ? "Queuing..." : "Render Final Video"}
            </button>

            {exportStatus && (
              <p className="mt-3 text-xs text-center" style={{ color: "#8899aa" }}>{exportStatus}</p>
            )}
          </div>

          {/* Export History */}
          {exports.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "#c9a227" }}>EXPORT HISTORY</h3>
              <div className="space-y-2">
                {exports.map((exp) => (
                  <div key={exp.id} className="p-3 rounded-xl" style={{ background: "#0e1c33" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white font-medium">{exp.format?.toUpperCase()}</span>
                      <span className="text-xs" style={{ color: "#8899aa" }}>{exp.duration_seconds}s</span>
                    </div>
                    {exp.export_url && (
                      <a href={exp.export_url} download className="text-xs" style={{ color: "#c9a227" }}>
                        Download →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
