"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { icon: "◧", label: "Dashboard", href: "/", done: true },
  { icon: "✈", label: "Itinerary", href: "/trip/vietnam-2026", done: true },
  { icon: "◎", label: "Destinations", href: "/#discover", done: true },
  { icon: "▭", label: "Bookings", href: "/", done: false },
  { icon: "₹", label: "Budget", href: "/", done: false },
  { icon: "🗺", label: "Map View", href: "/", done: false },
  { icon: "≡", label: "Notes", href: "/", done: false },
  { icon: "📄", label: "Documents", href: "/", done: false },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [toast, setToast] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);

  useEffect(() => {
    fetch("https://travel-api.prashantkumarbharadwaj.workers.dev/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.authenticated) setUser({ email: d.email, name: d.name });
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "Prashant";

  return (
    <aside className="hidden w-[220px] shrink-0 flex-col border-r border-stone-200 bg-white lg:flex">
      <div className="flex h-[64px] items-center gap-2 border-b border-stone-100 px-5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white text-sm">✦</span>
        <span className="text-sm font-bold text-violet-700">WanderPlan</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((n) => {
          const active = (n.label === "Dashboard" && pathname === "/") || (n.label === "Itinerary" && pathname.startsWith("/trip"));
          if (n.done) {
            return (
              <Link key={n.label} href={n.href} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium ${active ? "bg-violet-50 text-violet-700" : "text-stone-500 hover:bg-stone-50"}`}>
                <span className="w-4 text-center text-[11px]">{n.icon}</span> {n.label}
              </Link>
            );
          }
          return (
            <button
              key={n.label}
              onClick={() => showToast(`${n.label} — coming soon`)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-stone-400 hover:bg-stone-50 hover:text-stone-500"
            >
              <span className="w-4 text-center text-[11px]">{n.icon}</span> {n.label} <span className="ml-auto text-[10px] text-stone-400">soon</span>
            </button>
          );
        })}
      </nav>
      {toast && <div className="mx-3 mb-2 rounded-lg bg-stone-800 px-3 py-2 text-xs text-white">{toast}</div>}
      <div className="border-t border-stone-100 p-3">
        <div className="flex items-center gap-2 px-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
            {displayName.charAt(0).toUpperCase()}
          </span>
          <span className="text-xs font-medium text-stone-700" title={user?.email || ""}>{displayName}</span>
        </div>
        {user?.email && <div className="mt-1 px-2 text-[11px] text-stone-400 truncate">{user.email}</div>}
      </div>
    </aside>
  );
}
