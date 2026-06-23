import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const statusColors: Record<string, string> = {
  draft: "#8899aa",
  scripted: "#c9a227",
  storyboarded: "#40916c",
  rendered: "#2d6a4f",
  exported: "#e8c547",
};

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from("noble_video_projects")
    .select("*, noble_video_scenes(count)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">My Projects</h1>
          <p style={{ color: "#8899aa" }}>{projects?.length ?? 0} Noble video projects</p>
        </div>
        <Link
          href="/create"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, #c9a227, #e8c547)", color: "#0a1628" }}
        >
          + Create New
        </Link>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}/storyboard`}
              className="block rounded-2xl p-5 card-glow transition-all"
              style={{ background: "#0e1c33" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 mr-3">
                  <h3 className="font-semibold text-white truncate">{project.title || "Untitled Project"}</h3>
                  <p className="text-xs mt-0.5" style={{ color: "#8899aa" }}>
                    {project.platform?.replace(/_/g, " ")} · {project.duration_seconds}s
                  </p>
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-semibold shrink-0"
                  style={{ color: statusColors[project.status] ?? "#8899aa", background: "rgba(255,255,255,0.05)" }}
                >
                  {project.status}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs" style={{ color: "#8899aa" }}>
                <span className="capitalize">{project.tone?.replace(/_/g, " ")}</span>
                <span>·</span>
                <span className="capitalize">{project.goal?.replace(/_/g, " ")}</span>
                <span>·</span>
                <span>{project.aspect_ratio}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl p-16 text-center" style={{ background: "#0e1c33" }}>
          <p className="text-5xl mb-4">🎬</p>
          <p className="text-lg font-semibold text-white mb-2">No projects yet</p>
          <p className="text-sm mb-6" style={{ color: "#8899aa" }}>Create your first Noble video to get started</p>
          <Link
            href="/create"
            className="inline-block px-6 py-3 rounded-xl font-semibold text-sm"
            style={{ background: "linear-gradient(135deg, #c9a227, #e8c547)", color: "#0a1628" }}
          >
            Create First Video
          </Link>
        </div>
      )}
    </div>
  );
}
