export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";

export default async function ClipsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: scenes } = await supabase
    .from("noble_video_scenes")
    .select("*, noble_video_projects!inner(title, user_id, aspect_ratio)")
    .eq("noble_video_projects.user_id", user.id)
    .order("created_at", { ascending: false });

  const withMedia = scenes?.filter((s) => s.image_url || s.video_url) ?? [];

  return (
    <div className="min-h-screen" style={{ background: "#080f1e" }}>
      {/* Header */}
      <div className="px-8 pt-8 pb-6 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div>
          <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif" }}>Noble Studio</p>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Saved Clips</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
            {withMedia.length} generated Noble scenes
          </p>
        </div>
      </div>

      <div className="px-8 py-6 max-w-6xl">
        {withMedia.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {withMedia.map((scene) => {
              const project = scene.noble_video_projects as { title: string; aspect_ratio: string };
              return (
                <div key={scene.id} className="rounded-2xl overflow-hidden" style={{ background: "#0d1628", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {/* Media preview */}
                  <div className="relative w-full" style={{ aspectRatio: scene.noble_video_projects?.aspect_ratio === "9:16" ? "9/16" : scene.noble_video_projects?.aspect_ratio === "1:1" ? "1/1" : "16/9", maxHeight: 240 }}>
                    {scene.video_url ? (
                      <video
                        src={scene.video_url}
                        className="w-full h-full object-cover"
                        controls
                        muted
                        playsInline
                      />
                    ) : scene.image_url ? (
                      <img src={scene.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: "#111f3a" }}>
                        <Image src="/noble-badge.jpg" alt="Noble" width={48} height={48} className="rounded-full opacity-40" />
                      </div>
                    )}
                    {/* Status badge */}
                    <div className="absolute top-2 right-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{
                        background: scene.status === "approved" ? "rgba(64,145,108,0.85)" : "rgba(201,162,39,0.85)",
                        color: "#fff",
                        fontFamily: "'Inter', sans-serif",
                      }}>
                        {scene.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-xs font-semibold mb-1 truncate" style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif" }}>
                      {project?.title}
                    </p>
                    <p className="text-sm text-white mb-3 line-clamp-2" style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.4 }}>
                      {scene.script_line}
                    </p>
                    <div className="flex items-center gap-2">
                      {scene.video_url && (
                        <a href={scene.video_url} download className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ background: "rgba(201,162,39,0.12)", color: "#c9a227", fontFamily: "'Inter', sans-serif" }}>
                          ↓ Video
                        </a>
                      )}
                      {scene.image_url && !scene.video_url && (
                        <a href={scene.image_url} download className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ background: "rgba(201,162,39,0.12)", color: "#c9a227", fontFamily: "'Inter', sans-serif" }}>
                          ↓ Image
                        </a>
                      )}
                      {scene.voice_url && (
                        <a href={scene.voice_url} download className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ background: "rgba(64,145,108,0.12)", color: "#40916c", fontFamily: "'Inter', sans-serif" }}>
                          ↓ Audio
                        </a>
                      )}
                      <span className="ml-auto text-xs" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Inter', sans-serif" }}>
                        Scene {scene.scene_number}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl p-16 text-center" style={{ background: "#0d1628", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="relative w-28 h-28 mx-auto mb-5 rounded-full overflow-hidden" style={{ border: "2px solid rgba(201,162,39,0.3)" }}>
              <Image src="/noble-thumbsup.png" alt="Noble" fill className="object-cover object-top" />
            </div>
            <p className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>No clips yet</p>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
              Generate images and videos in your storyboard to see clips here
            </p>
            <Link href="/projects" className="inline-block px-6 py-3 rounded-xl text-sm font-bold" style={{ background: "linear-gradient(135deg, #a07820, #c9a227)", color: "#080f1e", fontFamily: "'Inter', sans-serif" }}>
              View Projects
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
