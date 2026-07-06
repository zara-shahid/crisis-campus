import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/auth";
import { BLOOD_GROUPS } from "../types/auth";
import MedicalConditionsPicker from "../components/MedicalConditionsPicker";
import GeoSphere from "../components/GeoSphere";

// ── Section Label ─────────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1.5 h-1.5 border border-emerald-500/50" />
      <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-emerald-400/60">{label}</span>
      <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent" />
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border-t border-t-white/10 border-b border-b-black/40 border-x border-x-white/5 bg-white/[0.03] backdrop-blur-sm p-4 text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/30 mb-1">{label}</div>
      <div className="font-display font-bold text-sm text-white/80">{value || "—"}</div>
    </div>
  );
}

export default function Profile() {
  const { user, loading, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [bloodGroup, setBloodGroup] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) {
      setBloodGroup(user.blood_group ?? "");
      setConditions(user.medical_conditions ?? []);
      setContactName(user.emergency_contact_name ?? "");
      setContactPhone(user.emergency_contact_phone ?? "");
    }
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({
        blood_group: bloodGroup || undefined,
        medical_conditions: conditions,
        emergency_contact_name: contactName || undefined,
        emergency_contact_phone: contactPhone || undefined,
      });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050B08]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border border-emerald-500/30 animate-ping" style={{ animationDelay: "0.3s" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🛰️</span>
            </div>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400/50 animate-pulse">
            Loading Profile…
          </p>
        </div>
      </div>
    );
  }

  const initials = user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex flex-col min-h-screen bg-[#050B08] text-white overflow-x-hidden selection:bg-emerald-500/30">

      {/* ── 3D Globe Background ───────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-25 mix-blend-screen overflow-hidden">
        <GeoSphere />
      </div>

      {/* ── Moving Grid ──────────────────────────────────────────────────────── */}
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

      {/* ── Ambient Orbs ─────────────────────────────────────────────────────── */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.07, 0.12, 0.07] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-[-20%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-emerald-900/40 blur-[130px] pointer-events-none z-0"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="fixed bottom-[-20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-cyan-900/25 blur-[120px] pointer-events-none z-0"
      />

      {/* ── HUD Corner Decorators ────────────────────────────────────────────── */}
      <div className="fixed top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-emerald-500/30 pointer-events-none z-40 hidden md:block" />
      <div className="fixed top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-emerald-500/30 pointer-events-none z-40 hidden md:block" />
      <div className="fixed bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-emerald-500/30 pointer-events-none z-40 hidden md:block" />
      <div className="fixed bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-emerald-500/30 pointer-events-none z-40 hidden md:block" />

      <main className="relative z-10 mx-auto w-full max-w-2xl px-4 sm:px-6 py-12">

        {/* ── Profile Header ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 border-b border-emerald-500/10 pb-6 relative"
        >
          <div className="absolute bottom-0 left-0 w-24 h-px bg-gradient-to-r from-emerald-400 to-transparent" />
          <div className="absolute bottom-0 right-0 w-24 h-px bg-gradient-to-l from-emerald-400 to-transparent" />

          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl border-t border-t-white/20 border-b border-b-black/50 border-x border-x-white/10 bg-emerald-500/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                <span className="font-display font-black text-xl text-emerald-400">{initials}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#050B08] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-400/60">
                  FIELD OPERATIVE
                </span>
              </div>
              <h1 className="font-display font-black text-2xl text-white">{user.name}</h1>
              <p className="font-mono text-[10px] text-white/60 tracking-widest mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <Link
              to="/dashboard"
              className="group flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-400/50 hover:text-emerald-400 transition-colors border border-emerald-500/15 px-3 py-1.5 hover:bg-emerald-500/10 hover:border-emerald-500/40"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Dashboard
            </Link>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="font-mono text-[9px] uppercase tracking-[0.2em] text-red-400/60 hover:text-red-400 transition-colors border border-red-500/15 px-3 py-1.5 hover:bg-red-500/5 hover:border-red-500/30"
            >
              Log Out
            </button>
          </div>
        </motion.div>

        {/* ── Quick Stats ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          <StatCard icon="🩸" label="Blood Group" value={bloodGroup || "Not Set"} />
          <StatCard icon="🏥" label="Conditions" value={conditions.length > 0 ? `${conditions.length} listed` : "None"} />
          <StatCard icon="📞" label="Emergency Contact" value={contactName || "Not Set"} />
        </motion.div>

        {/* ── Edit Form ────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="relative rounded-2xl border-t border-t-white/20 border-b border-b-black/60 border-x border-x-white/5 bg-white/[0.04] backdrop-blur-md shadow-[0_24px_60px_rgba(0,0,0,0.55)] overflow-hidden"
        >
          {/* Corner HUD marks */}
          <div className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-emerald-500/40 pointer-events-none" />
          <div className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 border-emerald-500/40 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 border-emerald-500/20 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 border-emerald-500/20 pointer-events-none" />

          {/* Panel header */}
          <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-emerald-400/70">
                OPERATIVE PROFILE · EDIT
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent" />
            </div>
            <p className="font-mono text-[9px] text-white/50 mt-1">
              Profile data is embedded in your SOS broadcasts and AI recommendations
            </p>
          </div>

          <form onSubmit={handleSave} className="px-6 py-6 space-y-7">

            {/* Blood Group */}
            <div>
              <SectionLabel label="Medical Data" />
              <div className="space-y-4">
                <div>
                  <label className="mb-2 flex items-center gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/60">Blood Group</span>
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white text-sm outline-none transition-all duration-300 focus:border-emerald-500/50 focus:shadow-[0_0_15px_rgba(16,185,129,0.08)] font-mono appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#0a1a10]">Prefer not to say</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg} className="bg-[#0a1a10]">{bg}</option>
                    ))}
                  </select>
                </div>

                <MedicalConditionsPicker selected={conditions} onChange={setConditions} />
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <SectionLabel label="Emergency Contact" />
              <div className="space-y-3">
                <div>
                  <label className="mb-2 flex items-center gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/60">Contact Name</span>
                  </label>
                  <input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Full name of your emergency contact"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none transition-all duration-300 focus:border-emerald-500/50 focus:shadow-[0_0_15px_rgba(16,185,129,0.08)] font-body"
                  />
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/60">Contact Phone</span>
                  </label>
                  <input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+92 300 0000000"
                    type="tel"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none transition-all duration-300 focus:border-emerald-500/50 focus:shadow-[0_0_15px_rgba(16,185,129,0.08)] font-mono tracking-wider"
                  />
                </div>
              </div>
            </div>

            {/* Save button */}
            <div className="space-y-3 pt-2">
              <motion.button
                type="submit"
                disabled={saving}
                whileHover={!saving ? { scale: 1.01 } : {}}
                whileTap={!saving ? { scale: 0.99 } : {}}
                className="relative w-full rounded-xl py-3.5 font-display font-bold text-sm tracking-wider uppercase overflow-hidden transition-all duration-300
                  disabled:cursor-not-allowed disabled:opacity-40
                  enabled:bg-emerald-600 enabled:shadow-[0_0_25px_rgba(16,185,129,0.35)] enabled:hover:shadow-[0_0_40px_rgba(16,185,129,0.55)]"
              >
                {!saving && (
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {saving ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Saving…
                    </>
                  ) : "💾 Save Changes"}
                </span>
              </motion.button>

              <AnimatePresence>
                {saved && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 py-2.5"
                  >
                    <span className="text-emerald-400">✓</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
                      Profile Updated Successfully
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
        </motion.div>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-emerald-500/15 pt-6 relative"
        >
          <div className="absolute top-0 left-0 w-16 h-px bg-emerald-400/60" />
          <div className="absolute top-0 right-0 w-16 h-px bg-emerald-400/60" />
          <div className="flex items-center gap-6 font-mono text-[9px] uppercase tracking-[0.3em] text-emerald-400/40">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              CC_OS v0.1.0
            </span>
            <span className="hidden sm:inline">PROFILE_SYNC: ACTIVE</span>
          </div>
          <span className="font-mono text-[9px] text-white/20 tracking-widest">
            Data used only for emergency personalization
          </span>
        </motion.div>
      </main>
    </div>
  );
}