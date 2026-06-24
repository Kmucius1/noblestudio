"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Sparkles,
  FolderOpen,
  Bookmark,
  Upload,
  Bot,
  LayoutTemplate,
  Settings,
  LogOut,
  Lock,
  CheckCircle2,
  Shield,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Create Video", href: "/create", icon: Sparkles, badge: "NEW" },
  { label: "My Projects", href: "/projects", icon: FolderOpen },
  { label: "Saved Clips", href: "/clips", icon: Bookmark },
  { label: "Exports", href: "/exports", icon: Upload },
  { label: "AI Tools", href: "/ai-tools", icon: Bot },
  { label: "Templates", href: "/templates", icon: LayoutTemplate },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside
      className="w-56 flex flex-col shrink-0 min-h-screen"
      style={{
        background: "#06111f",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div className="px-4 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="relative w-10 h-10 rounded-full overflow-hidden shrink-0"
            style={{ boxShadow: "0 0 14px rgba(201,162,39,0.45), 0 0 0 1.5px rgba(201,162,39,0.5)" }}
          >
            <Image src="/noble-badge.jpg" alt="Noble" fill className="object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
              NOBLE STUDIO
            </p>
            <p className="text-xs mt-1 font-semibold tracking-widest" style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif" }}>
              EHM STRATEGIES
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: active ? "rgba(201,162,39,0.12)" : "transparent",
                color: active ? "#e4b93a" : "rgba(255,255,255,0.45)",
              }}
            >
              <Icon
                size={16}
                style={{ color: active ? "#c9a227" : "rgba(255,255,255,0.3)", flexShrink: 0 }}
              />
              <span style={{ fontFamily: "'Inter', sans-serif" }}>{item.label}</span>
              {item.badge && (
                <span
                  className="ml-auto text-xs px-1.5 py-0.5 rounded-md font-bold"
                  style={{ background: "#1b5e36", color: "#6ee7b7", fontSize: "10px" }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Character Lock panel */}
      <div
        className="mx-2 mb-2 rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(201,162,39,0.25)", background: "#0a1828" }}
      >
        <div
          className="px-3 py-2 flex items-center gap-1.5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <Lock size={11} style={{ color: "rgba(255,255,255,0.35)" }} />
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}
          >
            Character Lock
          </span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-3">
          <div
            className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0"
            style={{ border: "1px solid rgba(201,162,39,0.3)" }}
          >
            <Image src="/noble-badge.jpg" alt="Noble the Bull" fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              Noble the Bull
            </p>
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle2 size={11} style={{ color: "#40916c", flexShrink: 0 }} />
              <span className="text-xs" style={{ color: "#40916c", fontFamily: "'Inter', sans-serif" }}>
                Active character profile
              </span>
            </div>
          </div>
        </div>
        <div
          className="flex items-center justify-center gap-1.5 py-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <Shield size={11} style={{ color: "#c9a227" }} />
          <span className="text-xs font-semibold" style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif" }}>
            Locked &amp; Verified
          </span>
        </div>
      </div>

      {/* Sign out */}
      <div className="px-2 pb-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "10px" }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all"
          style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
        >
          <LogOut size={15} style={{ color: "inherit" }} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
