import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, Trophy, RotateCcw, ChevronRight } from "lucide-react";
import { SectionTitle } from "../components/SectionTitle";
import { QuizCard } from "../components/QuizCard";
import { CyberCard } from "../components/CyberCard";
import { AnimatedButton } from "../components/AnimatedButton";
import { quizQuestions } from "../data/quizQuestions";
import { shuffleArray, getScoreGrade, cn } from "../utils/helpers";
import { useTheme } from "../context/ThemeContext";
import { XP_REWARDS } from "../data/rankProgression";

const QUIZ_TIME = 300; // 5 minutes
const QUESTIONS_PER_QUIZ = 5;

export const CyberQuiz = () => {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [started, setStarted] = useState(false);
  const { recordQuizScore, unlockAchievement, addXP } = useTheme();

  const startQuiz = useCallback(() => {
    setQuestions(shuffleArray(quizQuestions).slice(0, QUESTIONS_PER_QUIZ));
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setShowResult(false);
    setAnswered(false);
    setFinished(false);
    setTimeLeft(QUIZ_TIME);
    setStarted(true);
    unlockAchievement("first-quiz");
  }, [unlockAchievement]);

  useEffect(() => {
    if (!started || finished) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, finished]);

  const handleSelect = (index) => {
    if (answered) return;
    setSelected(index);
  };

  const handleNext = () => {
    if (!answered) {
      const correct = selected === questions[current].correct;
      if (correct) setScore((s) => s + 1);
      setShowResult(true);
      setAnswered(true);
      return;
    }

    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowResult(false);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  };

  useEffect(() => {
    if (finished && started && questions.length > 0) {
      recordQuizScore(score, questions.length);
      if (score > 0) {
        addXP(score * XP_REWARDS.QUIZ_CORRECT);
      }
    }
  }, [finished, started, score, questions.length, recordQuizScore, addXP]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const progress = started && !finished ? ((current + (answered ? 1 : 0)) / questions.length) * 100 : 0;

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <SectionTitle title="Cyber Safety Quiz" subtitle="Test your knowledge with timed multiple-choice questions" />
        <CyberCard glow className="py-12">
          <Trophy className="mx-auto text-neon-green mb-4" size={48} />
          <p className="text-slate-400 mb-2">{QUESTIONS_PER_QUIZ} random questions</p>
          <p className="text-slate-400 mb-8">{QUIZ_TIME / 60} minute time limit</p>
          <AnimatedButton onClick={startQuiz} icon={ChevronRight}>Start Quiz</AnimatedButton>
        </CyberCard>
      </div>
    );
  }

  if (finished) {
    const grade = getScoreGrade(score, questions.length);
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <CyberCard glow className="text-center py-12">
          <Trophy className={`mx-auto mb-4 ${grade.color}`} size={56} />
          <h2 className="font-display text-3xl text-white mb-2">Quiz Complete!</h2>
          <p className={`text-6xl font-display font-bold ${grade.color} mb-2`}>{grade.grade}</p>
          <p className="text-slate-400 mb-6">{grade.label}</p>
          <p className="text-2xl text-white mb-2">
            {score} / {questions.length} correct
          </p>
          <p className="text-slate-500 mb-4">
            {Math.round((score / questions.length) * 100)}% accuracy
          </p>
          {score > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-mono mb-6">
              <span>+{score * XP_REWARDS.QUIZ_CORRECT} Defense XP Earned</span>
            </div>
          )}
          <div>
            <AnimatedButton onClick={startQuiz} icon={RotateCcw}>Try Again</AnimatedButton>
          </div>
        </CyberCard>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-6">
        <div className={cn("inline-flex items-center justify-center gap-3 rounded-xl border px-4 py-2 shadow-md transition-all duration-300",
    timeLeft <= 10
      ? "bg-danger/15 border-danger/50"
      : timeLeft <= 20
        ? "bg-warning/15 border-warning/50"
        : "bg-slate-800/70 border-slate-700"
  )}
>
  <Clock
    size={21}
    className={cn(
      timeLeft <= 10
        ? "text-danger"
        : timeLeft <= 20
          ? "text-warning"
          : "text-slate-300"
    )}
  />

  <span
    className={cn(
      "font-mono text-xl sm:text-2xl font-extrabold tracking-wide tabular-nums transition-colors duration-300",
      timeLeft <= 10
        ? "text-danger animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]"
        : timeLeft <= 20
          ? "text-warning drop-shadow-[0_0_6px_rgba(234,179,8,0.5)]"
          : "text-slate-100"
    )}
  >
    {formatTime(timeLeft)}
  </span>
</div>
        <span className="text-slate-400 text-sm">
          Question {current + 1} of {questions.length}
        </span>
        <span className="text-neon-green font-mono text-sm">Score: {score}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-cyber-border rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-neon-green to-neon-cyan"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <QuizCard
        question={q.question}
        options={q.options}
        selected={selected}
        onSelect={handleSelect}
        showResult={showResult}
        correctIndex={q.correct}
        disabled={answered}
      />

      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <CyberCard className={selected === q.correct ? "border-neon-green/50" : "border-danger/50"}>
            <p className="text-sm text-slate-300">{q.explanation}</p>
          </CyberCard>
        </motion.div>
      )}

      <div className="mt-6 flex justify-end">
        <AnimatedButton
          onClick={handleNext}
          disabled={selected === null && !answered}
          icon={ChevronRight}
        >
          {!answered ? "Check Answer" : current < questions.length - 1 ? "Next Question" : "Finish Quiz"}
        </AnimatedButton>
      </div>
    </div>
  );
};
