"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { TripCard } from "@/components/TripCards";
import type { Trip } from "@/lib/types";

const API = "https://travel-api.prashantkumarbharadwaj.workers.dev";

export default function ItineraryPage() {
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("travel_token") : null;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    fetch(`${API}/api/trips`, { headers })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setTrips(data as Trip[]);
        else setErr("Unexpected response");
      })
      .catch((e) => setErr(e.message || "Failed to load"));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f8f7f5]">
      <Sidebar />
      <div className="flex-1">
        <div className="sticky top-0 z-10 flex h-[64px] items-center justify-between border-b border-stone-200 bg-white px-6">
          <div>
            <h1 className="text-lg font-bold text-stone-800">Itineraries</h1>
            <p className="text-xs text-stone-500">All trips — live from API</p>
          </div>
          <Link href="/" className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50">← Dashboard</Link>
        </div>
        <div className="p-6">
          {trips === null && !err && <div className="py-12 text-center text-sm text-stone-500">Loading itineraries…</div>}
          {err && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Failed to load: {err} — <button onClick={() => location.reload()} className="underline">retry</button></div>}
          {trips && trips.length === 0 && <div className="py-12 text-center text-sm text-stone-500">No itineraries yet. Create one from Dashboard.</div>}
          {trips && trips.length > 0 && (
            <>
              <div className="mb-3 text-xs text-stone-500">{trips.length} {trips.length === 1 ? "itinerary" : "itineraries"}</div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {trips.map((t) => <TripCard key={t.id} trip={t} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
