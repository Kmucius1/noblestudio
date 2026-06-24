"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ProjectEditorHeader } from "./storyboard/ProjectEditorHeader";
import { FullScriptPanel } from "./storyboard/FullScriptPanel";
import { SceneCard } from "./storyboard/SceneCard";
import type { NobleVideoProject, NobleVideoScene, NobleCharacterRef } from "@/types/noble";

interface Props {
  project: NobleVideoProject;
  initialScenes: NobleVideoScene[];
  characterRefs: NobleCharacterRef[];
}

interface SceneError {
  type: "image" | "video" | "voice";
  raw: string;
}

interface VideoJob {
  jobId: string;
  sceneId: string;
  startedAt: number;
}

function getUIStatus(
  scene: NobleVideoScene,
  generating: Record<string, string>,
  errors: Record<string, SceneError>,
  videoJobs: VideoJob[]
): string {
  const gen = generating[scene.id];
  if (gen === "image") return "image_generating";
  if (gen === "voice") return "voice_generating";
  if (errors[scene.id]) return "image_failed";
  if (scene.status === "approved") return "approved";
  if (videoJobs.some((j) => j.sceneId === scene.id)) return "video_generating";
  if (scene.video_url) return "video_ready";
  if (scene.image_url) return "image_ready";
  return "pending";
}

export default function StoryboardClient({ project, initialScenes, characterRefs }: Props) {
  const [scenes, setScenes] = useState<NobleVideoScene[]>(initialScenes);
  const [generating, setGenerating] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, SceneError>>({});
  const [videoJobs, setVideoJobs] = useState<VideoJob[]>([]);
  const pollTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const primaryRef = characterRefs.find((r) => r.is_primary);

  // ── Video job polling ─────────────────────────────────────────────────────
  const pollVideoJob = useCallback(async (job: VideoJob) => {
    try {
      const res = await fetch(
        `/api/noble/job-status/${job.jobId}?scene_id=${job.sceneId}&type=video`
      );
      const data = await res.json();

      if (data.status === "completed" && data.url) {
        setScenes((prev) =>
          prev.map((s) =>
            s.id === job.sceneId ? { ...s, video_url: data.url, status: "video_generated" } : s
          )
        );
        setVideoJobs((prev) => prev.filter((j) => j.jobId !== job.jobId));
        return;
      }

      if (data.status === "failed") {
        setErrors((prev) => ({
          ...prev,
          [job.sceneId]: { type: "video", raw: data.error ?? "Video generation failed" },
        }));
        setVideoJobs((prev) => prev.filter((j) => j.jobId !== job.jobId));
        return;
      }

      // Still processing — check if we've been waiting too long (5 min)
      if (Date.now() - job.startedAt > 5 * 60 * 1000) {
        setErrors((prev) => ({
          ...prev,
          [job.sceneId]: {
            type: "video",
            raw: "Video generation timed out after 5 minutes. The job may still be running — try refreshing.",
          },
        }));
        setVideoJobs((prev) => prev.filter((j) => j.jobId !== job.jobId));
        return;
      }

      // Schedule next poll in 6s
      pollTimers.current[job.jobId] = setTimeout(() => pollVideoJob(job), 6_000);
    } catch (err) {
      console.error("[StoryboardClient] video poll error:", err);
      // Network error — retry
      pollTimers.current[job.jobId] = setTimeout(() => pollVideoJob(job), 10_000);
    }
  }, []);

  // Start polling whenever a new video job is added
  useEffect(() => {
    videoJobs.forEach((job) => {
      if (!pollTimers.current[job.jobId]) {
        pollTimers.current[job.jobId] = setTimeout(() => pollVideoJob(job), 5_000);
      }
    });
  }, [videoJobs, pollVideoJob]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(pollTimers.current).forEach(clearTimeout);
    };
  }, []);

  // ── Image generation ──────────────────────────────────────────────────────
  async function handleGenerateImage(scene: NobleVideoScene, provider: "higgsfield" | "fal" = "higgsfield") {
    setGenerating((p) => ({ ...p, [scene.id]: "image" }));
    setErrors((p) => { const n = { ...p }; delete n[scene.id]; return n; });

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
          provider,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const raw = String(data.error ?? "Image generation failed");
        console.error("[StoryboardClient] image failed:", raw);
        setErrors((p) => ({ ...p, [scene.id]: { type: "image", raw } }));
        return;
      }

      setScenes((prev) =>
        prev.map((s) =>
          s.id === scene.id ? { ...s, image_url: data.image_url, status: "image_generated" } : s
        )
      );
    } catch (err) {
      const raw = String(err);
      console.error("[StoryboardClient] image exception:", raw);
      setErrors((p) => ({ ...p, [scene.id]: { type: "image", raw } }));
    } finally {
      setGenerating((p) => { const n = { ...p }; delete n[scene.id]; return n; });
    }
  }

  // ── Video generation ──────────────────────────────────────────────────────
  async function handleGenerateVideo(scene: NobleVideoScene) {
    if (!scene.image_url) return;
    setErrors((p) => { const n = { ...p }; delete n[scene.id]; return n; });

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
          duration: Math.max(4, Math.ceil(project.duration_seconds / scenes.length)),
          aspect_ratio: project.aspect_ratio,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const raw = String(data.error ?? "Video submission failed");
        console.error("[StoryboardClient] video failed:", raw);
        setErrors((p) => ({ ...p, [scene.id]: { type: "video", raw } }));
        return;
      }

      if (data.queued && data.job_id) {
        // Higgsfield async — add to polling queue
        setVideoJobs((prev) => [
          ...prev.filter((j) => j.sceneId !== scene.id),
          { jobId: data.job_id, sceneId: scene.id, startedAt: Date.now() },
        ]);
        return;
      }

      // Synchronous provider returned a URL directly
      if (data.video_url) {
        setScenes((prev) =>
          prev.map((s) =>
            s.id === scene.id ? { ...s, video_url: data.video_url, status: "video_generated" } : s
          )
        );
      }
    } catch (err) {
      const raw = String(err);
      console.error("[StoryboardClient] video exception:", raw);
      setErrors((p) => ({ ...p, [scene.id]: { type: "video", raw } }));
    }
  }

  // ── Voice generation ──────────────────────────────────────────────────────
  async function handleGenerateVoice(scene: NobleVideoScene) {
    setGenerating((p) => ({ ...p, [scene.id]: "voice" }));
    setErrors((p) => { const n = { ...p }; delete n[scene.id]; return n; });

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

      if (!res.ok) {
        const raw = String(data.error ?? "Voice generation failed");
        console.error("[StoryboardClient] voice failed:", raw);
        setErrors((p) => ({ ...p, [scene.id]: { type: "voice", raw } }));
        return;
      }

      setScenes((prev) =>
        prev.map((s) =>
          s.id === scene.id ? { ...s, voice_url: data.voice_url } : s
        )
      );
    } catch (err) {
      const raw = String(err);
      console.error("[StoryboardClient] voice exception:", raw);
      setErrors((p) => ({ ...p, [scene.id]: { type: "voice", raw } }));
    } finally {
      setGenerating((p) => { const n = { ...p }; delete n[scene.id]; return n; });
    }
  }

  // ── Approve scene ─────────────────────────────────────────────────────────
  async function handleApprove(scene: NobleVideoScene) {
    try {
      await fetch("/api/noble/approve-scene", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scene_id: scene.id, status: "approved" }),
      });
      setScenes((prev) =>
        prev.map((s) => (s.id === scene.id ? { ...s, status: "approved" } : s))
      );
    } catch (err) {
      console.error("[StoryboardClient] approve failed:", err);
    }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#080f1e" }}>
      <ProjectEditorHeader project={project} scenes={scenes} />

      <div style={{ maxWidth: 960, margin: "0 auto", width: "100%", padding: "2rem 2.5rem" }}>

        {project.script && (
          <div className="mb-6">
            <FullScriptPanel script={project.script} />
          </div>
        )}

        {scenes.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ background: "#0d1a2e", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-base font-semibold text-white mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
              No scenes generated yet
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
              The script is ready but scenes haven&apos;t been built. Regenerate from the script panel above.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {scenes.map((scene) => {
              const uiStatus = getUIStatus(scene, generating, errors, videoJobs);
              const activeJob = videoJobs.find((j) => j.sceneId === scene.id);
              return (
                <SceneCard
                  key={scene.id}
                  scene={scene}
                  uiStatus={uiStatus}
                  error={errors[scene.id]}
                  videoJobId={activeJob?.jobId}
                  videoJobStartedAt={activeJob?.startedAt}
                  onGenerateImage={(provider) => handleGenerateImage(scene, provider)}
                  onGenerateVideo={() => handleGenerateVideo(scene)}
                  onGenerateVoice={() => handleGenerateVoice(scene)}
                  onApprove={() => handleApprove(scene)}
                  aspectRatio={project.aspect_ratio}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
