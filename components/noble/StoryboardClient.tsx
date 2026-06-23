"use client";

import { useState } from "react";
import Image from "next/image";
import type { NobleVideoProject, NobleVideoScene, NobleCharacterRef } from "@/types/noble";

interface Props {
  project: NobleVideoProject;
  initialScenes: NobleVideoScene[];
  characterRefs: NobleCharacterRef[];
}

export default function StoryboardClient({ project, initialScenes, characterRefs }: Props) {
  const [scenes, setScenes] = useState(initialScenes);
  const [generating, setGenerating] = useState<Record<string, string>>({});
  const [error, setError] = useState<Record<string, string>>({});

  const primaryRef = characterRefs.find((r) => r.is_primary);

  async function generateImage(scene: NobleVideoScene) {
    setGenerating((prev) => ({ ...prev, [scene.id]: "image" }));
    setError((prev) => { const next = { ...prev }; delete next[scene.id]; return next; });

    try {
      const res = await fetch("/api/noble/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scene_id: scene.id,
          project_id: project.id,
          visual_prompt: scene.visual_prompt,
          camera_direction: scene.camera_direction,
          noble_action: scene.noble_action,
          background: scene.background,
          reference_image_url: primaryRef?.image_url,
          aspect_ratio: project.aspect_ratio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setScenes((prev) => prev.map((s) => s.id === scene.id ? { ...s, image_url: data.image_url, status: "image_generated" } : s));
    } catch (err) {
      setError((prev) => ({ ...prev, [scene.id]: String(err) }));
    } finally {
      setGenerating((prev) => { const next = { ...prev }; delete next[scene.id]; return next; });
    }
  }

  async function generateVideo(scene: NobleVideoScene) {
    if (!scene.image_url) return;
    setGenerating((prev) => ({ ...prev, [scene.id]: "video" }));
    setError((prev) => { const next = { ...prev }; delete next[scene.id]; return next; });

    try {
      const res = await fetch("/api/noble/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scene_id: scene.id,
          project_id: project.id,
          approved_image_url: scene.image_url,
          noble_action: scene.noble_action,
          camera_direction: scene.camera_direction,
          duration: Math.ceil(project.duration_seconds / scenes.length),
          aspect_ratio: project.aspect_ratio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setScenes((prev) => prev.map((s) => s.id === scene.id ? { ...s, video_url: data.video_url, status: "video_generated" } : s));
    } catch (err) {
      setError((prev) => ({ ...prev, [scene.id]: String(err) }));
    } finally {
      setGenerating((prev) => { const next = { ...prev }; delete next[scene.id]; return next; });
    }
  }

  async function generateVoice(scene: NobleVideoScene) {
    setGenerating((prev) => ({ ...prev, [scene.id]: "voice" }));
    setError((prev) => { const next = { ...prev }; delete next[scene.id]; return next; });

    try {
      const res = await fetch("/api/noble/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scene_id: scene.id,
          project_id: project.id,
          script_line: scene.script_line,
          tone: project.tone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setScenes((prev) => prev.map((s) => s.id === scene.id ? { ...s, voice_url: data.voice_url } : s));
    } catch (err) {
      setError((prev) => ({ ...prev, [scene.id]: String(err) }));
    } finally {
      setGenerating((prev) => { const next = { ...prev }; delete next[scene.id]; return next; });
    }
  }

  async function approveScene(scene: NobleVideoScene) {
    await fetch("/api/noble/approve-scene", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scene_id: scene.id, status: "approved" }),
    });
    setScenes((prev) => prev.map((s) => s.id === scene.id ? { ...s, status: "approved" } : s));
  }

  const statusBadge: Record<string, { label: string; color: string }> = {
    pending: { label: "Pending", color: "#8899aa" },
    image_generated: { label: "Image Ready", color: "#c9a227" },
    video_generated: { label: "Video Ready", color: "#40916c" },
    approved: { label: "Approved", color: "#e8c547" },
    error: { label: "Error", color: "#ef4444" },
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">{project.title}</h1>
          <p style={{ color: "#8899aa" }}>
            {project.platform?.replace(/_/g, " ")} · {project.duration_seconds}s · {project.tone} · {project.aspect_ratio}
          </p>
        </div>
        <a
          href={`/projects/${project.id}/editor`}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity"
          style={{ background: "linear-gradient(135deg, #c9a227, #e8c547)", color: "#0a1628" }}
        >
          Final Editor →
        </a>
      </div>

      {/* Script */}
      {project.script && (
        <div className="rounded-2xl p-5 mb-8 border" style={{ background: "#0e1c33", borderColor: "#1a2d52" }}>
          <h3 className="text-xs font-semibold mb-2" style={{ color: "#c9a227" }}>FULL SCRIPT</h3>
          <p className="text-sm leading-relaxed" style={{ color: "#ccd6e0" }}>{project.script}</p>
        </div>
      )}

      {/* Scene Cards */}
      <div className="space-y-6">
        {scenes.map((scene) => {
          const badge = statusBadge[scene.status] ?? statusBadge.pending;
          const isGenerating = !!generating[scene.id];
          const sceneError = error[scene.id];

          return (
            <div key={scene.id} className="rounded-2xl overflow-hidden card-glow" style={{ background: "#0e1c33" }}>
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#132040" }}>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "linear-gradient(135deg, #c9a227, #e8c547)", color: "#0a1628" }}>
                    {scene.scene_number}
                  </span>
                  <span className="text-sm font-semibold text-white">Scene {scene.scene_number}</span>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ color: badge.color, background: "rgba(255,255,255,0.05)" }}>
                  {badge.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6 p-6">
                {/* Scene Preview */}
                <div>
                  {scene.image_url ? (
                    <div className="relative rounded-xl overflow-hidden aspect-video mb-3">
                      <Image src={scene.image_url} alt={`Scene ${scene.scene_number}`} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="rounded-xl flex items-center justify-center aspect-video mb-3" style={{ background: "#132040" }}>
                      <span style={{ color: "#1a2d52", fontSize: "3rem" }}>🐂</span>
                    </div>
                  )}

                  {scene.video_url && (
                    <video
                      src={scene.video_url}
                      controls
                      className="w-full rounded-xl mb-3"
                      style={{ background: "#132040" }}
                    />
                  )}

                  {scene.voice_url && (
                    <audio src={scene.voice_url} controls className="w-full mb-3" />
                  )}

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => generateImage(scene)}
                      disabled={isGenerating}
                      className="py-2 px-3 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                      style={{ background: "#132040", color: "#c9a227", border: "1px solid #1a2d52" }}
                    >
                      {generating[scene.id] === "image" ? "Generating..." : "Generate Image"}
                    </button>
                    <button
                      onClick={() => generateVideo(scene)}
                      disabled={isGenerating || !scene.image_url}
                      className="py-2 px-3 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                      style={{ background: "#132040", color: "#40916c", border: "1px solid #1a2d52" }}
                    >
                      {generating[scene.id] === "video" ? "Generating..." : "Generate Video"}
                    </button>
                    <button
                      onClick={() => generateVoice(scene)}
                      disabled={isGenerating}
                      className="py-2 px-3 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                      style={{ background: "#132040", color: "#8899aa", border: "1px solid #1a2d52" }}
                    >
                      {generating[scene.id] === "voice" ? "Recording..." : "Add Voice"}
                    </button>
                    <button
                      onClick={() => approveScene(scene)}
                      disabled={isGenerating || scene.status === "approved"}
                      className="py-2 px-3 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                      style={{
                        background: scene.status === "approved" ? "rgba(201,162,39,0.15)" : "#132040",
                        color: scene.status === "approved" ? "#c9a227" : "#8899aa",
                        border: `1px solid ${scene.status === "approved" ? "#c9a227" : "#1a2d52"}`,
                      }}
                    >
                      {scene.status === "approved" ? "Approved" : "Approve Scene"}
                    </button>
                  </div>

                  {sceneError && <p className="mt-2 text-xs text-red-400">{sceneError}</p>}
                </div>

                {/* Scene Details */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: "#c9a227" }}>SCRIPT LINE</p>
                    <p className="text-sm" style={{ color: "#ccd6e0" }}>{scene.script_line}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: "#c9a227" }}>CAPTION</p>
                    <p className="text-sm" style={{ color: "#ccd6e0" }}>{scene.caption_text}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: "#c9a227" }}>VISUAL PROMPT</p>
                    <p className="text-sm" style={{ color: "#8899aa" }}>{scene.visual_prompt}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold mb-1" style={{ color: "#c9a227" }}>CAMERA</p>
                      <p className="text-xs" style={{ color: "#8899aa" }}>{scene.camera_direction}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-1" style={{ color: "#c9a227" }}>NOBLE ACTION</p>
                      <p className="text-xs" style={{ color: "#8899aa" }}>{scene.noble_action}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-1" style={{ color: "#c9a227" }}>BACKGROUND</p>
                      <p className="text-xs" style={{ color: "#8899aa" }}>{scene.background}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-1" style={{ color: "#c9a227" }}>VOICE DIRECTION</p>
                      <p className="text-xs" style={{ color: "#8899aa" }}>{scene.voice_direction}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
