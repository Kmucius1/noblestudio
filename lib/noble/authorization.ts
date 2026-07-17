import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function notFound() {
  return NextResponse.json({ error: "Resource not found" }, { status: 404 });
}

async function authenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function authorizeOwnedProject(projectId: string) {
  const { supabase, user } = await authenticatedClient();

  if (!user) {
    return { response: unauthorized(), user: null, project: null };
  }

  const { data: project, error } = await supabase
    .from("noble_video_projects")
    .select("id, user_id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to authorize Noble project:", error);
  }

  if (!project) {
    return { response: notFound(), user: null, project: null };
  }

  return { response: null, user, project };
}

export async function authorizeOwnedScene(
  sceneId: string,
  expectedProjectId?: string,
) {
  const { supabase, user } = await authenticatedClient();

  if (!user) {
    return {
      response: unauthorized(),
      user: null,
      project: null,
      scene: null,
    };
  }

  const { data: scene, error: sceneError } = await supabase
    .from("noble_video_scenes")
    .select("id, project_id")
    .eq("id", sceneId)
    .maybeSingle();

  if (sceneError) {
    console.error("Failed to load Noble scene for authorization:", sceneError);
  }

  if (!scene || (expectedProjectId && scene.project_id !== expectedProjectId)) {
    return {
      response: notFound(),
      user: null,
      project: null,
      scene: null,
    };
  }

  const { data: project, error: projectError } = await supabase
    .from("noble_video_projects")
    .select("id, user_id")
    .eq("id", scene.project_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (projectError) {
    console.error("Failed to authorize Noble scene owner:", projectError);
  }

  if (!project) {
    return {
      response: notFound(),
      user: null,
      project: null,
      scene: null,
    };
  }

  return { response: null, user, project, scene };
}
