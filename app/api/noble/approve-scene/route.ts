import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { scene_id, status } = body;

    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from("noble_video_scenes")
      .update({ status })
      .eq("id", scene_id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
