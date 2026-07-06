import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GeoSphere from "../components/GeoSphere";
import AIChat from "../components/AIChat";

function ScrambleText({ text }: { text: string }) {
  const [display, setDisplay] = useState("");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text.split("").map((char, index) => {
          if (index < iteration) return text[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
    return () => clearInterval(interval);
  }, [text]);
  return <>{display}</>;
}

export default function Assistant() {
  const { user } = useAuth();
  const conditions = user?.medical_conditions ?? [];

  return (
    <div className="flex flex-col min-h-screen bg-[#050B08] text-white overflow-x-hidden selection:bg-emerald-500/30">

      {/* ── 3D Globe Background ────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-25 mix-blend-screen overflow-hidden">
        <GeoSphere />
      </div>

      {/* ── Moving Grid ───────────────────────────────────────────────────────── */}
      <motion.div
        animate={{ backgroundPosition: ["0px 0px", "50px 50px"] }}
        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
        className="fixed inset-[-50px] pointer-events-none z-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16,185,129,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* ── Ambient Orbs ──────────────────────────────────────────────────────── */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.07, 0.13, 0.07], x: [0, 40, 0], y: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-[-20%] left-[-5%] w-[60vw] h-[60vw] rounded-full bg-emerald-900/40 blur-[130px] pointer-events-none z-0"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.08, 0.04], x: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-900/30 blur-[120px] pointer-events-none z-0"
      />

      {/* ── HUD Corner Decorators ─────────────────────────────────────────────── */}
      <div className="fixed top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-emerald-500/30 pointer-events-none z-40 hidden md:block" />
      <div className="fixed top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-emerald-500/30 pointer-events-none z-40 hidden md:block" />
      <div className="fixed bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-emerald-500/30 pointer-events-none z-40 hidden md:block" />
      <div className="fixed bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-emerald-500/30 pointer-events-none z-40 hidden md:block" />

      <main className="relative z-10 mx-auto w-full max-w-3xl px-4 sm:px-6 py-12">

        {/* ── Page Header ───────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-10 relative"
        >
          {/* Back link top-left */}
          <Link
            to="/dashboard"
            className="absolute left-0 top-1 group flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-400/50 hover:text-emerald-400 transition-colors border border-emerald-500/15 px-3 py-1.5 hover:bg-emerald-500/10 hover:border-emerald-500/40"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Dashboard
          </Link>

          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-sm bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-sm h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400">
              <ScrambleText text="AI EMERGENCY ASSISTANT · UPLINK ACTIVE" />
            </span>
          </div>

          <h1 className="font-display font-black text-4xl lg:text-5xl text-white tracking-tight mb-3">
            Tell us what's{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              happening
            </span>
          </h1>
          <p className="font-mono text-[9px] text-white/60 leading-relaxed">
            Describe your emergency and receive a clear, personalized action plan in seconds
          </p>

          {conditions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 inline-flex items-center gap-2 border border-emerald-500/20 bg-emerald-500/5 rounded-none px-4 py-2"
            >
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="font-mono text-[10px] text-emerald-400/80 tracking-widest uppercase">
                Personalized for: {conditions.join(", ")}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* ── Chat Component ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <AIChat medicalConditions={conditions} />
        </motion.div>

        {/* ── Footer ────────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-emerald-500/15 pt-6 relative"
        >
          <div className="absolute top-0 left-0 w-16 h-px bg-emerald-400/60" />
          <div className="absolute top-0 right-0 w-16 h-px bg-emerald-400/60" />
          <div className="flex items-center gap-6 font-mono text-[9px] uppercase tracking-[0.3em] text-emerald-400/40">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              AI_CORE: ONLINE
            </span>
            <span className="hidden sm:inline">GROQ_LLM: ACTIVE</span>
          </div>
          <span className="font-mono text-[9px] text-white/20 tracking-widest">
            Crisis Compass AI · Emergency Response
          </span>
        </motion.div>
      </main>
    </div>
  );
}