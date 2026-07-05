import { motion } from "framer-motion";

export default function Loader({ label = "Working on it..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-base/70">
      <motion.span
        className="h-3 w-3 rounded-full bg-action"
        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="font-mono text-xs uppercase tracking-wide">{label}</span>
    </div>
  );
}