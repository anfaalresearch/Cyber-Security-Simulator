import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { getRankInfo } from "../data/rankProgression";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useLocalStorage("cyber-theme", "dark");
  const [achievements, setAchievements] = useLocalStorage("cyber-achievements", []);
  const [quizScores, setQuizScores] = useLocalStorage("cyber-quiz-scores", []);
  const [xp, setXP] = useLocalStorage("cyber-xp", 0);
  const [levelUpNotification, setLevelUpNotification] = useState(null);
  const [simulationStats, setSimulationStats] = useLocalStorage("cyber-sim-stats", {
    phishingCompleted: 0,
    websitesChecked: 0,
    quizzesTaken: 0,
    scenariosCompleted: 0,
  });

  useEffect(() => {
    document.body.classList.toggle("light-theme", theme === "light");
    document.body.classList.toggle("dark-theme", theme === "dark");
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), [setTheme]);

  const unlockAchievement = useCallback((id) => {
    setAchievements((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  }, [setAchievements]);

  const addXP = useCallback((amount) => {
    const safeAmount = Math.max(0, Number(amount) || 0);
    if (safeAmount <= 0) return;

    setXP((prevXP) => {
      const oldRank = getRankInfo(prevXP);
      const newXP = prevXP + safeAmount;
      const newRank = getRankInfo(newXP);

      if (newRank.tier > oldRank.tier) {
        setLevelUpNotification(newRank);
      }
      return newXP;
    });
  }, [setXP]);

  const dismissLevelUp = useCallback(() => setLevelUpNotification(null), []);

  const recordQuizScore = useCallback((score, total) => {
    setQuizScores((prev) => [
      ...prev.slice(-9),
      { score, total, date: new Date().toISOString(), pct: Math.round((score / total) * 100) },
    ]);
    setSimulationStats((s) => ({ ...s, quizzesTaken: s.quizzesTaken + 1 }));
    setAchievements((prev) => {
      const next = [...prev];
      if (score === total && !next.includes("perfect-quiz")) next.push("perfect-quiz");
      if (score >= total * 0.8 && !next.includes("quiz-master")) next.push("quiz-master");
      return next;
    });
  }, [setQuizScores, setSimulationStats, setAchievements]);

  const incrementStat = useCallback((key) => {
    setSimulationStats((s) => ({ ...s, [key]: (s[key] || 0) + 1 }));
  }, [setSimulationStats]);

  const resetProgress = useCallback(() => {
    setXP(0);
    setAchievements([]);
    setQuizScores([]);
    setSimulationStats({
      phishingCompleted: 0,
      websitesChecked: 0,
      quizzesTaken: 0,
      scenariosCompleted: 0,
    });
    setLevelUpNotification(null);
  }, [setXP, setAchievements, setQuizScores, setSimulationStats]);

  const rankInfo = getRankInfo(xp);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        achievements,
        unlockAchievement,
        quizScores,
        recordQuizScore,
        simulationStats,
        incrementStat,
        xp,
        rankInfo,
        addXP,
        levelUpNotification,
        dismissLevelUp,
        resetProgress,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
