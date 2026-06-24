import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateImage } from "@/lib/providers";
import { buildImagePrompt } from "@/lib/noble/prompts";
import { NOBLE_NEGATIVE_PROMPT } from "@/lib/noble/character-bible";
import type { ImageProvider } from "@/lib/providers";

// Images take 10–25s to generate + poll; 60s gives safe headroom
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      scene_id,
      project_id,
      visual_prompt,
      camera_direction,
      noble_action,
      background,
      reference_image_url,
      provider = "higgsfield",
      aspect_ratio = "9:16",
    } = body;

    if (!scene_id || !project_id) {
      return NextResponse.json({ error: "scene_id and project_id are required" }, { status: 400 });
    }

    const fullPrompt = buildImagePrompt({
      sceneDescription: visual_prompt ?? "",
      cameraDirection: camera_direction ?? "",
      nobleAction: noble_action ?? "",
      background: background ?? "",
    });

    // This polls internally for Higgsfield — returns a real URL or throws
    const result = await generateImage(
      {
        prompt: fullPrompt,
        negativePrompt: NOBLE_NEGATIVE_PROMPT,
        referenceImageUrl: reference_image_url,
        aspectRatio: aspect_ratio,
      },
      provider as ImageProvider
    );

    const supabase = await createServiceClient();

    // Save to scene
    const { data: scene, error: sceneErr } = await supabase
      .from("noble_video_scenes")
      .update({ image_url: result.url, status: "image_generated" })
      .eq("id", scene_id)
      .select()
      .single();

    if (sceneErr) {
      console.error("[generate-image] DB update failed:", sceneErr.message);
    }

    // Mirror to Supabase Storage as backup (best-effort — don't fail if this errors)
    try {
      const imageRes = await fetch(result.url, { signal: AbortSignal.timeout(15_000) });
      if (imageRes.ok) {
        const blob = await imageRes.blob();
        const fileName = `${project_id}/${scene_id}.jpg`;
        await supabase.storage
          .from("noble-images")
          .upload(fileName, blob, { upsert: true, contentType: "image/jpeg" });
      }
    } catch (storageErr) {
      console.warn("[generate-image] Storage mirror failed (non-fatal):", storageErr);
    }

    return NextResponse.json({
      success: true,
      image_url: result.url,
      provider: result.provider,
      job_id: result.jobId,
      scene,
    });
  } catch (err) {
    const raw = String(err);
    console.error("[generate-image]", raw);
    return NextResponse.json({ error: raw }, { status: 500 });
  }
}
