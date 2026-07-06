import { motion, AnimatePresence } from "framer-motion";
import { useWeather, codeToIcon } from "../hooks/useWeather";

function SkeletonBar({ w = "100%" }: { w?: string }) {
  return (
    <div
      className="h-3 rounded bg-white/5 animate-pulse"
      style={{ width: w }}
    />
  );
}

export default function WeatherCard({ locationHint }: { locationHint?: string }) {
  const { data, loading, error } = useWeather(locationHint);

  /* ── UV index badge ── */
  function uvLabel(uv: number) {
    if (uv <= 2) return { label: "LOW", color: "text-emerald-400" };
    if (uv <= 5) return { label: "MODERATE", color: "text-yellow-400" };
    if (uv <= 7) return { label: "HIGH", color: "text-orange-400" };
    if (uv <= 10) return { label: "VERY HIGH", color: "text-red-400" };
    return { label: "EXTREME", color: "text-red-600" };
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative group overflow-hidden rounded-2xl border-t border-t-white/20 border-b border-b-black/60 border-x border-x-white/5 bg-white/[0.04] backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.5)] p-6 hover:border-t-emerald-400/40 hover:bg-white/[0.06] transition-all duration-300 h-full flex flex-col justify-between"
    >
      {/* Subtle scan-line shimmer */}
      <div className="scan-sweep absolute inset-0 pointer-events-none" />

      {/* Corner HUD marks */}
      <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-emerald-500/30 pointer-events-none" />
      <div className="absolute top-3 right-3 w-4 h-4 border-r border-t border-emerald-500/30 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-l border-b border-emerald-500/30 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-emerald-500/30 pointer-events-none" />

      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-400/70">
            WEATHER · LIVE
          </span>
        </div>
        
        {/* Decorative Telemetry Chart */}
        <svg className="h-4 w-16 opacity-30 mx-auto hidden sm:block" viewBox="0 0 100 20" preserveAspectRatio="none">
          <path d="M0,10 Q10,0 20,10 T40,10 T60,10 T80,10 T100,10" fill="none" stroke="#34d399" strokeWidth="1" strokeDasharray="2,2">
            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="5s" repeatCount="indefinite" />
          </path>
        </svg>

        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-mono text-[9px] text-emerald-400/60 tracking-widest">UPLINK</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="skel" exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-end gap-4">
              <SkeletonBar w="60px" />
              <SkeletonBar w="40%" />
            </div>
            <SkeletonBar w="55%" />
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[0, 1, 2].map((i) => <SkeletonBar key={i} />)}
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="err"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <span className="text-3xl mb-3">📡</span>
            <p className="font-mono text-xs text-red-400 tracking-wide">SIGNAL LOST</p>
            <p className="text-white/30 text-xs mt-1">Weather feed unavailable</p>
          </motion.div>
        )}

        {data && !loading && (
          <motion.div
            key="data"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Main temp + icon */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-end gap-2">
                  <span className="font-display font-black text-6xl text-white leading-none tabular-nums">
                    {data.temp_c}
                  </span>
                  <span className="font-display font-semibold text-2xl text-white/40 mb-1">°C</span>
                </div>
                <p className="font-mono text-[11px] text-white/70 mt-1 tracking-wide uppercase">
                  {data.description}
                </p>
                <p className="font-mono text-[10px] text-emerald-400/80 tracking-widest mt-0.5 truncate max-w-[180px]">
                  📍 {data.location}
                </p>
              </div>
              <span className="text-5xl leading-none select-none">
                {codeToIcon(data.icon_code, data.is_day)}
              </span>
            </div>

            {/* Divider */}
            <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Metrics grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "HUMIDITY", value: `${data.humidity}%`, icon: "💧" },
                { label: "WIND", value: `${data.wind_kph} km/h`, icon: "💨" },
                { label: "FEELS", value: `${data.feels_like_c}°C`, icon: "🌡️" },
                { label: "VIS", value: `${data.visibility_km} km`, icon: "👁" },
                { label: "UV IDX", value: String(data.uv_index), icon: "☀️" },
                { label: "WIND DIR", value: data.wind_dir, icon: "🧭" },
              ].map(({ label, value, icon }) => (
                <div
                  key={label}
                  className="rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2"
                >
                  <div className="font-mono text-[8px] uppercase tracking-widest text-white/50 mb-0.5">
                    {icon} {label}
                  </div>
                  <div className="font-display font-semibold text-xs text-white">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* UV warning if elevated */}
            {data.uv_index >= 6 && (() => {
              const { label, color } = uvLabel(data.uv_index);
              return (
                <div className={`mt-3 flex items-center gap-2 font-mono text-[9px] tracking-widest ${color}`}>
                  <span className="animate-pulse">⚠</span>
                  <span>UV {label} — seek shade, use SPF 50+</span>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
