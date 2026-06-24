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
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.HIGGSFIELD_API_KEY}`,
  };
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

/** Parse Higgsfield HTML error pages and JSON error shapes into a clean string. */
async function safeText(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  if (text.trim().startsWith("<")) {
    return `HTTP ${res.status} — Higgsfield API is temporarily unavailable. Please try again in a few minutes.`;
  }
  try {
    const j = JSON.parse(text);
    return j.message ?? j.error ?? j.detail ?? text.slice(0, 300);
  } catch {
    return text.slice(0, 300) || `HTTP ${res.status}`;
  }
}

/** Extract the output URL from a completed Higgsfield job response. */
function extractUrl(job: Record<string, unknown>): string | null {
  const candidates = [
    job.url,
    job.image_url,
    job.video_url,
    job.output_url,
    (job.output as Record<string, unknown> | undefined)?.url,
    (job.result as Record<string, unknown> | undefined)?.url,
    (job.data as Record<string, unknown> | undefined)?.url,
    Array.isArray(job.outputs) ? (job.outputs[0] as Record<string, unknown>)?.url : undefined,
    Array.isArray(job.media) ? (job.media[0] as Record<string, unknown>)?.url : undefined,
    Array.isArray(job.results) ? (job.results[0] as Record<string, unknown>)?.url : undefined,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.startsWith("http")) return c;
  }
  return null;
}

/**
 * Poll a Higgsfield job until it completes or times out.
 * Logs every status check; throws on failure or timeout.
 */
async function pollJobUrl(jobId: string, timeoutMs: number, label: string): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  let waitMs = 3_000;
  let attempt = 0;

  while (Date.now() < deadline) {
    await delay(waitMs);
    attempt++;

    let res: Response;
    try {
      res = await fetch(`${BASE_URL}/jobs/${jobId}`, {
        headers: auth(),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (err) {
      console.error(`[higgsfield] ${label} poll #${attempt} fetch error:`, err);
      waitMs = Math.min(waitMs * 1.5, 10_000);
      continue;
    }

    if (!res.ok) {
      const detail = await safeText(res);
      throw new Error(`[higgsfield] ${label} job poll failed (${res.status}): ${detail}`);
    }

    const job = await res.json() as Record<string, unknown>;
    const status = String(job.status ?? "").toLowerCase();
    console.log(`[higgsfield] ${label} poll #${attempt}: status=${status} jobId=${jobId}`);

    if (["completed", "done", "succeeded", "success", "ready"].includes(status)) {
      const url = extractUrl(job);
      if (url) return url;
      console.error("[higgsfield] Completed job response:", JSON.stringify(job).slice(0, 500));
      throw new Error(`[higgsfield] ${label} job completed but no URL found in response`);
    }

    if (["failed", "error", "cancelled", "canceled", "rejected"].includes(status)) {
      const reason = String(
        (job as Record<string, unknown>).error ??
        (job as Record<string, unknown>).message ??
        (job as Record<string, unknown>).reason ??
        "Unknown reason"
      );
      throw new Error(`[higgsfield] ${label} job failed: ${reason}`);
    }

    // pending / processing / queued — back off and retry
    waitMs = Math.min(waitMs * 1.4, 10_000);
  }

  throw new Error(
    `Higgsfield ${label} timed out after ${Math.round(timeoutMs / 1000)}s. ` +
    "The provider may be under load. Please try again."
  );
}

// ── Image generation ────────────────────────────────────────────────────────

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

/**
 * Submit an image generation job and poll until complete.
 * Polls server-side — caller must ensure their function timeout is >= 55s.
 */
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
      signal: AbortSignal.timeout(20_000),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("timeout") || msg.includes("abort")) {
      throw new Error("Higgsfield timed out submitting the image job. Please try again.");
    }
    throw new Error(`Higgsfield connection failed: ${msg}`);
  }

  if (!res.ok) {
    const detail = await safeText(res);
    throw new Error(`Higgsfield image generation failed (${res.status}): ${detail}`);
  }

  const data = await res.json() as Record<string, unknown>;
  const jobId = String(data.job_id ?? data.id ?? "");

  if (!jobId) {
    // If the API returned a URL directly (synchronous mode), use it
    const directUrl = extractUrl(data);
    if (directUrl) return { url: directUrl, provider: "higgsfield" };
    throw new Error("Higgsfield image response contained neither a job_id nor a URL");
  }

  console.log(`[higgsfield] Image job submitted: ${jobId}`);

  // Poll until complete (images typically take 10–25s)
  const url = await pollJobUrl(jobId, 50_000, "image");
  return { url, provider: "higgsfield", jobId };
}

// ── Video generation ────────────────────────────────────────────────────────

/**
 * Submit a video generation job and return IMMEDIATELY with the job_id.
 * The caller is responsible for polling /api/noble/job-status/[jobId]
 * because videos take 60–180s — too long for a serverless function.
 */
export async function generateVideo(
  input: VideoGenerationInput
): Promise<GenerationResult & { queued: true }> {
  const duration = input.duration ?? 8;
  const model =
    duration <= 8 ? NOBLE_HIGGSFIELD_MODELS.videoFast : NOBLE_HIGGSFIELD_MODELS.videoQuality;

  // If imageUrl looks like a real URL, include it as start_image
  const medias: { role: string; value: string }[] = [];
  if (input.imageUrl && input.imageUrl.startsWith("http")) {
    medias.push({ role: "start_image", value: input.imageUrl });
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/videos/generate`, {
      method: "POST",
      headers: auth(),
      body: JSON.stringify({
        model,
        ...(medias.length > 0 ? { medias } : {}),
        prompt: input.motionPrompt,
        negative_prompt: NOBLE_NEGATIVE_PROMPT,
        duration,
        aspect_ratio: input.aspectRatio ?? "9:16",
      }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("timeout") || msg.includes("abort")) {
      throw new Error("Higgsfield timed out submitting the video job. Please try again.");
    }
    throw new Error(`Higgsfield connection failed: ${msg}`);
  }

  if (!res.ok) {
    const detail = await safeText(res);
    throw new Error(`Higgsfield video submission failed (${res.status}): ${detail}`);
  }

  const data = await res.json() as Record<string, unknown>;
  const jobId = String(data.job_id ?? data.id ?? "");

  if (!jobId) {
    throw new Error("Higgsfield video response contained no job_id — cannot track generation");
  }

  console.log(`[higgsfield] Video job submitted: ${jobId} model=${model} duration=${duration}s`);
  return { url: "", provider: "higgsfield", jobId, queued: true };
}

// ── Job status (for polling endpoint) ──────────────────────────────────────

export interface HiggsfieldJobStatus {
  status: "pending" | "processing" | "completed" | "failed";
  url?: string;
  error?: string;
  raw?: Record<string, unknown>;
}

/** Single non-blocking status check — does NOT poll. */
export async function checkJobStatus(jobId: string): Promise<HiggsfieldJobStatus> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/jobs/${jobId}`, {
      headers: auth(),
      signal: AbortSignal.timeout(12_000),
    });
  } catch (err) {
    return { status: "pending", error: String(err) };
  }

  if (!res.ok) {
    const detail = await safeText(res);
    return { status: "failed", error: `HTTP ${res.status}: ${detail}` };
  }

  const job = await res.json() as Record<string, unknown>;
  const status = String(job.status ?? "").toLowerCase();

  if (["completed", "done", "succeeded", "success", "ready"].includes(status)) {
    const url = extractUrl(job);
    if (url) return { status: "completed", url, raw: job };
    return { status: "failed", error: "Job completed but no output URL found", raw: job };
  }

  if (["failed", "error", "cancelled", "canceled", "rejected"].includes(status)) {
    const error = String(
      (job as Record<string, unknown>).error ??
      (job as Record<string, unknown>).message ??
      "Job failed"
    );
    return { status: "failed", error, raw: job };
  }

  return { status: "processing", raw: job };
}

// ── Soul Portrait (face-faithful hero shots) ────────────────────────────────

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
      signal: AbortSignal.timeout(20_000),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Higgsfield connection failed: ${msg}`);
  }

  if (!res.ok) {
    const detail = await safeText(res);
    throw new Error(`Higgsfield soul portrait failed (${res.status}): ${detail}`);
  }

  const data = await res.json() as Record<string, unknown>;
  const jobId = String(data.job_id ?? data.id ?? "");

  if (!jobId) {
    const directUrl = extractUrl(data);
    if (directUrl) return { url: directUrl, provider: "higgsfield" };
    throw new Error("Soul portrait response contained no job_id or URL");
  }

  const url = await pollJobUrl(jobId, 50_000, "soul_portrait");
  return { url, provider: "higgsfield", jobId };
}
