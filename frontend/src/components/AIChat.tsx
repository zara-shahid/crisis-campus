import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getEmergencyPlan } from "../services/api";
import type { EmergencyPlan } from "../types/emergency";
import RiskBadge from "./RiskBadge";

// ── Suggestion chips ──────────────────────────────────────────────────────────
const EXAMPLES = [
  { icon: "🔥", text: "Smoke coming from the apartment below mine" },
  { icon: "🌊", text: "Flood warning issued, alone with my grandmother" },
  { icon: "🏚️", text: "Earthquake just hit, stuck in a stairwell" },
];

// ── Report section field ──────────────────────────────────────────────────────
function ReportField({ title, items, accent, icon }: {
  title: string; items: string[]; accent: string; icon: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t border-white/[0.06] py-4 first:border-t-0"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">{icon}</span>
        <h3 className={`font-mono text-[10px] font-bold uppercase tracking-[0.25em] ${accent}`}>
          {title}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-current to-transparent opacity-20" />
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex gap-3 text-sm text-white/85 leading-relaxed"
          >
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${accent.replace("text-", "bg-")} opacity-70`} />
            {item}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

// ── Report ID generator ───────────────────────────────────────────────────────
function generateReportId() {
  const now = new Date();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CC-${now.getFullYear()}-${rand}`;
}

// ── Thinking/Loading animation ────────────────────────────────────────────────
function AnalyzingLoader() {
  const steps = [
    "Parsing situation context…",
    "Assessing threat level…",
    "Generating action plan…",
    "Personalizing recommendations…",
  ];
  const [step, setStep] = useState(0);

  useState(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % steps.length);
    }, 700);
    return () => clearInterval(interval);
  });

  return (
    <div className="flex flex-col items-center gap-5 py-10">
      {/* Radar-style animation */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping" />
        <div className="absolute inset-2 rounded-full border border-emerald-500/30 animate-ping" style={{ animationDelay: "0.2s" }} />
        <div className="absolute inset-4 rounded-full border border-emerald-500/40 animate-ping" style={{ animationDelay: "0.4s" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">🛰️</span>
        </div>
      </div>
      <div className="text-center">
        <p className="font-display font-bold text-white text-sm">Analyzing…</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="font-mono text-[10px] text-emerald-400/70 tracking-widest uppercase mt-1"
          >
            {steps[step]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AIChat({ medicalConditions = [] }: { medicalConditions?: string[] }) {
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<EmergencyPlan | null>(null);
  const [report, setReport] = useState<{ id: string; time: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!situation.trim()) return;
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const result = await getEmergencyPlan({ situation, medical_conditions: medicalConditions });
      setPlan(result);
      setReport({
        id: generateReportId(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      });
    } catch (err) {
      setError("Couldn't reach the AI Emergency Assistant. Check that the backend is running and GROQ_API_KEY is set.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* ── Input Panel ─────────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl border-t border-t-white/20 border-b border-b-black/60 border-x border-x-white/5 bg-white/[0.04] backdrop-blur-md shadow-[0_24px_60px_rgba(0,0,0,0.55)] overflow-hidden">
        {/* Corner HUD marks */}
        <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-emerald-500/40 pointer-events-none" />
        <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-emerald-500/40 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-emerald-500/20 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-emerald-500/20 pointer-events-none" />

        <div className="px-6 pt-6 pb-5">
          {/* Panel header */}
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-emerald-400/70">
              SITUATION REPORT
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                id="situation"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                rows={4}
                placeholder="Describe your emergency situation in detail…"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white text-sm placeholder:text-white/25 outline-none transition-all duration-300 focus:border-emerald-500/50 focus:bg-black/30 focus:shadow-[0_0_20px_rgba(16,185,129,0.1)] resize-none font-body leading-relaxed"
              />
              {situation.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-3 right-3 font-mono text-[9px] text-white/20 tracking-widest"
                >
                  {situation.length} chars
                </motion.div>
              )}
            </div>

            {/* Example chips */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-white/20">Example situations:</span>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    type="button"
                    key={ex.text}
                    onClick={() => setSituation(ex.text)}
                    className="group flex items-center gap-1.5 rounded-none border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/50 transition-all duration-200 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-400"
                  >
                    <span>{ex.icon}</span>
                    <span className="font-mono text-[10px] truncate max-w-[200px]">{ex.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading || !situation.trim()}
              whileHover={!loading && situation.trim() ? { scale: 1.01 } : {}}
              whileTap={!loading && situation.trim() ? { scale: 0.99 } : {}}
              className="relative w-full rounded-xl py-3.5 font-display font-bold text-sm tracking-wider uppercase overflow-hidden transition-all duration-300
                disabled:cursor-not-allowed disabled:opacity-40
                enabled:bg-emerald-600 enabled:shadow-[0_0_25px_rgba(16,185,129,0.35)] enabled:hover:shadow-[0_0_40px_rgba(16,185,129,0.55)]"
            >
              {/* Animated shine */}
              {!loading && situation.trim() && (
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
              )}
              <span className="relative z-10">
                {loading ? "Generating Plan…" : "⚡ Generate Emergency Plan"}
              </span>
            </motion.button>
          </form>
        </div>
      </div>

      {/* ── Output Area ───────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="rounded-2xl border-t border-t-white/15 border-b border-b-black/50 border-x border-x-white/5 bg-white/[0.03] backdrop-blur-md shadow-[0_16px_40px_rgba(0,0,0,0.4)] overflow-hidden"
          >
            <AnalyzingLoader />
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-md p-5 flex items-start gap-3"
          >
            <span className="text-red-400 text-lg mt-0.5">⚠</span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-red-400/80 mb-1">Connection Error</p>
              <p className="text-sm text-red-400/70">{error}</p>
            </div>
          </motion.div>
        )}

        {plan && report && (
          <motion.div
            key="plan"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border-t border-t-white/20 border-b border-b-black/60 border-x border-x-white/5 bg-white/[0.04] backdrop-blur-md shadow-[0_24px_60px_rgba(0,0,0,0.55)] overflow-hidden"
          >
            {/* Alert banner for critical/high */}
            {(plan.danger_level === "critical" || plan.danger_level === "high") && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                className="border-b border-red-500/20 bg-red-500/10 px-6 py-3 flex items-center gap-3"
              >
                <span className="text-red-400 animate-pulse text-lg">🚨</span>
                <p className="font-mono text-[10px] uppercase tracking-widest text-red-400">
                  {plan.danger_level === "critical" ? "CRITICAL RISK — RESPOND IMMEDIATELY" : "HIGH RISK DETECTED — ACT NOW"}
                </p>
              </motion.div>
            )}

            {/* Report header */}
            <div className="px-6 pt-5 pb-4 border-b border-white/[0.06]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-emerald-400/70">
                      INCIDENT REPORT
                    </span>
                    <div className="h-px w-12 bg-emerald-500/20" />
                  </div>
                  <p className="font-mono text-[10px] text-white/30 tracking-widest">
                    #{report.id} · Generated {report.time}
                  </p>
                </div>
                <RiskBadge level={plan.danger_level} />
              </div>
            </div>

            {/* Situation summary */}
            <div className="px-6 pt-4 pb-2">
              <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] px-4 py-3">
                <p className="font-mono text-[9px] uppercase tracking-widest text-emerald-400/60 mb-1.5">Situation Assessment</p>
                <p className="text-sm text-white/80 leading-relaxed">{plan.situation}</p>
              </div>
            </div>

            {/* Report fields */}
            <div className="px-6 pb-6">
              <ReportField title="Immediate Actions" items={plan.immediate_actions} accent="text-red-400" icon="⚡" />
              <ReportField title="Things to Carry" items={plan.things_to_carry} accent="text-emerald-400" icon="🎒" />
              <ReportField title="Nearby Help" items={plan.nearby_help} accent="text-cyan-400" icon="🏥" />
              <ReportField title="Safety Tips" items={plan.safety_tips} accent="text-amber-400" icon="🛡️" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}