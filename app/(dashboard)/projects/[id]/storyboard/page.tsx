import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import StoryboardClient from "@/components/noble/StoryboardClient";

export default async function StoryboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: project } = await supabase
    .from("noble_video_projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!project) notFound();

  const { data: scenes } = await supabase
    .from("noble_video_scenes")
    .select("*")
    .eq("project_id", id)
    .order("scene_number");

  const { data: refs } = await supabase
    .from("noble_character_refs")
    .select("*")
    .order("is_primary", { ascending: false });

  return <StoryboardClient project={project} initialScenes={scenes ?? []} characterRefs={refs ?? []} />;
}
