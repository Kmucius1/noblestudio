"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

const VIDEO_GOALS = [
  { value: "mortgage_education", label: "Mortgage Education" },
  { value: "funny_tiktok", label: "Funny TikTok" },
  { value: "luxury_ad", label: "Luxury Ad" },
  { value: "website_hero", label: "Website Hero" },
  { value: "loan_explainer", label: "Loan Explainer" },
  { value: "holiday_social", label: "Holiday / Social" },
  { value: "client_followup", label: "Client Follow-Up" },
  { value: "rsm_training", label: "RSM Training" },
];

const PLATFORMS = [
  { value: "tiktok_reels_shorts", label: "TikTok / Reels / Shorts", ratio: "9:16" },
  { value: "website_hero", label: "Website Hero", ratio: "16:9" },
  { value: "instagram_square", label: "Instagram Square", ratio: "1:1" },
  { value: "meta_ad", label: "Meta Ad", ratio: "4:5" },
];

const LENGTHS = [8, 15, 30, 60];

const TONES = [
  { value: "funny", label: "Funny" },
  { value: "luxury", label: "Luxury" },
  { value: "educational", label: "Educational" },
  { value: "bold", label: "Bold" },
  { value: "warm", label: "Warm" },
  { value: "cartoon_cinematic", label: "Cinematic" },
];

const LOCATIONS = [
  { value: "luxury_office", label: "Luxury Office" },
  { value: "mortgage_desk", label: "Mortgage Desk" },
  { value: "tampa_skyline", label: "Tampa Skyline" },
  { value: "kitchen_remodel", label: "High-End Home" },
  { value: "bank_vault", label: "Bank Vault" },
  { value: "white_studio", label: "White Studio" },
  { value: "closing_table", label: "Closing Table" },
  { value: "dream_home_driveway", label: "Dream Home" },
];

const CTAS = [
  { value: "apply_now", label: "Apply Now" },
  { value: "request_quote", label: "Request a Quote" },
  { value: "talk_to_noble", label: "Talk to Noble" },
  { value: "price_loan", label: "Price Your Loan" },
  { value: "visit_ehm", label: "Visit EHM Strategies" },
];

const card = { background: "#0d1628", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px" };
const label = { color: "#c9a227", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, fontFamily: "'Inter', sans-serif", marginBottom: 12, display: "block" };

function OptionBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all w-full"
      style={{
        background: active ? "rgba(201,162,39,0.12)" : "#111f3a",
        border: `1px solid ${active ? "#c9a227" : "rgba(255,255,255,0.06)"}`,
        color: active ? "#e4b93a" : "rgba(255,255,255,0.4)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {children}
    </button>
  );
}

export default function CreateVideoPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({
    goal: "mortgage_education",
    platform: "tiktok_reels_shorts",
    aspect_ratio: "9:16",
    duration_seconds: 15,
    tone: "warm",
    location: "luxury_office",
    cta: "apply_now",
    custom_prompt: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  function set(key: string, value: string | number) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "platform") {
        const p = PLATFORMS.find((p) => p.value === value);
        if (p) next.aspect_ratio = p.ratio;
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const projectRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, title: "New Noble Video", user_id: user.id }),
      });
      const project = await projectRes.json();
      if (!projectRes.ok) throw new Error(project.error);

      const scriptRes = await fetch("/api/noble/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: project.id, ...form }),
      });
      const scriptData = await scriptRes.json();
      if (!scriptRes.ok) throw new Error(scriptData.error);

      router.push(`/projects/${project.id}/storyboard`);
    } catch (err) {
      setError(String(err));
      setGenerating(false);
      setLoading(false);
    }
  }

  if (generating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: "#080f1e" }}>
        <div className="text-center">
          <div className="relative w-28 h-28 mx-auto mb-6 rounded-full overflow-hidden animate-pulse" style={{ boxShadow: "0 0 40px rgba(201,162,39,0.4)", outline: "2px solid rgba(201,162,39,0.5)" }}>
            <Image src="/noble-badge.jpg" alt="Noble" fill className="object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Noble is writing your script...
          </h2>
          <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif" }}>
            Creating your {form.duration_seconds}s {form.tone} video for {form.platform.replace(/_/g, " ")}
          </p>
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full" style={{ background: "#c9a227", animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite` }} />
            ))}
          </div>
          <p className="text-xs mt-6" style={{ color: "rgba(201,162,39,0.5)", fontFamily: "'Inter', sans-serif" }}>
            "No Bull. Just Strategy."
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#080f1e" }}>
      {/* Header */}
      <div className="px-8 pt-8 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif" }}>Noble Studio</p>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Create New Video</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>
          Fill out your brief — Noble writes the script and builds your storyboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-8 py-6 max-w-4xl space-y-5">

        {/* Goal */}
        <div style={card}>
          <span style={label}>Video Goal</span>
          <div className="grid grid-cols-4 gap-2">
            {VIDEO_GOALS.map((g) => (
              <OptionBtn key={g.value} active={form.goal === g.value} onClick={() => set("goal", g.value)}>
                {g.label}
              </OptionBtn>
            ))}
          </div>
        </div>

        {/* Platform + Length + Tone */}
        <div className="grid grid-cols-3 gap-5">
          <div style={card}>
            <span style={label}>Platform</span>
            <div className="space-y-2">
              {PLATFORMS.map((p) => (
                <OptionBtn key={p.value} active={form.platform === p.value} onClick={() => set("platform", p.value)}>
                  <span>{p.label}</span>
                  <span className="ml-1 opacity-50 text-xs">{p.ratio}</span>
                </OptionBtn>
              ))}
            </div>
          </div>

          <div style={card}>
            <span style={label}>Length</span>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {LENGTHS.map((l) => (
                <OptionBtn key={l} active={form.duration_seconds === l} onClick={() => set("duration_seconds", l)}>
                  {l}s
                </OptionBtn>
              ))}
            </div>
            <span style={label}>Tone</span>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map((t) => (
                <OptionBtn key={t.value} active={form.tone === t.value} onClick={() => set("tone", t.value)}>
                  {t.label}
                </OptionBtn>
              ))}
            </div>
          </div>

          <div style={card}>
            <span style={label}>Call to Action</span>
            <div className="space-y-2">
              {CTAS.map((c) => (
                <OptionBtn key={c.value} active={form.cta === c.value} onClick={() => set("cta", c.value)}>
                  {c.label}
                </OptionBtn>
              ))}
            </div>
          </div>
        </div>

        {/* Location */}
        <div style={card}>
          <span style={label}>Noble's Location</span>
          <div className="grid grid-cols-4 gap-2">
            {LOCATIONS.map((l) => (
              <OptionBtn key={l.value} active={form.location === l.value} onClick={() => set("location", l.value)}>
                {l.label}
              </OptionBtn>
            ))}
          </div>
        </div>

        {/* Custom Prompt */}
        <div style={card}>
          <span style={label}>Custom Direction (optional)</span>
          <textarea
            value={form.custom_prompt}
            onChange={(e) => set("custom_prompt", e.target.value)}
            rows={3}
            placeholder="e.g. Noble stands in a luxury Tampa condo explaining why now is the best time to refinance your investment property..."
            className="w-full px-4 py-3 rounded-xl text-sm text-white resize-none outline-none transition-all"
            style={{ background: "#111f3a", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "'Inter', sans-serif", color: "rgba(255,255,255,0.8)" }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(201,162,39,0.5)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.06)")}
          />
        </div>

        {error && (
          <div className="p-4 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontFamily: "'Inter', sans-serif" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase disabled:opacity-50 transition-all"
          style={{
            background: "linear-gradient(135deg, #a07820, #c9a227, #e4b93a)",
            color: "#080f1e",
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "0.1em",
            boxShadow: "0 4px 20px rgba(201,162,39,0.35)",
          }}
        >
          Generate Noble Script + Storyboard →
        </button>
      </form>
    </div>
  );
}
