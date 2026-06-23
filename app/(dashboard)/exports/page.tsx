import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";

export default async function ExportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: exports } = await supabase
    .from("noble_exports")
    .select("*, noble_video_projects!inner(title, user_id, platform, aspect_ratio)")
    .eq("noble_video_projects.user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen" style={{ background: "#080f1e" }}>
      {/* Header */}
      <div className="px-8 pt-8 pb-6 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div>
          <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif" }}>Noble Studio</p>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Export History</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
            {exports?.length ?? 0} rendered Noble videos
          </p>
        </div>
      </div>

      <div className="px-8 py-6 max-w-5xl">
        {exports && exports.length > 0 ? (
          <div className="space-y-3">
            {exports.map((exp) => {
              const project = exp.noble_video_projects as { title: string; platform: string; aspect_ratio: string };
              const isReady = exp.status === "complete" || exp.status === "ready";
              return (
                <div key={exp.id} className="rounded-2xl p-5" style={{ background: "#0d1628", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center" style={{ background: isReady ? "rgba(64,145,108,0.12)" : "rgba(201,162,39,0.1)", border: `1px solid ${isReady ? "rgba(64,145,108,0.25)" : "rgba(201,162,39,0.2)"}` }}>
                      <span className="text-sm" style={{ color: isReady ? "#40916c" : "#c9a227" }}>↑</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {project?.title ?? "Untitled"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}>
                        <span>{exp.format?.toUpperCase() ?? "MP4"}</span>
                        <span>·</span>
                        <span>{project?.aspect_ratio}</span>
                        {exp.duration_seconds && <><span>·</span><span>{exp.duration_seconds}s</span></>}
                        <span>·</span>
                        <span>{new Date(exp.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                    </div>

                    {/* Status + Download */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{
                        color: isReady ? "#6ee7b7" : "#c9a227",
                        background: isReady ? "rgba(110,231,183,0.1)" : "rgba(201,162,39,0.1)",
                        fontFamily: "'Inter', sans-serif",
                      }}>
                        {exp.status ?? "queued"}
                      </span>
                      {exp.export_url ? (
                        <a
                          href={exp.export_url}
                          download
                          className="px-4 py-2 rounded-xl text-sm font-bold"
                          style={{ background: "linear-gradient(135deg, #a07820, #c9a227)", color: "#080f1e", fontFamily: "'Inter', sans-serif" }}
                        >
                          ↓ Download
                        </a>
                      ) : (
                        <span className="px-4 py-2 rounded-xl text-sm font-bold opacity-40" style={{ background: "#0d1628", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'Inter', sans-serif" }}>
                          Processing
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl p-16 text-center" style={{ background: "#0d1628", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="relative w-28 h-28 mx-auto mb-5 rounded-full overflow-hidden" style={{ border: "2px solid rgba(201,162,39,0.3)" }}>
              <Image src="/noble-signing.png" alt="Noble" fill className="object-cover object-top" />
            </div>
            <p className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>No exports yet</p>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
              Complete a project and render the final video to see it here
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
