"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import TripDetailClient from "./[id]/TripDetail";

function TripByQuery() {
  const sp = useSearchParams();
  const id = sp.get("id") || "";
  if (!id) return <div className="p-8 text-sm text-stone-500">No trip id — <a href="/itinerary" className="text-violet-600 underline">view all itineraries</a></div>;
  return <TripDetailClient id={id} />;
}

export default function TripQueryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-stone-500">Loading…</div>}>
      <TripByQuery />
    </Suspense>
  );
}
