"use client";
import { useEffect, useMemo, useState } from "react";
import { useTravel } from "@/lib/store";
import Sidebar from "@/components/Sidebar";
import { TripCard, DestinationCard, StatCard } from "@/components/TripCards";
import { tripStats } from "@/lib/destinations";
import Link from "next/link";

export default function Home() {
  const { trips, createTrip, importTrips } = useTravel();
  const [mounted, setMounted] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => setMounted(true), []);
  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => { try {
      const parsed = JSON.parse(r.result as string);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      importTrips(arr as any);
    } catch {} }; r.readAsText(f);
  };

  if (!mounted) return <div className="flex min-h-screen"><Sidebar /><div className="flex-1 p-8 text-sm text-stone-500">Loading…</div></div>;

  const featured = trips[0] ? tripStats(trips[0]) : null;

  return (
    <div className="flex min-h-screen bg-[#f8f7f5]">
      <Sidebar />
      <div className="flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-[64px] items-center justify-between border-b border-stone-200 bg-white px-6">
          <div>
            <h1 className="text-lg font-bold text-stone-800">Hello, Prashant! <span className="text-amber-500">👋</span></h1>
            <p className="text-xs text-stone-500">Let&apos;s make your dream trip unforgettable.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowNew(!showNew)} className="rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700">+ Add Destination</button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500">⌕</button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500">🔔</button>
          </div>
        </div>

        <div className="p-6">
          {showNew && (
            <div className="mb-6 flex flex-wrap items-end gap-2 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
              <label className="text-xs font-medium text-stone-700">Title<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bali 2027" className="ml-2 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm focus:border-violet-500 focus:outline-none" /></label>
              <label className="text-xs font-medium text-stone-700">Country<input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Indonesia" className="ml-2 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm focus:border-violet-500 focus:outline-none" /></label>
              <button onClick={() => { if (!title.trim()) return; createTrip({ title: title.trim(), country: country.trim() || title.trim() }); setTitle(""); setCountry(""); setShowNew(false); }} className="rounded-full bg-violet-600 px-5 py-1.5 text-xs font-semibold text-white hover:bg-violet-700">Create</button>
              <label className="ml-auto cursor-pointer rounded-full bg-white px-4 py-1.5 text-xs font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50">Import JSON<input type="file" accept=".json" onChange={onImport} className="hidden" /></label>
            </div>
          )}

          {/* Stats */}
          {featured && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard icon="📅" value={`${featured.days}`} label="Days" bg="bg-violet-50 text-violet-700" />
              <StatCard icon="◎" value={`${featured.dests}`} label="Destinations" bg="bg-emerald-50 text-emerald-700" />
              <StatCard icon="🎫" value={`${featured.bookings}`} label="Bookings" bg="bg-orange-50 text-orange-700" />
              <StatCard icon="₹" value={`₹${featured.budget.toLocaleString("en-IN")}`} label="Est. Budget" bg="bg-violet-50 text-violet-700" />
            </div>
          )}

          {/* Your Trips */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-800">Your trips</h2>
              <span className="text-xs text-stone-500">{trips.length} {trips.length === 1 ? "trip" : "trips"}</span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((t) => <TripCard key={t.id} trip={t} />)}
            </div>
          </div>

          {/* Itinerary Overview — destinations of featured trip */}
          {featured && (
            <div className="mt-8">
              <h2 className="text-sm font-bold text-stone-800">Your Itinerary Overview</h2>
              <p className="text-xs text-stone-500">Click a destination to view day-wise plan, stays, bookings & more.</p>
              <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {featured.groups.map((g) => (
                  <DestinationCard key={g.base + g.startDate} base={g.base} emoji={g.emoji} cover={g.cover} startDate={g.startDate} endDate={g.endDate} nights={g.nights} onClick={() => window.location.assign(`/trip/${trips[0].id}`)} />
                ))}
              </div>
              <div className="mt-4">
                <Link href={`/trip/${trips[0].id}`} className="inline-flex rounded-full bg-violet-600 px-5 py-2 text-xs font-semibold text-white hover:bg-violet-700">Open itinerary →</Link>
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <Link href={`/trip/${trips[0]?.id ?? ""}`} className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50">View detailed mock (image) →</Link>
            <span className="text-xs text-stone-400 self-center">Homepage now shows trip list only; detail on click as requested.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
