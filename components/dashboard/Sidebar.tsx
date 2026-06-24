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
  { label: "Dashboard",    href: "/dashboard",  icon: LayoutDashboard },
  { label: "Create Video", href: "/create",      icon: Sparkles, badge: "NEW" },
  { label: "My Projects",  href: "/projects",    icon: FolderOpen },
  { label: "Saved Clips",  href: "/clips",       icon: Bookmark },
  { label: "Exports",      href: "/exports",     icon: Upload },
  { label: "AI Tools",     href: "/ai-tools",    icon: Bot },
  { label: "Templates",    href: "/templates",   icon: LayoutTemplate },
  { label: "Settings",     href: "/settings",    icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside
      className="w-64 flex flex-col shrink-0 min-h-screen"
      style={{ background: "#06111f", borderRight: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* ── Logo ── */}
      <div className="px-5 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-3">
          <div
            className="relative w-11 h-11 rounded-full overflow-hidden shrink-0"
            style={{ boxShadow: "0 0 16px rgba(201,162,39,0.45), 0 0 0 2px rgba(201,162,39,0.4)" }}
          >
            <Image src="/noble-badge.jpg" alt="Noble" fill className="object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-wider leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              NOBLE STUDIO
            </p>
            <p className="text-xs font-semibold tracking-widest mt-1" style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif" }}>
              EHM STRATEGIES
            </p>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: active ? "rgba(201,162,39,0.12)" : "transparent",
                color: active ? "#e4b93a" : "rgba(255,255,255,0.5)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <Icon
                size={18}
                style={{ color: active ? "#c9a227" : "rgba(255,255,255,0.35)", flexShrink: 0 }}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span
                  className="text-xs px-2 py-0.5 rounded-md font-bold"
                  style={{ background: "#1b5e36", color: "#6ee7b7", fontSize: "10px", letterSpacing: "0.05em" }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Character Lock ── */}
      <div
        className="mx-3 mb-3 rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(201,162,39,0.2)", background: "#0a1828" }}
      >
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <Lock size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}
          >
            Character Lock
          </span>
        </div>

        <div className="flex items-center gap-3 px-4 py-4">
          <div
            className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0"
            style={{ border: "1.5px solid rgba(201,162,39,0.35)" }}
          >
            <Image src="/noble-badge.jpg" alt="Noble the Bull" fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>
              Noble the Bull
            </p>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} style={{ color: "#40916c", flexShrink: 0 }} />
              <span className="text-xs font-medium" style={{ color: "#40916c", fontFamily: "'Inter', sans-serif" }}>
                Active character
              </span>
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-center gap-2 py-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <Shield size={12} style={{ color: "#c9a227" }} />
          <span className="text-xs font-semibold" style={{ color: "#c9a227", fontFamily: "'Inter', sans-serif" }}>
            Locked &amp; Verified
          </span>
        </div>
      </div>

      {/* ── Sign out ── */}
      <div className="px-3 pb-5 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors"
          style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
        >
          <LogOut size={17} style={{ color: "inherit", flexShrink: 0 }} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
