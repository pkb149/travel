"use client";
import { create } from "zustand";
import type { Trip, DayNode } from "@/lib/types";
import { vietnamTrip } from "@/data/vietnam";

const KEY = "travel:trips:v2";

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
}

function loadTrips(): { trips: Trip[]; activeId: string | null } {
  if (typeof window === "undefined") return { trips: [vietnamTrip], activeId: vietnamTrip.id };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { trips: [vietnamTrip], activeId: vietnamTrip.id };
    const parsed = JSON.parse(raw) as { trips: Trip[]; activeId: string | null };
    if (!parsed.trips?.length) return { trips: [vietnamTrip], activeId: vietnamTrip.id };
    // migrate old single-trip key if present
    return parsed;
  } catch {
    return { trips: [vietnamTrip], activeId: vietnamTrip.id };
  }
}

function save(trips: Trip[], activeId: string | null) {
  localStorage.setItem(KEY, JSON.stringify({ trips, activeId }));
  // keep legacy key in sync for backward compat
  const active = trips.find((t) => t.id === activeId);
  if (active) localStorage.setItem("travel:trip:vietnam-2026", JSON.stringify(active));
}

type Store = {
  trips: Trip[];
  activeId: string | null;
  selectedDayId: string | null;
  setActive: (id: string) => void;
  setSelectedDay: (id: string | null) => void;
  createTrip: (opts: { title: string; country: string; startDate?: string; endDate?: string }) => string;
  duplicateTrip: (id: string) => void;
  deleteTrip: (id: string) => void;
  renameTrip: (id: string, patch: Partial<Pick<Trip, "title" | "country" | "startDate" | "endDate">>) => void;
  updateDay: (tripId: string, dayId: string, patch: Partial<DayNode>) => void;
  addDay: (tripId: string, afterId: string) => void;
  removeDay: (tripId: string, dayId: string) => void;
  duplicateDay: (tripId: string, dayId: string) => void;
  importTrips: (trips: Trip[]) => void;
  reset: () => void;
};

export const useTravel = create<Store>((set) => {
  const init = loadTrips();
  return {
    trips: init.trips,
    activeId: init.activeId,
    selectedDayId: null,
    setActive: (id) =>
      set((s) => {
        save(s.trips, id);
        return { activeId: id, selectedDayId: null };
      }),
    setSelectedDay: (id) => set({ selectedDayId: id }),
    createTrip: (opts) => {
      const id = uid("trip");
      const trip: Trip = {
        id,
        title: opts.title || "New Trip",
        country: opts.country || "—",
        startDate: opts.startDate || new Date().toISOString().slice(0, 10),
        endDate: opts.endDate || new Date().toISOString().slice(0, 10),
        days: [
          {
            id: uid("d"),
            date: opts.startDate || new Date().toISOString().slice(0, 10),
            base: opts.country || "New Place",
            emoji: "📍",
            plan: "",
            flights: [],
            hotels: [],
            cabs: [],
            attachments: [],
          },
        ],
      };
      let newId = id;
      set((s) => {
        const trips = [...s.trips, trip];
        save(trips, id);
        newId = id;
        return { trips, activeId: id, selectedDayId: trip.days[0].id };
      });
      return newId;
    },
    duplicateTrip: (id) =>
      set((s) => {
        const src = s.trips.find((t) => t.id === id);
        if (!src) return s;
        const nid = uid("trip");
        const copy: Trip = {
          ...src,
          id: nid,
          title: src.title + " (copy)",
          days: src.days.map((d) => ({
            ...d,
            id: uid("d"),
            flights: d.flights.map((f) => ({ ...f, id: uid("f") })),
            hotels: d.hotels.map((h) => ({ ...h, id: uid("h") })),
            cabs: d.cabs.map((c) => ({ ...c, id: uid("c") })),
            attachments: [...d.attachments],
          })),
        };
        const trips = [...s.trips, copy];
        save(trips, nid);
        return { trips, activeId: nid };
      }),
    deleteTrip: (id) =>
      set((s) => {
        const trips = s.trips.filter((t) => t.id !== id);
        const activeId = s.activeId === id ? (trips[0]?.id ?? null) : s.activeId;
        save(trips, activeId);
        return { trips, activeId, selectedDayId: null };
      }),
    renameTrip: (id, patch) =>
      set((s) => {
        const trips = s.trips.map((t) => (t.id === id ? { ...t, ...patch } : t));
        save(trips, s.activeId);
        return { trips };
      }),
    updateDay: (tripId, dayId, patch) =>
      set((s) => {
        const trips = s.trips.map((t) =>
          t.id === tripId ? { ...t, days: t.days.map((d) => (d.id === dayId ? { ...d, ...patch } : d)) } : t
        );
        save(trips, s.activeId);
        return { trips };
      }),
    addDay: (tripId, afterId) =>
      set((s) => {
        const nid = uid("d");
        const nd: DayNode = { id: nid, date: "", base: "New Place", emoji: "📍", plan: "", flights: [], hotels: [], cabs: [], attachments: [] };
        const trips = s.trips.map((t) => {
          if (t.id !== tripId) return t;
          const idx = t.days.findIndex((d) => d.id === afterId);
          const days = [...t.days];
          days.splice(idx + 1, 0, nd);
          return { ...t, days };
        });
        save(trips, s.activeId);
        return { trips, selectedDayId: nid };
      }),
    removeDay: (tripId, dayId) =>
      set((s) => {
        const trips = s.trips.map((t) => (t.id === tripId ? { ...t, days: t.days.filter((d) => d.id !== dayId) } : t));
        save(trips, s.activeId);
        return { trips, selectedDayId: null };
      }),
    duplicateDay: (tripId, dayId) =>
      set((s) => {
        const trips = s.trips.map((t) => {
          if (t.id !== tripId) return t;
          const idx = t.days.findIndex((d) => d.id === dayId);
          if (idx < 0) return t;
          const src = t.days[idx];
          const nid = uid("d");
          const copy = {
            ...src,
            id: nid,
            flights: src.flights.map((f) => ({ ...f, id: uid("f") })),
            hotels: src.hotels.map((h) => ({ ...h, id: uid("h") })),
            cabs: src.cabs.map((c) => ({ ...c, id: uid("c") })),
            attachments: [...src.attachments],
          };
          const days = [...t.days];
          days.splice(idx + 1, 0, copy);
          return { ...t, days };
        });
        save(trips, s.activeId);
        return { trips };
      }),
    importTrips: (trips) =>
      set(() => {
        const activeId = trips[0]?.id ?? null;
        save(trips, activeId);
        return { trips, activeId, selectedDayId: null };
      }),
    reset: () => {
      localStorage.removeItem(KEY);
      localStorage.removeItem("travel:trip:vietnam-2026");
      return { trips: [vietnamTrip], activeId: vietnamTrip.id, selectedDayId: null };
    },
  };
});
