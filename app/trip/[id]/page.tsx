import TripDetailClient from "./TripDetail";
export async function generateStaticParams() {
  return [{ id: "vietnam-2026" }, { id: "trip_greece_20261201" }];
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TripDetailClient id={id} />;
}
