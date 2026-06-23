import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { project_id, aspect_ratio, format = "mp4" } = body;

    const supabase = await createServiceClient();

    const { data: scenes } = await supabase
      .from("noble_video_scenes")
      .select("*")
      .eq("project_id", project_id)
      .eq("status", "approved")
      .order("scene_number");

    if (!scenes || scenes.length === 0) {
      return NextResponse.json({ error: "No approved scenes to export" }, { status: 400 });
    }

    const videoUrls = scenes.map((s) => s.video_url).filter(Boolean);
    const voiceUrls = scenes.map((s) => s.voice_url).filter(Boolean);
    const captions = scenes.map((s) => ({ text: s.caption_text, scene: s.scene_number }));

    // Create export record
    const { data: exportRecord } = await supabase
      .from("noble_exports")
      .insert({
        project_id,
        format,
        aspect_ratio,
        status: "queued",
      })
      .select()
      .single();

    // TODO: Trigger FFmpeg worker here
    // The worker should: merge video clips + voice + captions + logo + CTA card → final MP4
    // For now, return the scene URLs so the user can inspect them
    return NextResponse.json({
      success: true,
      export_id: exportRecord?.id,
      status: "queued",
      message: "FFmpeg render queued. Connect your video worker to process this export.",
      payload: { video_urls: videoUrls, voice_urls: voiceUrls, captions, aspect_ratio, format },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
