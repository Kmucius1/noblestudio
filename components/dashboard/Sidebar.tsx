"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "⚡" },
  { label: "Create Video", href: "/create", icon: "+" },
  { label: "My Projects", href: "/projects", icon: "🎬" },
  { label: "Saved Clips", href: "/clips", icon: "🎞" },
  { label: "Exports", href: "/exports", icon: "📤" },
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
    <aside className="w-64 flex flex-col shrink-0 border-r" style={{ background: "#08111f", borderColor: "#132040" }}>
      <div className="p-6 border-b" style={{ borderColor: "#132040" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "linear-gradient(135deg, #c9a227, #e8c547)" }}>
            🐂
          </div>
          <div>
            <p className="text-sm font-bold text-white">Noble Studio</p>
            <p className="text-xs" style={{ color: "#c9a227" }}>EHM Strategies</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                background: active ? "#132040" : "transparent",
                color: active ? "#c9a227" : "#8899aa",
                borderLeft: active ? "2px solid #c9a227" : "2px solid transparent",
              }}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: "#132040" }}>
        <div className="p-3 rounded-xl mb-3" style={{ background: "#132040" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "#c9a227" }}>Noble Character Lock</p>
          <p className="text-xs" style={{ color: "#8899aa" }}>Active — All generations reference the Noble bible</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-sm rounded-xl transition-colors"
          style={{ color: "#8899aa" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8899aa")}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
