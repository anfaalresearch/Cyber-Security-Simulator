import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, KeyRound, Copy, RefreshCw, Check, X } from "lucide-react";
import { SectionTitle } from "../components/SectionTitle";
import { CyberCard } from "../components/CyberCard";
import { AnimatedButton } from "../components/AnimatedButton";
import { analyzePassword } from "../utils/passwordStrength";
import { useTheme } from "../context/ThemeContext";
import { XP_REWARDS } from "../data/rankProgression";
import { cn } from "../utils/helpers";

export const PasswordAnalyzer = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [awardedXP, setAwardedXP] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(null);
  const { unlockAchievement, addXP } = useTheme();

  const analysis = analyzePassword(password);

  useEffect(() => {
    return () => clearTimeout(copyTimer.current);
  }, []);

  const handlePasswordChange = (val) => {
    setPassword(val);
    const result = analyzePassword(val);
    if (result.score >= 8) {
      unlockAchievement("password-pro");
      if (!awardedXP) {
        setAwardedXP(true);
        addXP(XP_REWARDS.PASSWORD_STRONG);
      }
    }
  };

    const copySuggestion = async () => {
    try {
      await navigator.clipboard.writeText(analysis.suggestions);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Could not copy to clipboard", err);
    }
  };

  const checkItems = [
    { key: "length", label: "12+ characters" },
    { key: "uppercase", label: "Uppercase letter" },
    { key: "lowercase", label: "Lowercase letter" },
    { key: "numbers", label: "Number" },
    { key: "symbols", label: "Special character" },
    { key: "noCommon", label: "Not a common password" },
    { key: "noRepeating", label: "No repeating chars" },
    { key: "noSequential", label: "No sequential patterns" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionTitle
        title="Password Strength Analyzer"
        subtitle="Real-time password analysis with crack-time estimates and security recommendations"
        align="left"
      />

      <CyberCard glow className="mb-8">
        <label className="text-sm text-slate-400 font-mono mb-2 block">ENTER PASSWORD</label>
        <div className="relative">
          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-green" size={20} />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder="Type a password to analyze..."
            className="w-full pl-12 pr-12 py-4 bg-cyber-black border border-cyber-border rounded-lg text-white font-mono focus:border-neon-green focus:outline-none focus:ring-1 focus:ring-neon-green/50 transition-all"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Strength meter */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-mono" style={{ color: analysis.color }}>
              {analysis.label}
            </span>
            <span className="text-sm text-slate-500">
              Crack time: <span className="text-white font-mono">{analysis.crackTime}</span>
            </span>
          </div>
          <div className="h-3 bg-cyber-border rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: analysis.color }}
              initial={{ width: 0 }}
              animate={{ width: `${analysis.percentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-slate-600 font-mono">
            <span>0</span>
            <span>Score: {analysis.score}/10</span>
            <span>10</span>
          </div>
          {analysis.score >= 8 && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono">
              <span>+{XP_REWARDS.PASSWORD_STRONG} XP Earned (Robust Password)</span>
            </div>
          )}
        </div>
      </CyberCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Checks */}
        <CyberCard>
          <h3 className="text-white font-semibold mb-4">Security Checks</h3>
          <ul className="space-y-2">
            {checkItems.map(({ key, label }) => (
              <li key={key} className="flex items-center gap-3 text-sm">
                {analysis.checks[key] ? (
                  <Check className="text-neon-green flex-shrink-0" size={16} />
                ) : (
                  <X className="text-slate-600 flex-shrink-0" size={16} />
                )}
                <span className={analysis.checks[key] ? "text-slate-300" : "text-slate-600"}>
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </CyberCard>

        {/* Tips */}
        <CyberCard>
          <h3 className="text-white font-semibold mb-4">Recommendations</h3>
          <ul className="space-y-2">
            {analysis.tips.map((tip, i) => (
              <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                <span className="text-neon-cyan mt-0.5">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </CyberCard>
      </div>

      {/* Suggestion */}
      {password && analysis.score < 8 && (
        <CyberCard className="mt-6 border-neon-cyan/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-neon-cyan font-mono text-sm">SUGGESTED STRONG PASSWORD</h3>
            <div className="flex gap-2">
              <button
                onClick={copySuggestion}
                aria-label={copied ? "Copied to clipboard" : "Copy suggested password"}
                className={cn(
                  "p-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1.5",
                  copied ? "text-neon-green" : "text-slate-400 hover:text-neon-green"
                )}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied && <span className="text-xs font-mono">Copied!</span>}
              </button>
              <button
                onClick={() => handlePasswordChange(analysis.suggestions)}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-neon-cyan transition-colors"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
          <p className="font-mono text-white text-sm break-all">{analysis.suggestions}</p>
        </CyberCard>
      )}
    </div>
  );
};
