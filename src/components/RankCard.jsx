import { motion } from "framer-motion";
import { Award, Zap, ChevronRight, ShieldCheck, Lock } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { RANK_TIERS, XP_REWARDS } from "../data/rankProgression";
import { CyberCard } from "./CyberCard";
import { cn } from "../utils/helpers";

export const RankCard = () => {
  const { rankInfo, xp, resetProgress } = useTheme();

  if (!rankInfo) return null;

  return (
    <CyberCard glow className="mb-8 overflow-hidden relative">
      {/* Background glow accent */}
      <div
        className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: rankInfo.color }}
      />

      {/* Header section with current rank and XP */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-cyber-border/60">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border bg-white/5 shadow-inner"
            style={{ borderColor: `${rankInfo.color}60` }}
          >
            {rankInfo.badge}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase border"
                style={{
                  backgroundColor: `${rankInfo.color}15`,
                  borderColor: `${rankInfo.color}40`,
                  color: rankInfo.color,
                }}
              >
                Tier {rankInfo.tier} of 5
              </span>
              <span className="text-xs font-mono text-slate-400">Cyber Defense Career</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white mt-1">
              {rankInfo.title}
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mt-0.5">
              {rankInfo.description}
            </p>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-baseline md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-cyber-border/40">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Zap size={14} className="text-neon-cyan" />
            <span>TOTAL DEFENSE XP</span>
          </div>
          <span className="text-3xl font-display font-bold text-white font-mono tracking-tight">
            {xp}{" "}
            <span className="text-sm font-normal text-slate-400 font-sans">XP</span>
          </span>
        </div>
      </div>

      {/* Progress to next tier */}
      <div className="py-5 border-b border-cyber-border/60">
        <div className="flex justify-between items-center text-xs font-mono mb-2">
          <span className="text-slate-300">
            {rankInfo.isMaxRank ? (
              <span className="text-neon-green font-semibold">Maximum Rank Tier Achieved</span>
            ) : (
              <>
                Next Tier:{" "}
                <span className="text-white font-bold">{rankInfo.nextRank?.title}</span>
              </>
            )}
          </span>
          <span className="text-slate-400">
            {rankInfo.isMaxRank ? (
              "Apex Guardian"
            ) : (
              <>
                <span className="text-neon-cyan font-bold">{rankInfo.xpToNext} XP</span> remaining
              </>
            )}
          </span>
        </div>

        {/* Progress bar container */}
        <div className="w-full h-3 bg-cyber-black rounded-full overflow-hidden p-0.5 border border-cyber-border/80">
          <motion.div
            className="h-full rounded-full transition-all duration-700"
            initial={{ width: 0 }}
            animate={{ width: `${rankInfo.progressPercent}%` }}
            style={{ backgroundColor: rankInfo.color }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1.5">
          <span>{rankInfo.minXP} XP</span>
          <span>{rankInfo.progressPercent}% Tier Progress</span>
          <span>{rankInfo.isMaxRank ? "MAX" : `${rankInfo.nextRank?.minXP} XP`}</span>
        </div>
      </div>

      {/* Progression Roadmap: 5 Tier Stepper */}
      <div className="pt-5">
        <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-4">
          Progression Milestones
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {RANK_TIERS.map((tier) => {
            const isUnlocked = xp >= tier.minXP;
            const isCurrent = rankInfo.tier === tier.tier;

            return (
              <div
                key={tier.id}
                className={cn(
                  "p-3 rounded-xl border transition-all text-left flex flex-col justify-between",
                  isCurrent
                    ? "bg-white/10 shadow-md"
                    : isUnlocked
                    ? "bg-white/5 opacity-80"
                    : "bg-cyber-black/40 border-cyber-border/40 opacity-50"
                )}
                style={{
                  borderColor: isCurrent ? `${tier.color}80` : undefined,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{tier.badge}</span>
                  {isCurrent ? (
                    <span
                      className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${tier.color}20`,
                        color: tier.color,
                      }}
                    >
                      CURRENT
                    </span>
                  ) : isUnlocked ? (
                    <ShieldCheck size={14} className="text-neon-green" />
                  ) : (
                    <Lock size={12} className="text-slate-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-snug">{tier.title}</h4>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {tier.minXP === 0 ? "0 XP" : `${tier.minXP.toLocaleString()} XP`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* XP earning methods footer */}
      <div className="mt-5 pt-4 border-t border-cyber-border/40 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
          <span className="text-slate-300 font-semibold">Earn XP:</span>
          <span className="text-emerald-400">Quiz: +{XP_REWARDS.QUIZ_CORRECT} XP/correct</span>
          <span className="text-cyan-400">Phishing: +{XP_REWARDS.PHISHING_EMAIL} XP</span>
          <span className="text-amber-400">Attack Scenario: +{XP_REWARDS.SCENARIO_COMPLETE} XP</span>
          <span className="text-purple-400">Strong Password: +{XP_REWARDS.PASSWORD_STRONG} XP</span>
          <span className="text-slate-300">Website Inspection: +{XP_REWARDS.WEBSITE_CHECK} XP</span>
        </div>
        {xp > 0 && (
          <button
            onClick={() => {
              if (window.confirm("Reset your defense XP and simulation statistics?")) {
                resetProgress();
              }
            }}
            className="text-slate-500 hover:text-danger text-[10px] transition-colors underline cursor-pointer"
          >
            Reset Progress
          </button>
        )}
      </div>
    </CyberCard>
  );
};
