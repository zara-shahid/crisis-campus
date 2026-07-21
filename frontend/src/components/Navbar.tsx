import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Navbar() {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 glass-nav bg-[#050B08]/80 backdrop-blur-md border-b border-emerald-500/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-4">
        <Link to="/" className="flex items-center gap-3 font-display font-bold text-lg text-white group">
          <motion.span 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-action font-mono text-[11px] text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all group-hover:shadow-[0_0_25px_rgba(16,185,129,0.7)]"
          >
            CC
          </motion.span>
          <span className="tracking-wide">Crisis Compass</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/assistant" className="text-emerald-400/60 transition-colors hover:text-emerald-400">
            Assistant
          </Link>
          <Link to="/dashboard" className="text-emerald-400/60 transition-colors hover:text-emerald-400">
            Dashboard
          </Link>
          <Link to="/checklist" className="text-emerald-400/60 transition-colors hover:text-emerald-400">
            Checklist
          </Link>
          <Link to="/community" className="text-emerald-400/60 transition-colors hover:text-emerald-400">
            Community
          </Link>
          {!loading && user && (
            <Link to="/profile" className="text-emerald-400/60 transition-colors hover:text-emerald-400">
              Profile
            </Link>
          )}
          {!loading && !user && (
            <>
              <Link to="/login" className="text-emerald-400/60 transition-colors hover:text-emerald-400">
                Log in
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="rounded-none bg-emerald-500/10 px-5 py-2 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm transition-all hover:bg-emerald-500/20 hover:border-emerald-500/60 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] uppercase tracking-wider text-[11px] font-mono"
                >
                  Sign up
                </Link>
              </motion.div>
            </>
          )}
        </nav>

        {/* Mobile Toggle Button */}
        <button 
          className="md:hidden text-emerald-400 p-2 focus:outline-none" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="md:hidden border-t border-emerald-500/20 bg-[#050B08]/95 backdrop-blur-lg px-4 py-4 shadow-xl"
        >
          <nav className="flex flex-col items-start gap-4 text-sm font-medium">
            <Link onClick={closeMenu} to="/assistant" className="w-full text-emerald-400/60 py-2 transition-colors hover:text-emerald-400 border-b border-emerald-500/10">
              Assistant
            </Link>
            <Link onClick={closeMenu} to="/dashboard" className="w-full text-emerald-400/60 py-2 transition-colors hover:text-emerald-400 border-b border-emerald-500/10">
              Dashboard
            </Link>
            <Link onClick={closeMenu} to="/checklist" className="w-full text-emerald-400/60 py-2 transition-colors hover:text-emerald-400 border-b border-emerald-500/10">
              Checklist
            </Link>
            <Link onClick={closeMenu} to="/community" className="w-full text-emerald-400/60 py-2 transition-colors hover:text-emerald-400 border-b border-emerald-500/10">
              Community
            </Link>
            {!loading && user && (
              <Link onClick={closeMenu} to="/profile" className="w-full text-emerald-400/60 py-2 transition-colors hover:text-emerald-400 border-b border-emerald-500/10">
                Profile
              </Link>
            )}
            {!loading && !user && (
              <div className="flex flex-col gap-3 w-full pt-2">
                <Link onClick={closeMenu} to="/login" className="w-full text-center py-2 text-emerald-400/60 border border-emerald-500/20 rounded-none bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors uppercase tracking-widest text-[10px] font-mono">
                  Log in
                </Link>
                <Link
                  onClick={closeMenu}
                  to="/register"
                  className="w-full text-center py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-none hover:bg-emerald-500/30 transition-colors uppercase tracking-widest text-[10px] font-mono shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>
        </motion.div>
      )}

      <div className="hazard-stripe h-[2px] w-full opacity-50" />
    </header>
  );
}