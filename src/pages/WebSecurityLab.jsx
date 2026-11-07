import { useState } from "react";
import {
  Shield,
  Bug,
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Terminal,
  Lock,
  Unlock,
  Award,
  RefreshCw,
  Eye,
  Database,
  Globe,
  Server,
  FileCode,
} from "lucide-react";
import { SectionTitle } from "../components/SectionTitle";
import { CyberCard } from "../components/CyberCard";
import { AnimatedButton } from "../components/AnimatedButton";
import { useTheme } from "../context/ThemeContext";
import { WEB_SECURITY_MISSIONS } from "../data/webSecurityScenarios";
import {
  evaluateSqlQuery,
  evaluateXssPayload,
  evaluateIdorAccess,
  evaluateCommandInjection,
  evaluateChallengeMission,
} from "../utils/webSecurityEngine";

export const WebSecurityLab = () => {
  const { addXP } = useTheme();
  const [activeTab, setActiveTab] = useState("challenges"); // "challenges" | "sandbox"

  // Challenge Mode State
  const [selectedMissionId, setSelectedMissionId] = useState(WEB_SECURITY_MISSIONS[0].id);
  const currentMission =
    WEB_SECURITY_MISSIONS.find((m) => m.id === selectedMissionId) || WEB_SECURITY_MISSIONS[0];

  const [missionPayload, setMissionPayload] = useState(currentMission.defaultPayload || "");
  const [missionTargetId, setMissionTargetId] = useState(currentMission.targetId || "101");
  const [defenseActive, setDefenseActive] = useState(false);
  const [missionResult, setMissionResult] = useState(null);
  const [missionCompleted, setMissionCompleted] = useState({});

  // Sandbox Mode State
  const [sandboxCategory, setSandboxCategory] = useState("sqli"); // "sqli" | "xss" | "idor" | "rce"
  const [sandboxPayload, setSandboxPayload] = useState("' OR '1'='1");
  const [sandboxDefenseActive, setSandboxDefenseActive] = useState(false);
  const [sandboxExecutionResult, setSandboxExecutionResult] = useState(null);

  // Switch Mission handler
  const handleSelectMission = (mission) => {
    setSelectedMissionId(mission.id);
    setMissionPayload(mission.defaultPayload || "");
    setMissionTargetId(mission.targetId || "101");
    setDefenseActive(false);
    setMissionResult(null);
  };

  // Run Challenge Evaluation
  const handleRunChallenge = () => {
    const solution = {
      payload: missionPayload,
      targetId: missionTargetId,
      defenseActive,
    };

    const evalResult = evaluateChallengeMission(currentMission, solution);
    setMissionResult(evalResult);

    if (evalResult.passed && !missionCompleted[currentMission.id]) {
      if (typeof addXP === "function") {
        addXP(evalResult.xpEarned);
      }
      setMissionCompleted((prev) => ({ ...prev, [currentMission.id]: true }));
    }
  };

  // Run Sandbox Evaluation
  const handleRunSandbox = () => {
    let result = null;
    if (sandboxCategory === "sqli") {
      result = evaluateSqlQuery({
        queryTemplate: "SELECT * FROM users WHERE username = '{INPUT}'",
        input: sandboxPayload,
        parameterized: sandboxDefenseActive,
      });
    } else if (sandboxCategory === "xss") {
      result = evaluateXssPayload({
        input: sandboxPayload,
        htmlEncoding: sandboxDefenseActive,
      });
    } else if (sandboxCategory === "idor") {
      result = evaluateIdorAccess({
        requestedId: sandboxPayload,
        currentSession: { userId: 102, role: "user" },
        enforceOwnership: sandboxDefenseActive,
      });
    } else if (sandboxCategory === "rce") {
      result = evaluateCommandInjection({
        input: sandboxPayload,
        whitelistValidation: sandboxDefenseActive,
      });
    }
    setSandboxExecutionResult(result);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Title */}
      <div className="text-center mb-10">
        <SectionTitle
          title="Web Security & OWASP Defense Lab"
          subtitle="Explore real-world web exploitation vectors, inspect backend execution traces, and apply architectural secure coding defenses."
        />

        {/* Tab Switcher */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setActiveTab("challenges")}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === "challenges"
                ? "bg-neon-green/20 text-neon-green border border-neon-green/40 shadow-[0_0_15px_rgba(0,255,157,0.2)]"
                : "bg-cyber-gray/40 text-gray-400 hover:text-white border border-transparent"
            }`}
          >
            <Shield className="w-4 h-4" />
            OWASP Defense Challenges
          </button>
          <button
            onClick={() => {
              setActiveTab("sandbox");
              if (!sandboxExecutionResult) handleRunSandbox();
            }}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === "sandbox"
                ? "bg-neon-green/20 text-neon-green border border-neon-green/40 shadow-[0_0_15px_rgba(0,255,157,0.2)]"
                : "bg-cyber-gray/40 text-gray-400 hover:text-white border border-transparent"
            }`}
          >
            <Bug className="w-4 h-4" />
            Interactive Vulnerability Sandbox
          </button>
        </div>
      </div>

      {/* ===================== MODE 1: CHALLENGES ===================== */}
      {activeTab === "challenges" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Mission Selection Column */}
          <div className="lg:col-span-4 space-y-4">
            <CyberCard>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-neon-green" />
                Select Security Mission
              </h3>
              <div className="space-y-3">
                {WEB_SECURITY_MISSIONS.map((mission) => {
                  const isSelected = mission.id === currentMission.id;
                  const isDone = missionCompleted[mission.id];
                  return (
                    <div
                      key={mission.id}
                      onClick={() => handleSelectMission(mission)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-neon-green/10 border-neon-green/40 shadow-[0_0_10px_rgba(0,255,157,0.1)]"
                          : "bg-cyber-dark/40 border-cyber-gray/50 hover:border-gray-500"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
                          {mission.category.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-cyber-black text-gray-300 border border-cyber-gray/40">
                            +{mission.xpReward} XP
                          </span>
                          {isDone && <CheckCircle2 className="w-4 h-4 text-neon-green" />}
                        </div>
                      </div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-neon-green transition-colors">
                        {mission.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {mission.targetName} &bull; {mission.targetEndpoint}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CyberCard>
          </div>

          {/* Mission Interactive Studio */}
          <div className="lg:col-span-8 space-y-6">
            {/* Mission Briefing */}
            <CyberCard>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-neon-green" />
                  Mission Briefing: {currentMission.title}
                </h3>
                <span className="text-xs px-2.5 py-1 rounded bg-neon-green/10 text-neon-green border border-neon-green/30 font-medium">
                  Target: {currentMission.targetEndpoint}
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                {currentMission.description}
              </p>

              {/* Code Snippet Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-cyber-black/70 p-3 rounded-lg border border-red-500/20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-400 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Vulnerable Server Code
                  </div>
                  <pre className="text-[11px] font-mono text-gray-300 overflow-x-auto whitespace-pre">
                    {currentMission.vulnerableSnippet}
                  </pre>
                </div>
                <div className="bg-cyber-black/70 p-3 rounded-lg border border-neon-green/20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neon-green mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Secure Remediated Pattern
                  </div>
                  <pre className="text-[11px] font-mono text-gray-300 overflow-x-auto whitespace-pre">
                    {currentMission.secureSnippet}
                  </pre>
                </div>
              </div>
            </CyberCard>

            {/* Interactive Attack & Defense Console */}
            <CyberCard>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-neon-green" />
                Exploit Crafting & Secure Defense Console
              </h3>

              <div className="space-y-4">
                {/* Input form */}
                {currentMission.category === "idor" ? (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">
                      Target Account Identifier (ID parameter):
                    </label>
                    <input
                      type="text"
                      value={missionTargetId}
                      onChange={(e) => setMissionTargetId(e.target.value)}
                      className="w-full bg-cyber-black border border-cyber-gray/60 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-neon-green outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">
                      Injected User Parameter / Exploit Payload:
                    </label>
                    <input
                      type="text"
                      value={missionPayload}
                      onChange={(e) => setMissionPayload(e.target.value)}
                      className="w-full bg-cyber-black border border-cyber-gray/60 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-neon-green outline-none"
                    />
                  </div>
                )}

                {/* Preset Payloads */}
                {currentMission.presetPayloads && (
                  <div>
                    <span className="text-xs text-gray-400 mr-2">Quick Presets:</span>
                    <div className="inline-flex flex-wrap gap-2 mt-1">
                      {currentMission.presetPayloads.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (currentMission.category === "idor") {
                              setMissionTargetId(preset.payload);
                            } else {
                              setMissionPayload(preset.payload);
                            }
                          }}
                          className="text-xs px-2.5 py-1 rounded bg-cyber-dark text-gray-300 border border-cyber-gray/50 hover:border-neon-green hover:text-neon-green transition-all"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Defense Toggle */}
                <div className="p-4 rounded-xl bg-cyber-black/60 border border-cyber-gray/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {defenseActive ? (
                        <Lock className="w-4 h-4 text-neon-green" />
                      ) : (
                        <Unlock className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-sm font-semibold text-white">
                        {currentMission.defenseName}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 max-w-xl">
                      {currentMission.defenseExplanation}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDefenseActive(!defenseActive)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                      defenseActive
                        ? "bg-neon-green text-cyber-black font-bold shadow-[0_0_10px_rgba(0,255,157,0.3)]"
                        : "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30"
                    }`}
                  >
                    {defenseActive ? "Defense ACTIVE" : "Defense DISABLED"}
                  </button>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <AnimatedButton
                    onClick={handleRunChallenge}
                    className="w-full flex items-center justify-center gap-2 bg-neon-green hover:bg-neon-green/90 text-cyber-black font-bold py-3 rounded-lg"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Deploy Payload & Evaluate Defense
                  </AnimatedButton>
                </div>
              </div>
            </CyberCard>

            {/* Mission Results Card */}
            {missionResult && (
              <CyberCard>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-neon-green" />
                  Mission Evaluation Verdict
                </h3>

                <div
                  className={`p-4 rounded-xl border mb-4 ${
                    missionResult.passed
                      ? "bg-neon-green/10 border-neon-green/40 text-neon-green"
                      : "bg-red-500/10 border-red-500/40 text-red-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-bold flex items-center gap-2">
                      {missionResult.passed ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" /> Mission Accomplished (Score:{" "}
                          {missionResult.score}%)
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" /> Mission Incomplete (Score:{" "}
                          {missionResult.score}%)
                        </>
                      )}
                    </span>
                    {missionResult.passed && (
                      <span className="text-xs px-3 py-1 rounded-full bg-neon-green/20 font-bold border border-neon-green/50">
                        +{missionResult.xpEarned} XP Awarded!
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {missionResult.feedback}
                  </p>
                </div>
              </CyberCard>
            )}
          </div>
        </div>
      )}

      {/* ===================== MODE 2: SANDBOX ===================== */}
      {activeTab === "sandbox" && (
        <div className="space-y-6">
          <CyberCard>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-neon-green" />
              Interactive Vulnerability & Sanitization Sandbox
            </h3>

            {/* Vulnerability Category Picker */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { id: "sqli", label: "SQL Injection", icon: Database, default: "' OR '1'='1" },
                {
                  id: "xss",
                  label: "Cross-Site Scripting",
                  icon: Globe,
                  default: "<script>alert(document.cookie)</script>",
                },
                { id: "idor", label: "IDOR Access", icon: Eye, default: "101" },
                { id: "rce", label: "Command Injection", icon: Server, default: "127.0.0.1; whoami" },
              ].map((cat) => {
                const Icon = cat.icon;
                const isSelected = sandboxCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSandboxCategory(cat.id);
                      setSandboxPayload(cat.default);
                      setSandboxExecutionResult(null);
                    }}
                    className={`p-3 rounded-lg border text-left transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? "bg-neon-green/15 border-neon-green text-neon-green"
                        : "bg-cyber-dark/50 border-cyber-gray/40 text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-semibold">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sandbox Input Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Custom Input Payload:
                </label>
                <input
                  type="text"
                  value={sandboxPayload}
                  onChange={(e) => setSandboxPayload(e.target.value)}
                  className="w-full bg-cyber-black border border-cyber-gray/60 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-neon-green outline-none"
                  placeholder="Enter test payload..."
                />
              </div>

              {/* Defense Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-cyber-black border border-cyber-gray/40">
                <span className="text-xs text-gray-300">
                  Enable Architectural Secure Coding Defense (Prepared Statements / Entity Encoding / Whitelist)
                </span>
                <button
                  type="button"
                  onClick={() => setSandboxDefenseActive(!sandboxDefenseActive)}
                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all ${
                    sandboxDefenseActive
                      ? "bg-neon-green text-cyber-black"
                      : "bg-cyber-dark text-gray-400 border border-cyber-gray"
                  }`}
                >
                  {sandboxDefenseActive ? "Defense ON" : "Defense OFF"}
                </button>
              </div>

              {/* Run Button */}
              <AnimatedButton
                onClick={handleRunSandbox}
                className="w-full flex items-center justify-center gap-2 bg-neon-green hover:bg-neon-green/90 text-cyber-black font-bold py-2.5 rounded-lg"
              >
                <Play className="w-4 h-4 fill-current" />
                Simulate Execution
              </AnimatedButton>
            </div>
          </CyberCard>

          {/* Sandbox Execution Stream */}
          {sandboxExecutionResult && (
            <CyberCard>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-neon-green" />
                Live Execution Stream & Security Inspection
              </h3>

              <div className="space-y-3 font-mono text-xs">
                {/* Status Bar */}
                <div className="p-3 rounded-lg bg-cyber-black border border-cyber-gray/40 flex items-center justify-between">
                  <span className="text-gray-400">Classification:</span>
                  <span
                    className={`font-bold ${
                      sandboxExecutionResult.vulnerable || sandboxExecutionResult.breached
                        ? "text-red-400"
                        : "text-neon-green"
                    }`}
                  >
                    {sandboxExecutionResult.technique}
                  </span>
                </div>

                {/* Explanation */}
                <div className="p-3 rounded-lg bg-cyber-dark/50 border border-cyber-gray/40 text-gray-300">
                  <span className="text-gray-400 block mb-1 font-sans text-xs font-semibold">
                    Analysis:
                  </span>
                  {sandboxExecutionResult.explanation}
                </div>

                {/* Output Details */}
                {sandboxExecutionResult.executedQuery && (
                  <div className="p-3 rounded-lg bg-cyber-black border border-cyber-gray/40">
                    <span className="text-gray-400 block mb-1">Executed SQL:</span>
                    <code className="text-neon-green">{sandboxExecutionResult.executedQuery}</code>
                    {sandboxExecutionResult.boundParameters && (
                      <div className="mt-2 text-gray-400">
                        Bound Parameters:{" "}
                        <span className="text-yellow-400">
                          {JSON.stringify(sandboxExecutionResult.boundParameters)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {sandboxExecutionResult.renderedHtml !== undefined && (
                  <div className="p-3 rounded-lg bg-cyber-black border border-cyber-gray/40">
                    <span className="text-gray-400 block mb-1">Rendered DOM Output:</span>
                    <code className="text-yellow-300">{sandboxExecutionResult.renderedHtml}</code>
                    {sandboxExecutionResult.capturedCookie && (
                      <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/30 text-red-400">
                        Captured Cookie: {sandboxExecutionResult.capturedCookie}
                      </div>
                    )}
                  </div>
                )}

                {sandboxExecutionResult.record && (
                  <div className="p-3 rounded-lg bg-cyber-black border border-cyber-gray/40">
                    <span className="text-gray-400 block mb-1">Retrieved Object Record:</span>
                    <pre className="text-cyan-300">
                      {JSON.stringify(sandboxExecutionResult.record, null, 2)}
                    </pre>
                  </div>
                )}

                {sandboxExecutionResult.output && (
                  <div className="p-3 rounded-lg bg-cyber-black border border-cyber-gray/40">
                    <span className="text-gray-400 block mb-1">Subprocess Output:</span>
                    <pre className="text-gray-200 whitespace-pre">
                      {sandboxExecutionResult.output}
                    </pre>
                  </div>
                )}
              </div>
            </CyberCard>
          )}
        </div>
      )}
    </div>
  );
};
