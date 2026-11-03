import { useState } from "react";
import { motion } from "framer-motion";
import { Swords, Trophy, ChevronRight, RotateCcw } from "lucide-react";
import { SectionTitle } from "../components/SectionTitle";
import { CyberCard } from "../components/CyberCard";
import { AnimatedButton } from "../components/AnimatedButton";
import { attackScenarios } from "../data/attackScenarios";
import { useTheme } from "../context/ThemeContext";
import { XP_REWARDS } from "../data/rankProgression";
import { cn } from "../utils/helpers";

export const AttackSimulation = () => {
  const [activeScenario, setActiveScenario] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completed, setCompleted] = useState([]);
  const { unlockAchievement, incrementStat, addXP } = useTheme();

  const scenario = attackScenarios.find((s) => s.id === activeScenario);
  const step = scenario?.steps[stepIndex];

  const handleChoice = (choice) => {
    setSelectedChoice(choice);
    setShowFeedback(true);
    setTotalScore((s) => s + choice.score);
  };

  const handleNext = () => {
    const isNewCompletion = !completed.includes(activeScenario);
    const nextCompleted = isNewCompletion
      ? [...completed, activeScenario]
      : completed;

    if (isNewCompletion) {
      setCompleted(nextCompleted);
      const earnedXP = (selectedChoice?.score || 0) * 10;
      if (earnedXP > 0) {
        addXP(earnedXP);
      }
    }

    setActiveScenario(null);
    setStepIndex(0);
    setSelectedChoice(null);
    setShowFeedback(false);

    if (isNewCompletion && nextCompleted.length === attackScenarios.length) {
      unlockAchievement("scenario-survivor");
      incrementStat("scenariosCompleted");
    }
  };

  const resetAll = () => {
    setActiveScenario(null);
    setTotalScore(0);
    setCompleted([]);
    setSelectedChoice(null);
    setShowFeedback(false);
  };

  const maxScore = attackScenarios.length * 10;

  if (activeScenario && scenario && step) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{scenario.icon}</span>
          <div>
            <h2 className="font-display text-xl text-white">{scenario.title}</h2>
            <p className="text-slate-500 text-sm">{scenario.description}</p>
          </div>
        </div>

        <CyberCard glow>
          <p className="text-slate-300 leading-relaxed mb-6">{step.prompt}</p>

          <div className="space-y-3">
            {step.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => !showFeedback && handleChoice(choice)}
                disabled={showFeedback}
                className={cn(
                  "w-full text-left p-4 rounded-lg border transition-all text-sm",
                  showFeedback && selectedChoice === choice
                    ? choice.score >= 7
                      ? "border-neon-green bg-neon-green/20"
                      : choice.score >= 4
                      ? "border-warning bg-warning/20"
                      : "border-danger bg-danger/20"
                    : "border-cyber-border hover:border-neon-cyan/50 bg-white/5",
                  showFeedback && selectedChoice !== choice && "opacity-50"
                )}
              >
                {choice.text}
              </button>
            ))}
          </div>

          {showFeedback && selectedChoice && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-lg bg-white/5 border border-cyber-border"
            >
              <div className="flex items-center gap-3 mb-2">
                <p className="text-neon-cyan text-xs font-mono">
                  SCORE: +{selectedChoice.score}/10
                </p>
                <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  +{selectedChoice.score * 10} XP Earned
                </span>
              </div>
              <p className="text-slate-300 text-sm mb-4">{selectedChoice.feedback}</p>
              <p className="text-neon-green text-xs font-mono">
                BEST ACTION: {scenario.bestAction}
              </p>
              <AnimatedButton onClick={handleNext} className="mt-4" icon={ChevronRight}>
                Continue
              </AnimatedButton>
            </motion.div>
          )}
        </CyberCard>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionTitle
        title="Attack Simulation Scenarios"
        subtitle="Experience real-world cyber attack scenarios and learn the best responses"
        align="left"
      />

      {totalScore > 0 && (
        <CyberCard className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="text-neon-green" size={24} />
            <span className="text-white">
              Security Score: <span className="text-neon-green font-mono">{totalScore}</span> / {maxScore}
            </span>
          </div>
          <AnimatedButton variant="ghost" onClick={resetAll} icon={RotateCcw}>
            Reset
          </AnimatedButton>
        </CyberCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {attackScenarios.map((s) => (
          <CyberCard
            key={s.id}
            onClick={() => setActiveScenario(s.id)}
            className={cn(completed.includes(s.id) && "border-neon-green/40")}
          >
            <span className="text-4xl mb-4 block">{s.icon}</span>
            <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
            <p className="text-slate-400 text-sm mb-4">{s.description}</p>
            {completed.includes(s.id) ? (
              <span className="text-neon-green text-xs font-mono">✓ COMPLETED</span>
            ) : (
              <span className="text-neon-cyan text-sm flex items-center gap-1">
                Start Scenario <ChevronRight size={14} />
              </span>
            )}
          </CyberCard>
        ))}
      </div>
    </div>
  );
};
