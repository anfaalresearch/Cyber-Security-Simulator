import { motion, AnimatePresence } from "framer-motion";
import { Award, ChevronRight, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export const LevelUpModal = () => {
  const { levelUpNotification, dismissLevelUp } = useTheme();

  if (!levelUpNotification) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-md p-6 rounded-2xl border bg-cyber-card shadow-2xl text-center overflow-hidden"
          style={{ borderColor: `${levelUpNotification.color}60` }}
        >
          {/* Background glow circle */}
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: levelUpNotification.color }}
          />

          <button
            onClick={dismissLevelUp}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>

          <span className="text-5xl mb-4 block animate-bounce">{levelUpNotification.badge}</span>

          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider mb-2"
            style={{
              backgroundColor: `${levelUpNotification.color}20`,
              color: levelUpNotification.color,
            }}
          >
            <Award size={14} /> Rank Promotion Unlocked
          </span>

          <h2 className="text-2xl font-display font-bold text-white mb-2">
            {levelUpNotification.title}
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed mb-6 px-4">
            {levelUpNotification.description}
          </p>

          <div
            className="p-3 mb-6 rounded-xl border bg-white/5 text-left text-xs font-mono"
            style={{ borderColor: `${levelUpNotification.color}30` }}
          >
            <div className="flex justify-between items-center mb-1 text-slate-400">
              <span>CURRENT STATUS</span>
              <span className="text-white font-bold">{levelUpNotification.xp} XP</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>TIER LEVEL</span>
              <span className="text-neon-cyan font-bold">Tier {levelUpNotification.tier} / 5</span>
            </div>
          </div>

          <button
            onClick={dismissLevelUp}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-cyber-black transition-all flex items-center justify-center gap-2 font-mono glow-btn"
            style={{ backgroundColor: levelUpNotification.color }}
          >
            Claim Rank & Continue <ChevronRight size={16} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
