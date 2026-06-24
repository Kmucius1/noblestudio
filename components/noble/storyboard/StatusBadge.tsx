const CONFIG: Record<string, { label: string; color: string; bg: string; pulse?: boolean }> = {
  pending:           { label: "Draft",             color: "#6b7a90", bg: "rgba(107,122,144,0.12)" },
  image_generating:  { label: "Generating Image",  color: "#c9a227", bg: "rgba(201,162,39,0.12)", pulse: true },
  image_failed:      { label: "Image Failed",      color: "#f87171", bg: "rgba(248,113,113,0.1)" },
  image_ready:       { label: "Image Ready",       color: "#40916c", bg: "rgba(64,145,108,0.12)" },
  video_generating:  { label: "Generating Video",  color: "#c9a227", bg: "rgba(201,162,39,0.12)", pulse: true },
  video_ready:       { label: "Video Ready",       color: "#2d9c77", bg: "rgba(45,156,119,0.12)" },
  voice_generating:  { label: "Recording Voice",   color: "#c9a227", bg: "rgba(201,162,39,0.12)", pulse: true },
  approved:          { label: "Approved",          color: "#e4b93a", bg: "rgba(228,185,58,0.12)" },
};

export function StatusBadge({ status }: { status: string }) {
  const c = CONFIG[status] ?? CONFIG.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ color: c.color, background: c.bg, fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" }}
    >
      {c.pulse && (
        <span className="w-1.5 h-1.5 rounded-full dot-pulse" style={{ background: c.color }} />
      )}
      {c.label}
    </span>
  );
}
