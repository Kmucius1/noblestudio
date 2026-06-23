// Official Noble Brand Kit — from Kmucius1/v0-mortgage-not-insurance, noble-brand-kit branch

export const NOBLE_HIGGSFIELD_IDS = {
  // Soul V2 — most face-faithful; pass as soul_id / custom_reference_id
  soulV2: "8a167e9a-21b0-4d2b-84c6-56b86dd5f4ac",
  // Element — flexible, works with all video models; embed in prompt as <<<id>>>
  element: "6d96fa12-951b-43a7-8689-637f9908fced",
  // Source still — original approved Noble portrait
  sourceStill: "02999c8b-40f9-43d4-bd69-7653cead2881",
  // Approved reference stills (media_input IDs)
  refs: [
    "cf1b002c-e2ca-408c-a502-95b838fe242d",
    "54b8ff7f-1e10-4e98-8847-b5aed8507d67",
    "04d3685d-c8b5-4021-b6ea-0c526b46de2d",
  ],
};

export const NOBLE_HIGGSFIELD_MODELS = {
  image: "nano_banana_2",         // keyframe generation
  videoFast: "kling3_0_turbo",    // 8s teasers
  videoQuality: "kling3_0",       // 15–30s multi-scene
  soulPortrait: "soul_2",         // face-faithful hero shots
};

// Embed this tag at the START of every image/video prompt (Nano Banana / Element models)
export const NOBLE_ELEMENT_ANCHOR = `<<<${NOBLE_HIGGSFIELD_IDS.element}>>>`;

export const NOBLE_CHARACTER_BIBLE = `
Noble is the EHM Strategies bull mascot — a polished, trustworthy lending officer and financial guardian.
Powerful but friendly. Confident, composed, a little playful. Never goofy, never aggressive.
He's the sharp advisor who cuts through lender runaround and gives investors a straight answer.

LOCKED PHYSICAL DESIGN:
- Species/build: heroic anthropomorphic bull, executive proportions (strong, not bulky-cartoonish)
- Eyes: GREEN
- Hair: dark brown, swooped — NO SIDEBURNS
- Horns: polished gold/ivory, clean and symmetrical
- Fur: golden-brown
- Face: confident, friendly-strong; not angry, not cute, not human

LOCKED WARDROBE:
- White dress shirt
- Navy vest
- Emerald-green tie
- Gold cape with emerald-green underside
- Overall: premium, executive, superhero-of-finance

BRAND PALETTE: Deep navy · Black · Emerald green · Metallic gold · White (contrast)

SLOGANS:
- Primary: "No Bull. Just Strategy."
- Category: "No-Bull Mortgage Lending."
- "Straight answers. Real strategy. No bull."
- "I don't do runaround. I do results."

PRODUCTS: DSCR loans, fix-and-flip, bridge loans, construction loans
CTA PATTERN: "Run it through Noble's Loan Strategy → EHMStrategies.com"
`.trim();

export const NOBLE_NEGATIVE_PROMPT =
  "cute, goofy, childish, scary, evil, generic, skinny, blue jacket, red tie, different horns, " +
  "different hair, different eyes, sideburns, cowboy style, sports mascot style, human face, " +
  "realistic animal body, flat vector art, cheap clipart, blurry, distorted, extra horns, " +
  "broken hands, wrong outfit, different cape, different character, redesign, reinterpretation";

// Short inline lock for prompt injection
export const NOBLE_CHARACTER_LOCK =
  "Noble: green eyes, dark-brown swooped hair (no sideburns), gold horns, " +
  "white dress shirt, navy vest, emerald-green tie, gold cape with green underside. " +
  "Heroic anthropomorphic bull, executive proportions. Deep navy/emerald/gold palette.";

export const NOBLE_VOICE_DIRECTION = `
Noble's voice: confident, warm, grounded, a little swagger. Not hypey, not cartoonish.
Pace: unhurried — he's the calm expert in the room.
Signature move: name the pain → cut the runaround → give a clear next step.
Always lands on: "No Bull. Just Strategy."
Model: eleven_multilingual_v2 (or eleven_turbo_v2_5 for speed).
`.trim();

// Prompt scaffold for Nano Banana / Element generations (most ad/reel work)
export function buildNanoBananaPrompt(scene: string): string {
  return (
    `${NOBLE_ELEMENT_ANCHOR} — Noble, the EHM Strategies bull mascot. ` +
    `Keep his locked design exactly: ${NOBLE_CHARACTER_LOCK} ` +
    `${scene}. ` +
    `Palette: deep navy, black, emerald green, metallic gold. ` +
    `High-end luxury finance commercial look, cinematic lighting, sharp premium 3D mascot rendering. ` +
    `No redesign of Noble.`
  );
}

// Prompt scaffold for Soul V2 / hero portraits (face-faithful)
export function buildSoulPrompt(scene: string): string {
  return (
    `Noble the EHM Strategies bull executive, ${scene}, ` +
    `confident composed pose, navy/emerald/gold palette, ` +
    `cinematic rim light, premium finance brand.`
  );
}
