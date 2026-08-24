import TripDetailClient from "./TripDetail";
export async function generateStaticParams() {
  try {
    const res = await fetch("https://travel-api.prashantkumarbharadwaj.workers.dev/api/trips", { next: { revalidate: 60 } });
    if (res.ok) {
      const trips = await res.json() as { id: string }[];
      if (Array.isArray(trips) && trips.length > 0) {
        return trips.map((t) => ({ id: t.id }));
      }
    }
  } catch {}
  // Fallback to known seed trips if API unavailable at build time
  return [{ id: "vietnam-2026" }, { id: "trip_greece_20261201" }, { id: "trip_sapa_20261122" }];
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TripDetailClient id={id} />;
}
