import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getEmergencyPlan } from "../services/api";
import type { EmergencyPlan } from "../types/emergency";
import RiskBadge from "./RiskBadge";
import Loader from "./Loader";
import AlertBanner from "./AlertBanner";

const EXAMPLES = [
  "There is smoke coming from the apartment below mine",
  "Flood warning issued for my area, I'm alone with my grandmother",
  "Earthquake just hit, I'm stuck in a stairwell",
];

function ReportField({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: string;
}) {
  return (
    <div className="border-t border-base/10 py-4 first:border-t-0">
      <h3 className={`font-mono text-[11px] font-semibold uppercase tracking-widest ${accent}`}>
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-base/90">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function generateReportId() {
  const now = new Date();
  const y = now.getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CC-${y}-${rand}`;
}

export default function AIChat({
  medicalConditions = [],
}: {
  medicalConditions?: string[];
}) {
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
      console.error(err);
      setError(
        "Couldn't reach the AI Emergency Assistant. Check that the backend is running and GROQ_API_KEY is set."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-3">
        <label htmlFor="situation" className="block font-display text-lg font-semibold text-base">
          Describe what's happening
        </label>
        <textarea
          id="situation"
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          rows={3}
          placeholder="e.g. There is smoke in my building"
          className="w-full rounded-xl border border-base/15 bg-white p-4 text-base shadow-sm outline-none transition focus:border-action focus:ring-2 focus:ring-action/20"
        />
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex}
              onClick={() => setSituation(ex)}
              className="rounded-full border border-base/10 bg-canvas px-3 py-1 text-xs text-base/70 transition hover:border-action/40 hover:text-action"
            >
              {ex}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={loading || !situation.trim()}
          className="w-full rounded-xl bg-action py-3 font-display font-semibold text-white transition hover:bg-action/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Generating plan..." : "Get my emergency plan"}
        </button>
      </form>

      <div className="mt-6">
        {loading && <Loader label="Analyzing situation..." />}
        {error && (
          <p className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
            {error}
          </p>
        )}

        <AnimatePresence>
          {plan && report && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden rounded-2xl border border-base/10 bg-white shadow-sm"
            >
              {(plan.danger_level === "critical" || plan.danger_level === "high") && (
                <AlertBanner
                  label="Alert"
                  message={`${plan.danger_level} risk detected · respond immediately`}
                  tone="danger"
                />
              )}

              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-base/10 pb-4">
                  <div>
                    <p className="font-display text-sm font-semibold uppercase tracking-wide text-base">
                      Incident report
                    </p>
                    <p className="font-mono text-[11px] text-base/50">
                      #{report.id} · generated {report.time}
                    </p>
                  </div>
                  <RiskBadge level={plan.danger_level} />
                </div>

                <p className="mt-4 rounded-lg bg-base/5 p-3 text-sm text-base/90">
                  {plan.situation}
                </p>

                <ReportField title="Immediate actions" items={plan.immediate_actions} accent="text-danger" />
                <ReportField title="Things to carry" items={plan.things_to_carry} accent="text-action" />
                <ReportField title="Nearby help" items={plan.nearby_help} accent="text-success" />
                <ReportField title="Safety tips" items={plan.safety_tips} accent="text-warning" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}