export const XP_REWARDS = {
  QUIZ_CORRECT: 20,
  PHISHING_EMAIL: 50,
  SCENARIO_COMPLETE: 100,
  PASSWORD_STRONG: 30,
  WEBSITE_CHECK: 15,
};

export const RANK_TIERS = [
  {
    tier: 1,
    id: "cadet",
    title: "Cyber Cadet",
    minXP: 0,
    maxXP: 250,
    badge: "🥉",
    color: "#34d399",
    textColor: "text-emerald-400",
    bgBadge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    description: "Recruit level defense trainee learning foundational cyber security concepts.",
  },
  {
    tier: 2,
    id: "analyst",
    title: "Security Analyst",
    minXP: 251,
    maxXP: 750,
    badge: "🥈",
    color: "#00d4ff",
    textColor: "text-neon-cyan",
    bgBadge: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
    description: "Competent analyst skilled at inspecting URLs, certificates, and detecting suspicious emails.",
  },
  {
    tier: 3,
    id: "hunter",
    title: "Threat Hunter",
    minXP: 751,
    maxXP: 1500,
    badge: "🥇",
    color: "#f59e0b",
    textColor: "text-warning",
    bgBadge: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    description: "Proactive defender uncovering hidden social engineering vectors, QR scams, and fraud patterns.",
  },
  {
    tier: 4,
    id: "commander",
    title: "Incident Responder",
    minXP: 1501,
    maxXP: 3000,
    badge: "🎖️",
    color: "#a855f7",
    textColor: "text-purple-400",
    bgBadge: "bg-purple-500/10 border-purple-500/30 text-purple-400",
    description: "Tactical specialist countering real-time attacks, credential breaches, and unauthorized access.",
  },
  {
    tier: 5,
    id: "sentinel",
    title: "Cyber Sentinel",
    minXP: 3001,
    maxXP: Infinity,
    badge: "👑",
    color: "#00ff88",
    textColor: "text-neon-green",
    bgBadge: "bg-neon-green/10 border-neon-green/30 text-neon-green",
    description: "Elite guardian of cybersecurity, operating with comprehensive threat intelligence.",
  },
];

export function getRankInfo(currentXP = 0) {
  const safeXP = Math.max(0, Number(currentXP) || 0);
  const currentRank =
    RANK_TIERS.find((r) => safeXP >= r.minXP && (safeXP <= r.maxXP || r.maxXP === Infinity)) ||
    RANK_TIERS[0];

  const isMaxRank = currentRank.tier === RANK_TIERS.length;
  const nextRank = isMaxRank ? null : RANK_TIERS.find((r) => r.tier === currentRank.tier + 1);

  let progressPercent = 100;
  let xpInCurrentTier = safeXP;
  let tierRange = 250;

  if (!isMaxRank && nextRank) {
    const tierStart = currentRank.minXP === 0 ? 0 : currentRank.minXP - 1;
    tierRange = nextRank.minXP - tierStart;
    xpInCurrentTier = safeXP - tierStart;
    progressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentTier / tierRange) * 100)));
  }

  return {
    ...currentRank,
    xp: safeXP,
    nextRank,
    isMaxRank,
    progressPercent,
    xpToNext: nextRank ? Math.max(0, nextRank.minXP - safeXP) : 0,
  };
}
