import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: projects } = await supabase
    .from("noble_video_projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const { count: totalProjects } = await supabase
    .from("noble_video_projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: totalExports } = await supabase
    .from("noble_exports")
    .select("*", { count: "exact", head: true });

  const stats = [
    { label: "Projects", value: totalProjects ?? 0, icon: "◈", sub: "total created" },
    { label: "Exports", value: totalExports ?? 0, icon: "↑", sub: "rendered" },
    { label: "AI Provider", value: "Higgsfield", icon: "✦", sub: "primary" },
  ];

  const statusColors: Record<string, string> = {
    draft: "rgba(255,255,255,0.3)",
    scripted: "#c9a227",
    storyboarded: "#40916c",
    rendered: "#2d6a4f",
    exported: "#f5d76e",
  };

  return (
    <div className="min-h-screen" style={{ background: "#080f1e" }}>
      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden" style={{ height: 280 }}>
        <Image src="/noble-hero.jpg" alt="Noble" fill className="object-cover object-right" priority />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(95deg, rgba(8,15,30,0.97) 30%, rgba(8,15,30,0.65) 65%, rgba(8,15,30,0.15) 100%)"
        }} />
        <div className="absolute inset-0 flex items-center px-10">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase mb-3 font-medium" style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif" }}>
              EHM Strategies · Internal
            </p>
            <h1 className="text-5xl font-bold leading-tight text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Noble Studio
            </h1>
            <p className="text-base" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", maxWidth: 360 }}>
              AI video production for EHM&apos;s mortgage brand. Script, storyboard, generate, export.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl text-sm font-bold tracking-widest uppercase"
              style={{
                background: "linear-gradient(135deg, #a07820, #c9a227, #e4b93a)",
                color: "#080f1e",
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "0.1em",
                boxShadow: "0 4px 20px rgba(201,162,39,0.4)",
              }}
            >
              ✦ Create New Video
            </Link>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-6xl">
        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl p-5" style={{
              background: "#0d1628",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
                  {stat.label}
                </span>
                <span className="text-xs" style={{ color: "#c9a227" }}>{stat.icon}</span>
              </div>
              <p className="text-3xl font-bold text-white mb-0.5" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {stat.value}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* ── Quick Actions ── */}
          <div className="col-span-2">
            <h2 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
              Quick Actions
            </h2>
            <div className="space-y-2">
              {[
                { label: "Create New Noble Video", href: "/create", desc: "Start with goal, tone, and platform" },
                { label: "My Projects", href: "/projects", desc: "View and continue past work" },
                { label: "Saved Clips", href: "/clips", desc: "Browse generated Noble scenes" },
                { label: "Export History", href: "/exports", desc: "Download final rendered videos" },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex items-center justify-between p-4 rounded-xl transition-all group"
                  style={{ background: "#0d1628", border: "1px solid rgba(255,255,255,0.06)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,162,39,0.25)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
                >
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{a.label}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}>{a.desc}</p>
                  </div>
                  <span className="text-sm transition-transform group-hover:translate-x-0.5" style={{ color: "#c9a227" }}>→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Recent Projects ── */}
          <div className="col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
                Recent Projects
              </h2>
              <Link href="/projects" className="text-xs" style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif" }}>View all →</Link>
            </div>

            {projects && projects.length > 0 ? (
              <div className="space-y-2">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}/storyboard`}
                    className="flex items-center gap-4 p-4 rounded-xl transition-all group"
                    style={{ background: "#0d1628", border: "1px solid rgba(255,255,255,0.06)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,162,39,0.25)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
                  >
                    <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-lg" style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.2)" }}>
                      ◈
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {project.title || "Untitled Project"}
                      </p>
                      <p className="text-xs mt-0.5 capitalize" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
                        {project.platform?.replace(/_/g, " ")} · {project.duration_seconds}s · {project.tone}
                      </p>
                    </div>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-semibold shrink-0"
                      style={{ color: statusColors[project.status] ?? "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", fontFamily: "'Inter', sans-serif" }}
                    >
                      {project.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl p-12 text-center" style={{ background: "#0d1628", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden" style={{ border: "2px solid rgba(201,162,39,0.3)" }}>
                  <Image src="/noble-badge.jpg" alt="Noble" fill className="object-cover" />
                </div>
                <p className="text-base font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>No projects yet</p>
                <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
                  Create your first Noble video to get started
                </p>
                <Link
                  href="/create"
                  className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase"
                  style={{ background: "linear-gradient(135deg, #a07820, #c9a227)", color: "#080f1e", fontFamily: "'Inter', sans-serif", letterSpacing: "0.1em" }}
                >
                  Create First Video
                </Link>
              </div>
            )}

            {/* Noble sample images strip */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {["/noble-signing.png", "/noble-commercial.png"].map((src, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden" style={{ height: 120, border: "1px solid rgba(201,162,39,0.15)" }}>
                  <Image src={src} alt="Noble" fill className="object-cover object-top" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,15,30,0.7) 0%, transparent 50%)" }} />
                  <div className="absolute bottom-2 left-3">
                    <p className="text-xs font-semibold text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {i === 0 ? "Commercial Lending" : "EHM Ad Creative"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
