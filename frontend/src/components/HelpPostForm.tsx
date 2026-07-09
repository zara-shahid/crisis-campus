import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HELP_CATEGORIES } from "../types/helpBoard";
import type { HelpCategory, HelpPostCreate } from "../types/helpBoard";

interface HelpPostFormProps {
  onSubmit: (payload: HelpPostCreate) => Promise<void>;
  submitting?: boolean;
}

export default function HelpPostForm({ onSubmit, submitting }: HelpPostFormProps) {
  const { user } = useAuth();
  const [category, setCategory] = useState<HelpCategory>("water");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [contactPhone, setContactPhone] = useState(user?.emergency_contact_phone ?? "");
  const [localError, setLocalError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
        <p className="text-white/50 text-sm mb-4">
          Sign in to post a need or offer help to your community.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 font-display font-semibold text-black text-sm hover:bg-emerald-400 transition-colors"
        >
          Log in to post
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);

    if (title.trim().length < 3) {
      setLocalError("Title must be at least 3 characters.");
      return;
    }
    if (description.trim().length < 10) {
      setLocalError("Please add a bit more detail (at least 10 characters).");
      return;
    }

    try {
      await onSubmit({
        category,
        title: title.trim(),
        description: description.trim(),
        location: location.trim() || undefined,
        contact_phone: contactPhone.trim() || undefined,
      });
      setTitle("");
      setDescription("");
      setLocation("");
    } catch {
      // parent handles error state
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-emerald-500/20 bg-white/[0.03] p-6 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <h2 className="font-display font-semibold text-white text-sm">Post a need</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {HELP_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={`flex flex-col items-center gap-1 rounded-lg border px-3 py-3 text-xs font-mono uppercase tracking-wider transition-all ${
              category === cat.id
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
            }`}
          >
            <span className="text-lg">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Short title (e.g. Need bottled water)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/40 focus:outline-none"
        />
        <textarea
          placeholder="Describe what you need, how urgent it is, and any details helpers should know..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={1000}
          className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/40 focus:outline-none resize-none"
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Area / neighborhood (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={200}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/40 focus:outline-none"
          />
          <input
            type="tel"
            placeholder="Contact phone (optional)"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            maxLength={30}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/40 focus:outline-none"
          />
        </div>
      </div>

      {localError && (
        <p className="mt-3 font-mono text-[10px] text-red-400">{localError}</p>
      )}

      <motion.button
        type="submit"
        disabled={submitting}
        whileTap={{ scale: 0.98 }}
        className="mt-5 w-full rounded-lg bg-emerald-500 py-3 font-display font-bold text-black text-sm tracking-wide hover:bg-emerald-400 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Posting…" : "Post to community board"}
      </motion.button>
    </form>
  );
}
