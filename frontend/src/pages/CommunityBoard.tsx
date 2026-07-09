import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import GeoSphere from "../components/GeoSphere";
import HelpPostCard from "../components/HelpPostCard";
import HelpPostForm from "../components/HelpPostForm";
import Loader from "../components/Loader";
import { useHelpBoard } from "../hooks/useHelpBoard";
import { HELP_CATEGORIES } from "../types/helpBoard";
import type { HelpCategory } from "../types/helpBoard";

export default function CommunityBoard() {
  const {
    posts,
    category,
    setCategory,
    loading,
    error,
    submitting,
    submitPost,
    markFulfilled,
    removePost,
    refresh,
  } = useHelpBoard();
  const [actionBusy, setActionBusy] = useState(false);

  async function handleFulfill(id: number) {
    setActionBusy(true);
    try {
      await markFulfilled(id);
    } finally {
      setActionBusy(false);
    }
  }

  async function handleDelete(id: number) {
    setActionBusy(true);
    try {
      await removePost(id);
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#050B08] text-white overflow-x-hidden selection:bg-emerald-500/30">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30 mix-blend-screen overflow-hidden">
        <GeoSphere />
      </div>

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

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-emerald-500/10 pb-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-sm bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-sm h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400">
                Crisis Compass · Community Network
              </span>
            </div>
            <h1 className="font-display font-black text-4xl lg:text-5xl text-white tracking-tight">
              Community{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Help Board
              </span>
            </h1>
            <p className="text-emerald-400/50 font-mono text-xs mt-2.5 tracking-widest uppercase">
              Post needs · Coordinate aid · Water · Food · Shelter · Rides
            </p>
          </div>

          <Link
            to="/dashboard"
            className="group flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-400/60 hover:text-emerald-400 transition-colors border border-emerald-500/20 px-4 py-2 hover:bg-emerald-500/10"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Dashboard
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <HelpPostForm onSubmit={submitPost} submitting={submitting} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="font-display font-semibold text-white text-sm">
                Open requests
                {!loading && (
                  <span className="ml-2 font-mono text-[10px] text-white/30">
                    ({posts.length})
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={() => refresh()}
                className="font-mono text-[9px] uppercase tracking-widest text-emerald-400/60 hover:text-emerald-400 transition-colors"
              >
                Refresh
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              <FilterChip
                active={category === "all"}
                onClick={() => setCategory("all")}
                label="All"
              />
              {HELP_CATEGORIES.map((cat) => (
                <FilterChip
                  key={cat.id}
                  active={category === cat.id}
                  onClick={() => setCategory(cat.id as HelpCategory)}
                  label={`${cat.icon} ${cat.label}`}
                />
              ))}
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 mb-4 font-mono text-[10px] text-red-400">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader />
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
                <p className="text-white/40 text-sm mb-1">No open requests right now.</p>
                <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest">
                  Be the first to post a need
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {posts.map((post) => (
                    <HelpPostCard
                      key={post.id}
                      post={post}
                      busy={actionBusy}
                      onFulfill={handleFulfill}
                      onDelete={handleDelete}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-md border transition-colors ${
        active
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
          : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
      }`}
    >
      {label}
    </button>
  );
}
