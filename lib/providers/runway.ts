import type { ImageGenerationInput, VideoGenerationInput, GenerationResult } from "./index";

export async function generateImage(_input: ImageGenerationInput): Promise<GenerationResult> {
  throw new Error("Runway does not support text-to-image directly. Use Kling or Higgsfield for images.");
}

export async function generateVideo(input: VideoGenerationInput): Promise<GenerationResult> {
  const res = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RUNWAY_API_KEY}`,
      "X-Runway-Version": "2024-11-06",
    },
    body: JSON.stringify({
      promptImage: input.imageUrl,
      promptText: input.motionPrompt,
      duration: input.duration <= 5 ? 5 : 10,
      ratio: input.aspectRatio === "9:16" ? "768:1280" : input.aspectRatio === "16:9" ? "1280:768" : "1280:1280",
    }),
  });

  if (!res.ok) throw new Error(`Runway video error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { url: data.output?.[0], provider: "runway" };
}
