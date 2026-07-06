import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  CHECKLIST_DATA,
  CRITICAL_ITEMS,
  useChecklist,
} from "../hooks/useChecklist";
import type { ChecklistCategory, SyncStatus } from "../hooks/useChecklist";

// ── Sync status pill ──────────────────────────────────────────────────────────
function SyncPill({ status }: { status: SyncStatus }) {
  if (status === "idle") return null;
  const map = {
    loading: { icon: "⟳", text: "Loading…",   cls: "text-white/30 border-white/10 bg-white/5", spin: true },
    saving:  { icon: "⟳", text: "Saving…",    cls: "text-amber-400/70 border-amber-500/20 bg-amber-500/5", spin: true },
    saved:   { icon: "✓", text: "Saved",      cls: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5", spin: false },
    error:   { icon: "✕", text: "Sync error", cls: "text-red-400 border-red-500/20 bg-red-500/5", spin: false },
  } as const;
  const { icon, text, cls, spin } = map[status];
  return (
    <motion.span
      key={status}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className={`inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-widest border rounded-md px-2 py-0.5 ${cls}`}
    >
      <span className={spin ? "animate-spin inline-block" : ""}>{icon}</span>
      {text}
    </motion.span>
  );
}

// ── Readiness Config ──────────────────────────────────────────────────────────
const READINESS_STYLES = {
  CRITICAL: { text: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/25",     ring: "#ef4444", glow: "shadow-[0_0_20px_rgba(239,68,68,0.2)]" },
  LOW:      { text: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/25",  ring: "#f97316", glow: "shadow-[0_0_20px_rgba(249,115,22,0.2)]" },
  MODERATE: { text: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/25",   ring: "#f59e0b", glow: "shadow-[0_0_20px_rgba(245,158,11,0.2)]" },
  HIGH:     { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25", ring: "#10b981", glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]"  },
  READY:    { text: "text-teal-300",    bg: "bg-teal-500/10",    border: "border-teal-500/25",    ring: "#2dd4bf", glow: "shadow-[0_0_20px_rgba(45,212,191,0.2)]"  },
};

// ── Progress Ring ─────────────────────────────────────────────────────────────
function ProgressRing({ pct, label, done, total, color }: {
  pct: number; label: string; done: number; total: number; color: string;
}) {
  const R = 56;
  const circ = 2 * Math.PI * R;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center" style={{ width: 148, height: 148 }}>
        <svg className="absolute inset-0" width={148} height={148} viewBox="0 0 148 148">
          {/* Outer decorative ring */}
          <circle cx={74} cy={74} r={70} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={1} strokeDasharray="4,4" />
          {/* Track */}
          <circle cx={74} cy={74} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={12} />
          {/* Progress arc */}
          <motion.circle
            cx={74} cy={74} r={R} fill="none" stroke={color} strokeWidth={12}
            strokeLinecap="round" strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
          />
          {/* Glow arc */}
          <motion.circle
            cx={74} cy={74} r={R} fill="none" stroke={color} strokeWidth={3}
            strokeLinecap="round" strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "center", transform: "rotate(-90deg)", filter: "blur(6px)", opacity: 0.6 }}
          />
        </svg>
        <div className="text-center z-10">
          <motion.div
            className="font-display font-black text-4xl text-white leading-none tabular-nums"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
          >
            {pct}%
          </motion.div>
          <div className="font-mono text-[9px] text-white/30 mt-1 uppercase tracking-widest">
            {done}/{total}
          </div>
        </div>
      </div>
      {/* Readiness label */}
      <div
        className="font-mono text-[10px] uppercase tracking-[0.25em] font-bold px-4 py-1.5 rounded-none border"
        style={{ color, borderColor: color + "50", background: color + "18" }}
      >
        ◈ {label}
      </div>
    </div>
  );
}

// ── Mini Progress Bar ─────────────────────────────────────────────────────────
function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-0.5 rounded-full bg-white/10 overflow-hidden mt-1.5">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
      />
    </div>
  );
}

// ── Check Item Row ────────────────────────────────────────────────────────────
function CheckItem({ id, label, detail, critical, checked, onToggle }: {
  id: string; label: string; detail?: string; critical?: boolean;
  checked: boolean; onToggle: () => void;
}) {
  return (
    <motion.button
      layout
      onClick={onToggle}
      whileHover={{ x: 2 }}
      className={`group flex items-start gap-3 w-full text-left rounded-lg px-3 py-2.5 transition-all duration-200
        ${checked
          ? "bg-emerald-500/5 border border-emerald-500/10"
          : "hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06]"
        }`}
    >
      {/* Custom checkbox */}
      <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-all duration-200
        ${checked ? "bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "border-white/20 group-hover:border-emerald-500/50"}`}
      >
        {checked && (
          <motion.svg
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none"
          >
            <path d="M1.5 5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <span className={`text-[13px] leading-snug transition-all duration-200
          ${checked ? "line-through text-white/40" : "text-white font-medium group-hover:text-white"}`}
        >
          {label}
        </span>
        {detail && (
          <p className="font-mono text-[10px] text-white/50 mt-0.5 leading-relaxed">{detail}</p>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
        {critical && !checked && (
          <span className="font-mono text-[8px] uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-sm animate-pulse">
            CRITICAL
          </span>
        )}
        {checked && (
          <span className="font-mono text-[8px] uppercase tracking-wider text-emerald-400/60">✓ DONE</span>
        )}
      </div>
    </motion.button>
  );
}

// ── Category Card ─────────────────────────────────────────────────────────────
function CategoryCard({ cat, checked, onToggle, defaultOpen }: {
  cat: ChecklistCategory; checked: Set<string>;
  onToggle: (id: string) => void; defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const catDone = cat.items.filter((i) => checked.has(i.id)).length;
  const catPct = Math.round((catDone / cat.items.length) * 100);
  const allDone = catDone === cat.items.length;

  const colorMap: Record<string, string> = {
    "text-blue-400":   "#60a5fa", "text-amber-400":  "#fbbf24",
    "text-red-400":    "#f87171", "text-emerald-400":"#34d399",
    "text-violet-400": "#a78bfa", "text-cyan-400":   "#22d3ee",
    "text-orange-400": "#fb923c", "text-pink-400":   "#f472b6",
  };
  const hexColor = colorMap[cat.color] ?? "#10b981";

  return (
    <motion.div
      layout
      className={`rounded-xl border overflow-hidden transition-all duration-300 backdrop-blur-sm
        ${allDone
          ? "border-t border-t-emerald-400/30 border-b border-b-black/40 border-x border-x-emerald-500/10 bg-emerald-500/[0.05] shadow-[0_8px_20px_rgba(16,185,129,0.08)]"
          : "border-t border-t-white/15 border-b border-b-black/40 border-x border-x-white/5 bg-white/[0.03] hover:border-t-white/25 hover:bg-white/[0.05]"
        }`}
    >
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-3 w-full px-4 py-4 text-left group"
      >
        <span className="text-xl leading-none select-none">{cat.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`font-display font-bold text-sm tracking-wide ${allDone ? "text-emerald-300" : "text-white/90"}`}>
              {cat.title}
            </span>
            {allDone && (
              <span className="font-mono text-[8px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.5 rounded-sm uppercase tracking-widest">
                COMPLETE
              </span>
            )}
          </div>
          <MiniBar pct={catPct} color={hexColor} />
        </div>
        <div className="text-right shrink-0 ml-3">
          <div className="font-mono text-[10px] font-bold" style={{ color: hexColor }}>
            {catDone}/{cat.items.length}
          </div>
          <div className={`font-mono text-[10px] mt-1 text-white/30 transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}>
            ▼
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="items"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-0.5 border-t border-white/[0.05] pt-2">
              {cat.items.map((item) => (
                <CheckItem
                  key={item.id}
                  {...item}
                  checked={checked.has(item.id)}
                  onToggle={() => onToggle(item.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PreparednessChecklist() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const { checked, toggle, reset, progress, syncStatus } = useChecklist(userId ? String(userId) : null);

  const readinessStyle = READINESS_STYLES[progress.readinessLabel];
  const criticalRemaining = CRITICAL_ITEMS.filter((id) => !checked.has(id)).length;
  const completedCategories = CHECKLIST_DATA.filter((c) => c.items.every((i) => checked.has(i.id))).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl border-t border-t-white/20 border-b border-b-black/60 border-x border-x-white/5 bg-white/[0.04] backdrop-blur-md shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden"
    >
      {/* Corner HUD marks */}
      <div className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-emerald-500/40 pointer-events-none z-10" />
      <div className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 border-emerald-500/40 pointer-events-none z-10" />
      <div className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 border-emerald-500/20 pointer-events-none z-10" />
      <div className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 border-emerald-500/20 pointer-events-none z-10" />

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="px-6 pt-7 pb-5 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-emerald-400/70">
                PREPAREDNESS · CHECKLIST
              </span>
              <AnimatePresence mode="wait">
                <SyncPill key={syncStatus} status={syncStatus} />
              </AnimatePresence>
            </div>
            <p className="text-white/60 text-xs font-mono">
              {user
                ? `Synced to account · ${user.name.split(" ")[0]}`
                : "Progress saved locally — log in to sync across devices"}
            </p>
          </div>
          <button
            onClick={reset}
            className="font-mono text-[9px] uppercase tracking-widest text-white/20 hover:text-red-400 transition-colors border border-white/[0.06] hover:border-red-500/20 rounded-lg px-3 py-1.5 hover:bg-red-500/5"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ── Progress Ring + Stats ──────────────────────────────────────────────── */}
      <div className="px-6 py-6 border-b border-white/[0.06]">
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* Ring */}
          <div className="hidden lg:block shrink-0">
            <ProgressRing
              pct={progress.pct}
              label={progress.readinessLabel}
              done={progress.done}
              total={progress.total}
              color={readinessStyle.ring}
            />
          </div>

          {/* Stats */}
          <div className="flex-1 w-full space-y-5">
            {/* Overall bar */}
            <div>
              <div className="flex justify-between font-mono text-[9px] text-white/30 mb-2 uppercase tracking-widest">
                <span>Overall Readiness</span>
                <span className={readinessStyle.text}>{progress.pct}% · {progress.done}/{progress.total} items</span>
              </div>
              <div className="h-2.5 rounded-none bg-white/[0.06] overflow-hidden border border-white/[0.04]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.pct}%` }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full relative overflow-hidden"
                  style={{ background: `linear-gradient(90deg, ${readinessStyle.ring}80, ${readinessStyle.ring})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </motion.div>
              </div>
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Readiness level */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`rounded-xl border-t border-t-white/10 border-b border-b-black/30 border-x border-x-white/5 p-3 text-center backdrop-blur-sm ${readinessStyle.bg} ${readinessStyle.glow}`}
              >
                <div className={`font-mono text-[8px] uppercase tracking-widest ${readinessStyle.text} opacity-70 mb-1.5`}>Readiness</div>
                <div className={`font-display font-black text-sm ${readinessStyle.text}`}>{progress.readinessLabel}</div>
              </motion.div>

              {/* Critical remaining */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`rounded-xl border-t border-t-white/10 border-b border-b-black/30 border-x border-x-white/5 p-3 text-center backdrop-blur-sm ${
                  criticalRemaining === 0
                    ? "bg-emerald-500/[0.06] shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    : "bg-red-500/[0.06] shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                }`}
              >
                <div className={`font-mono text-[8px] uppercase tracking-widest mb-1.5 ${criticalRemaining === 0 ? "text-emerald-400/70" : "text-red-400/70"}`}>
                  Critical Left
                </div>
                <div className={`font-display font-black text-sm ${criticalRemaining === 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {criticalRemaining === 0 ? "✓ CLEAR" : criticalRemaining}
                </div>
              </motion.div>

              {/* Categories done */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-xl border-t border-t-white/10 border-b border-b-black/30 border-x border-x-white/5 bg-white/[0.03] p-3 text-center backdrop-blur-sm"
              >
                <div className="font-mono text-[8px] uppercase tracking-widest text-white/30 mb-1.5">Categories</div>
                <div className="font-display font-black text-sm text-white/80">
                  {completedCategories}
                  <span className="text-white/30 text-xs">/{CHECKLIST_DATA.length}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Accordion List ────────────────────────────────────────────── */}
      <div className="px-6 py-5 space-y-2.5 max-h-[620px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent">
        {CHECKLIST_DATA.map((cat, i) => (
          <CategoryCard
            key={cat.id}
            cat={cat}
            checked={checked}
            onToggle={toggle}
            defaultOpen={i < 2}
          />
        ))}
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <div className="px-6 pb-6">
        <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.03] px-4 py-3 flex items-start gap-3">
          <span className="text-emerald-400/50 text-sm mt-0.5">ℹ</span>
          <p className="font-mono text-[9px] text-white/25 leading-relaxed">
            {user
              ? `Progress is saved to your account ("${user.name}") and syncs across devices. `
              : "Progress is saved locally. Log in to sync across devices. "}
            Checklist follows FEMA / Red Cross guidelines — consult official local emergency management resources.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
