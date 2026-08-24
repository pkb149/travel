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
    <div className={`group relative rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-zinc-900 ${selected ? "border-zinc-900 ring-1 ring-zinc-900 dark:border-white dark:ring-white" : "border-zinc-200 dark:border-zinc-800"}`}>
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-lg dark:bg-zinc-800">{day.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex h-2 w-2 rounded-full ${baseColor(day.base)}`} />
              <span className="text-sm font-semibold">{day.base}</span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">Day {index + 1}</span>
            </div>
            <div className="text-xs text-zinc-500">{dateLabel(day.date)} · {day.date || "no date"}</div>
          </div>
        </div>
        <span className={`hidden text-xs sm:inline ${counts ? "text-zinc-600" : "text-zinc-400"}`}>{counts ? `${counts} detail${counts>1?"s":""}` : "no details"}</span>
      </div>

      {/* plan chips */}
      {chips.length ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {chips.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white dark:bg-zinc-700">{c}</span>
              {i < chips.length - 1 && <span className="text-zinc-400">→</span>}
            </span>
          ))}
        </div>
      ) : <p className="mt-3 text-xs italic text-zinc-400">No plan yet — click Edit to add steps.</p>}

      {/* badges */}
      {(day.flights.length || day.hotels.length || day.cabs.length || day.attachments.length) ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {day.flights.map((f) => <span key={f.id} className="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-medium text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950 dark:text-sky-300">✈ {f.from}→{f.to} {f.flightNo ? `· ${f.flightNo}` : ""}</span>)}
          {day.hotels.map((h) => <span key={h.id} className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-300">🏨 {h.name}</span>)}
          {day.cabs.map((c) => <span key={c.id} className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">🚕 {c.from}→{c.to}</span>)}
          {day.attachments.map((a) => <span key={a.id} className="rounded-full bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-700 ring-1 ring-violet-200 dark:bg-violet-950 dark:text-violet-300">📎 {a.name || a.kind}</span>)}
        </div>
      ) : null}

      {/* actions */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <button onClick={onSelect} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${selected ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"}`}>{selected ? "Editing…" : "Edit"}</button>
        <button onClick={onAddAfter} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:ring-zinc-700">+ Day after</button>
        <button onClick={onDuplicate} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:ring-zinc-700">Duplicate</button>
        <button onClick={onRemove} className="ml-auto rounded-full px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950">Delete</button>
      </div>
    </div>
  );
}
