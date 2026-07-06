import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import type { DangerLevel } from "../types/emergency";
import type { AlertData } from "../services/alerts";

const CONFIG: Record<
  DangerLevel,
  {
    label: string;
    code: string;
    bg: string;
    border: string;
    text: string;
    glow: string;
    dot: string;
    bar: string;
    bars: number;        // filled bars out of 4
    pulse: boolean;
  }
> = {
  low: {
    label: "Low Risk",
    code: "LVL-1",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,1)]",
    bar: "bg-emerald-500",
    bars: 1,
    pulse: false,
  },
  moderate: {
    label: "Moderate Risk",
    code: "LVL-2",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    glow: "shadow-[0_0_20px_rgba(234,179,8,0.15)]",
    dot: "bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,1)]",
    bar: "bg-yellow-400",
    bars: 2,
    pulse: false,
  },
  high: {
    label: "High Risk",
    code: "LVL-3",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-400",
    glow: "shadow-[0_0_20px_rgba(249,115,22,0.2)]",
    dot: "bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,1)]",
    bar: "bg-orange-400",
    bars: 3,
    pulse: true,
  },
  critical: {
    label: "Critical — Act Now",
    code: "LVL-4",
    bg: "bg-red-500/15",
    border: "border-red-500/50",
    text: "text-red-400",
    glow: "shadow-[0_0_30px_rgba(239,68,68,0.3)]",
    dot: "bg-red-400 shadow-[0_0_12px_rgba(239,68,68,1)]",
    bar: "bg-red-500",
    bars: 4,
    pulse: true,
  },
};

interface RiskBadgeProps {
  level: DangerLevel;
  alerts?: AlertData[];
  /** If true, renders as a larger card-style widget for dashboard use */
  card?: boolean;
}

export default function RiskBadge({ level, alerts = [], card = false }: RiskBadgeProps) {
  const cfg = CONFIG[level];

  if (card) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`relative overflow-hidden rounded-2xl border-t border-t-white/20 border-b border-b-black/60 border-x border-x-white/5 p-6 backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.5)] ${cfg.bg} ${cfg.glow} transition-all duration-300 h-full flex flex-col justify-between`}
      >
        {/* Sweep for critical */}
        {level === "critical" && (
          <div className="scan-sweep absolute inset-0 pointer-events-none" />
        )}

        {/* Corner marks */}
        <div className={`absolute top-3 left-3 w-4 h-4 border-l border-t ${cfg.border} pointer-events-none`} />
        <div className={`absolute top-3 right-3 w-4 h-4 border-r border-t ${cfg.border} pointer-events-none`} />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className={`font-mono text-[9px] uppercase tracking-[0.2em] ${cfg.text} opacity-70`}>
            THREAT LEVEL
          </span>

          {/* Decorative Telemetry Chart */}
          <svg className={`h-4 w-12 opacity-40 mx-auto hidden sm:block`} viewBox="0 0 50 20" preserveAspectRatio="none">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <rect key={i} x={i * 7} y={10 + Math.sin(i) * 5} width="4" height={10 - Math.sin(i) * 5} fill="currentColor" className={`${cfg.text}`} opacity={0.3 + (i * 0.1)}>
                <animate attributeName="height" values={`${10 - Math.sin(i) * 5};${15 + Math.cos(i) * 5};${10 - Math.sin(i) * 5}`} dur={`${1 + i * 0.2}s`} repeatCount="indefinite" />
                <animate attributeName="y" values={`${10 + Math.sin(i) * 5};${5 - Math.cos(i) * 5};${10 + Math.sin(i) * 5}`} dur={`${1 + i * 0.2}s`} repeatCount="indefinite" />
              </rect>
            ))}
          </svg>

          <div className="flex items-center gap-1.5">
            <span className={`relative flex h-2.5 w-2.5 ${cfg.pulse ? "animate-pulse" : ""}`}>
              <span className={`absolute inline-flex h-full w-full rounded-full ${cfg.dot} ${cfg.pulse ? "animate-ping opacity-75" : ""}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cfg.dot}`} />
            </span>
          </div>
        </div>

        {/* Code */}
        <div className={`font-mono text-[11px] tracking-[0.25em] ${cfg.text} opacity-80 mb-1`}>
          {cfg.code}
        </div>

        {/* Label */}
        <div className={`font-display font-black text-2xl ${cfg.text} leading-tight`}>
          {cfg.label}
        </div>

        {/* Severity bars */}
        <div className="flex items-center gap-1.5 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
              className={`origin-bottom h-5 flex-1 rounded-sm ${
                i <= cfg.bars ? cfg.bar : "bg-white/10"
              } ${i <= cfg.bars && level === "critical" ? "animate-pulse" : ""}`}
            />
          ))}
        </div>
        <div className="font-mono text-[9px] text-white/25 tracking-widest mt-1.5 mb-4">
          SEVERITY SCALE
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className={`font-mono text-[9px] uppercase tracking-[0.2em] ${cfg.text} opacity-70 mb-2`}>
              ACTIVE ALERTS
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2">
              <AnimatePresence>
                {alerts.map((alert, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.1 }}
                    className="flex flex-col gap-1 border-l-2 border-current pl-2"
                    style={{ borderColor: CONFIG[alert.severity]?.bar || "rgba(255,255,255,0.2)" }}
                  >
                    <span className="text-xs font-semibold leading-tight text-white/90">
                      {alert.title}
                    </span>
                    <span className="text-[10px] text-white/50 leading-tight">
                      {alert.description.slice(0, 80)}{alert.description.length > 80 ? "..." : ""}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  /* ── Inline badge (original compact style, now with dots) ── */
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-display text-sm font-semibold ${cfg.bg} ${cfg.border} ${cfg.text}`}
    >
      <span className={`relative flex h-2 w-2`}>
        {cfg.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`} />
      </span>
      <span className="font-mono text-[10px] tracking-widest opacity-70">{cfg.code}</span>
      <span className="h-3 w-px bg-current opacity-30" />
      {cfg.label}
    </span>
  );
}