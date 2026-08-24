"use client";
import type { DayNode } from "@/lib/types";
import { planToChips, dateLabel, baseColor } from "@/lib/utils";

export default function DayCard({ day, index, selected, onSelect, onAddAfter, onDuplicate, onRemove }: {
  day: DayNode; index: number; selected: boolean;
  onSelect: () => void; onAddAfter: () => void; onDuplicate: () => void; onRemove: () => void;
}) {
  const chips = planToChips(day.plan);
  const counts = day.flights.length + day.hotels.length + day.cabs.length + day.attachments.length;

  return (
    <div className={`group relative rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md ${selected ? "border-teal-600 ring-1 ring-teal-600" : "border-stone-200"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-lg ring-1 ring-amber-100">{day.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex h-2 w-2 rounded-full ${baseColor(day.base)}`} />
              <span className="text-sm font-semibold text-stone-800">{day.base}</span>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600">Day {index + 1}</span>
            </div>
            <div className="text-xs text-stone-500">{dateLabel(day.date)} · {day.date || "no date"}</div>
          </div>
        </div>
        <span className={`hidden text-xs sm:inline ${counts ? "text-stone-600" : "text-stone-400"}`}>{counts ? `${counts} detail${counts>1?"s":""}` : "no details"}</span>
      </div>

      {chips.length ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {chips.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800 ring-1 ring-teal-200">{c}</span>
              {i < chips.length - 1 && <span className="text-stone-300">→</span>}
            </span>
          ))}
        </div>
      ) : <p className="mt-3 text-xs italic text-stone-400">No plan yet — click Edit to add steps.</p>}

      {(day.flights.length || day.hotels.length || day.cabs.length || day.attachments.length) ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {day.flights.map((f) => <span key={f.id} className="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-medium text-sky-700 ring-1 ring-sky-200">✈ {f.from}→{f.to} {f.flightNo ? `· ${f.flightNo}` : ""}</span>)}
          {day.hotels.map((h) => <span key={h.id} className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200">🏨 {h.name}</span>)}
          {day.cabs.map((c) => <span key={c.id} className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">🚕 {c.from}→{c.to}</span>)}
          {day.attachments.map((a) => <span key={a.id} className="rounded-full bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-700 ring-1 ring-violet-200">📎 {a.name || a.kind}</span>)}
        </div>
      ) : null}

      {day.photography && (
        <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50 p-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">📸 Photography</div>
          <div className="mt-1 space-y-1 text-xs leading-relaxed text-stone-600">
            {day.photography.allowed && <div><b>Allowed:</b> {day.photography.allowed}</div>}
            {day.photography.tripod && <div><b>Tripod:</b> {day.photography.tripod}</div>}
            {day.photography.drone && <div><b>Drone:</b> {day.photography.drone}</div>}
            {day.photography.commercial && <div><b>Commercial:</b> {day.photography.commercial}</div>}
            {day.photography.notes && <div className="text-stone-500 italic">{day.photography.notes}</div>}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        <button onClick={onSelect} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm ${selected ? "bg-teal-600 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>{selected ? "Editing…" : "Edit"}</button>
        <button onClick={onAddAfter} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50">+ Day after</button>
        <button onClick={onDuplicate} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50">Duplicate</button>
        <button onClick={onRemove} className="ml-auto rounded-full px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
      </div>
    </div>
  );
}
