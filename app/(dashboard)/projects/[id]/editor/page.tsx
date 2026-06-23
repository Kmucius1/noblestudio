import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import FinalEditor from "@/components/editor/FinalEditor";

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: exports } = await supabase
    .from("noble_exports")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  return <FinalEditor project={project} scenes={scenes ?? []} exports={exports ?? []} />;
}
