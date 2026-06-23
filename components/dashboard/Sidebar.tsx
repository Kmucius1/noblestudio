"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "⚡" },
  { label: "Create Video", href: "/create", icon: "✦", highlight: true },
  { label: "My Projects", href: "/projects", icon: "◈" },
  { label: "Saved Clips", href: "/clips", icon: "▣" },
  { label: "Exports", href: "/exports", icon: "↑" },
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
    <aside className="w-60 flex flex-col shrink-0" style={{
      background: "#06111f",
      borderRight: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0" style={{
          boxShadow: "0 0 16px rgba(201,162,39,0.4), 0 0 0 1px rgba(201,162,39,0.5)",
        }}>
          <Image src="/noble-badge.jpg" alt="Noble" fill className="object-cover" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Noble Studio
          </p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(201,162,39,0.7)", letterSpacing: "0.06em", fontFamily: "'Inter', sans-serif" }}>
            EHM Strategies
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group"
              style={{
                background: active ? "rgba(201,162,39,0.1)" : "transparent",
                color: active ? "#e4b93a" : "rgba(255,255,255,0.4)",
                borderLeft: `2px solid ${active ? "#c9a227" : "transparent"}`,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <span className="w-4 text-center text-xs" style={{ color: active ? "#c9a227" : "rgba(255,255,255,0.25)" }}>
                {item.icon}
              </span>
              {item.label}
              {item.highlight && !active && (
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded-md font-semibold" style={{ background: "rgba(201,162,39,0.15)", color: "#c9a227" }}>
                  NEW
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Noble preview card */}
      <div className="mx-3 mb-3 rounded-xl overflow-hidden relative" style={{ border: "1px solid rgba(201,162,39,0.2)" }}>
        <div className="relative h-32">
          <Image src="/noble-thumbsup.png" alt="Noble" fill className="object-cover object-top" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,17,31,0.95) 0%, rgba(6,17,31,0.3) 60%, transparent 100%)" }} />
        </div>
        <div className="px-3 pb-3 -mt-4 relative z-10">
          <p className="text-xs font-bold text-white mb-0.5" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Character Lock</p>
          <p className="text-xs" style={{ color: "rgba(201,162,39,0.7)", fontFamily: "'Inter', sans-serif" }}>Active · Noble bible enforced</p>
        </div>
      </div>

      {/* Sign out */}
      <div className="px-3 pb-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-xs rounded-xl transition-colors"
          style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.04em" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >
          ← Sign Out
        </button>
      </div>
    </aside>
  );
}
