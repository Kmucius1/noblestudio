import { NOBLE_CHARACTER_LOCK, NOBLE_NEGATIVE_PROMPT, NOBLE_VOICE_DIRECTION } from "./character-bible";

interface ScriptPromptInput {
  userRequest: string;
  platform: string;
  length: string;
  tone: string;
  cta: string;
}

interface ScenePromptInput {
  sceneDescription: string;
  cameraDirection: string;
  nobleAction: string;
  background: string;
}

interface VideoPromptInput {
  motion: string;
  cameraMove: string;
  duration: number;
  aspectRatio: string;
}

export function buildScriptPrompt(input: ScriptPromptInput): string {
  return `You are the creative director for Noble the Bull, the official mascot of EHM Strategies.

Create a short video script based on this request:
${input.userRequest}

The video must be built for:
Platform: ${input.platform}
Length: ${input.length}
Tone: ${input.tone}
CTA: ${input.cta}

Rules:
- Noble must sound smart, warm, confident, and easy to understand.
- Keep mortgage language simple.
- Do not make false promises about loan approval, rates, or guaranteed funding.
- Do not guarantee loan approval or specific interest rates.
- Create a hook in the first 2 seconds.
- End with a strong CTA.

Return a JSON object with this exact structure:
{
  "title": "string",
  "script": "string (full script)",
  "voice_direction": "string",
  "scenes": [
    {
      "scene_number": 1,
      "script_line": "string",
      "visual_prompt": "string",
      "camera_direction": "string",
      "noble_action": "string",
      "background": "string",
      "caption_text": "string",
      "voice_direction": "string"
    }
  ]
}`;
}

export function buildImagePrompt(input: ScenePromptInput): string {
  return `Create a scene image for Noble the Bull.

${NOBLE_CHARACTER_LOCK}

Scene:
${input.sceneDescription}

Camera:
${input.cameraDirection}

Action:
${input.nobleAction}

Background:
${input.background}

Style:
Cinematic 3D animation, luxury finance brand, polished lighting, high-end commercial look, clean background, expressive but consistent character.

Negative prompt:
${NOBLE_NEGATIVE_PROMPT}`;
}

export function buildVideoPrompt(input: VideoPromptInput): string {
  return `Animate this approved image of Noble the Bull.

Motion:
${input.motion}

Camera:
${input.cameraMove}

Rules:
- Keep Noble's face, horns, green eyes, brown swooped hair, navy vest, green tie, white shirt, and gold cape exactly the same.
- Do not change the character design.
- Do not change the outfit.
- Do not morph his face.
- Keep motion smooth and subtle.
- Make it feel like a high-end animated commercial.
- Duration: ${input.duration} seconds.
- Aspect ratio: ${input.aspectRatio}.`;
}

export function buildVoicePrompt(): string {
  return `Voice direction for Noble: ${NOBLE_VOICE_DIRECTION}`;
}
