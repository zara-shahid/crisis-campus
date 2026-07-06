import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Navbar() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3 font-display font-bold text-lg text-white group">
          <motion.span 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-action font-mono text-[11px] text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all group-hover:shadow-[0_0_25px_rgba(16,185,129,0.7)]"
          >
            CC
          </motion.span>
          <span className="tracking-wide">Crisis Compass</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link to="/assistant" className="text-muted transition-colors hover:text-white">
            Assistant
          </Link>
          <Link to="/dashboard" className="text-muted transition-colors hover:text-white">
            Dashboard
          </Link>
          <Link to="/checklist" className="text-muted transition-colors hover:text-white">
            Checklist
          </Link>
          {!loading && user && (
            <Link to="/profile" className="text-muted transition-colors hover:text-white">
              Profile
            </Link>
          )}
          {!loading && !user && (
            <>
              <Link to="/login" className="text-muted transition-colors hover:text-white">
                Log in
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="rounded-full bg-white/10 px-5 py-2 text-white border border-white/10 backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  Sign up
                </Link>
              </motion.div>
            </>
          )}
        </nav>
      </div>
      <div className="hazard-stripe h-[2px] w-full opacity-50" />
    </header>
  );
}