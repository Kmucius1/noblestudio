import type { ImageGenerationInput, VideoGenerationInput, GenerationResult } from "./index";

const BASE_URL = "https://queue.fal.run";

export async function generateImage(input: ImageGenerationInput): Promise<GenerationResult> {
  const res = await fetch(`${BASE_URL}/fal-ai/flux/dev`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${process.env.FAL_API_KEY}`,
    },
    body: JSON.stringify({
      prompt: input.prompt,
      negative_prompt: input.negativePrompt,
      image_url: input.referenceImageUrl,
      image_size: input.aspectRatio === "9:16" ? "portrait_16_9" : input.aspectRatio === "16:9" ? "landscape_16_9" : "square",
    }),
  });

  if (!res.ok) throw new Error(`Fal image error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { url: data.images?.[0]?.url, provider: "fal" };
}

export async function generateVideo(input: VideoGenerationInput): Promise<GenerationResult> {
  const res = await fetch(`${BASE_URL}/fal-ai/kling-video/v1.6/pro/image-to-video`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${process.env.FAL_API_KEY}`,
    },
    body: JSON.stringify({
      image_url: input.imageUrl,
      prompt: input.motionPrompt,
      duration: String(input.duration),
      aspect_ratio: input.aspectRatio,
    }),
  });

  if (!res.ok) throw new Error(`Fal video error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { url: data.video?.url, provider: "fal" };
}
