export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";

const statusColors: Record<string, { text: string; bg: string }> = {
  draft:        { text: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.05)" },
  scripted:     { text: "#c9a227",               bg: "rgba(201,162,39,0.1)" },
  storyboarded: { text: "#40916c",               bg: "rgba(64,145,108,0.1)" },
  rendered:     { text: "#6ee7b7",               bg: "rgba(110,231,183,0.1)" },
  exported:     { text: "#e4b93a",               bg: "rgba(228,185,58,0.12)" },
};

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: projects } = await supabase
    .from("noble_video_projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen" style={{ background: "#080f1e" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "2.5rem 2.5rem" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div>
          <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif" }}>Noble Studio</p>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Inter', sans-serif" }}>My Projects</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
            {projects?.length ?? 0} Noble video projects
          </p>
        </div>
        <Link
          href="/create"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
          style={{ background: "linear-gradient(135deg, #a07820, #c9a227, #e4b93a)", color: "#080f1e", fontFamily: "'Inter', sans-serif", boxShadow: "0 4px 16px rgba(201,162,39,0.3)" }}
        >
          ✦ Create New
        </Link>
      </div>

      <div>
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {projects.map((project) => {
              const s = statusColors[project.status] ?? statusColors.draft;
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}/storyboard`}
                  className="noble-card rounded-2xl p-5"
                  style={{ background: "#0d1628" }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center" style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.2)" }}>
                        <span className="text-sm" style={{ color: "#c9a227" }}>◈</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {project.title || "Untitled Project"}
                        </p>
                        <p className="text-xs mt-0.5 capitalize" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
                          {project.platform?.replace(/_/g, " ")} · {project.duration_seconds}s
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ml-3" style={{ color: s.text, background: s.bg, fontFamily: "'Inter', sans-serif" }}>
                      {project.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}>
                      <span className="capitalize">{project.tone?.replace(/_/g, " ")}</span>
                      <span>·</span>
                      <span className="capitalize">{project.goal?.replace(/_/g, " ")}</span>
                      <span>·</span>
                      <span>{project.aspect_ratio}</span>
                    </div>
                    <span className="text-xs" style={{ color: "#c9a227" }}>→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl p-16 text-center" style={{ background: "#0d1628", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="relative w-28 h-28 mx-auto mb-5 rounded-full overflow-hidden" style={{ border: "2px solid rgba(201,162,39,0.3)" }}>
              <Image src="/noble-badge.jpg" alt="Noble" fill className="object-cover" />
            </div>
            <p className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>No projects yet</p>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
              Create your first Noble video to get started
            </p>
            <Link
              href="/create"
              className="inline-block px-6 py-3 rounded-xl text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #a07820, #c9a227)", color: "#080f1e", fontFamily: "'Inter', sans-serif" }}
            >
              Create First Video
            </Link>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
