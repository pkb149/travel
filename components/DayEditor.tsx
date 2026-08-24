"use client";
import { useState } from "react";
import type { DayNode, Flight, Hotel, Cab, Attachment, PhotographyRule, Activity } from "@/lib/types";
import { useTravel } from "@/lib/store";
import { uid, planToChips } from "@/lib/utils";

function Section({ title, count, children, onAdd, addLabel }: { title: string; count?: number; children: React.ReactNode; onAdd?: () => void; addLabel?: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-stone-500">{title} {count !== undefined && <span className="ml-1 rounded bg-white px-1.5 py-0.5 text-[11px] ring-1 ring-stone-200">{count}</span>}</h4>
        {onAdd && <button onClick={onAdd} className="rounded-full bg-teal-600 px-3 py-1 text-xs font-medium text-white hover:bg-teal-700">+ {addLabel}</button>}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export default function DayEditor({ tripId, day }: { tripId: string; day: DayNode }) {
  const updateDay = useTravel((s) => s.updateDay);
  const [planDraft, setPlanDraft] = useState(day.plan);
  const chips = planToChips(day.plan);
  const savePlan = () => {
    updateDay(tripId, day.id, { plan: planDraft });
    // Auto-generate activities from plan if none exist, keep times editable separately
    if (!day.activities || day.activities.length === 0) {
      const acts: Activity[] = chips.map((title, i) => ({ time: `${String(10 + i).padStart(2, "0")}:00`, title }));
      updateDay(tripId, day.id, { activities: acts });
    }
  };
  const photo: PhotographyRule = day.photography || { allowed: "", tripod: "", drone: "", commercial: "", notes: "" };
  const setPhoto = (patch: Partial<PhotographyRule>) => updateDay(tripId, day.id, { photography: { ...photo, ...patch } });
  const activities: Activity[] = day.activities || [];
  const updateActivities = (next: Activity[]) => updateDay(tripId, day.id, { activities: next });
  const addActivity = () => updateActivities([...activities, { time: "10:00", title: "" }]);
  const updateActivity = (idx: number, patch: Partial<Activity>) => {
    const next = [...activities];
    next[idx] = { ...next[idx], ...patch };
    updateActivities(next);
  };
  const removeActivity = (idx: number) => updateActivities(activities.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs font-medium text-stone-600">Date
          <input type="date" value={day.date} onChange={(e) => updateDay(tripId, day.id, { date: e.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none" />
        </label>
        <label className="text-xs font-medium text-stone-600">Base
          <input value={day.base} onChange={(e) => updateDay(tripId, day.id, { base: e.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none" placeholder="Hanoi" />
        </label>
        <label className="text-xs font-medium text-stone-600">Emoji
          <input value={day.emoji} onChange={(e) => updateDay(tripId, day.id, { emoji: e.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none" />
        </label>
        <label className="text-xs font-medium text-stone-600">Notes
          <input value={day.notes ?? ""} onChange={(e) => updateDay(tripId, day.id, { notes: e.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none" placeholder="optional" />
        </label>
      </div>

      <Section title="⏰ Activities (time + title) — accurate time, arrow still separates but time is editable" count={activities.length} onAdd={addActivity} addLabel="Activity">
        <p className="text-xs text-stone-500">Each activity has its own time. Edit time directly; arrow in plan is just visual. Add/edit here for accurate schedule (e.g. 02:30 BLR, 04:30 Kolkata).</p>
        {activities.length === 0 && <p className="text-xs text-stone-500">No timed activities yet — click + Activity or Save plan to auto-generate from plan.</p>}
        {activities.map((a, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="time" value={a.time} onChange={(e) => updateActivity(i, { time: e.target.value })} className="w-28 rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
            <input value={a.title} onChange={(e) => updateActivity(i, { title: e.target.value })} placeholder="Activity" className="flex-1 rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
            <button onClick={() => removeActivity(i)} className="text-xs text-red-600">✕</button>
          </div>
        ))}
      </Section>

      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-stone-500">Plan — use → to separate steps (fallback if no activities)</label>
        <textarea value={planDraft} onChange={(e) => setPlanDraft(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none" placeholder="Temple → Market → Cafe" />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {chips.map((c, i) => <span key={i} className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800 ring-1 ring-teal-200">{c}</span>)}
        </div>
        <button onClick={savePlan} className="mt-2 rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-700">Save plan</button>
      </div>

      <Section title="📸 Photography">
        <div className="space-y-2">
          <label className="text-xs font-medium text-stone-600">Allowed
            <input value={photo.allowed || ""} onChange={(e) => setPhoto({ allowed: e.target.value })} placeholder="Personal allowed everywhere..." className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs focus:border-teal-500 focus:outline-none" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs font-medium text-stone-600">Tripod
              <input value={photo.tripod || ""} onChange={(e) => setPhoto({ tripod: e.target.value })} placeholder="Tripod allowed? ban?" className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
            </label>
            <label className="text-xs font-medium text-stone-600">Drone
              <input value={photo.drone || ""} onChange={(e) => setPhoto({ drone: e.target.value })} placeholder="Drone policy" className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
            </label>
          </div>
          <label className="text-xs font-medium text-stone-600">Commercial
            <input value={photo.commercial || ""} onChange={(e) => setPhoto({ commercial: e.target.value })} placeholder="Commercial needs permit?" className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
          </label>
          <label className="text-xs font-medium text-stone-600">Notes
            <input value={photo.notes || ""} onChange={(e) => setPhoto({ notes: e.target.value })} placeholder="Golden hour, light show times..." className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
          </label>
        </div>
      </Section>

      <Section title="Flights" count={day.flights.length} addLabel="Flight" onAdd={() => {
        const f: Flight = { id: uid("f"), from: "", to: "", airline: "", flightNo: "", time: "", pnr: "" };
        updateDay(tripId, day.id, { flights: [...day.flights, f] });
      }}>
        {day.flights.length === 0 && <p className="text-xs text-stone-500">No flights — add one.</p>}
        {day.flights.map((f) => (
          <FlightRow key={f.id} f={f} onChange={(patch) => updateDay(tripId, day.id, { flights: day.flights.map((x) => x.id === f.id ? { ...x, ...patch } : x) })} onRemove={() => updateDay(tripId, day.id, { flights: day.flights.filter((x) => x.id !== f.id) })} />
        ))}
      </Section>
      <Section title="Hotels" count={day.hotels.length} addLabel="Hotel" onAdd={() => {
        const h: Hotel = { id: uid("h"), name: "", area: "", checkIn: "", checkOut: "" };
        updateDay(tripId, day.id, { hotels: [...day.hotels, h] });
      }}>
        {day.hotels.length === 0 && <p className="text-xs text-stone-500">No hotel — add one.</p>}
        {day.hotels.map((h) => (
          <HotelRow key={h.id} h={h} onChange={(patch) => updateDay(tripId, day.id, { hotels: day.hotels.map((x) => x.id === h.id ? { ...x, ...patch } : x) })} onRemove={() => updateDay(tripId, day.id, { hotels: day.hotels.filter((x) => x.id !== h.id) })} />
        ))}
      </Section>
      <Section title="Cabs & Transfers" count={day.cabs.length} addLabel="Transfer" onAdd={() => {
        const c: Cab = { id: uid("c"), type: "cab", from: "", to: "", provider: "" };
        updateDay(tripId, day.id, { cabs: [...day.cabs, c] });
      }}>
        {day.cabs.length === 0 && <p className="text-xs text-stone-500">No transfers.</p>}
        {day.cabs.map((c) => (
          <CabRow key={c.id} c={c} onChange={(patch) => updateDay(tripId, day.id, { cabs: day.cabs.map((x) => x.id === c.id ? { ...x, ...patch } : x) })} onRemove={() => updateDay(tripId, day.id, { cabs: day.cabs.filter((x) => x.id !== c.id) })} />
        ))}
      </Section>
      <Section title="Attachments" count={day.attachments.length} addLabel="Attachment" onAdd={() => {
        const a: Attachment = { id: uid("a"), name: "", url: "", kind: "other" };
        updateDay(tripId, day.id, { attachments: [...day.attachments, a] });
      }}>
        {day.attachments.length === 0 && <p className="text-xs text-stone-500">Add boarding passes, vouchers, PDFs — stored privately in R2.</p>}
        {day.attachments.map((a) => (
          <AttachmentRow key={a.id} a={a} onChange={(patch) => updateDay(tripId, day.id, { attachments: day.attachments.map((x) => x.id === a.id ? { ...x, ...patch } : x) })} onRemove={() => updateDay(tripId, day.id, { attachments: day.attachments.filter((x) => x.id !== a.id) })} />
        ))}
        <label className="flex items-center gap-2 rounded-lg border border-dashed border-stone-300 bg-white px-3 py-2 text-xs">
          <span className="text-stone-500">Upload (private R2 via API only)</span>
          <input type="file" onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const a: Attachment = { id: uid("a"), name: file.name, kind: file.type.includes("image") ? "image" : file.type.includes("pdf") ? "pdf" : "other", url: "" };
            updateDay(tripId, day.id, { attachments: [...day.attachments, a] });
          }} className="text-xs" />
        </label>
      </Section>
    </div>
  );
}

function FlightRow({ f, onChange, onRemove }: { f: Flight; onChange: (p: Partial<Flight>) => void; onRemove: () => void }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-2.5">
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="From (HAN)" value={f.from} onChange={(e) => onChange({ from: e.target.value })} className="rounded border border-stone-200 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
        <input placeholder="To (DAD)" value={f.to} onChange={(e) => onChange({ to: e.target.value })} className="rounded border border-stone-200 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
        <input placeholder="Airline" value={f.airline ?? ""} onChange={(e) => onChange({ airline: e.target.value })} className="rounded border border-stone-200 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
        <input placeholder="Flight No" value={f.flightNo ?? ""} onChange={(e) => onChange({ flightNo: e.target.value })} className="rounded border border-stone-200 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
        <input placeholder="Time" value={f.time ?? ""} onChange={(e) => onChange({ time: e.target.value })} className="rounded border border-stone-200 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
        <input placeholder="PNR / Booking" value={f.pnr ?? ""} onChange={(e) => onChange({ pnr: e.target.value })} className="rounded border border-stone-200 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
        <input placeholder="Attachment link" value={f.attachment ?? ""} onChange={(e) => onChange({ attachment: e.target.value })} className="col-span-2 rounded border border-stone-200 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
      </div>
      <button onClick={onRemove} className="mt-2 text-xs text-red-600 hover:underline">Remove</button>
    </div>
  );
}
function HotelRow({ h, onChange, onRemove }: { h: Hotel; onChange: (p: Partial<Hotel>) => void; onRemove: () => void }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-2.5">
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="Hotel name" value={h.name} onChange={(e) => onChange({ name: e.target.value })} className="col-span-2 rounded border border-stone-200 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
        <input placeholder="Area" value={h.area ?? ""} onChange={(e) => onChange({ area: e.target.value })} className="rounded border border-stone-200 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
        <input placeholder="Booking ref" value={h.bookingRef ?? ""} onChange={(e) => onChange({ bookingRef: e.target.value })} className="rounded border border-stone-200 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
        <input type="date" value={h.checkIn ?? ""} onChange={(e) => onChange({ checkIn: e.target.value })} className="rounded border border-stone-200 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
        <input type="date" value={h.checkOut ?? ""} onChange={(e) => onChange({ checkOut: e.target.value })} className="rounded border border-stone-200 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
        <input placeholder="Cost" value={h.cost ?? ""} onChange={(e) => onChange({ cost: e.target.value })} className="rounded border border-stone-200 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
        <input placeholder="Attachment link" value={h.attachment ?? ""} onChange={(e) => onChange({ attachment: e.target.value })} className="rounded border border-stone-200 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
      </div>
      <button onClick={onRemove} className="mt-2 text-xs text-red-600 hover:underline">Remove</button>
    </div>
  );
}
function CabRow({ c, onChange, onRemove }: { c: Cab; onChange: (p: Partial<Cab>) => void; onRemove: () => void }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-2.5">
      <div className="grid grid-cols-2 gap-2">
        <select value={c.type} onChange={(e) => onChange({ type: e.target.value as Cab["type"] })} className="rounded border border-stone-200 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none">
          <option value="cab">Cab</option><option value="transfer">Transfer</option><option value="local">Local</option><option value="cruise">Cruise</option><option value="train">Train</option><option value="other">Other</option>
        </select>
        <input placeholder="Provider" value={c.provider ?? ""} onChange={(e) => onChange({ provider: e.target.value })} className="rounded border border-stone-200 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
        <input placeholder="From" value={c.from} onChange={(e) => onChange({ from: e.target.value })} className="rounded border border-stone-200 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
        <input placeholder="To" value={c.to} onChange={(e) => onChange({ to: e.target.value })} className="rounded border border-stone-200 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
        <input placeholder="Time" value={c.time ?? ""} onChange={(e) => onChange({ time: e.target.value })} className="rounded border border-stone-200 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
        <input placeholder="Cost" value={c.cost ?? ""} onChange={(e) => onChange({ cost: e.target.value })} className="rounded border border-stone-200 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
        <input placeholder="Notes / link" value={c.attachment ?? ""} onChange={(e) => onChange({ attachment: e.target.value })} className="col-span-2 rounded border border-stone-200 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none" />
      </div>
      <button onClick={onRemove} className="mt-2 text-xs text-red-600 hover:underline">Remove</button>
    </div>
  );
}
function AttachmentRow({ a, onChange, onRemove }: { a: Attachment; onChange: (p: Partial<Attachment>) => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-2.5 py-2">
      <select value={a.kind} onChange={(e) => onChange({ kind: e.target.value as Attachment["kind"] })} className="rounded border border-stone-200 px-2 py-1 text-xs focus:border-teal-500 focus:outline-none">
        <option value="pdf">PDF</option><option value="image">Image</option><option value="link">Link</option><option value="other">Other</option>
      </select>
      <input placeholder="Name" value={a.name} onChange={(e) => onChange({ name: e.target.value })} className="flex-1 rounded border border-stone-200 px-2 py-1 text-xs focus:border-teal-500 focus:outline-none" />
      <input placeholder="URL" value={a.url ?? ""} onChange={(e) => onChange({ url: e.target.value })} className="flex-1 rounded border border-stone-200 px-2 py-1 text-xs focus:border-teal-500 focus:outline-none" />
      <button onClick={onRemove} className="text-xs text-red-600">✕</button>
    </div>
  );
}
