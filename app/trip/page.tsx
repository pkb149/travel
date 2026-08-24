"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import TripDetailClient from "./[id]/TripDetail";

function TripQueryInner() {
  const params = useSearchParams();
  const id = params.get("id") || "vietnam-2026";
  return <TripDetailClient id={id} />;
}

export default function TripPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-stone-500">Loading…</div>}>
      <TripQueryInner />
    </Suspense>
  );
}
