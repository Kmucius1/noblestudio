import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateImage } from "@/lib/providers";
import { buildImagePrompt } from "@/lib/noble/prompts";
import { NOBLE_NEGATIVE_PROMPT } from "@/lib/noble/character-bible";
import type { ImageProvider } from "@/lib/providers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scene_id, project_id, visual_prompt, camera_direction, noble_action, background, reference_image_url, provider = "higgsfield", aspect_ratio = "9:16" } = body;

    const fullPrompt = buildImagePrompt({
      sceneDescription: visual_prompt,
      cameraDirection: camera_direction,
      nobleAction: noble_action,
      background,
    });

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

    const { data: scene } = await supabase
      .from("noble_video_scenes")
      .update({ image_url: result.url, status: "image_generated" })
      .eq("id", scene_id)
      .select()
      .single();

    // Upload to Supabase Storage as backup
    if (result.url) {
      const imageRes = await fetch(result.url);
      const imageBlob = await imageRes.blob();
      const fileName = `${project_id}/${scene_id}.jpg`;
      await supabase.storage.from("noble-images").upload(fileName, imageBlob, { upsert: true });
    }

    return NextResponse.json({ success: true, image_url: result.url, scene, provider: result.provider });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
