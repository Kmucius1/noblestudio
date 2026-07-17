import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { authorizeOwnedScene } from "@/lib/noble/authorization";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { scene_id, status } = body;

    if (!scene_id || status !== "approved") {
      return NextResponse.json(
        { error: "scene_id is required and status must be approved" },
        { status: 400 },
      );
    }

    const access = await authorizeOwnedScene(scene_id);
    if (access.response) return access.response;

    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from("noble_video_scenes")
      .update({ status })
      .eq("id", scene_id)
      .eq("project_id", access.scene!.project_id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
