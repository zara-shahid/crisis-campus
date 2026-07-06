import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CONFIRM_SECONDS = 5;

type Phase = "idle" | "confirm" | "sending" | "sent";

export default function QuickSOS() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(CONFIRM_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown tick
  useEffect(() => {
    if (phase !== "confirm") return;
    setCountdown(CONFIRM_SECONDS);
    intervalRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(intervalRef.current!);
          triggerSOS();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function triggerSOS() {
    setPhase("sending");
    // Simulate network call – replace with real API
    setTimeout(() => setPhase("sent"), 2200);
  }

  function cancel() {
    clearInterval(intervalRef.current!);
    setPhase("idle");
  }

  function reset() {
    setPhase("idle");
  }

  const circumference = 2 * Math.PI * 22; // r=22
  const dashOffset = circumference * (1 - countdown / CONFIRM_SECONDS);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl border-t border-t-white/20 border-b border-b-black/60 border-x border-x-white/5 bg-white/[0.04] backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.5)] p-6 overflow-hidden h-full flex flex-col"
    >
      {/* Corner HUD marks */}
      <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-red-500/30 pointer-events-none" />
      <div className="absolute top-3 right-3 w-4 h-4 border-r border-t border-red-500/30 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-l border-b border-red-500/30 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-red-500/30 pointer-events-none" />

      {/* Pulsing background glow on confirm */}
      <AnimatePresence>
        {phase === "confirm" && (
          <motion.div
            key="glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.08, 0.18, 0.08] }}
            transition={{ repeat: Infinity, duration: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-500 pointer-events-none rounded-2xl"
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-red-400/70">
            EMERGENCY · SOS
          </span>
          <p className="text-white/55 text-xs font-mono mt-0.5">
            Broadcasts location + profile
          </p>
        </div>
        <span className="text-2xl">🆘</span>
      </div>

      <AnimatePresence mode="wait">
        {/* ── IDLE ─────────────────────────────────────────────────── */}
        {phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex-1 flex flex-col items-center justify-center gap-5"
          >
            <motion.button
              id="sos-button"
              onClick={() => setPhase("confirm")}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="relative w-28 h-28 rounded-full flex items-center justify-center
                bg-red-600 border-4 border-red-400/40
                shadow-[0_0_0_8px_rgba(239,68,68,0.12),0_0_40px_rgba(239,68,68,0.4)]
                hover:shadow-[0_0_0_12px_rgba(239,68,68,0.18),0_0_60px_rgba(239,68,68,0.55)]
                transition-shadow duration-300 group"
              aria-label="Send SOS alert"
            >
              {/* Outer ring pulse */}
              <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-30" />
              <span className="font-display font-black text-2xl text-white tracking-wider">SOS</span>
            </motion.button>

            <div className="text-center">
              <p className="font-mono text-[10px] text-white/60 tracking-widest uppercase">
                Press to activate emergency alert
              </p>
              <p className="font-mono text-[9px] text-white/45 mt-1">
                Contacts emergency services + notifies your emergency contact
              </p>
            </div>

            {/* Info chips */}
            <div className="flex flex-wrap justify-center gap-2">
              {["📍 GPS Location", "🩺 Medical Profile", "📞 Emergency Contact"].map((chip) => (
                <span
                  key={chip}
                  className="font-mono text-[9px] text-white/30 border border-white/[0.08] rounded px-2 py-1"
                >
                  {chip}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── CONFIRM ──────────────────────────────────────────────── */}
        {phase === "confirm" && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex-1 flex flex-col items-center justify-center gap-4"
          >
            {/* Countdown ring */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" width="112" height="112">
                {/* Track */}
                <circle cx="56" cy="56" r="22" fill="none" stroke="rgba(239,68,68,0.15)" strokeWidth="44" />
                {/* Background ring */}
                <circle cx="56" cy="56" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                {/* Progress arc */}
                <circle
                  cx="56"
                  cy="56"
                  r="44"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dashoffset 0.95s linear" }}
                />
              </svg>
              <div className="relative z-10 text-center">
                <span className="font-display font-black text-4xl text-red-400 tabular-nums leading-none">
                  {countdown}
                </span>
                <div className="font-mono text-[9px] text-red-400/60 tracking-widest">SEC</div>
              </div>
            </div>

            <div className="text-center">
              <p className="font-display font-bold text-white text-sm">Confirm SOS alert?</p>
              <p className="font-mono text-[10px] text-white/30 mt-1 tracking-wide">
                Auto-sending in {countdown}s · Tap cancel to abort
              </p>
            </div>

            <div className="flex gap-3 w-full">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={triggerSOS}
                className="flex-1 rounded-xl bg-red-600 py-3 font-display font-bold text-white text-sm
                  shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]
                  transition-shadow duration-200"
              >
                Send Now
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={cancel}
                className="flex-1 rounded-xl border border-white/10 py-3 font-display font-semibold text-white/60 text-sm
                  hover:border-white/20 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── SENDING ──────────────────────────────────────────────── */}
        {phase === "sending" && (
          <motion.div
            key="sending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4 py-4"
          >
            <div className="relative w-20 h-20 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-red-500"
              />
              <span className="text-3xl">📡</span>
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-white text-sm">Transmitting…</p>
              <p className="font-mono text-[10px] text-white/30 mt-1 tracking-widest uppercase animate-pulse">
                Contacting emergency services
              </p>
            </div>
          </motion.div>
        )}

        {/* ── SENT ─────────────────────────────────────────────────── */}
        {phase === "sent" && (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4 py-2"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center
                shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            >
              <span className="text-3xl">✅</span>
            </motion.div>
            <div className="text-center">
              <p className="font-display font-bold text-emerald-400 text-sm">Alert Sent</p>
              <p className="font-mono text-[10px] text-white/30 mt-1 tracking-wide">
                Emergency services notified · Help is on the way
              </p>
            </div>
            <button
              onClick={reset}
              className="font-mono text-[10px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
            >
              ← Reset
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
