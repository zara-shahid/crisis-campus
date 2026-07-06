import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import GeoSphere from "../components/GeoSphere";
import PreparednessChecklist from "../components/PreparednessChecklist";

// ── Animated Counter ──────────────────────────────────────────────────────────
function ScrambleText({ text }: { text: string }) {
  const [display, setDisplay] = useState("");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((char, index) => {
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
    return () => clearInterval(interval);
  }, [text]);
  return <>{display}</>;
}

export default function ChecklistPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#050B08] text-white overflow-x-hidden selection:bg-emerald-500/30">

      {/* ── 3D Globe Background ─────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30 mix-blend-screen overflow-hidden">
        <GeoSphere />
      </div>

      {/* ── Moving Grid ─────────────────────────────────────────────────────── */}
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

      {/* ── Ambient Orbs ────────────────────────────────────────────────────── */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.14, 0.08] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-emerald-900/50 blur-[120px] pointer-events-none z-0"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="fixed bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-cyan-900/30 blur-[100px] pointer-events-none z-0"
      />

      {/* ── HUD Corner Decorators ────────────────────────────────────────────── */}
      <div className="fixed top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-emerald-500/30 pointer-events-none z-40 hidden md:block" />
      <div className="fixed top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-emerald-500/30 pointer-events-none z-40 hidden md:block" />
      <div className="fixed bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-emerald-500/30 pointer-events-none z-40 hidden md:block" />
      <div className="fixed bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-emerald-500/30 pointer-events-none z-40 hidden md:block" />

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-emerald-500/10 pb-6 relative"
        >
          {/* Decorative accent lines */}
          <div className="absolute bottom-0 left-0 w-32 h-px bg-gradient-to-r from-emerald-400 to-transparent" />
          <div className="absolute bottom-0 right-0 w-32 h-px bg-gradient-to-l from-emerald-400 to-transparent" />

          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-sm bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-sm h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400">
                <ScrambleText text="CRISIS COMPASS · READINESS PROTOCOL" />
              </span>
            </div>
            <h1 className="font-display font-black text-4xl lg:text-5xl text-white tracking-tight">
              Emergency{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Preparedness
              </span>
            </h1>
            <p className="text-emerald-400/50 font-mono text-xs mt-2.5 tracking-widest uppercase">
              Track household readiness <span className="text-white/20 mx-2">|</span> FEMA / Red Cross guidelines
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/dashboard"
              className="group flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-400/60 hover:text-emerald-400 transition-colors border border-emerald-500/20 px-4 py-2 hover:bg-emerald-500/10 hover:border-emerald-500/40"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Dashboard
            </Link>
          </div>
        </motion.div>

        {/* ── Checklist Component ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <PreparednessChecklist />
        </motion.div>

        {/* ── Footer ──────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-emerald-500/20 pt-6 relative"
        >
          <div className="absolute top-0 left-0 w-16 h-px bg-emerald-400" />
          <div className="absolute top-0 right-0 w-16 h-px bg-emerald-400" />
          <div className="flex items-center gap-8 font-mono text-[9px] uppercase tracking-[0.3em] text-emerald-400/40">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              CC_OS v0.1.0
            </span>
            <span className="hidden sm:inline">FEMA_COMPLIANT: YES</span>
          </div>
          <span className="font-mono text-[9px] text-white/20 tracking-widest">
            Based on FEMA / Red Cross guidelines
          </span>
        </motion.div>
      </main>
    </div>
  );
}
