import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
} from "lucide-react";
import { SectionTitle } from "../components/SectionTitle";
import { CyberCard } from "../components/CyberCard";
import { AnimatedButton } from "../components/AnimatedButton";
import { phishingEmails, phishingTacticsGuide } from "../data/phishingEmails";
import { useTheme } from "../context/ThemeContext";
import { XP_REWARDS } from "../data/rankProgression";
import { cn } from "../utils/helpers";

export const PhishingSimulator = () => {
  const [emailIndex, setEmailIndex] = useState(0);
  const [markedAreas, setMarkedAreas] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [userVerdict, setUserVerdict] = useState(null);
  const [completedEmails, setCompletedEmails] = useState([]);
  const { unlockAchievement, incrementStat, addXP } = useTheme();

  const email = phishingEmails[emailIndex];

  const toggleMark = (areaId) => {
    if (submitted) return;
    setMarkedAreas((prev) =>
      prev.includes(areaId) ? prev.filter((a) => a !== areaId) : [...prev, areaId]
    );
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!completedEmails.includes(emailIndex)) {
      setCompletedEmails((prev) => [...prev, emailIndex]);
      addXP(XP_REWARDS.PHISHING_EMAIL);
    }
    if (emailIndex === phishingEmails.length - 1) {
      unlockAchievement("phishing-hunter");
      incrementStat("phishingCompleted");
    }
  };

  const handleNext = () => {
    setEmailIndex((i) => Math.min(i + 1, phishingEmails.length - 1));
    setMarkedAreas([]);
    setSubmitted(false);
    setUserVerdict(null);
  };

  const handlePrev = () => {
    setEmailIndex((i) => Math.max(i - 1, 0));
    setMarkedAreas([]);
    setSubmitted(false);
    setUserVerdict(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionTitle
        title="Phishing Email Simulator"
        subtitle="Analyze realistic emails. Mark suspicious areas and decide if each email is phishing or legitimate."
        align="left"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Email list sidebar */}
        <div className="space-y-3">
          <h3 className="text-sm font-mono text-neon-cyan uppercase tracking-wider mb-4">Inbox</h3>
          {phishingEmails.map((e, i) => (
            <button
              key={e.id}
              onClick={() => {
                setEmailIndex(i);
                setMarkedAreas([]);
                setSubmitted(false);
                setUserVerdict(null);
              }}
              className={cn(
                "w-full text-left p-4 rounded-lg border transition-all",
                emailIndex === i
                  ? "border-neon-green bg-neon-green/10"
                  : "border-cyber-border bg-white/5 hover:border-neon-cyan/30"
              )}
            >
              <p className="text-white text-sm font-medium truncate">{e.subject}</p>
              <p className="text-slate-500 text-xs truncate mt-1">{e.displayFrom}</p>
            </button>
          ))}

          <CyberCard className="mt-6">
            <h4 className="text-neon-green font-mono text-xs uppercase mb-3">Phishing Tactics</h4>
            <ul className="space-y-2">
              {phishingTacticsGuide.map((t, i) => (
                <li key={i} className="text-xs text-slate-400">
                  <span className="text-neon-cyan">{t.name}:</span> {t.description}
                </li>
              ))}
            </ul>
          </CyberCard>
        </div>

        {/* Gmail-style email viewer */}
        <div className="lg:col-span-2 space-y-6">
          <CyberCard padding="p-0" hover={false}>
            {/* Gmail header bar */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-cyber-border bg-white/5">
              <Mail className="text-neon-cyan" size={20} />
              <span className="text-white font-medium">Gmail Simulator</span>
              <span className="ml-auto text-xs text-slate-500 font-mono">Training Mode</span>
            </div>

            {/* Email header */}
            <div className="px-6 py-5 border-b border-cyber-border">
              <h2 className="text-xl text-white font-medium mb-4">{email.subject}</h2>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center text-cyber-black font-bold text-sm">
                  {email.from[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{email.displayFrom}</p>
                  <p
                    className={cn(
                      "text-xs font-mono cursor-pointer rounded px-1 -mx-1 transition-colors",
                      markedAreas.includes("sender") && "bg-danger/30 text-danger",
                      !submitted && "hover:bg-danger/20"
                    )}
                    onClick={() => toggleMark("sender")}
                  >
                    &lt;{email.from}&gt;
                    {!submitted && <Flag size={10} className="inline ml-1 opacity-50" />}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">to {email.to} · {email.date}</p>
                </div>
              </div>
            </div>

            {/* Email body */}
            <div className="px-6 py-6 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {email.body}
            </div>
            {email.isPhishing && !submitted && (
              <div className="px-6 pb-4 flex flex-wrap gap-2">
                {email.suspiciousAreas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => toggleMark(area.id)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs border transition-colors",
                      markedAreas.includes(area.id)
                        ? "border-danger bg-danger/20 text-danger"
                        : "border-cyber-border text-slate-400 hover:border-warning/50"
                    )}
                  >
                    {area.label}
                  </button>
                ))}
              </div>
            )}
          </CyberCard>

          {/* User verdict */}
          {!submitted ? (
            <CyberCard>
              <p className="text-white mb-4 font-medium">Is this email phishing or legitimate?</p>
              <div className="flex flex-wrap gap-3">
                <AnimatedButton
                  variant={userVerdict === "phishing" ? "danger" : "secondary"}
                  onClick={() => setUserVerdict("phishing")}
                  icon={AlertTriangle}
                >
                  Phishing
                </AnimatedButton>
                <AnimatedButton
                  variant={userVerdict === "legitimate" ? "primary" : "secondary"}
                  onClick={() => setUserVerdict("legitimate")}
                  icon={CheckCircle}
                >
                  Legitimate
                </AnimatedButton>
                <AnimatedButton
                  onClick={handleSubmit}
                  disabled={!userVerdict}
                  className="ml-auto"
                >
                  Submit Analysis
                </AnimatedButton>
              </div>
              <p className="text-slate-500 text-xs mt-3">
                Tip: Click highlighted phrases or the sender address to mark suspicious areas.
              </p>
            </CyberCard>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CyberCard
                glow
                className={cn(
                  "border-2",
                  (userVerdict === "phishing") === email.isPhishing
                    ? "border-neon-green"
                    : "border-danger"
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  {(userVerdict === "phishing") === email.isPhishing ? (
                    <CheckCircle className="text-neon-green" size={28} />
                  ) : (
                    <XCircle className="text-danger" size={28} />
                  )}
                  <h3 className="text-xl font-semibold text-white">
                    {(userVerdict === "phishing") === email.isPhishing
                      ? "Correct!"
                      : "Incorrect"}
                  </h3>
                </div>

                <p className="text-slate-300 mb-4">{email.explanation}</p>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-neon-cyan text-xs font-mono mb-4">
                  <span>+{XP_REWARDS.PHISHING_EMAIL} Defense XP Earned</span>
                </div>

                {email.tactics.length > 0 && (
                  <div className="mb-4">
                    <p className="text-neon-cyan text-sm font-mono mb-2">TACTICS USED:</p>
                    <div className="flex flex-wrap gap-2">
                      {email.tactics.map((t, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full bg-danger/20 text-danger text-xs border border-danger/30"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <AnimatedButton variant="ghost" onClick={handlePrev} disabled={emailIndex === 0} icon={ChevronLeft}>
                    Previous
                  </AnimatedButton>
                  <AnimatedButton onClick={handleNext} disabled={emailIndex === phishingEmails.length - 1} icon={ChevronRight}>
                    Next Email
                  </AnimatedButton>
                </div>
              </CyberCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
