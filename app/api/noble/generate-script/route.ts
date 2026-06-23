import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createServiceClient } from "@/lib/supabase/server";
import { buildScriptPrompt } from "@/lib/noble/prompts";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? "placeholder" });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { project_id, goal, platform, duration_seconds, tone, location, cta, custom_prompt } = body;

    const userRequest = custom_prompt || `Create a ${goal.replace(/_/g, " ")} video for ${location?.replace(/_/g, " ") || "luxury office"} setting.`;

    const prompt = buildScriptPrompt({
      userRequest,
      platform: platform.replace(/_/g, " "),
      length: `${duration_seconds} seconds`,
      tone: tone.replace(/_/g, " "),
      cta: cta.replace(/_/g, " "),
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content ?? "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const generated = JSON.parse(jsonMatch[0]);

    const supabase = await createServiceClient();

    await supabase
      .from("noble_video_projects")
      .update({ title: generated.title, script: generated.script, status: "scripted" })
      .eq("id", project_id);

    const scenes = generated.scenes.map((s: Record<string, unknown>) => ({
      project_id,
      ...s,
      status: "pending",
    }));

    const { data: insertedScenes } = await supabase
      .from("noble_video_scenes")
      .insert(scenes)
      .select();

    return NextResponse.json({ success: true, generated, scenes: insertedScenes });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
