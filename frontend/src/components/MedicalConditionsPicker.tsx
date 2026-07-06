import { MEDICAL_CONDITION_PRESETS } from "../types/auth";
import { motion } from "framer-motion";

interface Props {
  selected: string[];
  onChange: (next: string[]) => void;
}

export default function MedicalConditionsPicker({ selected, onChange }: Props) {
  const otherEntries = selected.filter((c) => !MEDICAL_CONDITION_PRESETS.includes(c));
  const otherText = otherEntries.join(", ");

  function togglePreset(condition: string) {
    if (selected.includes(condition)) {
      onChange(selected.filter((c) => c !== condition));
    } else {
      onChange([...selected, condition]);
    }
  }

  function handleOtherChange(value: string) {
    const presetSelections = selected.filter((c) => MEDICAL_CONDITION_PRESETS.includes(c));
    const others = value.split(",").map((s) => s.trim()).filter(Boolean);
    onChange([...presetSelections, ...others]);
  }

  return (
    <div>
      <label className="mb-3 flex items-center gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-emerald-400/70">
          Medical Conditions
        </span>
        <span className="font-mono text-[9px] text-white/25">(optional)</span>
      </label>
      <div className="flex flex-wrap gap-2 mb-3">
        {MEDICAL_CONDITION_PRESETS.map((condition, i) => {
          const active = selected.includes(condition);
          return (
            <motion.button
              type="button"
              key={condition}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => togglePreset(condition)}
              className={`rounded-none border px-3 py-1.5 font-mono text-[10px] tracking-wider transition-all duration-200 ${
                active
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                  : "border-white/10 text-white/50 hover:border-emerald-500/30 hover:text-emerald-400/80 hover:bg-emerald-500/5"
              }`}
            >
              {active && <span className="mr-1.5 text-emerald-400">✓</span>}
              {condition}
            </motion.button>
          );
        })}
      </div>
      <input
        type="text"
        value={otherText}
        onChange={(e) => handleOtherChange(e.target.value)}
        placeholder="Other conditions, comma separated…"
        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none transition-all duration-300 focus:border-emerald-500/50 focus:bg-black/30 focus:shadow-[0_0_15px_rgba(16,185,129,0.08)] font-mono"
      />
    </div>
  );
}