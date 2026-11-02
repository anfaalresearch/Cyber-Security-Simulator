import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Menu, X, Sun, Moon } from "lucide-react";
import { useScrollPosition } from "../hooks/useScrollPosition";
import { useTheme } from "../context/ThemeContext";
import { cn } from "../utils/helpers";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/phishing-simulator", label: "Phishing" },
  { to: "/fake-website-detector", label: "Websites" },
  { to: "/password-analyzer", label: "Passwords" },
  { to: "/cyber-quiz", label: "Quiz" },
  { to: "/attack-simulation", label: "Scenarios" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/about", label: "About" },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrolled = useScrollPosition();
  const { theme, toggleTheme, rankInfo } = useTheme();

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-cyber-black/80 backdrop-blur-xl border-b border-neon-green/10 shadow-lg"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-neon-green/10 group-hover:bg-neon-green/20 transition-colors">
              <Shield className="text-neon-green" size={24} />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-white text-sm leading-tight">
                CyberSec
              </span>
              <span className="block text-neon-green text-xs font-mono">Simulator</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-neon-green bg-neon-green/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {rankInfo && (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white/5 hover:bg-white/10 transition-all"
                style={{ borderColor: `${rankInfo.color}50` }}
                title={`Cyber Rank: ${rankInfo.title} (${rankInfo.xp} XP)`}
              >
                <span className="text-base leading-none">{rankInfo.badge}</span>
                <div className="hidden sm:flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-white leading-tight">
                      {rankInfo.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {rankInfo.xp} XP
                    </span>
                  </div>
                  <div className="w-24 h-1 bg-cyber-border rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${rankInfo.progressPercent}%`,
                        backgroundColor: rankInfo.color,
                      }}
                    />
                  </div>
                </div>
              </Link>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-neon-green hover:bg-white/5 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-cyber-black/95 backdrop-blur-xl border-b border-neon-green/10"
          >
            <div className="px-4 py-4 space-y-1">
              {rankInfo && (
                <div
                  className="p-3 mb-3 rounded-lg border bg-white/5 flex items-center justify-between"
                  style={{ borderColor: `${rankInfo.color}50` }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{rankInfo.badge}</span>
                    <div>
                      <p className="text-sm font-bold text-white">{rankInfo.title}</p>
                      <p className="text-xs text-slate-400 font-mono">{rankInfo.xp} XP</p>
                    </div>
                  </div>
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded border"
                    style={{ borderColor: `${rankInfo.color}50`, color: rankInfo.color }}
                  >
                    {rankInfo.progressPercent}%
                  </span>
                </div>
              )}
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "text-neon-green bg-neon-green/10"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
