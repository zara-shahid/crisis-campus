import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchChecklist, saveChecklist } from "../services/checklist";

// ── Data model ────────────────────────────────────────────────────────────────

export interface ChecklistItem {
  id: string;
  label: string;
  detail?: string;
  critical?: boolean;
}

export interface ChecklistCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  glowColor: string;
  items: ChecklistItem[];
}

// ── Master checklist definition ───────────────────────────────────────────────

export const CHECKLIST_DATA: ChecklistCategory[] = [
  {
    id: "water",
    title: "Water Supply",
    icon: "💧",
    color: "text-blue-400",
    glowColor: "rgba(59,130,246,0.25)",
    items: [
      { id: "w1", label: "1 gallon per person per day (3-day supply)", critical: true },
      { id: "w2", label: "Water purification tablets or filter", critical: true },
      { id: "w3", label: "Manual water pump or siphon" },
      { id: "w4", label: "Collapsible water containers" },
      { id: "w5", label: "Unscented liquid chlorine bleach (for purification)" },
    ],
  },
  {
    id: "food",
    title: "Food & Nutrition",
    icon: "🥫",
    color: "text-amber-400",
    glowColor: "rgba(245,158,11,0.25)",
    items: [
      { id: "f1", label: "3-day supply of non-perishable food", critical: true },
      { id: "f2", label: "Manual can opener", critical: true },
      { id: "f3", label: "Energy bars or high-calorie emergency rations" },
      { id: "f4", label: "Baby formula / pet food if applicable" },
      { id: "f5", label: "Disposable plates, cups, utensils" },
      { id: "f6", label: "Portable camp stove + fuel canister" },
    ],
  },
  {
    id: "medical",
    title: "First Aid & Medical",
    icon: "⚕️",
    color: "text-red-400",
    glowColor: "rgba(239,68,68,0.25)",
    items: [
      { id: "m1", label: "Fully stocked first aid kit", critical: true },
      { id: "m2", label: "7-day supply of prescription medications", critical: true },
      { id: "m3", label: "Copies of medical records & prescriptions", critical: true },
      { id: "m4", label: "Thermometer" },
      { id: "m5", label: "Tourniquet & hemostatic gauze" },
      { id: "m6", label: "Emergency mylar blankets (×4)" },
      { id: "m7", label: "Hand sanitizer & N95 masks" },
    ],
  },
  {
    id: "comms",
    title: "Communication",
    icon: "📡",
    color: "text-emerald-400",
    glowColor: "rgba(16,185,129,0.25)",
    items: [
      { id: "c1", label: "Battery-powered or hand-crank NOAA radio", critical: true },
      { id: "c2", label: "Fully charged power bank (20,000 mAh+)", critical: true },
      { id: "c3", label: "Printed list of emergency contacts" },
      { id: "c4", label: "Whistle (signal for help)" },
      { id: "c5", label: "Local evacuation map (printed)" },
    ],
  },
  {
    id: "tools",
    title: "Tools & Safety",
    icon: "🔦",
    color: "text-violet-400",
    glowColor: "rgba(167,139,250,0.25)",
    items: [
      { id: "t1", label: "LED flashlight + extra batteries", critical: true },
      { id: "t2", label: "Multi-tool or Swiss Army knife", critical: true },
      { id: "t3", label: "Duct tape & plastic sheeting" },
      { id: "t4", label: "Work gloves (heavy duty)" },
      { id: "t5", label: "Fire extinguisher (ABC rated)" },
      { id: "t6", label: "Wrench / pliers to shut off utilities" },
      { id: "t7", label: "N95 dust masks" },
    ],
  },
  {
    id: "documents",
    title: "Documents & Finance",
    icon: "📋",
    color: "text-cyan-400",
    glowColor: "rgba(34,211,238,0.25)",
    items: [
      { id: "d1", label: "Copies of ID, passport, birth certificate", critical: true },
      { id: "d2", label: "Insurance policies & property documents", critical: true },
      { id: "d3", label: "Small amount of cash (ATMs may be offline)" },
      { id: "d4", label: "USB drive with encrypted digital copies" },
      { id: "d5", label: "Waterproof storage bag / document case" },
    ],
  },
  {
    id: "shelter",
    title: "Shelter & Warmth",
    icon: "🏕️",
    color: "text-orange-400",
    glowColor: "rgba(251,146,60,0.25)",
    items: [
      { id: "sh1", label: "Emergency tent or tarp" },
      { id: "sh2", label: "Sleeping bags rated for local climate" },
      { id: "sh3", label: "Change of clothes per person (3 days)" },
      { id: "sh4", label: "Rain ponchos" },
      { id: "sh5", label: "Sturdy closed-toe shoes" },
    ],
  },
  {
    id: "plan",
    title: "Family Action Plan",
    icon: "🗺️",
    color: "text-pink-400",
    glowColor: "rgba(244,114,182,0.25)",
    items: [
      { id: "p1", label: "Designated out-of-area contact person", critical: true },
      { id: "p2", label: "Two meeting locations agreed upon", critical: true },
      { id: "p3", label: "Everyone knows the evacuation route" },
      { id: "p4", label: "Pet evacuation plan" },
      { id: "p5", label: "Practice drill completed in past 6 months" },
    ],
  },
];

// ── Derived totals ─────────────────────────────────────────────────────────────

export const TOTAL_ITEMS = CHECKLIST_DATA.reduce(
  (sum, cat) => sum + cat.items.length,
  0
);

export const CRITICAL_ITEMS = CHECKLIST_DATA.flatMap((c) =>
  c.items.filter((i) => i.critical).map((i) => i.id)
);

// ── Storage helpers ───────────────────────────────────────────────────────────

function localKey(userId: string) {
  return `cc_checklist_v1_${userId}`;
}

function readLocal(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(localKey(userId));
    return raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

function writeLocal(userId: string, checked: Set<string>) {
  try {
    localStorage.setItem(localKey(userId), JSON.stringify([...checked]));
  } catch {
    // storage quota — fail silently
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export type SyncStatus = "idle" | "loading" | "saving" | "saved" | "error";

export function useChecklist(userId: string | null) {
  const isAuthenticated = userId !== null && userId !== "guest";

  // Initialise from localStorage immediately (avoids flash of empty state)
  const [checked, setChecked] = useState<Set<string>>(() =>
    readLocal(userId ?? "guest")
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");

  // Debounce timer ref for the save call
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track whether the initial load from backend has happened
  const didLoadRef = useRef(false);

  // ── On userId change: reload from backend (or localStorage for guests) ──────
  useEffect(() => {
    didLoadRef.current = false;

    if (!isAuthenticated) {
      // Guest — use localStorage only
      setChecked(readLocal("guest"));
      setSyncStatus("idle");
      return;
    }

    // Authenticated — fetch from backend; show local data in the meantime
    setChecked(readLocal(userId));
    setSyncStatus("loading");

    fetchChecklist()
      .then((res) => {
        const backendSet = new Set<string>(res.checked_ids);
        setChecked(backendSet);
        // Also update localStorage as a cache
        writeLocal(userId, backendSet);
        setSyncStatus("idle");
      })
      .catch(() => {
        // Network error — silently keep local copy, show error indicator
        setSyncStatus("error");
      })
      .finally(() => {
        didLoadRef.current = true;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ── Persist on every change (after initial load) ──────────────────────────
  useEffect(() => {
    const key = userId ?? "guest";

    // Always mirror to localStorage as a fast cache / offline fallback
    writeLocal(key, checked);

    // Only push to backend for logged-in users, and only after initial load
    if (!isAuthenticated || !didLoadRef.current) return;

    // Debounce: wait 800 ms after the last toggle before sending
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSyncStatus("saving");

    saveTimer.current = setTimeout(() => {
      saveChecklist([...checked])
        .then(() => setSyncStatus("saved"))
        .catch(() => setSyncStatus("error"))
        .finally(() => {
          // Reset "saved" indicator after 2 s
          setTimeout(() => setSyncStatus("idle"), 2000);
        });
    }, 800);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const toggle = useCallback((id: string) => {
    didLoadRef.current = true; // allow saves triggered by user interaction
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    didLoadRef.current = true;
    setChecked(new Set());
  }, []);

  // ── Derived progress ──────────────────────────────────────────────────────
  const progress = useMemo(() => {
    const total = TOTAL_ITEMS;
    const done = [...checked].filter((id) =>
      CHECKLIST_DATA.some((cat) => cat.items.some((item) => item.id === id))
    ).length;
    const criticalDone = CRITICAL_ITEMS.filter((id) => checked.has(id)).length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    const criticalPct =
      CRITICAL_ITEMS.length === 0
        ? 0
        : Math.round((criticalDone / CRITICAL_ITEMS.length) * 100);

    let readinessLabel: "CRITICAL" | "LOW" | "MODERATE" | "HIGH" | "READY";
    if (pct === 100) readinessLabel = "READY";
    else if (pct >= 75) readinessLabel = "HIGH";
    else if (pct >= 50) readinessLabel = "MODERATE";
    else if (pct >= 25) readinessLabel = "LOW";
    else readinessLabel = "CRITICAL";

    return { done, total, pct, criticalDone, criticalPct, readinessLabel };
  }, [checked]);

  return { checked, toggle, reset, progress, syncStatus };
}
