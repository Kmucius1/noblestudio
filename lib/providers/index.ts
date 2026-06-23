export type ImageProvider = "higgsfield" | "kling" | "runway" | "fal";
export type VideoProvider = "higgsfield" | "kling" | "runway" | "fal";

export interface ImageGenerationInput {
  prompt: string;
  negativePrompt: string;
  referenceImageUrl?: string;
  aspectRatio: string;
}

export interface VideoGenerationInput {
  imageUrl: string;
  motionPrompt: string;
  duration: number;
  aspectRatio: string;
}

export interface GenerationResult {
  url: string;
  provider: string;
  jobId?: string;
}

export async function generateImage(
  input: ImageGenerationInput,
  provider: ImageProvider = "higgsfield"
): Promise<GenerationResult> {
  switch (provider) {
    case "higgsfield":
      return (await import("./higgsfield")).generateImage(input);
    case "kling":
      return (await import("./kling")).generateImage(input);
    case "runway":
      return (await import("./runway")).generateImage(input);
    case "fal":
      return (await import("./fal")).generateImage(input);
    default:
      throw new Error(`Unknown image provider: ${provider}`);
  }
}

export async function generateVideo(
  input: VideoGenerationInput,
  provider: VideoProvider = "higgsfield"
): Promise<GenerationResult> {
  switch (provider) {
    case "higgsfield":
      return (await import("./higgsfield")).generateVideo(input);
    case "kling":
      return (await import("./kling")).generateVideo(input);
    case "runway":
      return (await import("./runway")).generateVideo(input);
    case "fal":
      return (await import("./fal")).generateVideo(input);
    default:
      throw new Error(`Unknown video provider: ${provider}`);
  }
}
