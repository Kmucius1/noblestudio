import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from("noble_video_projects")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { count: totalProjects } = await supabase
    .from("noble_video_projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  const { count: totalExports } = await supabase
    .from("noble_exports")
    .select("*", { count: "exact", head: true });

  const { data: refs } = await supabase
    .from("noble_character_refs")
    .select("*")
    .eq("is_primary", true)
    .limit(1);

  const stats = [
    { label: "Total Projects", value: totalProjects ?? 0, icon: "🎬" },
    { label: "Exports Rendered", value: totalExports ?? 0, icon: "📤" },
    { label: "Character Refs", value: refs?.length ?? 0, icon: "🐂" },
  ];

  const quickActions = [
    { label: "Create New Video", href: "/create", icon: "+", description: "Start a new Noble video from scratch" },
    { label: "Browse Projects", href: "/projects", icon: "🎬", description: "View all your Noble Studio projects" },
    { label: "Saved Clips", href: "/clips", icon: "🎞", description: "All generated Noble scenes and clips" },
    { label: "Export History", href: "/exports", icon: "📤", description: "Download your final rendered videos" },
  ];

  const statusColors: Record<string, string> = {
    draft: "#8899aa",
    scripted: "#c9a227",
    storyboarded: "#2d6a4f",
    rendered: "#40916c",
    exported: "#e8c547",
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Noble Studio</h1>
        <p style={{ color: "#8899aa" }}>AI-powered video production for EHM Strategies</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl p-5 card-glow" style={{ background: "#0e1c33" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-3xl font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-sm" style={{ color: "#8899aa" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Noble Character Lock Banner */}
      <div className="rounded-2xl p-5 mb-8 border" style={{ background: "linear-gradient(135deg, #0e1c33, #132040)", borderColor: "rgba(201,162,39,0.3)" }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: "linear-gradient(135deg, #c9a227, #e8c547)" }}>
            🐂
          </div>
          <div>
            <p className="font-semibold text-white mb-0.5">Noble Character Lock — Active</p>
            <p className="text-sm" style={{ color: "#8899aa" }}>
              Every generation references Noble&apos;s character bible: brown swooped hair, green eyes, gold horns, navy vest, green tie, white shirt, gold cape. No exceptions.
            </p>
          </div>
          <div className="ml-auto shrink-0">
            <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(45,106,79,0.3)", color: "#40916c" }}>
              LOCKED
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-4 p-4 rounded-xl card-glow transition-all block"
                style={{ background: "#0e1c33" }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ background: "#132040" }}>
                  {action.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{action.label}</p>
                  <p className="text-xs" style={{ color: "#8899aa" }}>{action.description}</p>
                </div>
                <span className="ml-auto text-sm" style={{ color: "#c9a227" }}>→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Projects</h2>
          {projects && projects.length > 0 ? (
            <div className="space-y-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}/storyboard`}
                  className="block p-4 rounded-xl card-glow transition-all"
                  style={{ background: "#0e1c33" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-white truncate">{project.title || "Untitled Project"}</p>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium ml-2 shrink-0"
                      style={{ color: statusColors[project.status] ?? "#8899aa", background: "rgba(255,255,255,0.05)" }}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "#8899aa" }}>
                    {project.platform?.replace(/_/g, " ")} · {project.duration_seconds}s · {project.tone}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl p-6 text-center" style={{ background: "#0e1c33" }}>
              <p className="text-3xl mb-2">🎬</p>
              <p className="text-sm text-white mb-1">No projects yet</p>
              <p className="text-xs mb-4" style={{ color: "#8899aa" }}>Create your first Noble video</p>
              <Link
                href="/create"
                className="inline-block px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: "linear-gradient(135deg, #c9a227, #e8c547)", color: "#0a1628" }}
              >
                Create Video
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
