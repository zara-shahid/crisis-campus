import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapLocation } from "../services/locations";

// Re-export type so existing callers keep working
export type { MapLocation };

// ── Colour palette per type & status ─────────────────────────────────────────
function markerColor(loc: MapLocation) {
  if (loc.status === "CLOSED") return "#6b7280"; // gray
  if (loc.status === "FULL") return "#ef4444";   // red
  if (loc.type === "hospital") return "#3b82f6"; // blue
  if (loc.type === "medpoint") return "#f59e0b"; // amber
  return "#10b981";                              // emerald (shelter/evac)
}

function markerIcon(type: MapLocation["type"]) {
  const icons: Record<MapLocation["type"], string> = {
    shelter: "🏠",
    evac: "🚨",
    hospital: "🏥",
    medpoint: "⚕️",
  };
  return icons[type];
}

function typeLabel(type: MapLocation["type"]) {
  const labels: Record<MapLocation["type"], string> = {
    shelter: "General Shelter",
    evac: "Evacuation Center",
    hospital: "Hospital",
    medpoint: "Medical Point",
  };
  return labels[type];
}

// ── Build a custom div-icon ──────────────────────────────────────────────────
function buildIcon(loc: MapLocation) {
  const color = markerColor(loc);
  const emoji = markerIcon(loc.type);
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <defs>
        <filter id="shadow" x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${color}" flood-opacity="0.5"/>
        </filter>
      </defs>
      <path d="M18 0C8.059 0 0 8.059 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.059 27.941 0 18 0z"
            fill="${color}" filter="url(#shadow)"/>
      <circle cx="18" cy="18" r="11" fill="rgba(0,0,0,0.5)"/>
    </svg>
  `);

  return L.divIcon({
    html: `
      <div style="position:relative;width:36px;height:44px;">
        <img src="data:image/svg+xml,${svg}" style="width:36px;height:44px;display:block;" alt=""/>
        <span style="position:absolute;top:7px;left:50%;transform:translateX(-50%);font-size:13px;line-height:1;">
          ${emoji}
        </span>
      </div>
    `,
    className: "",
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -46],
  });
}

// ── Popup HTML ───────────────────────────────────────────────────────────────
function buildPopup(loc: MapLocation) {
  const color = markerColor(loc);
  const pct =
    loc.capacity && loc.occupied != null
      ? Math.min(100, Math.round((loc.occupied / loc.capacity) * 100))
      : null;
  const barColor =
    !pct ? "#10b981"
    : pct >= 90 ? "#ef4444"
    : pct >= 65 ? "#f59e0b"
    : "#10b981";

  const statusBg =
    loc.status === "FULL" ? "rgba(239,68,68,0.15)"
    : loc.status === "CLOSED" ? "rgba(107,114,128,0.15)"
    : "rgba(16,185,129,0.15)";
  const statusText =
    loc.status === "FULL" ? "#f87171"
    : loc.status === "CLOSED" ? "#9ca3af"
    : "#34d399";

  const amenitiesHtml = loc.amenities
    ? loc.amenities
        .map(
          (a) =>
            `<span style="font-family:monospace;font-size:9px;color:#9ca3af;
              border:1px solid rgba(255,255,255,0.1);border-radius:4px;
              padding:2px 5px;white-space:nowrap;">${a}</span>`
        )
        .join("")
    : "";

  return `
    <div style="
      min-width:220px;max-width:260px;
      background:rgba(10,15,25,0.97);
      border:1px solid ${color}40;
      border-radius:12px;
      padding:14px;
      color:#fff;
      font-family:system-ui,sans-serif;
      box-shadow:0 8px 32px rgba(0,0,0,0.6),0 0 0 1px ${color}20;
    ">
      <!-- OSM badge -->
      <div style="font-family:monospace;font-size:8px;letter-spacing:0.15em;
        color:#34d399;background:rgba(16,185,129,0.1);
        border:1px solid rgba(16,185,129,0.2);border-radius:4px;
        padding:2px 6px;display:inline-block;margin-bottom:8px;">
        LIVE · OpenStreetMap
      </div>

      <!-- Header -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:10px;">
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:2px;line-height:1.3;">${loc.name}</div>
          <div style="font-family:monospace;font-size:10px;color:${color};opacity:0.8;">${typeLabel(loc.type)}</div>
        </div>
        <span style="font-family:monospace;font-size:9px;font-weight:700;letter-spacing:0.1em;
          background:${statusBg};color:${statusText};
          border:1px solid ${statusText}30;border-radius:4px;
          padding:3px 6px;white-space:nowrap;flex-shrink:0;">
          ${loc.status}
        </span>
      </div>

      <!-- Address -->
      <div style="font-family:monospace;font-size:9px;color:#6b7280;margin-bottom:10px;">
        📍 ${loc.address}
      </div>

      ${
        pct !== null
          ? `<!-- Occupancy bar -->
      <div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;font-family:monospace;font-size:9px;color:#6b7280;margin-bottom:4px;">
          <span>OCCUPANCY (simulated)</span>
          <span style="color:${barColor};">${pct}%</span>
        </div>
        <div style="height:4px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden;">
          <div style="width:${pct}%;height:100%;background:${barColor};border-radius:99px;"></div>
        </div>
      </div>`
          : ""
      }

      ${loc.phone ? `<div style="font-family:monospace;font-size:9px;color:#6b7280;margin-bottom:8px;">📞 ${loc.phone}</div>` : ""}

      <!-- Amenities -->
      ${
        amenitiesHtml
          ? `<div style="display:flex;flex-wrap:wrap;gap:4px;">${amenitiesHtml}</div>`
          : ""
      }
    </div>
  `;
}

// ── Component ─────────────────────────────────────────────────────────────────
interface EmergencyMapProps {
  locations: MapLocation[];
  height?: number | string;
  className?: string;
  center?: [number, number];
  zoom?: number;
  selectedId?: string | null;
  onSelectLocation?: (loc: MapLocation) => void;
}

export default function EmergencyMap({
  locations,
  height = 380,
  className = "",
  center = [33.6844, 73.0479],   // fallback: Islamabad
  zoom = 13,
  selectedId = null,
  onSelectLocation,
}: EmergencyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const styleRef = useRef<HTMLStyleElement | null>(null);

  // ── Init map once ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: false,
    });
    mapRef.current = map;

    // Dark tile layer (CartoDB dark matter — free, no key needed)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    L.control.attribution({ prefix: false, position: "bottomright" }).addTo(map);
    L.control.zoom({ position: "topright" }).addTo(map);

    // "LIVE DATA" watermark
    const liveControl = L.control({ position: "topleft" });
    liveControl.onAdd = () => {
      const div = L.DomUtil.create("div");
      div.innerHTML = `
        <div style="
          font-family:monospace;font-size:9px;letter-spacing:0.15em;
          color:#34d399;background:rgba(10,15,25,0.88);
          border:1px solid rgba(16,185,129,0.3);border-radius:6px;
          padding:4px 8px;backdrop-filter:blur(8px);
        ">● LIVE · OpenStreetMap Data</div>
      `;
      L.DomEvent.disableClickPropagation(div);
      return div;
    };
    liveControl.addTo(map);

    // Legend
    const legend = L.control({ position: "bottomleft" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div");
      div.innerHTML = `
        <div style="
          font-family:monospace;font-size:9px;
          background:rgba(10,15,25,0.88);
          border:1px solid rgba(255,255,255,0.08);border-radius:8px;
          padding:8px 10px;backdrop-filter:blur(8px);line-height:1.8;
        ">
          <div style="font-size:8px;letter-spacing:0.15em;color:#6b7280;margin-bottom:4px;">LEGEND</div>
          <div><span style="color:#10b981;">●</span> <span style="color:#9ca3af;">Shelter / Evac</span></div>
          <div><span style="color:#3b82f6;">●</span> <span style="color:#9ca3af;">Hospital</span></div>
          <div><span style="color:#f59e0b;">●</span> <span style="color:#9ca3af;">Medical Point</span></div>
          <div><span style="color:#ef4444;">●</span> <span style="color:#9ca3af;">Full</span></div>
          <div><span style="color:#6b7280;">●</span> <span style="color:#9ca3af;">Closed</span></div>
        </div>
      `;
      L.DomEvent.disableClickPropagation(div);
      return div;
    };
    legend.addTo(map);

    // CSS overrides
    const style = document.createElement("style");
    style.textContent = `
      .cc-popup .leaflet-popup-content-wrapper {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        border-radius: 12px !important;
        overflow: hidden;
      }
      .cc-popup .leaflet-popup-content { margin: 0 !important; }
      .cc-popup .leaflet-popup-tip-container { display: none; }
      .leaflet-control-zoom a {
        background: rgba(10,15,25,0.88) !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
        color: #9ca3af !important;
        font-size: 14px !important;
      }
      .leaflet-control-zoom a:hover {
        background: rgba(16,185,129,0.15) !important;
        color: #34d399 !important;
      }
      .leaflet-attribution-flag { display: none !important; }
      .leaflet-control-attribution {
        background: rgba(10,15,25,0.7) !important;
        color: #4b5563 !important;
        font-size: 8px !important;
      }
      .leaflet-control-attribution a { color: #6b7280 !important; }
    `;
    document.head.appendChild(style);
    styleRef.current = style;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
      style.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update markers when locations change ──────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    if (locations.length === 0) return;

    // Add new markers
    locations.forEach((loc) => {
      const marker = L.marker([loc.lat, loc.lng], { icon: buildIcon(loc) })
        .addTo(map)
        .bindPopup(buildPopup(loc), { maxWidth: 280, className: "cc-popup" });

      marker.on("click", () => onSelectLocation?.(loc));
      markersRef.current.set(loc.id, marker);
    });

    // Fit map bounds to markers
    const group = L.featureGroup(Array.from(markersRef.current.values()));
    map.fitBounds(group.getBounds().pad(0.2), { maxZoom: 15 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  // ── Re-center when center prop changes ───────────────────────────────────
  useEffect(() => {
    mapRef.current?.setView(center, zoom, { animate: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1]]);

  // ── Open popup for selected marker ────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    const marker = markersRef.current.get(selectedId);
    if (marker) {
      marker.openPopup();
      mapRef.current.panTo(marker.getLatLng(), { animate: true, duration: 0.5 });
    }
  }, [selectedId]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%" }}
      className={`rounded-xl overflow-hidden ${className}`}
    />
  );
}
