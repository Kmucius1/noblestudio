export const dynamic = "force-dynamic";
import Link from "next/link";
import Image from "next/image";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  let user = null;
  let projects: Record<string, unknown>[] = [];
  let totalProjects = 0;
  let totalExports = 0;

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) console.error("[Dashboard] auth error:", authError.message);
    user = authData?.user ?? null;

    if (user) {
      const { data: p, error: pErr } = await supabase
        .from("noble_video_projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(4);
      if (pErr) console.error("[Dashboard] projects query error:", pErr.message, pErr.code);
      projects = p ?? [];

      const { count: pc, error: pcErr } = await supabase
        .from("noble_video_projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (pcErr) console.error("[Dashboard] project count error:", pcErr.message);
      totalProjects = pc ?? 0;

      const { count: ec, error: ecErr } = await supabase
        .from("noble_exports")
        .select("*", { count: "exact", head: true });
      if (ecErr) console.error("[Dashboard] exports count error:", ecErr.message);
      totalExports = ec ?? 0;
    }
  } catch (err) {
    console.error("[Dashboard] page crash:", err);
  }

  if (!user) return null;

  const stats = [
    { label: "Projects", value: totalProjects, icon: "◈", sub: "total created" },
    { label: "Exports", value: totalExports, icon: "↑", sub: "rendered" },
    { label: "AI Provider", value: "Groq", icon: "✦", sub: "free · Llama 3.3" },
  ];

  const statusColors: Record<string, string> = {
    draft: "rgba(255,255,255,0.3)",
    scripted: "#c9a227",
    storyboarded: "#40916c",
    rendered: "#6ee7b7",
    exported: "#e4b93a",
  };

  return (
    <div className="min-h-screen" style={{ background: "#080f1e" }}>
      {/* Hero banner */}
      <div className="relative overflow-hidden" style={{ height: 260 }}>
        <Image src="/noble-hero.jpg" alt="Noble" fill className="object-cover object-right" priority />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(95deg, rgba(8,15,30,0.97) 30%, rgba(8,15,30,0.65) 65%, rgba(8,15,30,0.15) 100%)"
        }} />
        <div className="absolute inset-0 flex items-center px-10">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase mb-3 font-medium" style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif" }}>
              EHM Strategies · Noble Studio
            </p>
            <h1 className="text-4xl font-bold leading-tight text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Welcome back.
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', sans-serif", maxWidth: 340 }}>
              Script, storyboard, voice, and export Noble videos — all in one place.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase"
              style={{ background: "linear-gradient(135deg, #a07820, #c9a227, #e4b93a)", color: "#080f1e", fontFamily: "'Inter', sans-serif", letterSpacing: "0.1em", boxShadow: "0 4px 16px rgba(201,162,39,0.35)" }}
            >
              ✦ Create New Video
            </Link>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-6xl">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl p-5" style={{ background: "#0d1628", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}>{stat.label}</span>
                <span className="text-xs" style={{ color: "#c9a227" }}>{stat.icon}</span>
              </div>
              <p className="text-3xl font-bold text-white mb-0.5" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{stat.value}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Inter', sans-serif" }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Quick actions */}
          <div className="col-span-2">
            <h2 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}>Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: "Create New Noble Video", href: "/create", desc: "Start with goal, tone & platform" },
                { label: "My Projects", href: "/projects", desc: "View and continue past work" },
                { label: "Saved Clips", href: "/clips", desc: "Browse generated Noble scenes" },
                { label: "Export History", href: "/exports", desc: "Download final rendered videos" },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex items-center justify-between p-4 rounded-xl group transition-all"
                  style={{ background: "#0d1628", border: "1px solid rgba(255,255,255,0.06)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,162,39,0.25)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
                >
                  <div>
                    <p className="text-sm font-semibold text-white" style={{ fontFamily: "'Inter', sans-serif" }}>{a.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}>{a.desc}</p>
                  </div>
                  <span className="text-sm" style={{ color: "#c9a227" }}>→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent projects */}
          <div className="col-span-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}>Recent Projects</h2>
              <Link href="/projects" className="text-xs" style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif" }}>View all →</Link>
            </div>

            {projects.length > 0 ? (
              <div className="space-y-2">
                {projects.map((project) => (
                  <Link
                    key={project.id as string}
                    href={`/projects/${project.id}/storyboard`}
                    className="flex items-center gap-4 p-4 rounded-xl group transition-all"
                    style={{ background: "#0d1628", border: "1px solid rgba(255,255,255,0.06)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,162,39,0.25)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
                  >
                    <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center" style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.2)" }}>
                      <span className="text-sm" style={{ color: "#c9a227" }}>◈</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {(project.title as string) || "Untitled Project"}
                      </p>
                      <p className="text-xs mt-0.5 capitalize" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}>
                        {((project.platform as string) ?? "").replace(/_/g, " ")} · {project.duration_seconds as number}s · {project.tone as string}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold shrink-0" style={{
                      color: statusColors[project.status as string] ?? "rgba(255,255,255,0.3)",
                      background: "rgba(255,255,255,0.05)",
                      fontFamily: "'Inter', sans-serif",
                    }}>
                      {project.status as string}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl p-10 text-center" style={{ background: "#0d1628", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="relative w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden" style={{ border: "2px solid rgba(201,162,39,0.3)" }}>
                  <Image src="/noble-badge.jpg" alt="Noble" fill className="object-cover" />
                </div>
                <p className="text-base font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>No projects yet</p>
                <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}>Create your first Noble video to get started</p>
                <Link href="/create" className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase"
                  style={{ background: "linear-gradient(135deg, #a07820, #c9a227)", color: "#080f1e", fontFamily: "'Inter', sans-serif", letterSpacing: "0.1em" }}>
                  Create First Video
                </Link>
              </div>
            )}

            {/* Noble image strip */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {["/noble-signing.png", "/noble-commercial.png"].map((src, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden" style={{ height: 110, border: "1px solid rgba(201,162,39,0.12)" }}>
                  <Image src={src} alt="Noble" fill className="object-cover object-top" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,15,30,0.75) 0%, transparent 50%)" }} />
                  <p className="absolute bottom-2 left-3 text-xs font-semibold text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {i === 0 ? "Commercial Lending" : "EHM Ad Creative"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
