export const dynamic = "force-dynamic";
import Link from "next/link";
import Image from "next/image";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  Search,
  Zap,
  Bell,
  ChevronDown,
  Film,
  Play,
  Bookmark,
  Shield,
  Clapperboard,
  FolderOpen,
  Upload,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";

const THUMBNAIL_FALLBACKS = [
  "/noble-signing.png",
  "/noble-commercial.png",
  "/noble-office.jpg",
  "/noble-full.png",
  "/noble-nobull.png",
];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  draft:        { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" },
  scripted:     { bg: "rgba(201,162,39,0.15)",   color: "#e4b93a" },
  storyboarded: { bg: "rgba(64,145,108,0.2)",    color: "#6ee7b7" },
  rendered:     { bg: "rgba(64,145,108,0.2)",    color: "#6ee7b7" },
  exported:     { bg: "rgba(64,145,108,0.2)",    color: "#6ee7b7" },
  in_progress:  { bg: "rgba(201,162,39,0.15)",   color: "#e4b93a" },
  completed:    { bg: "rgba(27,94,54,0.35)",      color: "#6ee7b7" },
};

function statusLabel(s: string) {
  if (s === "in_progress") return "In Progress";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatPlatform(p: string) {
  return (p ?? "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function DashboardPage() {
  let user = null;
  let projects: Record<string, unknown>[] = [];
  let totalProjects = 0;
  let totalExports = 0;
  let totalClips = 0;

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (list) => {
            try { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
          },
        },
      }
    );

    const { data: authData } = await supabase.auth.getUser();
    user = authData?.user ?? null;

    if (user) {
      const { data: p } = await supabase
        .from("noble_video_projects")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5);
      projects = p ?? [];

      const { count: pc } = await supabase
        .from("noble_video_projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      totalProjects = pc ?? 0;

      const { count: ec } = await supabase
        .from("noble_exports")
        .select("*", { count: "exact", head: true });
      totalExports = ec ?? 0;

      try {
        const { count: cc } = await supabase
          .from("noble_clips")
          .select("*", { count: "exact", head: true });
        totalClips = (cc as number) ?? 0;
      } catch { /* table may not exist */ }
    }
  } catch (err) {
    console.error("[Dashboard]", err);
  }

  if (!user) return null;

  const firstName = user.user_metadata?.full_name?.split(" ")[0] ?? "Zoe";
  const userAvatar = user.user_metadata?.avatar_url ?? null;

  const lastProject = projects[0];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#080f1e" }}>

      {/* ── Top header ── */}
      <header
        className="flex items-center justify-between px-8 py-4 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            Welcome back, <span style={{ color: "#e4b93a" }}>{firstName}.</span>{" "}
            <span role="img" aria-label="wave">👋</span>
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif" }}>
            Create, edit, and export Noble videos in one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: "#0d1628", border: "1px solid rgba(255,255,255,0.07)", width: 240 }}
          >
            <Search size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}>
              Search projects, clips, scripts…
            </span>
          </div>

          {/* AI Provider pill */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "#0d1628", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Zap size={13} style={{ color: "#e4b93a" }} />
            <span className="text-sm font-medium text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
              AI Provider: Groq
            </span>
            <span className="w-2 h-2 rounded-full" style={{ background: "#40916c" }} />
          </div>

          {/* Notifications */}
          <button
            className="relative p-2.5 rounded-xl"
            style={{ background: "#0d1628", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Bell size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: "#c9a227", fontSize: "9px", fontFamily: "'Inter', sans-serif" }}
            >
              3
            </span>
          </button>

          {/* Avatar */}
          <button
            className="flex items-center gap-1.5 p-1.5 rounded-xl"
            style={{ background: "#0d1628", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden relative" style={{ border: "1px solid rgba(201,162,39,0.3)" }}>
              {userAvatar ? (
                <Image src={userAvatar} alt="You" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(201,162,39,0.15)" }}>
                  <span className="text-xs font-bold" style={{ color: "#c9a227" }}>{firstName[0]}</span>
                </div>
              )}
            </div>
            <ChevronDown size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "2rem 2.5rem" }} className="space-y-6">

        {/* ── Hero banner ── */}
        <div className="relative rounded-2xl overflow-hidden" style={{ height: 260 }}>
          <Image src="/noble-hero.jpg" alt="Noble the Bull" fill className="object-cover object-center" priority />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(100deg, rgba(8,15,30,0.96) 25%, rgba(8,15,30,0.7) 55%, rgba(8,15,30,0.1) 100%)" }}
          />
          <div className="absolute inset-0 flex flex-col justify-center px-8">
            <p
              className="text-xs font-bold tracking-widest uppercase mb-4"
              style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif" }}
            >
              EHM Strategies · Noble Studio
            </p>
            <h2
              className="text-4xl font-bold text-white leading-none mb-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Create Noble videos
            </h2>
            <h2
              className="text-4xl font-bold leading-none mb-4"
              style={{ fontFamily: "'Inter', sans-serif", color: "#e4b93a" }}
            >
              faster.
            </h2>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Inter', sans-serif", maxWidth: 340 }}>
              Generate scripts, scenes, voice, captions,<br />and export-ready video assets with AI.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
                style={{
                  background: "linear-gradient(135deg, #a07820, #c9a227, #e4b93a)",
                  color: "#080f1e",
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: "0 4px 18px rgba(201,162,39,0.4)",
                }}
              >
                <Sparkles size={14} />
                Create New Video
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                View My Projects
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              icon: Film,
              value: totalProjects,
              label: "Projects Created",
              sub: "+4 this week",
              subColor: "#40916c",
            },
            {
              icon: Play,
              value: totalExports,
              label: "Videos Exported",
              sub: "+12 this week",
              subColor: "#40916c",
            },
            {
              icon: Bookmark,
              value: totalClips,
              label: "Saved Clips",
              sub: "+18 this week",
              subColor: "#40916c",
            },
            {
              icon: Shield,
              value: "Groq",
              label: "Active AI Provider",
              sub: "Llama 3.3 · Fast",
              subColor: "#c9a227",
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-4 p-5 rounded-2xl"
                style={{ background: "#0d1628", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(201,162,39,0.1)", border: "1px solid rgba(201,162,39,0.2)" }}
                >
                  <Icon size={18} style={{ color: "#c9a227" }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {stat.value}
                  </p>
                  <p className="text-xs mt-0.5 text-white/60" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {stat.label}
                  </p>
                  <p className="text-xs mt-0.5 font-medium" style={{ color: stat.subColor, fontFamily: "'Inter', sans-serif" }}>
                    {stat.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                icon: Clapperboard,
                label: "Create New Video",
                desc: "Start from idea to export",
                href: "/create",
              },
              {
                icon: FolderOpen,
                label: "Continue Last Project",
                desc: lastProject ? (lastProject.title as string) : "No recent projects",
                href: lastProject ? `/projects/${lastProject.id}/storyboard` : "/projects",
              },
              {
                icon: Bookmark,
                label: "View Saved Clips",
                desc: "Browse your scenes",
                href: "/clips",
              },
              {
                icon: Upload,
                label: "Export History",
                desc: "Download & share",
                href: "/exports",
              },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <Link
                  key={i}
                  href={action.href}
                  className="flex items-center gap-3 p-4 rounded-2xl group transition-all border border-[rgba(255,255,255,0.06)] hover:border-[rgba(201,162,39,0.25)]"
                  style={{ background: "#0d1628" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.15)" }}
                  >
                    <Icon size={16} style={{ color: "#c9a227" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {action.label}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
                      {action.desc}
                    </p>
                  </div>
                  <span className="text-white/30 shrink-0 text-base">→</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Recent Projects ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
              Recent Projects
            </h2>
            <Link
              href="/projects"
              className="text-sm font-medium"
              style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif" }}
            >
              View all projects →
            </Link>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-5 gap-4">
              {projects.map((project, i) => {
                const thumb = THUMBNAIL_FALLBACKS[i % THUMBNAIL_FALLBACKS.length];
                const st = (project.status as string) ?? "draft";
                const stStyle = STATUS_STYLE[st] ?? STATUS_STYLE.draft;
                const dur = (project.duration_seconds as number) ?? 30;
                const mins = Math.floor(dur / 60).toString().padStart(2, "0");
                const secs = (dur % 60).toString().padStart(2, "0");
                const updatedAt = project.updated_at as string;

                return (
                  <Link
                    key={project.id as string}
                    href={`/projects/${project.id}/storyboard`}
                    className="group flex flex-col rounded-2xl overflow-hidden transition-all border border-[rgba(255,255,255,0.06)] hover:border-[rgba(201,162,39,0.25)]"
                    style={{ background: "#0d1628" }}
                  >
                    {/* Thumbnail */}
                    <div className="relative" style={{ height: 120 }}>
                      <Image src={thumb} alt="Project" fill className="object-cover" />
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(to top, rgba(13,22,40,0.85) 0%, transparent 60%)" }}
                      />
                      {/* Duration badge */}
                      <span
                        className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-md"
                        style={{ background: "rgba(0,0,0,0.65)", color: "white", fontFamily: "'Inter', sans-serif" }}
                      >
                        {mins}:{secs}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <p className="text-sm font-semibold text-white leading-tight line-clamp-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {(project.title as string) || "Untitled Project"}
                        </p>
                        <button className="shrink-0 text-white/30 hover:text-white/70 transition-colors">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                      <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
                        {formatPlatform(project.platform as string)}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: stStyle.bg, color: stStyle.color, fontFamily: "'Inter', sans-serif" }}
                        >
                          {statusLabel(st)}
                        </span>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Inter', sans-serif" }}>
                          Updated {updatedAt ? timeAgo(updatedAt) : "—"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div
              className="rounded-2xl p-12 text-center"
              style={{ background: "#0d1628", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div
                className="relative w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden"
                style={{ border: "2px solid rgba(201,162,39,0.3)" }}
              >
                <Image src="/noble-badge.jpg" alt="Noble" fill className="object-cover" />
              </div>
              <p className="text-base font-bold text-white mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                No projects yet
              </p>
              <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}>
                Create your first Noble video to get started
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
                style={{
                  background: "linear-gradient(135deg, #a07820, #c9a227)",
                  color: "#080f1e",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <Sparkles size={14} />
                Create First Video
              </Link>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
