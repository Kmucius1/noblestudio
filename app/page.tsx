import Image from "next/image";
import LoginForm from "@/components/auth/LoginForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen flex" style={{ background: "#080f1e" }}>
      {/* ── LEFT PANEL — hero image ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <Image
          src="/noble-office.jpg"
          alt="Noble at EHM Strategies"
          fill
          className="object-cover object-center"
          priority
        />
        {/* dark gradient overlay so text reads clean */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(105deg, rgba(8,15,30,0.82) 0%, rgba(8,15,30,0.45) 55%, rgba(8,15,30,0.1) 100%)"
        }} />

        {/* Brand overlay content */}
        <div className="relative z-10 flex flex-col justify-between p-12 h-full">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-px h-8" style={{ background: "linear-gradient(to bottom, transparent, #c9a227, transparent)" }} />
              <span className="text-xs tracking-[0.25em] uppercase font-medium" style={{ color: "#c9a227" }}>
                EHM Strategies
              </span>
            </div>
            <h1 className="text-5xl font-bold leading-tight mt-3" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#fff" }}>
              Noble<br />
              <span style={{
                background: "linear-gradient(135deg, #c9a227, #f5d76e, #c9a227)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>Studio</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Inter', sans-serif" }}>
              AI-powered video production suite for EHM&apos;s mortgage brand.
            </p>
          </div>

          <div className="space-y-4">
            <div className="h-px" style={{ background: "linear-gradient(90deg, rgba(201,162,39,0.5), transparent)" }} />
            {[
              { icon: "✦", text: "Noble character-locked across every generation" },
              { icon: "✦", text: "Script → Storyboard → Voice → Export in one flow" },
              { icon: "✦", text: "Higgsfield · Kling · Runway · ElevenLabs integrated" },
            ].map((f) => (
              <div key={f.text} className="flex items-start gap-3">
                <span className="text-xs mt-0.5 shrink-0" style={{ color: "#c9a227" }}>{f.icon}</span>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Inter', sans-serif" }}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — login form ── */}
      <div className="w-full lg:w-[460px] shrink-0 flex items-center justify-center p-8 relative" style={{ background: "#080f1e" }}>
        {/* subtle vertical gold line separator */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-px" style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(201,162,39,0.3) 20%, rgba(201,162,39,0.5) 50%, rgba(201,162,39,0.3) 80%, transparent 100%)"
        }} />

        <div className="w-full max-w-sm">
          {/* EHM Noble badge logo */}
          <div className="flex justify-center mb-8">
            <div className="relative w-24 h-24 rounded-full overflow-hidden" style={{ outline: "2px solid #c9a227", outlineOffset: "3px", boxShadow: "0 0 30px rgba(201,162,39,0.35), 0 0 60px rgba(201,162,39,0.12)" }}>
              <Image src="/noble-badge.jpg" alt="Noble — EHM Strategies" fill className="object-cover" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Noble Studio
            </h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.08em" }}>
              EHM STRATEGIES · INTERNAL
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-xs mt-8" style={{ color: "rgba(255,255,255,0.2)" }}>
            © 2026 EHM Strategies. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
