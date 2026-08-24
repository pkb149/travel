"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV = [
  { icon: "◧", label: "Dashboard", href: "/", done: true },
  { icon: "✈", label: "Itinerary", href: "/trip/vietnam-2026", done: true },
  { icon: "◎", label: "Destinations", href: "/#discover", done: true },
  { icon: "▭", label: "Bookings", href: "/trip/vietnam-2026", tab: "Bookings", done: false },
  { icon: "₹", label: "Budget", href: "/trip/vietnam-2026", tab: "Expenses", done: false },
  { icon: "🗺", label: "Map View", href: "/trip/vietnam-2026", tab: "Itinerary", anchor: "map", done: false },
  { icon: "≡", label: "Notes", href: "/trip/vietnam-2026", tab: "Notes", done: false },
  { icon: "📄", label: "Documents", href: "/trip/vietnam-2026", tab: "Photos", done: false },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

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
        <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-3 ring-1 ring-amber-100">
          <div className="text-xs font-semibold text-stone-800">Your Trip</div>
          <div className="text-[11px] text-stone-500">23 Days</div>
          <div className="mt-1 text-[11px] text-violet-600">27 Nov – 19 Dec 2025</div>
        </div>
        <div className="mt-3 flex items-center gap-2 px-2">
          <span className="h-6 w-6 rounded-full bg-stone-200" />
          <span className="text-xs font-medium text-stone-700">Prashant & Partner</span>
        </div>
      </div>
    </aside>
  );
}
