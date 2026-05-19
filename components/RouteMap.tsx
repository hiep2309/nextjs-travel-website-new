/**
 * Bản đồ tương tác (Leaflet + react-leaflet) — tuyến đường và marker minh họa trên Hero.
 *
 * `ResizeMap`: ép Leaflet tính lại kích thước sau khi khối hero hiển thị (tránh map xám).
 */
"use client";

import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import * as L from "leaflet";
import { useEffect, useState } from "react";

// FIX resize
const ResizeMap = () => {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return null;
};

// FIX zoom theo route
const FitBounds = ({ coords }: { coords: [number, number][] }) => {
  const map = useMap();

  useEffect(() => {
    if (coords.length === 0) return;
    const b = L.latLngBounds(coords[0], coords[0]);
    coords.forEach((c) => b.extend(c));
    map.fitBounds(b, { padding: [30, 30] });
  }, [coords, map]);

  return null;
};

type Props = {
  /** Khi null (đang chờ GPS): chỉ hiển thị điểm đến từ bài viết. */
  userLocation: { lat: number; lon: number } | null;
  place: { lat: number; lon: number };
  transportMode?: string;
};

const RouteMap = ({ userLocation, place }: Props) => {
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<[number, number][]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!userLocation) {
      setCoords([]);
      return;
    }
    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${userLocation.lon},${userLocation.lat};${place.lon},${place.lat}?overview=full&geometries=geojson`
        );
        const data = await res.json();
        if (cancelled || !data.routes?.[0]) return;
        const route = data.routes[0].geometry.coordinates;
        const latlng: [number, number][] = route.map((c: number[]) => [c[1], c[0]] as [number, number]);
        setCoords(latlng);
      } catch {
        if (!cancelled) setCoords([]);
      }
    };
    fetchRoute();
    return () => {
      cancelled = true;
    };
  }, [userLocation, place]);

  if (!mounted) {
    return (
      <div className="flex h-full min-h-[220px] w-full items-center justify-center bg-black/25 px-4 text-center text-xs text-white/55">
        Đang tải bản đồ…
      </div>
    );
  }

  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lon]
    : [place.lat, place.lon];

  return (
    <MapContainer
      center={center}
      zoom={userLocation ? 6 : 11}
      style={{ height: "100%", minHeight: "220px", width: "100%" }}
      scrollWheelZoom
    >
      <ResizeMap />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM" />
      {userLocation ? <Marker position={[userLocation.lat, userLocation.lon]} /> : null}
      <Marker position={[place.lat, place.lon]} />
      {userLocation && coords.length > 0 ? (
        <>
          <Polyline
            positions={coords}
            pathOptions={{ color: "#3b82f6", weight: 5, opacity: 0.9 }}
          />
          <FitBounds coords={coords} />
        </>
      ) : null}
    </MapContainer>
  );
};

export default RouteMap;