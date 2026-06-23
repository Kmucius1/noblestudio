"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Mode = "login" | "signup";

export default function LoginForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); }
      else { router.push("/dashboard"); router.refresh(); }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); }
      else {
        setSuccess("Check your email to confirm your account, then sign in.");
        setMode("login");
        setLoading(false);
      }
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    fontSize: "0.875rem",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex rounded-xl p-1 mb-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {(["login", "signup"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(""); setSuccess(""); }}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              fontFamily: "'Inter', sans-serif",
              background: mode === m ? "linear-gradient(135deg, #a07820, #c9a227)" : "transparent",
              color: mode === m ? "#080f1e" : "rgba(255,255,255,0.4)",
              letterSpacing: "0.04em",
            }}
          >
            {m === "login" ? "Sign In" : "Create Account"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: "rgba(201,162,39,0.8)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@ehmstrategies.com"
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(201,162,39,0.6)";
              e.target.style.boxShadow = "0 0 0 3px rgba(201,162,39,0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.1)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: "rgba(201,162,39,0.8)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••••••"
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(201,162,39,0.6)";
              e.target.style.boxShadow = "0 0 0 3px rgba(201,162,39,0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.1)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontFamily: "'Inter', sans-serif" }}>
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(45,106,79,0.2)", border: "1px solid rgba(64,145,108,0.3)", color: "#6ee7b7", fontFamily: "'Inter', sans-serif" }}>
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #a07820 0%, #c9a227 50%, #e4b93a 100%)",
            color: "#080f1e",
            fontFamily: "'Inter', sans-serif",
            boxShadow: loading ? "none" : "0 4px 20px rgba(201,162,39,0.35)",
            letterSpacing: "0.12em",
          }}
        >
          {loading ? "Please wait..." : mode === "login" ? "Enter Studio" : "Create Account"}
        </button>
      </form>
    </div>
  );
}
