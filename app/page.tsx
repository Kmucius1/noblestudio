export const dynamic = "force-dynamic";
import Image from "next/image";
import LoginForm from "@/components/auth/LoginForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen flex w-full overflow-hidden" style={{ background: "#080f1e" }}>

      {/* ── LEFT PANEL — hero image ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden min-w-0">
        <Image
          src="/noble-office.jpg"
          alt="Noble at EHM Strategies"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(105deg, rgba(8,15,30,0.88) 0%, rgba(8,15,30,0.5) 55%, rgba(8,15,30,0.15) 100%)"
        }} />

        <div className="relative z-10 flex flex-col justify-between p-10 h-full w-full">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-px h-6" style={{ background: "linear-gradient(to bottom, transparent, #c9a227, transparent)" }} />
              <span className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif" }}>
                EHM Strategies
              </span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mt-3" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#fff" }}>
              Noble<br />
              <span style={{
                background: "linear-gradient(135deg, #c9a227, #f5d76e, #c9a227)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>Studio</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Inter', sans-serif" }}>
              AI-powered video production suite for EHM&apos;s mortgage brand.
            </p>
          </div>

          <div className="space-y-3">
            <div className="h-px" style={{ background: "linear-gradient(90deg, rgba(201,162,39,0.5), transparent)" }} />
            {[
              "Noble character-locked across every generation",
              "Script → Storyboard → Voice → Export in one flow",
              "Higgsfield · Kling · Runway · ElevenLabs integrated",
            ].map((f) => (
              <div key={f} className="flex items-start gap-3">
                <span className="text-xs mt-0.5 shrink-0" style={{ color: "#c9a227" }}>✦</span>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Inter', sans-serif" }}>{f}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gold separator */}
      <div className="hidden lg:block w-px shrink-0" style={{
        background: "linear-gradient(to bottom, transparent 0%, rgba(201,162,39,0.3) 20%, rgba(201,162,39,0.5) 50%, rgba(201,162,39,0.3) 80%, transparent 100%)"
      }} />

      {/* ── RIGHT PANEL — login form ── */}
      <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 flex items-center justify-center p-6 lg:p-8" style={{ background: "#080f1e" }}>
        <div className="w-full max-w-sm">
          {/* EHM Noble badge logo */}
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden" style={{
              outline: "2px solid #c9a227",
              outlineOffset: "3px",
              boxShadow: "0 0 30px rgba(201,162,39,0.35), 0 0 60px rgba(201,162,39,0.12)"
            }}>
              <Image src="/noble-badge.jpg" alt="Noble — EHM Strategies" fill className="object-cover" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Noble Studio
            </h2>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.08em" }}>
              EHM STRATEGIES · INTERNAL
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'Inter', sans-serif" }}>
            © 2026 EHM Strategies. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
