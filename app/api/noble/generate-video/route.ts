import { NextRequest, NextResponse } from "next/server";
import { generateVideo } from "@/lib/providers";
import { buildVideoPrompt } from "@/lib/noble/prompts";
import type { VideoProvider } from "@/lib/providers";

// Just submits the job — fast, no polling needed
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      scene_id,
      project_id,
      approved_image_url,
      noble_action,
      camera_direction,
      duration = 8,
      aspect_ratio = "9:16",
      provider = "higgsfield",
    } = body;

    if (!scene_id || !project_id) {
      return NextResponse.json({ error: "scene_id and project_id are required" }, { status: 400 });
    }

    if (!approved_image_url) {
      return NextResponse.json(
        { error: "approved_image_url is required — generate and approve an image first" },
        { status: 400 }
      );
    }

    const motionPrompt = buildVideoPrompt({
      motion: noble_action || "Noble speaks directly to camera with confident gestures",
      cameraMove: camera_direction || "slow push in",
      duration,
      aspectRatio: aspect_ratio,
    });

    // For Higgsfield this returns immediately with queued:true + jobId
    // For fal/kling it may block and return a URL
    const result = await generateVideo(
      {
        imageUrl: approved_image_url,
        motionPrompt,
        duration,
        aspectRatio: aspect_ratio,
      },
      provider as VideoProvider
    );

    if (result.queued) {
      // Async job — client must poll /api/noble/job-status/[jobId]
      return NextResponse.json({
        success: true,
        queued: true,
        job_id: result.jobId,
        provider: result.provider,
        scene_id,
        project_id,
        message: `Video job submitted (${result.provider}). Poll /api/noble/job-status/${result.jobId} for progress.`,
      });
    }

    // Synchronous provider (fal/kling) — video URL available now
    return NextResponse.json({
      success: true,
      queued: false,
      video_url: result.url,
      provider: result.provider,
      scene_id,
    });
  } catch (err) {
    const raw = String(err);
    console.error("[generate-video]", raw);
    return NextResponse.json({ error: raw }, { status: 500 });
  }
}
