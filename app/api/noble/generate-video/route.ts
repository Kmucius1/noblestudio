import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateVideo } from "@/lib/providers";
import { buildVideoPrompt } from "@/lib/noble/prompts";
import type { VideoProvider } from "@/lib/providers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scene_id, project_id, approved_image_url, noble_action, camera_direction, duration = 5, aspect_ratio = "9:16", provider = "higgsfield" } = body;

    const motionPrompt = buildVideoPrompt({
      motion: noble_action || "Noble speaks directly to camera with confident gestures",
      cameraMove: camera_direction || "slow push in",
      duration,
      aspectRatio: aspect_ratio,
    });

    const result = await generateVideo(
      {
        imageUrl: approved_image_url,
        motionPrompt,
        duration,
        aspectRatio: aspect_ratio,
      },
      provider as VideoProvider
    );

    const supabase = await createServiceClient();

    const { data: scene } = await supabase
      .from("noble_video_scenes")
      .update({ video_url: result.url, status: "video_generated" })
      .eq("id", scene_id)
      .select()
      .single();

    // Upload to Supabase Storage
    if (result.url) {
      const videoRes = await fetch(result.url);
      const videoBlob = await videoRes.blob();
      const fileName = `${project_id}/${scene_id}.mp4`;
      await supabase.storage.from("noble-videos").upload(fileName, videoBlob, { upsert: true });
    }

    return NextResponse.json({ success: true, video_url: result.url, scene, provider: result.provider });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
