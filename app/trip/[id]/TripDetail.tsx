"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTravel } from "@/lib/store";
import { groupByDestination, formatDayRange, tripStats, getCover } from "@/lib/destinations";
import { planToChips, dateLabel } from "@/lib/utils";
import DayEditor from "@/components/DayEditor";
import Sidebar from "@/components/Sidebar";
import TripMap from "@/components/TripMap";

const TABS = ["Itinerary", "Stay", "Notes", "Bookings", "Expenses", "Photos"] as const;

export default function TripDetailClient({ id }: { id: string }) {
  const { trips, selectedDayId, setSelectedDay, addDay, removeDay, duplicateDay } = useTravel();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<typeof TABS[number]>("Itinerary");
  const [query, setQuery] = useState("");
  const [mapMode, setMapMode] = useState<"map" | "list">("map");

  useEffect(() => setMounted(true), []);
  const trip = useMemo(() => trips.find((t) => t.id === id) ?? trips[0] ?? null, [trips, id]);
  const groups = useMemo(() => (trip ? groupByDestination(trip) : []), [trip]);
  const [activeDest, setActiveDest] = useState<string | null>(null);
  const selected = useMemo(() => trip?.days.find((d) => d.id === selectedDayId) ?? null, [trip, selectedDayId]);
  const destDays = useMemo(() => {
    if (!trip || !activeDest) return trip?.days ?? [];
    return trip.days.filter((d) => d.base === activeDest);
  }, [trip, activeDest]);

  useEffect(() => {
    if (groups.length && !activeDest) setActiveDest(groups[0].base);
  }, [groups, activeDest]);

  if (!mounted) return <div className="flex min-h-screen"><Sidebar /><div className="flex-1 p-8 text-sm text-stone-500">Loading…</div></div>;
  if (!trip) return <div className="flex min-h-screen"><Sidebar /><div className="flex-1 p-8">Trip not found — <Link href="/" className="text-violet-600 underline">Back</Link></div></div>;

  const stats = tripStats(trip);
  const cover = getCover(activeDest || trip.country);

  return (
    <div className="flex min-h-screen bg-[#f8f7f5]">
      <Sidebar />
      <div className="flex-1">
        <div className="border-b border-stone-200 bg-white">
          <div className="flex items-center justify-between px-6 py-3">
            <Link href="/" className="text-xs font-medium text-violet-600 hover:underline">← Back to Itinerary</Link>
            <button className="rounded-full bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-violet-700">+ Add Activity</button>
          </div>
          <div className="px-6 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-stone-800">{activeDest || trip.title}, {trip.country}</h1>
                <p className="text-xs text-stone-500">{formatDayRange(trip.startDate, trip.endDate)} · {activeDest ? `${destDays.length} ${destDays.length === 1 ? "Night" : "Nights"}` : `${stats.days} Days`}</p>
              </div>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">₹{stats.budget.toLocaleString("en-IN")} est.</span>
            </div>
            <div className="relative mt-4 h-56 overflow-hidden rounded-2xl bg-stone-100">
              <img src={cover} alt={activeDest || trip.title} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80&auto=format&fit=crop"; }} />
              <button className="absolute bottom-3 right-3 rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700 shadow ring-1 ring-stone-200">Change Cover</button>
            </div>
            <div className="mt-4 flex gap-6 border-b border-stone-200 text-xs font-medium">
              {TABS.map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`border-b-2 pb-2 ${tab === t ? "border-violet-600 text-violet-700" : "border-transparent text-stone-500 hover:text-stone-700"}`}>{t}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {groups.map((g) => (
                <button key={g.base + g.startDate} onClick={() => setActiveDest(g.base)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${activeDest === g.base ? "bg-violet-600 text-white ring-violet-600" : "bg-white text-stone-600 ring-stone-200 hover:bg-stone-50"}`}>{g.emoji} {g.base} · {formatDayRange(g.startDate, g.endDate)}</button>
              ))}
            </div>
            {tab === "Itinerary" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search activities…" className="flex-1 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs focus:border-violet-500 focus:outline-none" />
                  <button onClick={() => addDay(trip.id, destDays[destDays.length - 1]?.id ?? trip.days[trip.days.length - 1]?.id ?? "")} className="rounded-full bg-white px-3 py-2 text-xs font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50">+ Add Activity</button>
                </div>
                {destDays.filter((d) => !query || d.plan.toLowerCase().includes(query.toLowerCase())).map((day) => {
                  const chips = planToChips(day.plan);
                  const idx = trip.days.indexOf(day);
                  return (
                    <div key={day.id} className={`rounded-2xl border bg-white p-4 ${selected?.id === day.id ? "border-violet-600 ring-1 ring-violet-600" : "border-stone-200"}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-stone-700">Day {idx + 1} – {dateLabel(day.date)} · {day.base} {day.emoji}</div>
                        <div className="flex gap-1">
                          <button onClick={() => setSelectedDay(day.id)} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-200">✎</button>
                          <button onClick={() => duplicateDay(trip.id, day.id)} className="rounded-full bg-stone-100 px-2 py-1 text-xs text-stone-600">⧉</button>
                          <button onClick={() => { if (confirm("Delete?")) removeDay(trip.id, day.id); }} className="rounded-full bg-red-50 px-2 py-1 text-xs text-red-600">🗑</button>
                        </div>
                      </div>
                      <div className="mt-2 space-y-2">
                        {chips.map((c, i) => (
                          <div key={i} className="flex items-center gap-3 rounded-xl bg-stone-50 px-3 py-2">
                            <span className="text-xs font-medium text-stone-500">{String(10 + i).padStart(2, "0")}:00</span>
                            <span className="flex-1 text-xs font-medium text-stone-800">{c}</span>
                            <span className="text-stone-400">⋮</span>
                          </div>
                        ))}
                        {chips.length === 0 && <p className="text-xs italic text-stone-400">No activities — edit to add.</p>}
                      </div>
                      {day.photography && (
                        <div className="mt-2 rounded-xl border border-amber-100 bg-amber-50/50 p-2.5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">📸 Photography</div>
                          <div className="mt-1 grid grid-cols-2 gap-1 text-xs leading-relaxed text-stone-600">
                            <div><b>Allowed:</b> {day.photography.allowed}</div>
                            <div><b>Tripod:</b> {day.photography.tripod}</div>
                            <div><b>Drone:</b> {day.photography.drone}</div>
                            <div><b>Commercial:</b> {day.photography.commercial}</div>
                          </div>
                          {day.photography.notes && <div className="mt-1 text-xs italic text-stone-500">{day.photography.notes}</div>}
                        </div>
                      )}
                      {(day.flights.length + day.hotels.length + day.cabs.length) > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {day.flights.map((f) => <span key={f.id} className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] text-sky-700 ring-1 ring-sky-100">✈ {f.from}→{f.to}</span>)}
                          {day.hotels.map((h) => <span key={h.id} className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-800 ring-1 ring-amber-100">🏨 {h.name}</span>)}
                          {day.cabs.map((c) => <span key={c.id} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700 ring-1 ring-emerald-100">🚕 {c.from}→{c.to}</span>)}
                        </div>
                      )}
                    </div>
                  );
                })}
                {selected && (
                  <div className="rounded-2xl border border-violet-200 bg-white p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-bold text-stone-800">Edit Day Plan — {selected.base} {selected.emoji}</div>
                      <button onClick={() => setSelectedDay(null)} className="rounded-full bg-stone-100 px-3 py-1 text-xs">Close</button>
                    </div>
                    <DayEditor tripId={trip.id} day={selected} />
                  </div>
                )}
              </div>
            )}
            {tab !== "Itinerary" && (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
                <div className="text-sm font-semibold text-stone-700">{tab}</div>
                <p className="mt-1 text-xs text-stone-500">Content for {tab} lives here — stays, notes, bookings, expenses, photos per destination. Wire to D1/R2.</p>
                {tab === "Stay" && <p className="mt-2 text-xs text-violet-600">Hotels for {activeDest}: {destDays.flatMap((d) => d.hotels).map((h) => h.name).join(", ") || "none yet — add in Edit"}</p>}
                {tab === "Bookings" && <p className="mt-2 text-xs text-stone-500">Flights • Hotels • Cabs for this destination.</p>}
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="text-sm font-semibold text-stone-800">About {activeDest}</div>
              <p className="mt-1 text-xs leading-relaxed text-stone-500">
                {activeDest === "Hoi An" ? "A charming ancient town with lanterns, riverside cafes, tailoring, and beautiful beaches." :
                 activeDest === "Singapore" ? "Glamour, gardens, Sentosa, shopping and Clarke Quay nightlife." :
                 activeDest === "Hanoi" ? "Old Quarter base for street food, Train Street, coffee culture and Temple of Literature." :
                 activeDest === "Phu Quoc" ? "Beach resort, island hopping, VinWonders, Grand World and Kiss Bridge fireworks." :
                 `Explore ${activeDest} — ${destDays[0]?.plan.slice(0, 80) ?? ""}`}
              </p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="text-sm font-semibold text-stone-800">Quick Info</div>
              <div className="mt-2 space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-stone-500">Weather</span><span className="font-medium text-stone-700">20°C – 25°C</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Currency</span><span className="font-medium">VND</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Language</span><span className="font-medium">Vietnamese</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Time Zone</span><span className="font-medium">GMT +7</span></div>
              </div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="text-sm font-semibold text-stone-800">Checklist</div>
              <label className="mt-2 flex gap-2 text-xs"><input type="checkbox" /> Tailor Appointments</label>
              <label className="flex gap-2 text-xs"><input type="checkbox" defaultChecked /> Lantern Boat Ride</label>
              <label className="flex gap-2 text-xs"><input type="checkbox" /> Spa Booking</label>
              <label className="flex gap-2 text-xs"><input type="checkbox" /> My Son Sanctuary</label>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-stone-800">Trip Map</div>
                  <p className="text-xs text-stone-500">OpenStreetMap · {groups.length} destinations</p>
                </div>
                <button onClick={() => setMapMode(mapMode === "map" ? "list" : "map")} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50">
                  {mapMode === "map" ? "View as List" : "View as Map"}
                </button>
              </div>
              <div className="mt-3">
                {mapMode === "map" ? (
                  <TripMap groups={groups} activeBase={activeDest} />
                ) : (
                  <div className="space-y-2">
                    {groups.map((g, i) => (
                      <div key={g.base + i} className={`flex items-center gap-3 rounded-xl border p-3 ${activeDest === g.base ? "border-violet-200 bg-violet-50" : "border-stone-200 bg-stone-50"}`}>
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">{i + 1}</span>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-stone-800">{g.emoji} {g.base}</div>
                          <div className="text-xs text-stone-500">{g.days.length} {g.days.length === 1 ? "night" : "nights"} · {g.startDate} → {g.endDate}</div>
                        </div>
                        <button onClick={() => setActiveDest(g.base)} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-200 hover:bg-violet-50">View</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="text-sm font-semibold text-stone-800">Budget Overview</div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl bg-violet-50 p-2"><div className="text-stone-500">Total</div><div className="font-bold">₹{tripStats(trip).budget.toLocaleString("en-IN")}</div></div>
                <div className="rounded-xl bg-orange-50 p-2"><div className="text-stone-500">Spent</div><div className="font-bold">₹{(tripStats(trip).budget * 0.35).toLocaleString("en-IN")}</div></div>
                <div className="rounded-xl bg-emerald-50 p-2"><div className="text-stone-500">Remaining</div><div className="font-bold text-emerald-700">₹{(tripStats(trip).budget * 0.65).toLocaleString("en-IN")}</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
