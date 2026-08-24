import type { Trip, DestinationGroup } from "@/lib/types";

// Use reliable picsum seeded images + one verified Unsplash for Singapore
// Unsplash IDs must be exact — many previous IDs were truncated and 404'd
export const COVERS: Record<string, string> = {
  Singapore: "https://images.unsplash.com/photo-1525625293386-3f8f993a32c5?w=600&q=80&auto=format&fit=crop",
  Hanoi: "https://picsum.photos/seed/hanoi-vietnam/600/400",
  "Lan Ha Bay": "https://picsum.photos/seed/lan-ha-bay/600/400",
  "Ninh Binh": "https://picsum.photos/seed/ninh-binh/600/400",
  "Da Nang": "https://picsum.photos/seed/da-nang/600/400",
  "Ba Na Hills": "https://picsum.photos/seed/ba-na-hills/600/400",
  "Hoi An": "https://picsum.photos/seed/hoi-an/600/400",
  HoiAn: "https://picsum.photos/seed/hoi-an/600/400",
  HCMC: "https://picsum.photos/seed/ho-chi-minh/600/400",
  "Ho Chi Minh City": "https://picsum.photos/seed/ho-chi-minh/600/400",
  "Phu Quoc": "https://picsum.photos/seed/phu-quoc/600/400",
  Home: "https://picsum.photos/seed/home/600/400",
  Greece: "https://picsum.photos/seed/greece/600/400",
  Athens: "https://picsum.photos/seed/athens/600/400",
  Santorini: "https://picsum.photos/seed/santorini/600/400",
};

export const COORDS: Record<string, [number, number]> = {
  Singapore: [1.3521, 103.8198],
  Hanoi: [21.0285, 105.8542],
  "Lan Ha Bay": [20.792, 107.073],
  "Ninh Binh": [20.25, 105.97],
  "Da Nang": [16.0544, 108.2022],
  "Ba Na Hills": [15.999, 107.998],
  "Hoi An": [15.88, 108.33],
  HCMC: [10.8231, 106.6297],
  "Ho Chi Minh City": [10.8231, 106.6297],
  "Phu Quoc": [10.29, 103.984],
  Home: [12.9716, 77.5946],
  Greece: [37.98, 23.72],
  Athens: [37.9838, 23.7275],
  Santorini: [36.3932, 25.4615],
  Mykonos: [37.4467, 25.3289],
  Bangkok: [13.7563, 100.5018],
  Phuket: [7.8804, 98.3923],
  Bali: [-8.4095, 115.1889],
  Tokyo: [35.6762, 139.6503],
  Kyoto: [35.0116, 135.7681],
};

export function getCover(base: string): string {
  if (COVERS[base]) return COVERS[base];
  // picsum never 404s — deterministic per base
  return `https://picsum.photos/seed/${encodeURIComponent(base.toLowerCase().replace(/\s+/g, "-"))}/600/400`;
}

export function getCoords(base: string): [number, number] | null {
  return COORDS[base] || null;
}

export function groupByDestination(trip: Trip): DestinationGroup[] {
  const groups: DestinationGroup[] = [];
  let cur: DestinationGroup | null = null;
  for (const d of trip.days) {
    if (!cur || cur.base !== d.base) {
      if (cur) groups.push(cur);
      cur = { base: d.base, emoji: d.emoji, days: [], startDate: d.date, endDate: d.date, nights: 0, cover: getCover(d.base) };
    }
    cur.days.push(d);
    cur.startDate = cur.days[0].date;
    cur.endDate = d.date;
    cur.nights = cur.days.length;
  }
  if (cur) groups.push(cur);
  return groups;
}

export function tripStats(trip: Trip) {
  const groups = groupByDestination(trip);
  const bookings = trip.days.reduce((n, d) => n + d.flights.length + d.hotels.length + d.cabs.length, 0);
  const days = trip.days.length;
  const dests = groups.length;
  const budget = trip.budget ?? 400000;
  return { days, dests, bookings, budget, groups };
}

export function formatDayRange(start: string, end: string) {
  if (!start || !end) return "";
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const sd = s.toLocaleDateString("en-IN", opts);
  const ed = e.toLocaleDateString("en-IN", opts);
  if (start === end) return sd;
  if (s.getMonth() === e.getMonth()) return `${s.getDate()} – ${ed}`;
  return `${sd} – ${ed}`;
}
