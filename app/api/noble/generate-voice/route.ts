import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scene_id, project_id, script_line, voice_id, tone = "warm" } = body;

    const nobleVoiceId = voice_id || process.env.ELEVENLABS_NOBLE_VOICE_ID;
    if (!nobleVoiceId) throw new Error("No Noble voice ID configured");

    const toneSettings: Record<string, { stability: number; similarity_boost: number; style: number }> = {
      warm: { stability: 0.75, similarity_boost: 0.85, style: 0.3 },
      luxury: { stability: 0.85, similarity_boost: 0.9, style: 0.2 },
      funny: { stability: 0.55, similarity_boost: 0.8, style: 0.6 },
      bold: { stability: 0.8, similarity_boost: 0.9, style: 0.45 },
      educational: { stability: 0.8, similarity_boost: 0.85, style: 0.25 },
    };

    const voiceSettings = toneSettings[tone] ?? toneSettings.warm;

    const res = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${nobleVoiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        text: script_line,
        model_id: "eleven_multilingual_v2",
        voice_settings: voiceSettings,
      }),
    });

    if (!res.ok) throw new Error(`ElevenLabs error: ${res.status} ${await res.text()}`);

    const audioBuffer = await res.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });

    const supabase = await createServiceClient();
    const fileName = `${project_id}/${scene_id}.mp3`;

    const { data: uploadData } = await supabase.storage
      .from("noble-voice")
      .upload(fileName, audioBlob, { upsert: true, contentType: "audio/mpeg" });

    const { data: urlData } = supabase.storage.from("noble-voice").getPublicUrl(fileName);
    const voiceUrl = urlData.publicUrl;

    const { data: scene } = await supabase
      .from("noble_video_scenes")
      .update({ voice_url: voiceUrl })
      .eq("id", scene_id)
      .select()
      .single();

    return NextResponse.json({ success: true, voice_url: voiceUrl, scene, upload: uploadData });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
