"use client";
import Link from "next/link";
import type { Trip } from "@/lib/types";
import { tripStats, formatDayRange, getCover } from "@/lib/destinations";

const FALLBACK = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80&auto=format&fit=crop";

function Img({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        const el = e.currentTarget as HTMLImageElement;
        if (el.src !== FALLBACK) el.src = FALLBACK;
      }}
    />
  );
}

export function TripCard({ trip }: { trip: Trip }) {
  const { days, dests, bookings, budget } = tripStats(trip);
  return (
    <Link href={`/trip/${trip.id}`} className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm hover:shadow-md">
      <div className="h-36 overflow-hidden bg-stone-100">
        <Img src={trip.cover || getCover(trip.country)} alt={trip.title} className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
      </div>
      <div className="p-3">
        <div className="text-sm font-semibold text-stone-800">{trip.title}</div>
        <div className="text-xs text-stone-500">{trip.country} · {days} days · {dests} destinations</div>
        <div className="mt-2 flex gap-1.5 text-[11px]">
          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-violet-700 ring-1 ring-violet-100">{days} Days</span>
          <span className="rounded-full bg-teal-50 px-2 py-0.5 text-teal-700 ring-1 ring-teal-100">{bookings} Bookings</span>
        </div>
        <div className="mt-1 text-[11px] text-stone-400">₹{budget.toLocaleString("en-IN")} est.</div>
      </div>
    </Link>
  );
}

export function DestinationCard({ base, emoji, cover, startDate, endDate, nights, onClick }: { base: string; emoji: string; cover: string; startDate: string; endDate: string; nights: number; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="group w-full overflow-hidden rounded-2xl border border-stone-200 bg-white text-left shadow-sm hover:shadow-md">
      <div className="h-32 overflow-hidden bg-stone-100">
        <Img src={cover} alt={base} className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-stone-800">{emoji} {base}</div>
        <div className="text-xs text-stone-500">{formatDayRange(startDate, endDate)} · {nights} {nights === 1 ? "Day" : "Days"}</div>
      </div>
    </button>
  );
}

export function StatCard({ icon, value, label, bg }: { icon: string; value: string; label: string; bg: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm ${bg}`}>{icon}</span>
      <div>
        <div className="text-sm font-bold text-stone-800">{value}</div>
        <div className="text-xs text-stone-500">{label}</div>
      </div>
    </div>
  );
}
