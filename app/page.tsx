"use client";
import { useEffect, useMemo, useState } from "react";
import { useTravel } from "@/lib/store";
import DayCard from "@/components/DayCard";
import DayEditor from "@/components/DayEditor";
import { dateLabel } from "@/lib/utils";
import type { Trip } from "@/lib/types";

export default function Home() {
  const { trips, activeId, selectedDayId, setActive, setSelectedDay, createTrip, duplicateTrip, deleteTrip, renameTrip, addDay, removeDay, duplicateDay, importTrips } = useTravel();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<string>("All");
  const [q, setQ] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [showNew, setShowNew] = useState(false);

  useEffect(() => setMounted(true), []);
  const active = useMemo(() => trips.find((t) => t.id === activeId) ?? trips[0] ?? null, [trips, activeId]);
  const selected = useMemo(() => active?.days.find((d) => d.id === selectedDayId) ?? null, [active, selectedDayId]);

  const bases = useMemo(() => (active ? ["All", ...Array.from(new Set(active.days.map((d) => d.base)))] : ["All"]), [active]);
  const filtered = (active?.days ?? []).filter((d) => {
    if (filter !== "All" && d.base !== filter) return false;
    if (q && !`${d.base} ${d.plan} ${d.date}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(trips, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `trips.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const exportActive = () => {
    if (!active) return;
    const blob = new Blob([JSON.stringify(active, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${active.id}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => { try {
      const parsed = JSON.parse(r.result as string);
      const arr: Trip[] = Array.isArray(parsed) ? parsed : [parsed as Trip];
      importTrips(arr);
    } catch {} }; r.readAsText(f);
  };

  if (!mounted) return <div className="p-8 text-sm text-stone-500">Loading trips…</div>;
  if (!active) return <div className="p-8 text-sm">No trips — create one.</div>;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      <div className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-stone-800"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">✈</span> Travel <span className="font-normal text-stone-500">— plan any trip</span></h1>
            <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-stone-500">Create trips from UI, via <code className="rounded bg-stone-100 px-1 py-0.5 text-stone-700">POST /api/trips</code>, or with the travel skill. Vietnam is seeded — add Japan, Bali, Greece anytime. Each day node holds flights ✈, hotels 🏨, cabs 🚕, attachments 📎.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowNew(!showNew)} className="rounded-full bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700">+ New trip</button>
            <button onClick={exportJson} className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50">Export all</button>
            <label className="cursor-pointer rounded-full bg-white px-4 py-2 text-xs font-semibold text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50">Import<input type="file" accept=".json" onChange={onImport} className="hidden" /></label>
          </div>
        </div>

        {showNew && (
          <div className="mt-4 flex flex-wrap items-end gap-2 rounded-xl bg-amber-50/70 p-3 ring-1 ring-amber-100">
            <label className="text-xs font-medium text-stone-700">Title<input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Bali 2027" className="ml-2 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none" /></label>
            <label className="text-xs font-medium text-stone-700">Country<input value={newCountry} onChange={(e) => setNewCountry(e.target.value)} placeholder="Indonesia" className="ml-2 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none" /></label>
            <button onClick={() => { if (!newTitle.trim()) return; createTrip({ title: newTitle.trim(), country: newCountry.trim() || newTitle.trim() }); setNewTitle(""); setNewCountry(""); setShowNew(false); }} className="rounded-full bg-teal-600 px-5 py-1.5 text-xs font-semibold text-white hover:bg-teal-700">Create</button>
            <button onClick={() => { createTrip({ title: "Vietnam Tour", country: "Vietnam" }); setShowNew(false); }} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-stone-600 ring-1 ring-stone-200 hover:bg-white">Seed Vietnam again</button>
          </div>
        )}

        <div className="mt-4 flex gap-2 overflow-auto pb-1">
          {trips.map((t) => (
            <button key={t.id} onClick={() => { setActive(t.id); setFilter("All"); }} className={`whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold ring-1 transition ${activeId === t.id ? "bg-teal-600 text-white ring-teal-600 shadow-sm" : "bg-white text-stone-600 ring-stone-200 hover:bg-stone-50"}`}>
              {t.title} <span className="opacity-60">· {t.country} · {t.days.length}d</span>
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2">
          <span className="text-xs font-semibold text-stone-800">{active.title}</span>
          <span className="text-xs text-stone-500">{active.country} · {dateLabel(active.startDate)} → {dateLabel(active.endDate)} · {active.days.length} nodes</span>
          <span className="ml-auto flex gap-1">
            <button onClick={() => { const t = prompt("Rename trip", active.title); if (t !== null) renameTrip(active.id, { title: t || active.title }); }} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50">Rename</button>
            <button onClick={() => duplicateTrip(active.id)} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50">Duplicate</button>
            <button onClick={exportActive} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50">Export</button>
            <button onClick={() => { if (confirm(`Delete ${active.title}?`)) deleteTrip(active.id); }} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-red-600 ring-1 ring-stone-200 hover:bg-red-50">Delete</button>
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-auto pb-1">
          {bases.map((b) => (
            <button key={b} onClick={() => setFilter(b)} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ${filter === b ? "bg-teal-600 text-white ring-teal-600" : "bg-white text-stone-600 ring-stone-200 hover:bg-stone-50"}`}>{b}</button>
          ))}
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search plan, base…" className="w-full rounded-full border border-stone-200 bg-white px-4 py-2 text-sm placeholder:text-stone-400 focus:border-teal-500 focus:outline-none sm:w-64" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative">
          <div className="absolute left-[18px] top-2 hidden h-[calc(100%-16px)] w-px bg-stone-200 lg:block" />
          <div className="space-y-4">
            {filtered.map((day) => {
              const idx = active.days.indexOf(day);
              return (
                <div key={day.id} className="relative flex gap-4">
                  <div className="hidden lg:flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-white text-xs font-bold text-stone-600 shadow-sm">{idx + 1}</div>
                  <div className="flex-1">
                    <DayCard day={day} index={idx} selected={selectedDayId === day.id} onSelect={() => setSelectedDay(selectedDayId === day.id ? null : day.id)} onAddAfter={() => addDay(active.id, day.id)} onDuplicate={() => duplicateDay(active.id, day.id)} onRemove={() => { if (confirm(`Delete day ${idx + 1} — ${day.base}?`)) removeDay(active.id, day.id); }} />
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => addDay(active.id, active.days[active.days.length - 1]?.id ?? "")} className="mt-4 w-full rounded-2xl border border-dashed border-stone-300 bg-white py-3 text-sm font-medium text-stone-600 hover:bg-stone-50">+ Add day at end</button>
        </div>

        <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-24px)] lg:overflow-auto">
          {selected ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-stone-800">Editing — Day {active.days.indexOf(selected) + 1} · {selected.base} {selected.emoji}</h2>
                <button onClick={() => setSelectedDay(null)} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 hover:bg-stone-200">Close</button>
              </div>
              <DayEditor tripId={active.id} day={selected} />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">🗺️</div>
              <h3 className="mt-3 text-sm font-semibold text-stone-800">Select a day to edit</h3>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-stone-500">Each node holds flights, hotel, cabs/local commute, and attachments. Add via UI, <code className="rounded bg-stone-100 px-1 py-0.5">POST /api/trips</code>, or the travel skill. Data persists locally; R2 is private — only API can access images.</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-left">
                <div className="rounded-xl bg-stone-50 p-3"><div className="text-xs font-semibold text-stone-700">✈ Flights</div><div className="text-[11px] text-stone-500">Airline, flightNo, PNR, time</div></div>
                <div className="rounded-xl bg-stone-50 p-3"><div className="text-xs font-semibold text-stone-700">🏨 Hotels</div><div className="text-[11px] text-stone-500">Check-in/out, booking ref</div></div>
                <div className="rounded-xl bg-stone-50 p-3"><div className="text-xs font-semibold text-stone-700">🚕 Cabs</div><div className="text-[11px] text-stone-500">Cab/transfer/local, cost</div></div>
                <div className="rounded-xl bg-stone-50 p-3"><div className="text-xs font-semibold text-stone-700">📎 Attachments</div><div className="text-[11px] text-stone-500">PDFs, images, links per day — R2 private</div></div>
              </div>
            </div>
          )}
          <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-stone-500">Trip overview</h4>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {active.days.map((d, i) => (
                <button key={d.id} onClick={() => setSelectedDay(d.id)} className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${selectedDayId === d.id ? "bg-teal-600 text-white ring-teal-600" : "bg-stone-50 text-stone-600 ring-stone-200 hover:bg-stone-100"}`}>{i + 1}. {d.emoji} {d.base}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-stone-400">Travel • <code>app/</code> on Pages → <code>https://travel-7l1.pages.dev</code> · <code>api/</code> on Workers → <code>travel-api.workers.dev</code> · R2 <code>travel-attachments</code> is <b>private</b> — only API (binding) can access, no public URL.</p>
    </div>
  );
}
