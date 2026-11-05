import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Circle,
  ExternalLink,
  Shield,
} from "lucide-react";
import { SectionTitle } from "../components/SectionTitle";
import { CyberCard } from "../components/CyberCard";
import { AnimatedButton } from "../components/AnimatedButton";
import { websiteExamples } from "../data/websites";
import { useTheme } from "../context/ThemeContext";
import { XP_REWARDS } from "../data/rankProgression";
import { cn } from "../utils/helpers";
import { UrlThreatAnalysis } from "../components/UrlThreatAnalysis";

export const FakeWebsiteDetector = () => {
  const [selectedId, setSelectedId] = useState(websiteExamples[0].id);
  const [verdict, setVerdict] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [checkedSites, setCheckedSites] = useState([]);
  const { incrementStat, addXP } = useTheme();

  const site = websiteExamples.find((s) => s.id === selectedId);

  const handleCheck = (userSaysFake) => {
    setVerdict(userSaysFake);
    setShowResult(true);
    incrementStat("websitesChecked");
    if (!checkedSites.includes(site.id)) {
      setCheckedSites((prev) => [...prev, site.id]);
      addXP(XP_REWARDS.WEBSITE_CHECK);
    }
  };

  
  const inspectAnother = () => {
  const currentIndex = websiteExamples.findIndex(item => item.id === selectedId);
  const nextIndex = (currentIndex + 1)%websiteExamples.length;
  const nextwebsite = websiteExamples[nextIndex];
  setSelectedId(nextwebsite.id);
  reset();
  };

  const reset = () => {
    setVerdict(null);
    setShowResult(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionTitle
        title="Fake Website Detector"
        subtitle="Inspect URLs, SSL indicators, and popups to identify fraudulent websites"
        align="left"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Site selector */}
        <div className="space-y-2">
          {websiteExamples.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={cn(
                "w-full text-left p-3 rounded-lg border text-sm transition-all",
                selectedId === s.id
                  ? "border-neon-cyan bg-neon-cyan/10 text-white"
                  : "border-cyber-border text-slate-400 hover:border-neon-cyan/30"
              )}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Browser mockup */}
        <div className="lg:col-span-3 space-y-6">
          <CyberCard padding="p-0" hover={false}>
            {/* Browser chrome */}
            <div className="bg-cyber-card border-b border-cyber-border p-3">
              <div className="flex gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-danger/80" />
                <div className="w-3 h-3 rounded-full bg-warning/80" />
                <div className="w-3 h-3 rounded-full bg-neon-green/80" />
              </div>
              <div className="flex items-center gap-2 bg-cyber-black rounded-lg px-4 py-2 border border-cyber-border">
                {site.https ? (
                  <Lock className="text-neon-green flex-shrink-0" size={16} />
                ) : (
                  <Unlock className="text-danger flex-shrink-0" size={16} />
                )}
                <span className={cn(
                  "font-mono text-sm truncate",
                  site.https ? "text-neon-green" : "text-danger"
                )}>
                  {site.url}
                </span>
              </div>
            </div>

            {/* Page content */}
            <div className="p-8 min-h-[300px] relative">
              <div className="max-w-md mx-auto text-center">
                <Globe className="mx-auto text-neon-cyan mb-4" size={48} />
                <h3 className="text-2xl font-display text-white mb-2">{site.name}</h3>
                <p className="text-slate-500 font-mono text-sm mb-6">{site.displayUrl}</p>

                <div className="space-y-3 text-left">
                  <div className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border text-sm",
                    site.https ? "border-neon-green/30 bg-neon-green/5" : "border-danger/30 bg-danger/5"
                  )}>
                    {site.https ? <Lock size={16} className="text-neon-green" /> : <Unlock size={16} className="text-danger" />}
                    <span>{site.https ? "HTTPS Secured" : "Not Secure — No HTTPS"}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-cyber-border bg-white/5 text-sm">
                    <ExternalLink size={16} className="text-neon-cyan" />
                    <span>Domain: <strong className="text-white">{site.displayUrl}</strong></span>
                  </div>
                </div>
              </div>

              {/* Fake popup */}
              {site.hasPopup && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 bg-black/70 flex items-center justify-center p-4"
                >
                  <div className="bg-cyber-card border-2 border-danger rounded-xl p-6 max-w-sm w-full shadow-[0_0_40px_rgba(255,51,102,0.3)]">
                    <AlertTriangle className="text-danger mx-auto mb-3" size={32} />
                    <p className="text-white text-center font-medium mb-2">⚠ Warning</p>
                    <p className="text-slate-400 text-sm text-center mb-4">{site.popupText}</p>
                    <button className="w-full py-2 bg-danger text-white rounded-lg text-sm font-medium">
                      Enter Credentials
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </CyberCard>

          <CyberCard>
            <UrlThreatAnalysis
              title="Website URL Security Analysis"
              urls={[{ label: site.name, url: site.url }]}
            />
          </CyberCard>

          {/* Inspection checklist */}
          <CyberCard>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Shield size={18} className="text-neon-green" />
              Inspection Checklist
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {[
                { label: "HTTPS Enabled", safe: site.https },
                { label: "Official Domain", safe: !site.isFake },
                { label: "No Suspicious Popup", safe: !site.hasPopup },
                { label: "Valid TLD (.com)", safe: !site.displayUrl.includes(".xyz") && !site.displayUrl.includes(".net") },
      ].map((check, i) => (
  <div key={i} className={cn(
    "flex items-center gap-2 p-3 rounded-lg text-sm",
    !showResult
      ? "bg-white/5 text-slate-300"
      : check.safe
        ? "bg-neon-green/10 text-neon-green"
        : "bg-danger/10 text-danger"
  )}>
    {!showResult ? <Circle size={16} /> : check.safe ? <CheckCircle size={16} /> : <XCircle size={16} />}
    {check.label}
  </div>
))}
</div>

            {!showResult ? (
              <div className="flex gap-3">
                <AnimatedButton variant="danger" onClick={() => handleCheck(true)} icon={AlertTriangle}>
                  Report as Fake
                </AnimatedButton>
                <AnimatedButton onClick={() => handleCheck(false)} icon={CheckCircle}>
                  Mark as Legitimate
                </AnimatedButton>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className={cn(
                  "p-4 rounded-lg border mb-4",
                  verdict === site.isFake ? "border-neon-green bg-neon-green/10" : "border-danger bg-danger/10"
                )}>
                  <p className="text-white font-medium mb-2">
                    {verdict === site.isFake ? "✓ Correct!" : "✗ Incorrect"}
                  </p>
                  <p className="text-slate-400 text-sm mb-2">
                    This site is {site.isFake ? "FAKE" : "LEGITIMATE"}.
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/30 text-slate-300 text-xs font-mono">
                    <span>+{XP_REWARDS.WEBSITE_CHECK} Defense XP</span>
                  </div>
                </div>

                {site.redFlags.length > 0 && (
                  <div className="mb-4">
                    <p className="text-neon-cyan text-sm font-mono mb-2">RED FLAGS:</p>
                    <ul className="space-y-1">
                      {site.redFlags.map((flag, i) => (
                        <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                          <AlertTriangle size={14} className="text-danger mt-0.5 flex-shrink-0" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <CyberCard className="bg-neon-green/5 border-neon-green/20">
                  <p className="text-neon-green text-xs font-mono mb-2">SAFE VERSION</p>
                  <p className="text-white font-mono text-sm">{site.safeVersion.url}</p>
                </CyberCard>

                <AnimatedButton onClick={inspectAnother} variant="secondary" className="mt-4">
                  Inspect Another
                </AnimatedButton>
              </motion.div>
            )}
          </CyberCard>
        </div>
      </div>
    </div>
  );
};
