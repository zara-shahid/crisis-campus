import { Link } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import WeatherCard from "../components/WeatherCard";
import RiskBadge from "../components/RiskBadge";
import ShelterLocator from "../components/ShelterLocator";
import QuickSOS from "../components/QuickSOS";
import GeoSphere from "../components/GeoSphere";
import { useAlerts } from "../hooks/useAlerts";

// ── Scramble Text Effect ───────────────────────────────────────────────────────
function ScrambleText({ text }: { text: string }) {
  const [display, setDisplay] = useState("");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay((prev) =>
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

// ── Live Clock & Hex Status ────────────────────────────────────────────────────
function LiveStatusClock() {
  const [time, setTime] = useState(new Date());
  const [hex, setHex] = useState("0x0000");

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      if (Math.random() > 0.7) {
        setHex(`0x${Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(4, '0')}`);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-end">
      <div className="font-mono text-[10px] text-emerald-400 tracking-widest">
        T-{time.toISOString().split("T")[1].slice(0, 11)}Z
      </div>
      <div className="font-mono text-[8px] text-white/50 tracking-[0.2em] mt-0.5">
        SYS_STATUS: {hex}
      </div>
    </div>
  );
}

// ── Background & Ambient Effects ───────────────────────────────────────────────
function DynamicBackground() {
  return (
    <>
      {/* 3D Globe */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen overflow-hidden">
        <GeoSphere />
      </div>

      {/* Moving tactical grid */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ backgroundPosition: ["0px 0px", "50px 50px"] }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          className="absolute inset-[-50px] opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16,185,129,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Ambient Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-emerald-900/40 blur-[120px] pointer-events-none z-0"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.05, 0.1, 0.05],
          x: [0, -40, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-900/30 blur-[100px] pointer-events-none z-0"
      />

      {/* Subtle Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4=')] mix-blend-overlay" />
    </>
  );
}

// ── Section Title ──────────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 group">
      <div className="w-2 h-2 border border-emerald-500/50 group-hover:bg-emerald-500/50 transition-colors" />
      <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-emerald-400/60 group-hover:text-emerald-400 transition-colors">
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 via-transparent to-transparent" />
    </div>
  );
}

// ── Main Dashboard Component ───────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const { data: alertsData } = useAlerts();

  const riskLevel = alertsData?.level || "low";
  const alertsList = alertsData?.alerts || [];

  // Staggered entry variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050B08] text-white overflow-x-hidden selection:bg-emerald-500/30">
      <DynamicBackground />

      {/* HUD Corner Decorators */}
      <div className="fixed top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-emerald-500/30 pointer-events-none z-40 hidden md:block" />
      <div className="fixed top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-emerald-500/30 pointer-events-none z-40 hidden md:block" />
      <div className="fixed bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-emerald-500/30 pointer-events-none z-40 hidden md:block" />
      <div className="fixed bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-emerald-500/30 pointer-events-none z-40 hidden md:block" />

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12 py-12">
        {/* ── Page header ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-emerald-500/10 pb-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-sm bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-sm h-2 w-2 bg-red-500" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400">
                <ScrambleText text="COMMAND CENTER · UPLINK ESTABLISHED" />
              </span>
            </div>
            <h1 className="font-display font-black text-4xl lg:text-5xl text-white tracking-tight drop-shadow-lg">
              {user ? (
                <>Welcome, <span className="text-emerald-400">{user.name.split(" ")[0]}</span>.</>
              ) : (
                "Emergency Dashboard"
              )}
            </h1>
            <p className="text-emerald-400/80 font-mono text-xs mt-2.5 tracking-widest uppercase">
              Situational overview <span className="text-white/40 mx-2">|</span> All systems nominal
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-4">
            <LiveStatusClock />
            <div className="flex gap-3">
              <Link
                to="/assistant"
                className="group relative inline-flex items-center gap-2 rounded-none bg-emerald-500/10 border border-emerald-500/30 px-5 py-2 font-display font-bold text-emerald-400 text-sm hover:bg-emerald-500/20 hover:border-emerald-500/60 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] overflow-hidden"
              >
                {/* Glint effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent group-hover:animate-[glint_1s_ease-in-out_infinite]" />
                <span className="relative z-10 uppercase tracking-wider">AI Assistant</span>
                <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              {user && (
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 rounded-none border border-white/10 bg-white/5 px-5 py-2 font-display font-semibold text-white/60 text-sm hover:border-white/30 hover:text-white hover:bg-white/10 transition-all duration-300 uppercase tracking-wider"
                >
                  Profile
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="show">
          {/* ── Top row: Weather + Risk ───────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="mb-2">
            <SectionLabel label="Situational Awareness" />
          </motion.div>
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            <div className="xl:col-span-2 group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              <div className="relative h-full">
                <WeatherCard />
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-amber-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              <div className="relative h-full">
                <RiskBadge level={riskLevel} alerts={alertsList} card />
              </div>
            </div>
          </motion.div>

          {/* ── Bottom row: Shelter map (wide) + SOS ──────────────────────────────── */}
          <motion.div variants={itemVariants} className="mb-2">
            <SectionLabel label="Tactical Response Tools" />
          </motion.div>
          <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-12">
            <div className="xl:col-span-2 group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-b from-emerald-500/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000" />
              <div className="relative h-full">
                <ShelterLocator />
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/30 to-red-600/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative h-full">
                <QuickSOS />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Footer status bar ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-emerald-500/20 pt-6 relative"
        >
          {/* Decorative bottom lines */}
          <div className="absolute top-0 left-0 w-24 h-px bg-emerald-400" />
          <div className="absolute top-0 right-0 w-24 h-px bg-emerald-400" />

          <div className="flex items-center gap-8 font-mono text-[9px] uppercase tracking-[0.3em] text-emerald-400/70">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              CC_OS v0.1.0
            </span>
            <span className="hidden sm:inline">AI_CORE: ACTIVE</span>
            <span className="hidden sm:inline">SAT_LINK: ESTABLISHED</span>
          </div>
          <Link
            to="/"
            className="group flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-400/60 hover:text-emerald-400 transition-colors border border-emerald-500/20 px-3 py-1.5 hover:bg-emerald-500/10"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Abort to Surface
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
