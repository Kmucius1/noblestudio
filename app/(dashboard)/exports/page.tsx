import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format } from "date-fns";

export default async function ExportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: exports } = await supabase
    .from("noble_exports")
    .select("*, noble_video_projects!inner(title, user_id, platform, aspect_ratio)")
    .eq("noble_video_projects.user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Export History</h1>
        <p style={{ color: "#8899aa" }}>{exports?.length ?? 0} rendered Noble videos</p>
      </div>

      {exports && exports.length > 0 ? (
        <div className="space-y-4">
          {exports.map((exp) => (
            <div key={exp.id} className="rounded-2xl p-5 card-glow" style={{ background: "#0e1c33" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white mb-1">
                    {(exp.noble_video_projects as { title: string })?.title}
                  </p>
                  <div className="flex items-center gap-3 text-xs" style={{ color: "#8899aa" }}>
                    <span>{exp.format?.toUpperCase()}</span>
                    <span>·</span>
                    <span>{(exp.noble_video_projects as { aspect_ratio: string })?.aspect_ratio}</span>
                    <span>·</span>
                    <span>{exp.duration_seconds}s</span>
                    <span>·</span>
                    <span>{format(new Date(exp.created_at), "MMM d, yyyy")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs px-3 py-1 rounded-full font-semibold"
                    style={{
                      background: exp.status === "complete" ? "rgba(64,145,108,0.2)" : "rgba(201,162,39,0.2)",
                      color: exp.status === "complete" ? "#40916c" : "#c9a227",
                    }}
                  >
                    {exp.status ?? "queued"}
                  </span>
                  {exp.export_url && (
                    <a
                      href={exp.export_url}
                      download
                      className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity"
                      style={{ background: "linear-gradient(135deg, #c9a227, #e8c547)", color: "#0a1628" }}
                    >
                      Download
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl p-16 text-center" style={{ background: "#0e1c33" }}>
          <p className="text-5xl mb-4">📤</p>
          <p className="text-lg font-semibold text-white mb-2">No exports yet</p>
          <p className="text-sm mb-6" style={{ color: "#8899aa" }}>Complete a project and render the final video</p>
          <Link href="/projects" className="inline-block px-6 py-3 rounded-xl font-semibold text-sm" style={{ background: "linear-gradient(135deg, #c9a227, #e8c547)", color: "#0a1628" }}>
            View Projects
          </Link>
        </div>
      )}
    </div>
  );
}
