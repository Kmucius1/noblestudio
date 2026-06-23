import type { ImageGenerationInput, VideoGenerationInput, GenerationResult } from "./index";

const BASE_URL = "https://api.klingai.com/v1";

export async function generateImage(input: ImageGenerationInput): Promise<GenerationResult> {
  const res = await fetch(`${BASE_URL}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.KLING_API_KEY}`,
    },
    body: JSON.stringify({
      prompt: input.prompt,
      negative_prompt: input.negativePrompt,
      image: input.referenceImageUrl,
      aspect_ratio: input.aspectRatio,
    }),
  });

  if (!res.ok) throw new Error(`Kling image error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { url: data.data?.[0]?.url, provider: "kling" };
}

export async function generateVideo(input: VideoGenerationInput): Promise<GenerationResult> {
  const res = await fetch(`${BASE_URL}/videos/image2video`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.KLING_API_KEY}`,
    },
    body: JSON.stringify({
      image_url: input.imageUrl,
      prompt: input.motionPrompt,
      duration: String(input.duration),
      aspect_ratio: input.aspectRatio,
    }),
  });

  if (!res.ok) throw new Error(`Kling video error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { url: data.data?.video_url, provider: "kling" };
}
