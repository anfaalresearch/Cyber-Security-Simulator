
import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { motion } from "framer-motion";
import {
  Trophy,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Target,
} from "lucide-react";

import { SectionTitle } from "../components/SectionTitle";
import { CyberCard } from "../components/CyberCard";
import { AnimatedButton } from "../components/AnimatedButton";
import { attackScenarios } from "../data/attackScenarios";
import { useTheme } from "../context/ThemeContext";
import { cn } from "../utils/helpers";

export const AttackSimulation = () => {
  const [activeScenario, setActiveScenario] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [scenarioScore, setScenarioScore] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [completionWasReplay, setCompletionWasReplay] = useState(false);
  // Persist completed scenarios so refreshing or using the session Reset
  // button cannot allow XP to be earned again for the same scenario.
  const [completed, setCompleted] = useLocalStorage(
    "cyber-completed-scenarios",
    []
  );

  const { unlockAchievement, incrementStat, addXP } = useTheme();

  const scenario = attackScenarios.find(
    (s) => s.id === activeScenario
  );

  const step = scenario?.steps[stepIndex];

  const totalSteps = scenario?.steps.length || 0;
  const isLastStep = stepIndex === totalSteps - 1;

  const maxScore = attackScenarios.reduce(
    (total, s) =>
      total +
      s.steps.reduce(
        (scenarioTotal, currentStep) =>
          scenarioTotal +
          Math.max(...currentStep.choices.map((choice) => choice.score)),
        0
      ),
    0
  );

  const handleStart = (scenarioId) => {
    setActiveScenario(scenarioId);
    setStepIndex(0);
    setScenarioScore(0);
    setSelectedChoice(null);
    setShowFeedback(false);
    setShowSummary(false);
    setCompletionWasReplay(false);
  };

  const handleChoice = (choice) => {
    if (showFeedback) return;

    setSelectedChoice(choice);
    setScenarioScore((score) => score + choice.score);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (!scenario || !selectedChoice) return;

    if (!isLastStep) {
      setStepIndex((index) => index + 1);
      setSelectedChoice(null);
      setShowFeedback(false);
      return;
    }

    // The scenario is completed only after its final step.
    const isNewCompletion = !completed.includes(activeScenario);
    setCompletionWasReplay(!isNewCompletion);

    if (isNewCompletion) {
      const finalScore = scenarioScore;
      const earnedXP = finalScore * 10;

      setCompleted((previous) => [
        ...previous,
        activeScenario,
      ]);

      // Award XP only once, after the final step.
      if (earnedXP > 0) {
        addXP(earnedXP);
      }

      // Count the score only on the first completion.
      setTotalScore((previous) => previous + finalScore);

      // Preserve the existing all-scenarios achievement logic.
      const allScenariosCompleted =
        completed.length + 1 === attackScenarios.length;

      if (allScenariosCompleted) {
        unlockAchievement("scenario-survivor");
        incrementStat("scenariosCompleted");
      }
    }

    setShowSummary(true);
  };

  const handleReturn = () => {
    setActiveScenario(null);
    setStepIndex(0);
    setScenarioScore(0);
    setSelectedChoice(null);
    setShowFeedback(false);
    setShowSummary(false);
  };

  const resetAll = () => {
    setActiveScenario(null);
    setStepIndex(0);
    setTotalScore(0);
    setScenarioScore(0);
    setSelectedChoice(null);
    setShowFeedback(false);
    setShowSummary(false);
  };

  // Final scenario summary screen.
  if (showSummary && scenario) {
    const isCompleted = completed.includes(activeScenario);
    const maxScenarioScore = scenario.steps.reduce(
      (total, currentStep) =>
        total + Math.max(...currentStep.choices.map((choice) => choice.score)),
      0
    );

    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <CyberCard glow>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Trophy
              className="text-neon-green mx-auto mb-4"
              size={52}
            />

            <h2 className="text-2xl font-display text-white mb-2">
              Scenario Completed!
            </h2>

            <p className="text-slate-400 text-sm mb-8">
              You have completed {scenario.title}.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="rounded-lg bg-white/5 p-5">
                <Target
                  className="text-neon-cyan mx-auto mb-2"
                  size={24}
                />
                <p className="text-slate-400 text-xs mb-1">
                  YOUR SCORE
                </p>
                <p className="text-2xl text-white font-mono">
                  {scenarioScore}/{maxScenarioScore}
                </p>
              </div>

              <div className="rounded-lg bg-white/5 p-5">
                <CheckCircle2
                  className="text-neon-green mx-auto mb-2"
                  size={24}
                />
                <p className="text-slate-400 text-xs mb-1">
                  STEPS COMPLETED
                </p>
                <p className="text-2xl text-white font-mono">
                  {totalSteps}/{totalSteps}
                </p>
              </div>
            </div>

            <div className="text-left rounded-lg bg-white/5 border border-cyber-border p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck
                  className="text-neon-green"
                  size={20}
                />
                <h3 className="text-white font-semibold">
                  Security Takeaway
                </h3>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">
                {scenario.bestAction}
              </p>
            </div>

            {isCompleted && (
              <p className="text-neon-green text-sm mb-5">
                {completionWasReplay
                  ? "Scenario already completed. No additional XP was awarded."
                  : "First-time completion recorded. XP awarded!"}
              </p>
            )}

            <AnimatedButton
              onClick={handleReturn}
              icon={ChevronRight}
            >
              Return to Scenarios
            </AnimatedButton>
          </motion.div>
        </CyberCard>
      </div>
    );
  }

  // Active scenario screen.
  if (activeScenario && scenario && step) {
    const progress = ((stepIndex + 1) / totalSteps) * 100;

    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{scenario.icon}</span>

          <div>
            <h2 className="font-display text-xl text-white">
              {scenario.title}
            </h2>

            <p className="text-slate-500 text-sm">
              {scenario.description}
            </p>
          </div>
        </div>

        <CyberCard glow>
          {/* Step progress indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neon-cyan text-xs font-mono">
                STEP {stepIndex + 1} OF {totalSteps}
              </span>

              <span className="text-slate-400 text-xs font-mono">
                {Math.round(progress)}% COMPLETE
              </span>
            </div>

            <div
              className="w-full h-2 rounded-full bg-white/10 overflow-hidden"
              role="progressbar"
              aria-label="Scenario progress"
              aria-valuemin={0}
              aria-valuemax={totalSteps}
              aria-valuenow={stepIndex + 1}
            >
              <motion.div
                className="h-full bg-neon-green rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <p className="text-slate-300 leading-relaxed mb-6">
            {step.prompt}
          </p>

          <div className="space-y-3">
            {step.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoice(choice)}
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
                  showFeedback &&
                    selectedChoice !== choice &&
                    "opacity-50"
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
              </div>

              <p className="text-slate-300 text-sm mb-4">
                {selectedChoice.feedback}
              </p>

              <p className="text-slate-400 text-xs mb-4">
                Scenario score: {scenarioScore}
              </p>

              {isLastStep && (
                <p className="text-neon-green text-xs font-mono mb-4">
                  BEST ACTION: {scenario.bestAction}
                </p>
              )}

              <AnimatedButton
                onClick={handleNext}
                className="mt-2"
                icon={ChevronRight}
              >
                {isLastStep ? "View Final Summary" : "Continue"}
              </AnimatedButton>
            </motion.div>
          )}
        </CyberCard>
      </div>
    );
  }

  // Scenario selection screen.
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
              Security Score:{" "}
              <span className="text-neon-green font-mono">
                {totalScore}
              </span>{" "}
              / {maxScore}
            </span>
          </div>

          <AnimatedButton
            variant="ghost"
            onClick={resetAll}
            icon={RotateCcw}
          >
            Reset
          </AnimatedButton>
        </CyberCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {attackScenarios.map((s) => (
          <CyberCard
            key={s.id}
            onClick={() => handleStart(s.id)}
            className={cn(
              completed.includes(s.id) &&
                "border-neon-green/40"
            )}
          >
            <span className="text-4xl mb-4 block">
              {s.icon}
            </span>

            <h3 className="text-lg font-semibold text-white mb-2">
              {s.title}
            </h3>

            <p className="text-slate-400 text-sm mb-4">
              {s.description}
            </p>

            {completed.includes(s.id) ? (
              <span className="text-neon-green text-xs font-mono">
                ✓ COMPLETED
              </span>
            ) : (
              <span className="text-neon-cyan text-sm flex items-center gap-1">
                Start Scenario <ChevronRight size={14} />
              </span>
            )}

            <p className="text-slate-500 text-xs mt-3">
              {s.steps.length} interactive steps
            </p>
          </CyberCard>
        ))}
      </div>
    </div>
  );
};
