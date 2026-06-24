"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { EmptyPreviewState } from "./EmptyPreviewState";
import { GenerationErrorState } from "./GenerationErrorState";
import type { NobleVideoScene } from "@/types/noble";

interface Props {
  scene: NobleVideoScene;
  uiStatus: string;
  error?: { type: string; raw: string };
  videoJobId?: string;
  videoJobStartedAt?: number;
  onGenerateImage: () => void;
  onRetryImage: () => void;
  onSwitchProvider: () => void;
  disabled: boolean;
  aspectRatio?: string;
}

function useElapsedSeconds(startedAt?: number, active = false): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active || !startedAt) {
      setElapsed(0);
      return;
    }
    setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [active, startedAt]);

  return elapsed;
}

export function ScenePreview({
  scene,
  uiStatus,
  error,
  videoJobId,
  videoJobStartedAt,
  onGenerateImage,
  onRetryImage,
  onSwitchProvider,
  disabled,
  aspectRatio,
}: Props) {
  const isGeneratingImage = uiStatus === "image_generating";
  const isGeneratingVideo = uiStatus === "video_generating";
  const isGeneratingVoice = uiStatus === "voice_generating";
  const isFailed = uiStatus === "image_failed";
  const hasImage = !!scene.image_url;
  const hasVideo = !!scene.video_url;

  const videoElapsed = useElapsedSeconds(videoJobStartedAt, isGeneratingVideo);
  const estimatedTotal = 120; // typical Higgsfield video job
  const pct = Math.min(Math.round((videoElapsed / estimatedTotal) * 100), 95);

  return (
    <div className="flex flex-col gap-3">
      {/* Image / image-loading area */}
      <div className="relative rounded-xl overflow-hidden" style={{ height: 220 }}>
        {isGeneratingImage ? (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-3"
            style={{ background: "#080f1c" }}
          >
            <Loader2 size={24} className="animate-spin" style={{ color: "#c9a227" }} />
            <p className="text-xs font-medium" style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif" }}>
              Generating image…
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'Inter', sans-serif" }}>
              10–30 seconds
            </p>
          </div>
        ) : hasImage ? (
          <>
            <Image
              src={scene.image_url!}
              alt={`Scene ${scene.scene_number}`}
              fill
              className="object-cover object-top"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(8,15,30,0.6) 0%, transparent 50%)" }}
            />
          </>
        ) : (
          <EmptyPreviewState
            onGenerate={onGenerateImage}
            disabled={disabled}
            aspectRatio={aspectRatio}
          />
        )}
      </div>

      {/* Video player (when complete) */}
      {hasVideo && !isGeneratingVideo && (
        <div className="rounded-xl overflow-hidden" style={{ background: "#080f1c" }}>
          <video
            src={scene.video_url!}
            controls
            className="w-full block"
            style={{ maxHeight: 160 }}
          />
        </div>
      )}

      {/* Video generating — live progress */}
      {isGeneratingVideo && (
        <div
          className="rounded-xl px-4 py-3"
          style={{ background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.15)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Loader2 size={13} className="animate-spin shrink-0" style={{ color: "#c9a227" }} />
            <p className="text-xs font-medium" style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif" }}>
              Generating video clip…
            </p>
            {videoElapsed > 0 && (
              <span className="text-xs ml-auto" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Inter', sans-serif" }}>
                {videoElapsed}s
              </span>
            )}
          </div>
          {/* Progress bar */}
          <div className="rounded-full overflow-hidden" style={{ height: 3, background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #c9a227, #e8c547)",
              }}
            />
          </div>
          {videoJobId && (
            <p className="text-xs mt-1.5 truncate" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'Inter', sans-serif" }}>
              Job {videoJobId.slice(0, 8)}… · ~2 min
            </p>
          )}
        </div>
      )}

      {/* Voice player */}
      {scene.voice_url && !isGeneratingVoice && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "#0a1422", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="px-3 pt-2.5">
            <p className="text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
              VOICE RECORDING
            </p>
          </div>
          <audio src={scene.voice_url} controls className="w-full px-3 pb-2.5" style={{ display: "block" }} />
        </div>
      )}

      {isGeneratingVoice && (
        <div
          className="rounded-xl flex items-center gap-2 px-4 py-3"
          style={{ background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.15)" }}
        >
          <Loader2 size={13} className="animate-spin shrink-0" style={{ color: "#c9a227" }} />
          <p className="text-xs" style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif" }}>
            Recording Noble&apos;s voice…
          </p>
        </div>
      )}

      {/* Error state */}
      {isFailed && error && (
        <GenerationErrorState
          error={error.raw}
          type={error.type as "image" | "video" | "voice"}
          onRetry={onRetryImage}
          onSwitchProvider={onSwitchProvider}
          disabled={disabled}
        />
      )}
    </div>
  );
}
