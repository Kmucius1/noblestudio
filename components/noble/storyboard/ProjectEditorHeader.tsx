import Link from "next/link";
import { ArrowLeft, Save, ExternalLink } from "lucide-react";
import type { NobleVideoProject, NobleVideoScene } from "@/types/noble";

const PROJECT_STATUS_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  draft:        { color: "#6b7a90", bg: "rgba(107,122,144,0.12)", label: "Draft" },
  scripted:     { color: "#c9a227", bg: "rgba(201,162,39,0.1)",  label: "Scripted" },
  storyboarded: { color: "#40916c", bg: "rgba(64,145,108,0.12)", label: "Storyboarded" },
  rendered:     { color: "#2d9c77", bg: "rgba(45,156,119,0.12)", label: "Rendered" },
  exported:     { color: "#e4b93a", bg: "rgba(228,185,58,0.12)", label: "Exported" },
};

interface Props {
  project: NobleVideoProject;
  scenes: NobleVideoScene[];
  onSaveDraft?: () => void;
  saving?: boolean;
}

function fmt(s: string) {
  return (s ?? "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ProjectEditorHeader({ project, scenes, onSaveDraft, saving }: Props) {
  const approved = scenes.filter((s) => s.status === "approved").length;
  const total = scenes.length;
  const pst = PROJECT_STATUS_STYLE[project.status] ?? PROJECT_STATUS_STYLE.draft;
  const canOpenEditor = approved > 0;

  return (
    <header
      className="sticky top-0 z-30 shrink-0"
      style={{
        background: "rgba(8,15,30,0.96)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(14px)",
      }}
    >
      {/* Top row: breadcrumb + actions */}
      <div className="flex items-center justify-between px-8 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/projects"
            className="flex items-center gap-1.5 text-xs shrink-0 transition-colors"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}
          >
            <ArrowLeft size={13} />
            My Projects
          </Link>
          <span style={{ color: "rgba(255,255,255,0.12)" }}>/</span>
          <span
            className="text-sm font-semibold text-white truncate"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {project.title}
          </span>
          <span
            className="shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{ color: pst.color, background: pst.bg, fontFamily: "'Inter', sans-serif" }}
          >
            {pst.label}
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 ml-4">
          {/* Progress pill */}
          {total > 0 && (
            <span
              className="text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{
                background: approved === total ? "rgba(64,145,108,0.15)" : "rgba(255,255,255,0.05)",
                color: approved === total ? "#40916c" : "rgba(255,255,255,0.35)",
                border: `1px solid ${approved === total ? "rgba(64,145,108,0.2)" : "rgba(255,255,255,0.07)"}`,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {approved}/{total} approved
            </span>
          )}

          {/* Save draft */}
          {onSaveDraft && (
            <button
              onClick={onSaveDraft}
              disabled={saving}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <Save size={12} />
              {saving ? "Saving…" : "Save Draft"}
            </button>
          )}

          {/* Final Editor */}
          {canOpenEditor ? (
            <a
              href={`/projects/${project.id}/editor`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: "linear-gradient(135deg, #c9a227, #e8c547)",
                color: "#0a1628",
                fontFamily: "'Inter', sans-serif",
                boxShadow: "0 2px 12px rgba(201,162,39,0.3)",
              }}
            >
              <ExternalLink size={12} />
              Final Editor
            </a>
          ) : (
            <div className="relative group">
              <button
                disabled
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold opacity-40 cursor-not-allowed"
                style={{
                  background: "rgba(201,162,39,0.2)",
                  color: "#c9a227",
                  border: "1px solid rgba(201,162,39,0.2)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <ExternalLink size={12} />
                Final Editor
              </button>
              <div
                className="absolute top-full right-0 mt-2 px-3 py-2 rounded-xl text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10"
                style={{
                  background: "#0d1628",
                  color: "rgba(255,255,255,0.55)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Approve at least one scene first
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div
        className="flex items-center gap-5 px-8 py-2.5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        {[
          { label: "Platform", value: fmt(project.platform) },
          { label: "Duration", value: `${project.duration_seconds}s` },
          { label: "Tone", value: fmt(project.tone) },
          { label: "Aspect", value: project.aspect_ratio },
          { label: "Goal", value: fmt(project.goal) },
        ].map((meta) => (
          <div key={meta.label} className="flex items-center gap-1.5">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'Inter', sans-serif" }}>
              {meta.label}
            </span>
            <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Inter', sans-serif" }}>
              {meta.value}
            </span>
          </div>
        ))}
      </div>
    </header>
  );
}
