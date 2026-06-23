import type { ImageGenerationInput, VideoGenerationInput, GenerationResult } from "./index";

const BASE_URL = "https://api.higgsfield.ai/v1";

export async function generateImage(input: ImageGenerationInput): Promise<GenerationResult> {
  const res = await fetch(`${BASE_URL}/images/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HIGGSFIELD_API_KEY}`,
    },
    body: JSON.stringify({
      prompt: input.prompt,
      negative_prompt: input.negativePrompt,
      reference_image: input.referenceImageUrl,
      aspect_ratio: input.aspectRatio,
    }),
  });

  if (!res.ok) throw new Error(`Higgsfield image error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { url: data.url ?? data.image_url, provider: "higgsfield" };
}

export async function generateVideo(input: VideoGenerationInput): Promise<GenerationResult> {
  const res = await fetch(`${BASE_URL}/videos/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HIGGSFIELD_API_KEY}`,
    },
    body: JSON.stringify({
      image_url: input.imageUrl,
      prompt: input.motionPrompt,
      duration: input.duration,
      aspect_ratio: input.aspectRatio,
    }),
  });

  if (!res.ok) throw new Error(`Higgsfield video error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { url: data.url ?? data.video_url, provider: "higgsfield" };
}
