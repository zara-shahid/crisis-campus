import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import AlertBanner from "../components/AlertBanner";
import GeoSphere from "../components/GeoSphere";

// ── Typewriter for coordinates ────────────────────────────────────────────────
function Typewriter({ text, delay = 0 }: { text: string; delay?: number }) {
  const [out, setOut] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => {
        i++;
        setOut(text.slice(0, i));
        if (i >= text.length) clearInterval(iv);
      }, 22);
      return () => clearInterval(iv);
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [text, delay]);
  return <>{out}</>;
}

// ── Glitch text effect ────────────────────────────────────────────────────────
function GlitchWord({ children }: { children: string }) {
  return (
    <span className="relative inline-block group">
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className="absolute inset-0 text-red-400 opacity-0 group-hover:opacity-60 translate-x-[2px] translate-y-[1px] pointer-events-none transition-opacity duration-75"
      >
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 text-emerald-300 opacity-0 group-hover:opacity-60 -translate-x-[2px] -translate-y-[1px] pointer-events-none transition-opacity duration-75"
      >
        {children}
      </span>
    </span>
  );
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, label }: { to: number; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let start = 0;
      const step = Math.ceil(to / 40);
      const iv = setInterval(() => {
        start += step;
        if (start >= to) { setCount(to); clearInterval(iv); }
        else setCount(start);
      }, 30);
      observer.disconnect();
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);
  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-4xl font-bold text-white tabular-nums">{count.toLocaleString()}+</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/40">{label}</div>
    </div>
  );
}

const STATUS = [
  { label: "AI Emergency Assistant", detail: "Real-time personalized plans", status: "ONLINE", color: "emerald" },
  { label: "Shelter & Route Finder", detail: "Nearest safe locations mapped", status: "DEMO", color: "amber" },
  { label: "Preparedness Checklist", detail: "Go-bag tracker & alerts", status: "BUILDING", color: "sky" },
  { label: "Community Help Board", detail: "Post needs for water, food, shelter, rides", status: "ONLINE", color: "emerald" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-canvas text-white overflow-x-hidden">

      {/* ── Live Ticker ────────────────────────────────────────────────────── */}
      <div className="relative w-full bg-emerald-950/40 border-b border-emerald-500/20 py-1.5 overflow-hidden z-50 flex items-center">
        <div className="absolute left-0 h-full w-16 bg-gradient-to-r from-canvas to-transparent z-10" />
        <div className="absolute right-0 h-full w-16 bg-gradient-to-l from-canvas to-transparent z-10" />
        <div className="flex gap-10 whitespace-nowrap animate-[marquee_25s_linear_infinite] font-mono text-[10px] uppercase tracking-widest text-emerald-400 px-4">
          <span>LAT: 34.0522° N · LNG: 118.2437° W</span>
          <span className="text-amber-400">⚠ WEATHER: SEVERE FLOOD WARNING — SECTOR 7</span>
          <span>SEISMIC: NOMINAL</span>
          <span className="text-emerald-300">AI SYSTEMS: OPERATIONAL</span>
          <span>SATELLITE UPLINK: ACTIVE</span>
          <span>RESPONSE TIME: &lt; 3 SECONDS</span>
          <span>LAT: 34.0522° N · LNG: 118.2437° W</span>
          <span className="text-amber-400">⚠ WEATHER: SEVERE FLOOD WARNING — SECTOR 7</span>
        </div>
      </div>

      {/* ── HERO: Asymmetric Split Layout ──────────────────────────────────── */}
      <main className="relative flex-1">
        
        {/* Tactical grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16,185,129,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Corner HUD marks */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-emerald-500/30 pointer-events-none" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-emerald-500/30 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-emerald-500/30 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-emerald-500/30 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 py-16 lg:py-24 min-h-[85vh] flex flex-col justify-center">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* ── LEFT: Text ─────────────────────────────────────────────── */}
            <div className="flex flex-col">
              
              {/* Status badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-3 self-start mb-8"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
                  System Active · AI-Powered Crisis Guidance
                </span>
              </motion.div>

              {/* Giant headline — per-line masked slide-up */}
              <h1 className="font-display font-black leading-[1.05] tracking-[-0.02em]">

                {/* Line 1 */}
                <div className="overflow-hidden">
                  <motion.span
                    initial={{ y: "110%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="block text-[clamp(2rem,5vw,3.8rem)] text-white/90 font-black"
                  >
                    When crisis
                  </motion.span>
                </div>

                {/* Line 2 */}
                <div className="overflow-hidden">
                  <motion.span
                    initial={{ y: "110%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="block text-[clamp(2rem,5vw,3.8rem)] text-white/90 font-black"
                  >
                    strikes, you
                  </motion.span>
                </div>

                {/* Line 3 — mixed: gradient "act—not" + outlined "panic" */}
                <div className="overflow-hidden">
                  <motion.span
                    initial={{ y: "110%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-wrap items-baseline gap-x-3 text-[clamp(2rem,5vw,3.8rem)]"
                  >
                    {/* "act not" — solid emerald gradient */}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-400 font-black italic">
                      act not
                    </span>
                    {/* "panic." — outlined/stroke style for contrast */}
                    <motion.span
                      animate={{
                        textShadow: [
                          "0 0 0px rgba(16,185,129,0)",
                          "0 0 20px rgba(16,185,129,0.8)",
                          "0 0 0px rgba(16,185,129,0)",
                        ],
                      }}
                      transition={{ repeat: Infinity, duration: 3, delay: 1.5 }}
                      className="font-black text-transparent"
                      style={{
                        WebkitTextStroke: "2px rgba(16,185,129,0.7)",
                        paintOrder: "stroke fill",
                      }}
                    >
                      panic
                    </motion.span>
                  </motion.span>
                </div>
              </h1>


              {/* Thin separator */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="origin-left w-24 h-[2px] bg-gradient-to-r from-emerald-500 to-transparent my-8"
              />

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="text-white/50 text-lg leading-relaxed max-w-md font-light"
              >
                Describe your emergency. Crisis Compass generates a{" "}
                <span className="text-white/80 font-medium">personalized evacuation plan</span>,
                nearest shelter, safe routes, and a go-bag list—
                built around <span className="text-white/80 font-medium">your medical profile</span>.
              </motion.p>

              {/* Coordinate readout */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-6 font-mono text-[11px] text-emerald-500/60 tracking-widest"
              >
                <Typewriter text="› POSITION ACQUIRED: 34.0522° N, 118.2437° W" delay={1.3} />
              </motion.div>

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="mt-10 flex flex-wrap gap-4"
              >
                <Link
                  to="/assistant"
                  className="group relative overflow-hidden inline-flex items-center gap-3 rounded-lg bg-emerald-500 px-8 py-4 font-display font-bold text-black text-sm tracking-wide shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.65)] transition-all duration-300 hover:scale-[1.03]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative">Launch Emergency Assistant</span>
                  <span className="relative text-base font-black group-hover:translate-x-1 transition-transform duration-200">→</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-8 py-4 font-display font-semibold text-white/70 text-sm tracking-wide hover:border-white/30 hover:text-white hover:bg-white/5 transition-all duration-300"
                >
                  Create Profile
                </Link>
              </motion.div>
            </div>

            {/* ── RIGHT: 3D Globe + HUD ──────────────────────────────────── */}
            <div className="relative hidden lg:flex items-center justify-center h-[550px]">
              
              {/* Globe container */}
              <div className="relative w-full h-full">
                <GeoSphere />
              </div>

              {/* HUD overlays on globe */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
                className="absolute top-6 right-6 font-mono text-[9px] text-emerald-400/70 tracking-widest space-y-1 text-right"
              >
                <div>ALT: 6,371 KM</div>
                <div>SCAN: ACTIVE</div>
                <div className="text-amber-400/70">ALERTS: 3</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 }}
                className="absolute bottom-6 left-6 font-mono text-[9px] text-emerald-400/70 tracking-widest space-y-1"
              >
                <div>MODE: REAL-TIME</div>
                <div>FEED: SATELLITE</div>
                <div>STATUS: NOMINAL</div>
              </motion.div>

              {/* Crosshair at center of globe */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-6 h-6">
                  <div className="absolute top-1/2 left-0 w-full h-px bg-emerald-500/40" />
                  <div className="absolute left-1/2 top-0 h-full w-px bg-emerald-500/40" />
                  <div className="absolute inset-1 rounded-full border border-emerald-500/30 animate-ping" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats row ──────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="mt-20 grid grid-cols-3 gap-8 border-t border-white/5 pt-12"
          >
            <Counter to={12000} label="People Assisted" />
            <Counter to={98} label="Plan Accuracy %" />
            <Counter to={3} label="Second Response" />
          </motion.div>
        </div>

        {/* ── Alert banner ───────────────────────────────────────────────── */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 pb-8">
          <AlertBanner
            label="Live demo"
            message="Flood warning · District 4 · Issued 14:32"
            tone="warning"
          />
        </div>
      </main>

      {/* ── System Status (HUD cards) ──────────────────────────────────────── */}
      <section className="relative z-10 border-t border-white/5 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 lg:px-12 py-16">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">System Status</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATUS.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 + i * 0.1 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="relative group overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.03] p-6 backdrop-blur-sm hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all duration-300"
              >
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                
                <div className="flex items-center justify-between mb-4">
                  <span className={`font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm ${
                    item.status === "ONLINE"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : item.status === "DEMO"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                  }`}>
                    {item.status}
                  </span>
                  <div className={`h-2 w-2 rounded-full ${
                    item.status === "ONLINE" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" :
                    item.status === "DEMO" ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,1)]" :
                    "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,1)]"
                  } animate-pulse`} />
                </div>
                <p className="font-display font-semibold text-white group-hover:text-emerald-300 transition-colors text-sm mb-1">{item.label}</p>
                <p className="text-white/40 text-xs">{item.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}