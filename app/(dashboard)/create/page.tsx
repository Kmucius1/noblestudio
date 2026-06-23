"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const VIDEO_GOALS = [
  { value: "mortgage_education", label: "Mortgage Education" },
  { value: "funny_tiktok", label: "Funny TikTok" },
  { value: "luxury_ad", label: "Luxury Ad" },
  { value: "website_hero", label: "Website Hero Video" },
  { value: "loan_explainer", label: "Loan Product Explainer" },
  { value: "holiday_social", label: "Holiday / Social Post" },
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
  { value: "cartoon_cinematic", label: "Cartoon Cinematic" },
];

const LOCATIONS = [
  { value: "luxury_office", label: "Luxury Office" },
  { value: "mortgage_desk", label: "Mortgage Desk" },
  { value: "tampa_skyline", label: "Tampa Skyline" },
  { value: "kitchen_remodel", label: "High-End Kitchen Remodel Home" },
  { value: "bank_vault", label: "Bank Vault" },
  { value: "white_studio", label: "White Studio" },
  { value: "closing_table", label: "Real Estate Closing Table" },
  { value: "dream_home_driveway", label: "Dream Home Driveway" },
];

const CTAS = [
  { value: "apply_now", label: "Apply Now" },
  { value: "request_quote", label: "Request a Quote" },
  { value: "talk_to_noble", label: "Talk to Noble" },
  { value: "price_loan", label: "Price Your Loan" },
  { value: "visit_ehm", label: "Visit EHM Strategies" },
];

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
  const [step, setStep] = useState<"form" | "generating">("form");

  function updateForm(key: string, value: string | number) {
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
    setStep("generating");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Create project
      const projectRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, title: "New Noble Video", user_id: user.id }),
      });
      const project = await projectRes.json();
      if (!projectRes.ok) throw new Error(project.error);

      // 2. Generate script + scenes
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
      setStep("form");
      setLoading(false);
    }
  }

  if (step === "generating") {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-6 animate-pulse">🐂</div>
          <h2 className="text-2xl font-bold text-white mb-2">Noble is writing your script...</h2>
          <p style={{ color: "#8899aa" }}>Creating your {form.duration_seconds}s {form.tone} video</p>
          <div className="mt-8 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#c9a227", animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Create New Noble Video</h1>
        <p style={{ color: "#8899aa" }}>Fill out your video brief. Noble writes the script and builds your storyboard.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Goal */}
        <div className="rounded-2xl p-6" style={{ background: "#0e1c33" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "#c9a227" }}>VIDEO GOAL</h3>
          <div className="grid grid-cols-2 gap-2">
            {VIDEO_GOALS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => updateForm("goal", g.value)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-left transition-all"
                style={{
                  background: form.goal === g.value ? "rgba(201,162,39,0.15)" : "#132040",
                  border: `1px solid ${form.goal === g.value ? "#c9a227" : "#1a2d52"}`,
                  color: form.goal === g.value ? "#c9a227" : "#8899aa",
                }}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Platform + Length */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl p-6" style={{ background: "#0e1c33" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "#c9a227" }}>PLATFORM</h3>
            <div className="space-y-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => updateForm("platform", p.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
                  style={{
                    background: form.platform === p.value ? "rgba(201,162,39,0.15)" : "#132040",
                    border: `1px solid ${form.platform === p.value ? "#c9a227" : "#1a2d52"}`,
                    color: form.platform === p.value ? "#c9a227" : "#8899aa",
                  }}
                >
                  <span>{p.label}</span>
                  <span className="ml-2 text-xs opacity-60">{p.ratio}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-6" style={{ background: "#0e1c33" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "#c9a227" }}>LENGTH</h3>
            <div className="grid grid-cols-2 gap-2">
              {LENGTHS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => updateForm("duration_seconds", l)}
                  className="py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: form.duration_seconds === l ? "rgba(201,162,39,0.15)" : "#132040",
                    border: `1px solid ${form.duration_seconds === l ? "#c9a227" : "#1a2d52"}`,
                    color: form.duration_seconds === l ? "#c9a227" : "#8899aa",
                  }}
                >
                  {l}s
                </button>
              ))}
            </div>

            <h3 className="text-sm font-semibold mb-4 mt-6" style={{ color: "#c9a227" }}>TONE</h3>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => updateForm("tone", t.value)}
                  className="py-2.5 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: form.tone === t.value ? "rgba(201,162,39,0.15)" : "#132040",
                    border: `1px solid ${form.tone === t.value ? "#c9a227" : "#1a2d52"}`,
                    color: form.tone === t.value ? "#c9a227" : "#8899aa",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location + CTA */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl p-6" style={{ background: "#0e1c33" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "#c9a227" }}>NOBLE LOCATION</h3>
            <div className="space-y-2">
              {LOCATIONS.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => updateForm("location", l.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
                  style={{
                    background: form.location === l.value ? "rgba(201,162,39,0.15)" : "#132040",
                    border: `1px solid ${form.location === l.value ? "#c9a227" : "#1a2d52"}`,
                    color: form.location === l.value ? "#c9a227" : "#8899aa",
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-6" style={{ background: "#0e1c33" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "#c9a227" }}>CALL TO ACTION</h3>
            <div className="space-y-2">
              {CTAS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => updateForm("cta", c.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all"
                  style={{
                    background: form.cta === c.value ? "rgba(201,162,39,0.15)" : "#132040",
                    border: `1px solid ${form.cta === c.value ? "#c9a227" : "#1a2d52"}`,
                    color: form.cta === c.value ? "#c9a227" : "#8899aa",
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Prompt */}
        <div className="rounded-2xl p-6" style={{ background: "#0e1c33" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "#c9a227" }}>CUSTOM PROMPT (OPTIONAL)</h3>
          <textarea
            value={form.custom_prompt}
            onChange={(e) => updateForm("custom_prompt", e.target.value)}
            rows={3}
            placeholder="e.g. Noble is standing in a luxury Tampa condo explaining why now is the best time to refinance..."
            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none border resize-none transition-colors"
            style={{ background: "#132040", borderColor: "#1a2d52" }}
            onFocus={(e) => (e.target.style.borderColor = "#c9a227")}
            onBlur={(e) => (e.target.style.borderColor = "#1a2d52")}
          />
        </div>

        {error && (
          <div className="p-4 rounded-xl text-sm text-red-400" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-base transition-opacity disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #c9a227, #e8c547)", color: "#0a1628" }}
        >
          Generate Script + Storyboard →
        </button>
      </form>
    </div>
  );
}
