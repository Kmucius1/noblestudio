export type VideoGoal =
  | "mortgage_education"
  | "funny_tiktok"
  | "luxury_ad"
  | "website_hero"
  | "loan_explainer"
  | "holiday_social"
  | "client_followup"
  | "rsm_training";

export type Platform =
  | "tiktok_reels_shorts"
  | "website_hero"
  | "instagram_square"
  | "meta_ad";

export type AspectRatio = "9:16" | "16:9" | "1:1" | "4:5";

export type VideoLength = 8 | 15 | 30 | 60;

export type VideoTone =
  | "funny"
  | "luxury"
  | "educational"
  | "bold"
  | "warm"
  | "cartoon_cinematic";

export type NobleLocation =
  | "luxury_office"
  | "mortgage_desk"
  | "tampa_skyline"
  | "kitchen_remodel"
  | "bank_vault"
  | "white_studio"
  | "closing_table"
  | "dream_home_driveway";

export type CallToAction =
  | "apply_now"
  | "request_quote"
  | "talk_to_noble"
  | "price_loan"
  | "visit_ehm";

export type SceneStatus = "pending" | "image_generated" | "video_generated" | "approved" | "error";
export type ProjectStatus = "draft" | "scripted" | "storyboarded" | "rendered" | "exported";

export interface NobleVideoProject {
  id: string;
  user_id: string;
  title: string;
  goal: VideoGoal;
  platform: Platform;
  aspect_ratio: AspectRatio;
  duration_seconds: VideoLength;
  tone: VideoTone;
  location: NobleLocation;
  cta: CallToAction;
  custom_prompt?: string;
  script?: string;
  status: ProjectStatus;
  created_at: string;
}

export interface NobleVideoScene {
  id: string;
  project_id: string;
  scene_number: number;
  script_line: string;
  visual_prompt: string;
  negative_prompt: string;
  camera_direction: string;
  noble_action: string;
  background: string;
  caption_text: string;
  voice_direction?: string;
  image_url?: string;
  video_url?: string;
  voice_url?: string;
  status: SceneStatus;
  created_at: string;
}

export interface NobleCharacterRef {
  id: string;
  name: string;
  description: string;
  image_url: string;
  is_primary: boolean;
  created_at: string;
}

export interface NobleExport {
  id: string;
  project_id: string;
  export_url: string;
  format: string;
  duration_seconds: number;
  created_at: string;
}

export interface GeneratedScript {
  title: string;
  script: string;
  scenes: GeneratedScene[];
  voice_direction: string;
}

export interface GeneratedScene {
  scene_number: number;
  script_line: string;
  visual_prompt: string;
  camera_direction: string;
  noble_action: string;
  background: string;
  caption_text: string;
  voice_direction: string;
}
