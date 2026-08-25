"use client";
import { create } from "zustand";
import type { Trip, DayNode } from "@/lib/types";
import { vietnamTrip } from "@/data/vietnam";

const KEY = "travel:trips:v3";
const API = "https://travel-api.prashantkumarbharadwaj.workers.dev";

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("travel_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function syncTripToApi(trip: Trip) {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json", ...getAuthHeaders() };
    const secret = typeof window !== "undefined" ? localStorage.getItem("travel_token") : null;
    // Also try X-API-Secret if available (for service-to-service, but user token is enough for write)
    await fetch(`${API}/api/trips`, {
      method: "POST",
      headers,
      body: JSON.stringify(trip),
    });
  } catch {}
}

async function deleteTripFromApi(id: string) {
  try {
    await fetch(`${API}/api/trips/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
  } catch {}
}

function loadTrips(): { trips: Trip[]; activeId: string | null } {
  if (typeof window === "undefined") return { trips: [vietnamTrip], activeId: vietnamTrip.id };
  try {
    let raw = localStorage.getItem(KEY);
    let parsed: { trips: Trip[]; activeId: string | null } | null = null;
    if (raw) {
      parsed = JSON.parse(raw) as { trips: Trip[]; activeId: string | null };
    } else {
      const oldRaw = localStorage.getItem("travel:trips:v2");
      if (oldRaw) {
        const old = JSON.parse(oldRaw) as { trips: Trip[]; activeId: string | null };
        if (old.trips?.length) {
          const freshMap = new Map(vietnamTrip.days.map((d) => [d.id, d.photography]));
          const migrated = old.trips.map((t) => {
            if (t.id === vietnamTrip.id) {
              return {
                ...t,
                days: t.days.map((d) => ({
                  ...d,
                  photography: d.photography || freshMap.get(d.id) || undefined,
                })),
              };
            }
            return t;
          });
          parsed = { trips: migrated, activeId: old.activeId };
          localStorage.setItem(KEY, JSON.stringify(parsed));
          return parsed;
        }
      }
    }
    if (!parsed || !parsed.trips?.length) return { trips: [vietnamTrip], activeId: vietnamTrip.id };
    const freshMap = new Map(vietnamTrip.days.map((d) => [d.id, d.photography]));
    const needsMigration = parsed.trips.some((t) => t.id === vietnamTrip.id && t.days.some((d) => !d.photography && freshMap.has(d.id)));
    if (needsMigration) {
      parsed.trips = parsed.trips.map((t) => {
        if (t.id !== vietnamTrip.id) return t;
        return { ...t, days: t.days.map((d) => ({ ...d, photography: d.photography || freshMap.get(d.id) })) };
      });
      localStorage.setItem(KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return { trips: [vietnamTrip], activeId: vietnamTrip.id };
  }
}

function save(trips: Trip[], activeId: string | null) {
  localStorage.setItem(KEY, JSON.stringify({ trips, activeId }));
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
  loadFromApi: () => Promise<void>;
  reset: () => void;
};

export const useTravel = create<Store>((set, get) => {
  const init = loadTrips();
  // Fire-and-forget API sync on init: if API has trips, merge; also ensure vietnam is in D1
  if (typeof window !== "undefined") {
    setTimeout(() => get().loadFromApi(), 500);
  }
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
        syncTripToApi(trip);
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
        syncTripToApi(copy);
        return { trips, activeId: nid };
      }),
    deleteTrip: (id) =>
      set((s) => {
        const trips = s.trips.filter((t) => t.id !== id);
        const activeId = s.activeId === id ? (trips[0]?.id ?? null) : s.activeId;
        save(trips, activeId);
        deleteTripFromApi(id);
        return { trips, activeId, selectedDayId: null };
      }),
    renameTrip: (id, patch) =>
      set((s) => {
        const trips = s.trips.map((t) => (t.id === id ? { ...t, ...patch } : t));
        save(trips, s.activeId);
        const updated = trips.find((t) => t.id === id);
        if (updated) syncTripToApi(updated);
        return { trips };
      }),
    updateDay: (tripId, dayId, patch) =>
      set((s) => {
        const trips = s.trips.map((t) =>
          t.id === tripId ? { ...t, days: t.days.map((d) => (d.id === dayId ? { ...d, ...patch } : d)) } : t
        );
        save(trips, s.activeId);
        const updated = trips.find((t) => t.id === tripId);
        if (updated) syncTripToApi(updated);
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
        const updated = trips.find((t) => t.id === tripId);
        if (updated) syncTripToApi(updated);
        return { trips, selectedDayId: nid };
      }),
    removeDay: (tripId, dayId) =>
      set((s) => {
        const trips = s.trips.map((t) => (t.id === tripId ? { ...t, days: t.days.filter((d) => d.id !== dayId) } : t));
        save(trips, s.activeId);
        const updated = trips.find((t) => t.id === tripId);
        if (updated) syncTripToApi(updated);
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
        const updated = trips.find((t) => t.id === tripId);
        if (updated) syncTripToApi(updated);
        return { trips };
      }),
    importTrips: (trips) =>
      set(() => {
        const activeId = trips[0]?.id ?? null;
        save(trips, activeId);
        trips.forEach((t) => syncTripToApi(t));
        return { trips, activeId, selectedDayId: null };
      }),
    loadFromApi: async () => {
      try {
        const headers: Record<string, string> = { ...getAuthHeaders() };
        const res = await fetch(`${API}/api/trips`, { headers });
        if (!res.ok) return;
        const apiTrips = await res.json() as Trip[];
        if (!Array.isArray(apiTrips) || apiTrips.length === 0) {
          // Seed D1 with local trips if empty
          const { trips } = get();
          for (const t of trips) await syncTripToApi(t);
          return;
        }
        // Merge: API is source of truth, but keep local trips not in API
        const { trips: localTrips, activeId } = get();
        const apiIds = new Set(apiTrips.map((t) => t.id));
        const merged = [...apiTrips];
        for (const lt of localTrips) {
          if (!apiIds.has(lt.id)) {
            merged.push(lt);
            await syncTripToApi(lt);
          }
        }
        // If API has vietnam with old data without photography, ensure we use fresh
        save(merged, activeId && apiIds.has(activeId) ? activeId : merged[0]?.id ?? null);
        set({ trips: merged, activeId: activeId && apiIds.has(activeId) ? activeId : merged[0]?.id ?? null });
      } catch {}
    },
    reset: () => {
      localStorage.removeItem(KEY);
      localStorage.removeItem("travel:trips:v2");
      localStorage.removeItem("travel:trip:vietnam-2026");
      return { trips: [vietnamTrip], activeId: vietnamTrip.id, selectedDayId: null };
    },
  };
});
