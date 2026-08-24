"use client";
import { useEffect, useState } from "react";
import type { DestinationGroup } from "@/lib/types";
import { getCoords } from "@/lib/destinations";

export default function TripMap({ groups, activeBase }: { groups: DestinationGroup[]; activeBase?: string | null }) {
  const [mounted, setMounted] = useState(false);
  const [MapLib, setMapLib] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    // Dynamically import leaflet + react-leaflet to avoid SSR
    Promise.all([import("leaflet"), import("react-leaflet")]).then(([L, RL]) => {
      // Fix default icon paths for Next.js static export
      // @ts-ignore
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setMapLib({ L, ...RL });
    });
    // Load leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }, []);

  if (!mounted || !MapLib) {
    return <div className="flex h-64 items-center justify-center rounded-xl bg-stone-100 text-xs text-stone-500">Loading map…</div>;
  }

  const { MapContainer, TileLayer, Marker, Popup, Polyline } = MapLib;
  const points: [number, number][] = groups.map((g) => getCoords(g.base) || [21.03, 105.85]).filter(Boolean) as [number, number][];
  const center: [number, number] = points.length ? points[Math.floor(points.length / 2)] : [16.05, 108.2];
  const bounds: [[number, number], [number, number]] | undefined = points.length > 1 ? [points[0], points[points.length - 1]] : undefined;

  // Build polyline with dash styles: flights (solid), road (dashed), ferry (dotted)
  // For now, use single polyline with purple dashed
  const line: [number, number][] = points;

  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-stone-200">
      <MapContainer center={center} zoom={6} style={{ height: "320px", width: "100%" }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {groups.map((g, i) => {
          const coord = getCoords(g.base);
          if (!coord) return null;
          const isActive = activeBase === g.base;
          return (
            <Marker key={g.base + i} position={coord}>
              <Popup>
                <div className="text-xs">
                  <div className="font-semibold">{g.emoji} {g.base}</div>
                  <div className="text-stone-500">{g.days.length} {g.days.length === 1 ? "day" : "days"} · {g.startDate} → {g.endDate}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        {line.length > 1 && (
          <Polyline positions={line} pathOptions={{ color: "#7c3aed", weight: 3, opacity: 0.7, dashArray: "8 8" }} />
        )}
      </MapContainer>
      <div className="flex items-center justify-between bg-white px-3 py-2 text-[11px] text-stone-500">
        <span>OpenStreetMap · {groups.length} destinations</span>
        <span className="flex gap-2">
          <span className="flex items-center gap-1"><span className="h-0.5 w-3 bg-violet-600" /> Flights</span>
          <span className="flex items-center gap-1"><span className="h-0.5 w-3 border-t border-dashed border-violet-600" /> Road</span>
        </span>
      </div>
    </div>
  );
}
