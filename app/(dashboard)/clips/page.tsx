import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ClipsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: scenes } = await supabase
    .from("noble_video_scenes")
    .select("*, noble_video_projects!inner(title, user_id, aspect_ratio)")
    .eq("noble_video_projects.user_id", user!.id)
    .not("image_url", "is", null)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Saved Clips</h1>
        <p style={{ color: "#8899aa" }}>{scenes?.length ?? 0} generated Noble scenes</p>
      </div>

      {scenes && scenes.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {scenes.map((scene) => (
            <div key={scene.id} className="rounded-2xl overflow-hidden card-glow" style={{ background: "#0e1c33" }}>
              {scene.image_url ? (
                <img src={scene.image_url} alt="" className="w-full aspect-video object-cover" />
              ) : (
                <div className="w-full aspect-video flex items-center justify-center" style={{ background: "#132040" }}>
                  <span className="text-4xl">🐂</span>
                </div>
              )}
              <div className="p-4">
                <p className="text-xs font-semibold mb-1" style={{ color: "#c9a227" }}>
                  {(scene.noble_video_projects as { title: string })?.title}
                </p>
                <p className="text-sm text-white mb-2 line-clamp-2">{scene.script_line}</p>
                <div className="flex items-center gap-2">
                  {scene.video_url && (
                    <a href={scene.video_url} download className="text-xs px-2 py-1 rounded" style={{ background: "rgba(201,162,39,0.15)", color: "#c9a227" }}>
                      DL Video
                    </a>
                  )}
                  {scene.voice_url && (
                    <a href={scene.voice_url} download className="text-xs px-2 py-1 rounded" style={{ background: "rgba(64,145,108,0.15)", color: "#40916c" }}>
                      DL Audio
                    </a>
                  )}
                  <span className="ml-auto text-xs capitalize" style={{ color: "#8899aa" }}>{scene.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl p-16 text-center" style={{ background: "#0e1c33" }}>
          <p className="text-5xl mb-4">🎞</p>
          <p className="text-lg font-semibold text-white mb-2">No clips yet</p>
          <p className="text-sm mb-6" style={{ color: "#8899aa" }}>Generate images and videos in your storyboard to see clips here</p>
          <Link href="/projects" className="inline-block px-6 py-3 rounded-xl font-semibold text-sm" style={{ background: "linear-gradient(135deg, #c9a227, #e8c547)", color: "#0a1628" }}>
            View Projects
          </Link>
        </div>
      )}
    </div>
  );
}
