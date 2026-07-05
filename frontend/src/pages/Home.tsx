import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AlertBanner from "../components/AlertBanner";

const STATUS = [
  {
    label: "AI Emergency Assistant",
    detail: "Personalized plans generated on demand",
    status: "ONLINE",
    dot: "bg-success",
  },
  {
    label: "Shelters & routes",
    detail: "Map data is illustrative for this build",
    status: "DEMO DATA",
    dot: "bg-warning",
  },
  {
    label: "Preparedness checklist",
    detail: "Go-bag tracker, ships later this week",
    status: "IN PROGRESS",
    dot: "bg-action",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas">
      <section className="bg-base">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 pb-14 pt-20 text-center">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-action"
          >
            Crisis Compass · AI-Powered Emergency Guidance
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl"
          >
            A flood warning just went out.
            <br />
            <span className="text-action">You'll know exactly what to do.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 max-w-xl text-white/60"
          >
            Describe what's happening. Crisis Compass turns it into a personalized
            evacuation plan, the nearest shelter, a safe route, and what to pack,
            built around your own medical needs.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Link
              to="/assistant"
              className="inline-block rounded-xl bg-action px-6 py-3 font-display font-semibold text-white shadow-sm transition hover:bg-action/90"
            >
              Try the AI Assistant
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <AlertBanner
            label="Live demo"
            message="Flood warning · District 4 · Issued 14:32"
            tone="warning"
          />
        </motion.div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-base/40">
          System status
        </p>
        <div className="mt-4 divide-y divide-base/10 rounded-2xl border border-base/10 bg-white">
          {STATUS.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dot}`} />
                <div>
                  <p className="font-display text-sm font-semibold text-base">{item.label}</p>
                  <p className="text-xs text-base/50">{item.detail}</p>
                </div>
              </div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-base/50">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}