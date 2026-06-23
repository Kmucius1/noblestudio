import type { ImageGenerationInput, VideoGenerationInput, GenerationResult } from "./index";
import {
  NOBLE_HIGGSFIELD_IDS,
  NOBLE_HIGGSFIELD_MODELS,
  NOBLE_ELEMENT_ANCHOR,
  NOBLE_NEGATIVE_PROMPT,
  NOBLE_CHARACTER_LOCK,
} from "@/lib/noble/character-bible";

const BASE_URL = "https://api.higgsfield.ai/v1";

function auth() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${process.env.HIGGSFIELD_API_KEY}` };
}

// Build the full Noble prompt with Element anchor embedded
function buildNobleImagePrompt(scene: string): string {
  return (
    `${NOBLE_ELEMENT_ANCHOR} — Noble, the EHM Strategies bull mascot. ` +
    `Keep his locked design exactly: ${NOBLE_CHARACTER_LOCK} ` +
    `${scene}. ` +
    `Palette: deep navy, black, emerald green, metallic gold. ` +
    `High-end luxury finance commercial look, cinematic lighting, ` +
    `sharp premium 3D mascot rendering. Leave headroom for camera motion, no text in frame. ` +
    `No redesign of Noble.`
  );
}

export async function generateImage(input: ImageGenerationInput): Promise<GenerationResult> {
  // Always use Element anchor + nano_banana_2 per the commercial pipeline
  const prompt = buildNobleImagePrompt(input.prompt);

  const res = await fetch(`${BASE_URL}/images/generate`, {
    method: "POST",
    headers: auth(),
    body: JSON.stringify({
      prompt,
      negative_prompt: NOBLE_NEGATIVE_PROMPT,
      model: NOBLE_HIGGSFIELD_MODELS.image,          // nano_banana_2
      aspect_ratio: input.aspectRatio ?? "9:16",
      // reference_id for Element is embedded in the prompt as <<<id>>>
    }),
  });

  if (!res.ok) throw new Error(`Higgsfield image error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const jobId = data.job_id ?? data.id;
  return { url: data.url ?? data.image_url ?? jobId, provider: "higgsfield", jobId };
}

export async function generateVideo(input: VideoGenerationInput): Promise<GenerationResult> {
  // Use the locked fast model (kling3_0_turbo for ≤8s, kling3_0 for longer)
  const duration = input.duration ?? 8;
  const model = duration <= 8 ? NOBLE_HIGGSFIELD_MODELS.videoFast : NOBLE_HIGGSFIELD_MODELS.videoQuality;

  const res = await fetch(`${BASE_URL}/videos/generate`, {
    method: "POST",
    headers: auth(),
    body: JSON.stringify({
      model,
      medias: [{ role: "start_image", value: input.imageUrl }],
      prompt: input.motionPrompt,
      negative_prompt: NOBLE_NEGATIVE_PROMPT,
      duration,
      aspect_ratio: input.aspectRatio ?? "9:16",
    }),
  });

  if (!res.ok) throw new Error(`Higgsfield video error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const jobId = data.job_id ?? data.id;
  return { url: data.url ?? data.video_url ?? jobId, provider: "higgsfield", jobId };
}

// Hero portrait via Soul V2 — use when face fidelity is critical
export async function generateSoulPortrait(scene: string, aspectRatio = "9:16"): Promise<GenerationResult> {
  const res = await fetch(`${BASE_URL}/images/generate`, {
    method: "POST",
    headers: auth(),
    body: JSON.stringify({
      prompt: `Noble the EHM Strategies bull executive, ${scene}, confident composed pose, navy/emerald/gold palette, cinematic rim light, premium finance brand.`,
      negative_prompt: NOBLE_NEGATIVE_PROMPT,
      model: NOBLE_HIGGSFIELD_MODELS.soulPortrait,   // soul_2
      soul_id: NOBLE_HIGGSFIELD_IDS.soulV2,          // 8a167e9a-...
      aspect_ratio: aspectRatio,
    }),
  });

  if (!res.ok) throw new Error(`Higgsfield soul error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { url: data.url ?? data.image_url, provider: "higgsfield" };
}
