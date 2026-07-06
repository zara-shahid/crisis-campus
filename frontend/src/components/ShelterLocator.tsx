import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EmergencyMap from "./EmergencyMap";
import type { MapLocation } from "../services/locations";
import { useLocations } from "../hooks/useLocations";

// ── Sub-components ────────────────────────────────────────────────────────────

function OccupancyBar({ occupied, capacity }: { occupied: number; capacity: number }) {
  const pct = Math.min(100, Math.round((occupied / capacity) * 100));
  const color =
    pct >= 90 ? "bg-red-500" : pct >= 65 ? "bg-amber-400" : "bg-emerald-500";
  return (
    <div>
      <div className="flex justify-between font-mono text-[9px] text-white/30 mb-1">
        <span>OCCUPANCY (simulated)</span>
        <span className={pct >= 90 ? "text-red-400" : pct >= 65 ? "text-amber-400" : "text-emerald-400"}>
          {pct}%
        </span>
      </div>
      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

const TYPE_EMOJI: Record<MapLocation["type"], string> = {
  shelter: "🏠", evac: "🚨", hospital: "🏥", medpoint: "⚕️",
};
const TYPE_LABEL: Record<MapLocation["type"], string> = {
  shelter: "General Shelter", evac: "Evacuation Center",
  hospital: "Hospital", medpoint: "Medical Point",
};

function LocationRow({
  loc, idx, selected, onClick,
}: {
  loc: MapLocation; idx: number; selected: boolean; onClick: () => void;
}) {
  const isOpen = loc.status === "OPEN";
  const isFull = loc.status === "FULL";

  const borderColor = selected
    ? "border-emerald-500/40 bg-emerald-500/8"
    : isFull
    ? "border-red-500/20 bg-red-500/5 hover:border-red-500/30"
    : !isOpen
    ? "border-white/[0.05] bg-white/[0.02] opacity-60"
    : "border-white/[0.07] bg-white/[0.03] hover:border-emerald-500/20 hover:bg-emerald-500/5";

  const statusStyle = isFull
    ? "bg-red-500/15 text-red-400 border-red-500/20"
    : !isOpen
    ? "bg-gray-500/15 text-gray-400 border-gray-500/20"
    : "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";

  return (
    <motion.button
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.08 + idx * 0.04 }}
      onClick={onClick}
      className={`group w-full text-left rounded-xl border p-3.5 transition-all duration-200 cursor-pointer ${borderColor}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm font-bold border ${statusStyle}`}>
              {loc.status}
            </span>
            <span className="text-[10px]">{TYPE_EMOJI[loc.type]}</span>
            <span className="font-mono text-[9px] text-emerald-400/60 truncate">
              {TYPE_LABEL[loc.type]}
            </span>
          </div>
          <p className="font-display font-semibold text-[13px] text-white group-hover:text-emerald-300 transition-colors truncate mt-0.5">
            {loc.name}
          </p>
          <p className="font-mono text-[9px] text-white/50 mt-0.5 truncate">{loc.address}</p>
        </div>
        {loc.capacity && (
          <div className="text-right shrink-0">
            <div className="font-mono text-[8px] text-white/30">CAP</div>
            <div className="font-display font-bold text-sm text-white/60">{loc.capacity}</div>
          </div>
        )}
      </div>

      {loc.capacity && loc.occupied != null && (
        <div className="mt-2.5">
          <OccupancyBar occupied={loc.occupied} capacity={loc.capacity} />
        </div>
      )}

      {selected && loc.amenities && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.2 }}
          className="flex flex-wrap gap-1.5 mt-2.5"
        >
          {loc.amenities.map((am) => (
            <span key={am} className="font-mono text-[8px] text-white/40 border border-white/10 rounded px-1.5 py-0.5">
              {am}
            </span>
          ))}
        </motion.div>
      )}
    </motion.button>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-2 p-5 pt-0">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-2.5 bg-white/10 rounded w-16" />
              <div className="h-3.5 bg-white/10 rounded w-48" />
              <div className="h-2 bg-white/5 rounded w-32" />
            </div>
            <div className="h-8 w-12 bg-white/5 rounded" />
          </div>
          <div className="mt-3 h-1 bg-white/10 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
type FilterType = "all" | MapLocation["type"];

const FILTER_OPTS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "🏠 Shelter", value: "shelter" },
  { label: "🚨 Evac", value: "evac" },
  { label: "🏥 Hospital", value: "hospital" },
  { label: "⚕️ Medical", value: "medpoint" },
];

export default function ShelterLocator() {
  const { locations, center, status, error } = useLocations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [mapExpanded, setMapExpanded] = useState(true);

  const filtered =
    filter === "all" ? locations : locations.filter((l) => l.type === filter);

  const openCount = locations.filter((l) => l.status === "OPEN").length;
  const isLoading = status === "geolocating" || status === "loading";

  function handleSelect(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl border-t border-t-white/20 border-b border-b-black/60 border-x border-x-white/5 bg-white/[0.04] backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden h-full flex flex-col"
    >
      {/* Corner HUD decorations */}
      <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-emerald-500/30 pointer-events-none z-10" />
      <div className="absolute top-3 right-3 w-4 h-4 border-r border-t border-emerald-500/30 pointer-events-none z-10" />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="p-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-400/70">
                SHELTER · HOSPITAL · MAP
              </span>
              {isLoading ? (
                <span className="font-mono text-[8px] bg-white/5 text-white/30 border border-white/10 px-1.5 py-0.5 rounded-sm tracking-widest animate-pulse">
                  LOCATING…
                </span>
              ) : status === "error" ? (
                <span className="font-mono text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-sm tracking-widest">
                  ERROR
                </span>
              ) : (
                <span className="font-mono text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-sm tracking-widest">
                  LIVE
                </span>
              )}
            </div>
            <p className="text-white/60 text-xs font-mono">
              {isLoading
                ? "Detecting your location…"
                : error
                ? error
                : `${openCount} open · ${locations.length} found nearby`}
            </p>
          </div>
          <button
            onClick={() => setMapExpanded((p) => !p)}
            className="font-mono text-[9px] uppercase tracking-widest text-white/30 hover:text-emerald-400 transition-colors border border-white/[0.06] rounded-lg px-3 py-1.5 hover:border-emerald-500/20"
          >
            {mapExpanded ? "▲ Map" : "▼ Map"}
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 flex-wrap">
          {FILTER_OPTS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`font-mono text-[9px] uppercase tracking-wide px-2.5 py-1 rounded-md transition-all duration-150
                ${filter === opt.value
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                  : "text-white/30 hover:text-white/50 border border-transparent hover:border-white/10"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Leaflet Map ──────────────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {mapExpanded && (
          <motion.div
            key="map"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 320, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-y border-white/[0.06]"
          >
            <EmergencyMap
              locations={filtered}
              height={320}
              selectedId={selectedId}
              onSelectLocation={(loc) => setSelectedId(loc.id)}
              center={center ?? [33.6844, 73.0479]}
              zoom={13}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Location list ────────────────────────────────────────────────────── */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="flex-1 min-h-[300px] p-5 pt-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <AnimatePresence mode="popLayout">
            {filtered.map((loc, i) => (
              <LocationRow
                key={loc.id}
                loc={loc}
                idx={i}
                selected={selectedId === loc.id}
                onClick={() => handleSelect(loc.id)}
              />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && !isLoading && (
            <p className="font-mono text-[10px] text-white/20 text-center py-8 uppercase tracking-widest">
              {status === "error" ? "Location fetch failed" : "No locations match filter"}
            </p>
          )}
        </div>
      )}

      {/* ── Data source disclaimer ────────────────────────────────────────────── */}
      <div className="px-5 pb-4">
        <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-3 py-2 flex items-start gap-2">
          <span className="text-emerald-400 text-xs mt-0.5">ℹ</span>
          <p className="font-mono text-[9px] text-emerald-400/60 leading-relaxed">
            Locations sourced live from{" "}
            <strong className="text-emerald-400">OpenStreetMap</strong> (free &amp; open).
            Occupancy figures are <strong className="text-emerald-400">simulated</strong> —
            no live bed-availability API exists for Pakistan. Phone numbers and addresses
            are from OSM community data and may not be up to date.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
