"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "#c9a227" }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none border transition-colors"
          style={{ background: "#132040", borderColor: "#1a2d52" }}
          onFocus={(e) => (e.target.style.borderColor = "#c9a227")}
          onBlur={(e) => (e.target.style.borderColor = "#1a2d52")}
          placeholder="you@ehmstrategies.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "#c9a227" }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none border transition-colors"
          style={{ background: "#132040", borderColor: "#1a2d52" }}
          onFocus={(e) => (e.target.style.borderColor = "#c9a227")}
          onBlur={(e) => (e.target.style.borderColor = "#1a2d52")}
          placeholder="••••••••"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #c9a227, #e8c547)", color: "#0a1628" }}
      >
        {loading ? "Signing in..." : "Sign In to Noble Studio"}
      </button>
    </form>
  );
}
