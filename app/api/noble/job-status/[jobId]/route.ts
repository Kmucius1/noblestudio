import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { checkJobStatus } from "@/lib/providers";

export const maxDuration = 20;

/**
 * GET /api/noble/job-status/[jobId]?scene_id=xxx&type=video|image
 *
 * Polls Higgsfield once for job status.
 * When complete, saves the URL to the scene in DB and returns it.
 * Client should poll this every 5–10s until status === "completed" | "failed".
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const { searchParams } = new URL(req.url);
  const sceneId = searchParams.get("scene_id");
  const assetType = (searchParams.get("type") ?? "video") as "video" | "image";

  if (!jobId) {
    return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  }

  const result = await checkJobStatus(jobId);

  if (result.status === "completed" && result.url && sceneId) {
    // Persist the URL to the DB scene
    try {
      const supabase = await createServiceClient();
      const updateField = assetType === "image"
        ? { image_url: result.url, status: "image_generated" }
        : { video_url: result.url, status: "video_generated" };

      await supabase
        .from("noble_video_scenes")
        .update(updateField)
        .eq("id", sceneId);

      console.log(`[job-status] ${assetType} saved to scene ${sceneId}: ${result.url}`);
    } catch (dbErr) {
      console.error("[job-status] DB save failed:", dbErr);
    }
  }

  return NextResponse.json({
    job_id: jobId,
    status: result.status,
    url: result.url ?? null,
    error: result.error ?? null,
    asset_type: assetType,
    scene_id: sceneId,
  });
}
