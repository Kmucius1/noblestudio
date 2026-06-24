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

async function safeText(res: Response): Promise<string> {
  const text = await res.text();
  // If the response is HTML (Cloudflare error page, gateway timeout, etc.) return a clean message
  if (text.trim().startsWith("<")) {
    return `HTTP ${res.status} — Higgsfield API is temporarily unavailable. Please try again in a few minutes.`;
  }
  // Try to parse JSON error message
  try {
    const json = JSON.parse(text);
    return json.message ?? json.error ?? json.detail ?? text.slice(0, 200);
  } catch {
    return text.slice(0, 200);
  }
}

export async function generateImage(input: ImageGenerationInput): Promise<GenerationResult> {
  const prompt = buildNobleImagePrompt(input.prompt);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/images/generate`, {
      method: "POST",
      headers: auth(),
      body: JSON.stringify({
        prompt,
        negative_prompt: NOBLE_NEGATIVE_PROMPT,
        model: NOBLE_HIGGSFIELD_MODELS.image,
        aspect_ratio: input.aspectRatio ?? "9:16",
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("timeout") || msg.includes("abort")) {
      throw new Error("Higgsfield timed out — their API may be temporarily down. Try again in a few minutes.");
    }
    throw new Error(`Higgsfield connection failed: ${msg}`);
  }

  if (!res.ok) {
    const detail = await safeText(res);
    throw new Error(`Higgsfield image generation failed (${res.status}): ${detail}`);
  }

  const data = await res.json();
  const jobId = data.job_id ?? data.id;
  return { url: data.url ?? data.image_url ?? jobId, provider: "higgsfield", jobId };
}

export async function generateVideo(input: VideoGenerationInput): Promise<GenerationResult> {
  const duration = input.duration ?? 8;
  const model = duration <= 8 ? NOBLE_HIGGSFIELD_MODELS.videoFast : NOBLE_HIGGSFIELD_MODELS.videoQuality;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/videos/generate`, {
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
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("timeout") || msg.includes("abort")) {
      throw new Error("Higgsfield timed out — their API may be temporarily down. Try again in a few minutes.");
    }
    throw new Error(`Higgsfield connection failed: ${msg}`);
  }

  if (!res.ok) {
    const detail = await safeText(res);
    throw new Error(`Higgsfield video generation failed (${res.status}): ${detail}`);
  }

  const data = await res.json();
  const jobId = data.job_id ?? data.id;
  return { url: data.url ?? data.video_url ?? jobId, provider: "higgsfield", jobId };
}

export async function generateSoulPortrait(scene: string, aspectRatio = "9:16"): Promise<GenerationResult> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/images/generate`, {
      method: "POST",
      headers: auth(),
      body: JSON.stringify({
        prompt: `Noble the EHM Strategies bull executive, ${scene}, confident composed pose, navy/emerald/gold palette, cinematic rim light, premium finance brand.`,
        negative_prompt: NOBLE_NEGATIVE_PROMPT,
        model: NOBLE_HIGGSFIELD_MODELS.soulPortrait,
        soul_id: NOBLE_HIGGSFIELD_IDS.soulV2,
        aspect_ratio: aspectRatio,
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Higgsfield connection failed: ${msg}`);
  }

  if (!res.ok) {
    const detail = await safeText(res);
    throw new Error(`Higgsfield soul portrait failed (${res.status}): ${detail}`);
  }

  const data = await res.json();
  return { url: data.url ?? data.image_url, provider: "higgsfield" };
}
