import { motion } from "framer-motion";
import type { HelpPost } from "../types/helpBoard";
import { categoryMeta } from "../types/helpBoard";

const COLOR_MAP = {
  cyan: {
    badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/25",
    accent: "border-cyan-500/20",
  },
  amber: {
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/25",
    accent: "border-amber-500/20",
  },
  sky: {
    badge: "bg-sky-500/10 text-sky-300 border-sky-500/25",
    accent: "border-sky-500/20",
  },
  violet: {
    badge: "bg-violet-500/10 text-violet-300 border-violet-500/25",
    accent: "border-violet-500/20",
  },
} as const;

function parseApiDate(iso: string): Date {
  // API stores UTC; SQLite may return timestamps without a timezone suffix.
  if (!/[zZ]|[+-]\d{2}:\d{2}$/.test(iso)) {
    return new Date(`${iso}Z`);
  }
  return new Date(iso);
}

function formatTime(iso: string) {
  const date = parseApiDate(iso);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

interface HelpPostCardProps {
  post: HelpPost;
  onFulfill?: (id: number) => void;
  onDelete?: (id: number) => void;
  busy?: boolean;
}

export default function HelpPostCard({ post, onFulfill, onDelete, busy }: HelpPostCardProps) {
  const meta = categoryMeta(post.category);
  const colors = COLOR_MAP[meta.color as keyof typeof COLOR_MAP];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={`relative overflow-hidden rounded-xl border bg-white/[0.03] p-5 backdrop-blur-sm transition-colors hover:bg-white/[0.05] ${colors.accent}`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <span
          className={`inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest border rounded-md px-2 py-1 ${colors.badge}`}
        >
          <span>{meta.icon}</span>
          {meta.label}
        </span>
        <span className="font-mono text-[9px] text-white/30 tracking-widest shrink-0">
          {formatTime(post.created_at)}
        </span>
      </div>

      <h3 className="font-display font-semibold text-white text-base mb-2">{post.title}</h3>
      <p className="text-white/50 text-sm leading-relaxed mb-4">{post.description}</p>

      <div className="flex flex-wrap gap-3 text-xs font-mono text-white/40 mb-4">
        {post.location && (
          <span className="inline-flex items-center gap-1.5 border border-white/10 rounded-md px-2 py-1">
            📍 {post.location}
          </span>
        )}
        {post.contact_phone && (
          <a
            href={`tel:${post.contact_phone}`}
            className="inline-flex items-center gap-1.5 border border-emerald-500/20 text-emerald-400/80 rounded-md px-2 py-1 hover:bg-emerald-500/10 transition-colors"
          >
            📞 {post.contact_phone}
          </a>
        )}
        <span className="inline-flex items-center gap-1.5 border border-white/10 rounded-md px-2 py-1">
          👤 {post.author_name}
        </span>
      </div>

      {post.is_mine && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
          <button
            type="button"
            disabled={busy}
            onClick={() => onFulfill?.(post.id)}
            className="font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-md border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50 transition-colors"
          >
            Mark fulfilled
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDelete?.(post.id)}
            className="font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-md border border-red-500/20 text-red-400/80 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </motion.article>
  );
}
