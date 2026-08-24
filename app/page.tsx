"use client";
import { useEffect, useMemo, useState } from "react";
import { useTravel } from "@/lib/store";
import Sidebar from "@/components/Sidebar";
import { TripCard, StatCard } from "@/components/TripCards";
import { tripStats } from "@/lib/destinations";
import { SUGGESTED } from "@/data/discover";
import GoogleAuth from "@/components/GoogleAuth";

const FALLBACK = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80&auto=format&fit=crop";

export default function Home() {
  const { trips, createTrip, importTrips } = useTravel();
  const [mounted, setMounted] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");
  const [discoverQ, setDiscoverQ] = useState("");
  const [tag, setTag] = useState<string>("All");
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    // Clear ?auth=success param after successful login
    if (typeof window !== "undefined" && window.location.search.includes("auth=success")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      window.history.replaceState({}, "", url.toString());
    }
    fetch("https://travel-api.prashantkumarbharadwaj.workers.dev/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setAuthed(!!d?.authenticated))
      .catch(() => setAuthed(false));
  }, []);

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => { try {
      const parsed = JSON.parse(r.result as string);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      importTrips(arr as any);
    } catch {} }; r.readAsText(f);
  };

  const totalDays = trips.reduce((n, t) => n + t.days.length, 0);
  const totalBookings = trips.reduce((n, t) => n + tripStats(t).bookings, 0);
  const totalBudget = trips.reduce((n, t) => n + (t.budget ?? 400000), 0);

  const tags = useMemo(() => ["All", ...Array.from(new Set(SUGGESTED.map((s) => s.tag)))], []);
  const filtered = useMemo(() => SUGGESTED.filter((s) => {
    if (tag !== "All" && s.tag !== tag) return false;
    if (discoverQ && !`${s.country} ${s.city} ${s.tag}`.toLowerCase().includes(discoverQ.toLowerCase())) return false;
    return true;
  }), [tag, discoverQ]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof SUGGESTED>();
    for (const s of filtered) {
      if (!map.has(s.country)) map.set(s.country, []);
      map.get(s.country)!.push(s);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  if (!mounted) return <div className="flex min-h-screen items-center justify-center bg-[#f8f7f5]"><div className="text-sm text-stone-500">Loading…</div></div>;

  if (authed === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f7f5] p-6">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white">✦</div>
          <h1 className="mt-4 text-lg font-bold text-stone-800">Sign in to Travel</h1>
          <p className="mt-1 text-xs leading-relaxed text-stone-500">Only <b>prashantkumarbharadwaj@gmail.com</b> is whitelisted. Please sign in with Google to view your trips. Your data is private — R2 is only accessible via API.</p>
          <div className="mt-6 flex justify-center"><GoogleAuth /></div>
          <p className="mt-4 text-[11px] text-stone-400">After sign-in you&apos;ll be redirected back to your trips.</p>
        </div>
      </div>
    );
  }

  if (authed === null) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f8f7f5]"><div className="text-sm text-stone-500">Checking auth…</div></div>;
  }

  return (
    <div className="flex min-h-screen bg-[#f8f7f5]">
      <Sidebar />
      <div className="flex-1">
        <div className="sticky top-0 z-10 flex h-[64px] items-center justify-between border-b border-stone-200 bg-white px-6">
          <div>
            <h1 className="text-lg font-bold text-stone-800">Hello, Prashant! <span className="text-amber-500">👋</span></h1>
            <p className="text-xs text-stone-500">Let&apos;s make your dream trip unforgettable.</p>
          </div>
          <div className="flex items-center gap-2">
            <GoogleAuth />
            <button onClick={() => setShowNew(!showNew)} className="rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700">+ New trip</button>
            <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 hover:bg-stone-50">⌕<input type="file" accept=".json" onChange={onImport} className="hidden" /></label>
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

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon="📅" value={`${totalDays}`} label="Days" bg="bg-violet-50 text-violet-700" />
            <StatCard icon="◎" value={`${trips.length}`} label="Trips" bg="bg-emerald-50 text-emerald-700" />
            <StatCard icon="🎫" value={`${totalBookings}`} label="Bookings" bg="bg-orange-50 text-orange-700" />
            <StatCard icon="₹" value={`₹${totalBudget.toLocaleString("en-IN")}`} label="Est. Budget" bg="bg-violet-50 text-violet-700" />
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-800">Your trips</h2>
              <span className="text-xs text-stone-500">{trips.length} {trips.length === 1 ? "trip" : "trips"} — click to open detailed view</span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((t) => <TripCard key={t.id} trip={t} />)}
            </div>
          </div>

          <div id="discover" className="mt-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold text-stone-800">Discover — places you can visit</h2>
                <p className="text-xs text-stone-500">50+ destinations grouped by country — tap a city to create a trip. {filtered.length} places in {grouped.length} countries.</p>
              </div>
              <input value={discoverQ} onChange={(e) => setDiscoverQ(e.target.value)} placeholder="Search country, city…" className="w-full rounded-full border border-stone-200 bg-white px-4 py-2 text-xs focus:border-violet-500 focus:outline-none sm:w-64" />
            </div>
            <div className="mt-3 flex gap-2 overflow-auto pb-2">
              {tags.map((t) => (
                <button key={t} onClick={() => setTag(t)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${tag === t ? "bg-violet-600 text-white ring-violet-600" : "bg-white text-stone-600 ring-stone-200 hover:bg-stone-50"}`}>{t}</button>
              ))}
            </div>

            <div className="mt-4 space-y-8">
              {grouped.map(([countryName, places]) => (
                <div key={countryName}>
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="text-sm font-bold text-stone-800">{places[0].emoji} {countryName}</h3>
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">{places.length} {places.length === 1 ? "place" : "places"}</span>
                    <span className="h-px flex-1 bg-stone-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {places.map((s) => (
                      <button
                        key={s.country + s.city}
                        onClick={() => {
                          const name = `${s.city}, ${s.country}`;
                          if (confirm(`Create a new trip for ${name}?`)) createTrip({ title: `${s.city} Trip`, country: s.country });
                        }}
                        className="group overflow-hidden rounded-2xl border border-stone-200 bg-white text-left shadow-sm hover:shadow-md"
                      >
                        <div className="h-32 overflow-hidden bg-stone-100">
                          <img
                            src={s.cover}
                            alt={s.city}
                            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                            loading="lazy"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
                          />
                        </div>
                        <div className="p-3">
                          <div className="text-sm font-semibold text-stone-800">{s.city}</div>
                          <div className="text-xs text-stone-500">{s.tag} · {s.country}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && <p className="mt-6 text-center text-xs text-stone-400">No places match &ldquo;{discoverQ}&rdquo;.</p>}
            <p className="mt-4 text-xs text-stone-400">All images via picsum/unsplash with fallback — grouped by country as requested.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
