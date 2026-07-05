import type { DangerLevel } from "../types/emergency";

const STYLES: Record<DangerLevel, string> = {
  low: "border-success text-success",
  moderate: "border-warning text-warning",
  high: "border-danger text-danger",
  critical: "border-danger bg-danger text-white",
};

const CODES: Record<DangerLevel, string> = {
  low: "LVL-1",
  moderate: "LVL-2",
  high: "LVL-3",
  critical: "LVL-4",
};

const LABELS: Record<DangerLevel, string> = {
  low: "Low risk",
  moderate: "Moderate risk",
  high: "High risk",
  critical: "Critical — act now",
};

export default function RiskBadge({ level }: { level: DangerLevel }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded border-2 px-3 py-1 font-display text-sm font-semibold ${STYLES[level]}`}
    >
      <span className="font-mono text-[10px] tracking-widest opacity-70">
        {CODES[level]}
      </span>
      <span className="h-3 w-px bg-current opacity-30" />
      {LABELS[level]}
    </span>
  );
}