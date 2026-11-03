import { useState } from "react";
import { Shield, Plus, Trash2, Play, CheckCircle2, XCircle, AlertTriangle, ArrowUpDown, Filter, RefreshCw, Award } from "lucide-react";
import { SectionTitle } from "../components/SectionTitle";
import { CyberCard } from "../components/CyberCard";
import { AnimatedButton } from "../components/AnimatedButton";
import { useTheme } from "../context/ThemeContext";
import {
  DEFENSE_CHALLENGES,
  runDefenseScenario,
  evaluatePacket,
  inspectPayload
} from "../utils/firewallEngine";

const DEFAULT_SANDBOX_RULES = [
  { id: "r-dpi", priority: 1, action: "DROP", protocol: "TCP", srcCidr: "*", dstCidr: "*", dstPort: "80,443", dpiFilter: true, name: "Drop Malicious Web Payloads (DPI)" },
  { id: "r-web", priority: 10, action: "ALLOW", protocol: "TCP", srcCidr: "*", dstCidr: "10.0.0.5/32", dstPort: "80,443", name: "Allow Inbound HTTP/HTTPS" },
  { id: "r-ssh-admin", priority: 20, action: "ALLOW", protocol: "TCP", srcCidr: "10.10.100.0/24", dstCidr: "*", dstPort: "22", name: "Admin SSH Access" },
  { id: "r-deny-all", priority: 100, action: "DROP", protocol: "ALL", srcCidr: "*", dstCidr: "*", dstPort: "*", name: "Default Drop Policy" }
];

export const FirewallSimulator = () => {
  const { awardXp } = useTheme();
  const [activeTab, setActiveTab] = useState("challenges"); // "challenges" | "sandbox"
  
  // Challenge State
  const [selectedChallengeId, setSelectedChallengeId] = useState(DEFENSE_CHALLENGES[0].id);
  const currentChallenge = DEFENSE_CHALLENGES.find((c) => c.id === selectedChallengeId) || DEFENSE_CHALLENGES[0];
  const [challengeRules, setChallengeRules] = useState(() => currentChallenge.initialRules || []);
  const [challengeResult, setChallengeResult] = useState(null);

  // Sandbox State
  const [sandboxRules, setSandboxRules] = useState(DEFAULT_SANDBOX_RULES);
  const [customPacket, setCustomPacket] = useState({
    srcIp: "192.168.1.100",
    dstIp: "10.0.0.5",
    protocol: "TCP",
    dstPort: "80",
    payload: "GET /api/status HTTP/1.1"
  });
  const [sandboxLog, setSandboxLog] = useState([]);

  // New Rule Form State
  const [newRule, setNewRule] = useState({
    name: "New Filter Rule",
    priority: 5,
    action: "ALLOW",
    protocol: "TCP",
    srcCidr: "*",
    dstCidr: "*",
    dstPort: "*",
    dpiFilter: false
  });

  const handleSelectChallenge = (id) => {
    setSelectedChallengeId(id);
    const challenge = DEFENSE_CHALLENGES.find((c) => c.id === id);
    if (challenge) {
      setChallengeRules([...challenge.initialRules]);
      setChallengeResult(null);
    }
  };

  const handleAddRule = (isChallenge) => {
    const ruleObj = {
      ...newRule,
      id: `rule-${Date.now()}`,
      priority: Number(newRule.priority) || 10
    };
    if (isChallenge) {
      setChallengeRules((prev) => [...prev, ruleObj].sort((a, b) => a.priority - b.priority));
    } else {
      setSandboxRules((prev) => [...prev, ruleObj].sort((a, b) => a.priority - b.priority));
    }
    setNewRule({
      name: "Custom Rule",
      priority: (Number(newRule.priority) || 10) + 5,
      action: "DROP",
      protocol: "TCP",
      srcCidr: "*",
      dstCidr: "*",
      dstPort: "*",
      dpiFilter: false
    });
  };

  const handleDeleteRule = (id, isChallenge) => {
    if (isChallenge) {
      setChallengeRules((prev) => prev.filter((r) => r.id !== id));
    } else {
      setSandboxRules((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleRunChallenge = () => {
    const res = runDefenseScenario(currentChallenge, challengeRules);
    setChallengeResult(res);
    if (awardXp && res.xpAwarded > 0) {
      awardXp(res.xpAwarded, "firewall", currentChallenge.title);
    }
  };

  const handleInjectSandboxPacket = () => {
    const outcome = evaluatePacket(
      {
        srcIp: customPacket.srcIp,
        dstIp: customPacket.dstIp,
        protocol: customPacket.protocol,
        dstPort: Number(customPacket.dstPort) || 80,
        payload: customPacket.payload,
        tcpFlags: ["ACK"]
      },
      sandboxRules,
      null,
      "DROP"
    );

    const logEntry = {
      id: Date.now(),
      packet: { ...customPacket },
      outcome
    };

    setSandboxLog((prev) => [logEntry, ...prev.slice(0, 19)]);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionTitle
        title="Network Firewall & Packet Inspection Lab"
        subtitle="Design stateful firewall rules, enforce CIDR access control, and intercept malicious attacks with Deep Packet Inspection (DPI)."
      />

      {/* Mode Navigation Tabs */}
      <div className="flex gap-4 mb-8 border-b border-neon-green/20 pb-4">
        <button
          onClick={() => setActiveTab("challenges")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "challenges"
              ? "bg-neon-green text-cyber-black shadow-lg shadow-neon-green/20"
              : "bg-cyber-gray/40 text-gray-300 hover:text-neon-green hover:bg-cyber-gray/60"
          }`}
        >
          <Shield size={18} />
          Defense Challenge Scenarios
        </button>
        <button
          onClick={() => setActiveTab("sandbox")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "sandbox"
              ? "bg-neon-green text-cyber-black shadow-lg shadow-neon-green/20"
              : "bg-cyber-gray/40 text-gray-300 hover:text-neon-green hover:bg-cyber-gray/60"
          }`}
        >
          <Filter size={18} />
          Interactive Packet Sandbox
        </button>
      </div>

      {activeTab === "challenges" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Challenge Selector & Briefing */}
          <div className="space-y-6">
            <CyberCard title="Select Mission" glowColor="neon-cyan">
              <div className="space-y-3">
                {DEFENSE_CHALLENGES.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => handleSelectChallenge(ch.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedChallengeId === ch.id
                        ? "border-neon-green bg-neon-green/10 text-white"
                        : "border-gray-800 bg-cyber-dark/50 text-gray-400 hover:border-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-sm">{ch.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-neon-cyan/20 text-neon-cyan">
                        +{ch.xpReward} XP
                      </span>
                    </div>
                    <div className="flex gap-2 text-xs text-gray-400">
                      <span>Diff: {ch.difficulty}</span>
                      <span>•</span>
                      <span>Target: {ch.targetScore}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </CyberCard>

            <CyberCard title="Mission Briefing" glowColor="neon-purple">
              <p className="text-sm text-gray-300 mb-4">{currentChallenge.description}</p>
              <div className="bg-cyber-dark/60 p-3 rounded border border-gray-800 space-y-2 text-xs font-mono">
                <div className="text-neon-green">Test Packet Wave: {currentChallenge.testPackets.length} Packets</div>
                <div className="text-red-400">Malicious Threats: {currentChallenge.testPackets.filter(p => p.isMalicious).length}</div>
                <div className="text-blue-400">Legitimate Traffic: {currentChallenge.testPackets.filter(p => !p.isMalicious).length}</div>
              </div>
            </CyberCard>

            {challengeResult && (
              <CyberCard
                title="Simulation Results"
                glowColor={challengeResult.passed ? "neon-green" : "neon-red"}
              >
                <div className="text-center py-4 space-y-3">
                  <div className={`text-4xl font-extrabold font-mono ${challengeResult.passed ? "text-neon-green" : "text-red-500"}`}>
                    {challengeResult.score}%
                  </div>
                  <div className="flex justify-center items-center gap-2 text-sm font-semibold">
                    {challengeResult.passed ? (
                      <span className="flex items-center gap-1 text-neon-green">
                        <CheckCircle2 size={18} /> Target Met! Passed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400">
                        <XCircle size={18} /> Mission Failed (Under {currentChallenge.targetScore}%)
                      </span>
                    )}
                  </div>
                  <div className="flex justify-around text-xs text-gray-300 pt-2 border-t border-gray-800">
                    <div>
                      <div className="font-mono text-neon-green">{challengeResult.maliciousBlocked} / {challengeResult.totalMalicious}</div>
                      <div>Threats Blocked</div>
                    </div>
                    <div>
                      <div className="font-mono text-blue-400">{challengeResult.legitimateAllowed} / {challengeResult.totalLegitimate}</div>
                      <div>Legitimate Allowed</div>
                    </div>
                    <div>
                      <div className="font-mono text-neon-cyan">+{challengeResult.xpAwarded} XP</div>
                      <div>XP Earned</div>
                    </div>
                  </div>
                </div>
              </CyberCard>
            )}
          </div>

          {/* Right Columns: Rule Editor & Testing Console */}
          <div className="lg:col-span-2 space-y-6">
            <CyberCard title="Firewall ACL Rule Table (Ordered Priority)" glowColor="neon-green">
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="py-2 px-3">Priority</th>
                      <th className="py-2 px-3">Rule Name</th>
                      <th className="py-2 px-3">Action</th>
                      <th className="py-2 px-3">Proto</th>
                      <th className="py-2 px-3">Source CIDR</th>
                      <th className="py-2 px-3">Dest Port</th>
                      <th className="py-2 px-3">DPI Filter</th>
                      <th className="py-2 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challengeRules.map((rule) => (
                      <tr key={rule.id} className="border-b border-gray-900 hover:bg-white/5 transition-colors">
                        <td className="py-2 px-3 text-neon-cyan">{rule.priority}</td>
                        <td className="py-2 px-3 font-semibold text-gray-200">{rule.name}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rule.action === "ALLOW"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {rule.action}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-300">{rule.protocol}</td>
                        <td className="py-2 px-3 text-gray-300">{rule.srcCidr}</td>
                        <td className="py-2 px-3 text-gray-300">{rule.dstPort}</td>
                        <td className="py-2 px-3">
                          {rule.dpiFilter ? (
                            <span className="text-neon-purple font-bold">ACTIVE</span>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <button
                            onClick={() => handleDeleteRule(rule.id, true)}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                            title="Delete Rule"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Rule Form */}
              <div className="bg-cyber-dark/40 p-4 rounded-lg border border-gray-800 space-y-3 text-xs">
                <div className="font-semibold text-gray-200 flex items-center gap-1">
                  <Plus size={14} className="text-neon-green" /> Add Custom Rule
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      className="w-full bg-cyber-black border border-gray-800 rounded px-2 py-1 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Priority</label>
                    <input
                      type="number"
                      value={newRule.priority}
                      onChange={(e) => setNewRule({ ...newRule, priority: e.target.value })}
                      className="w-full bg-cyber-black border border-gray-800 rounded px-2 py-1 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Action</label>
                    <select
                      value={newRule.action}
                      onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                      className="w-full bg-cyber-black border border-gray-800 rounded px-2 py-1 text-white"
                    >
                      <option value="ALLOW">ALLOW</option>
                      <option value="DROP">DROP</option>
                      <option value="DENY">DENY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Protocol</label>
                    <select
                      value={newRule.protocol}
                      onChange={(e) => setNewRule({ ...newRule, protocol: e.target.value })}
                      className="w-full bg-cyber-black border border-gray-800 rounded px-2 py-1 text-white"
                    >
                      <option value="TCP">TCP</option>
                      <option value="UDP">UDP</option>
                      <option value="ICMP">ICMP</option>
                      <option value="ALL">ALL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Source CIDR</label>
                    <input
                      type="text"
                      value={newRule.srcCidr}
                      onChange={(e) => setNewRule({ ...newRule, srcCidr: e.target.value })}
                      placeholder="* or 192.168.1.0/24"
                      className="w-full bg-cyber-black border border-gray-800 rounded px-2 py-1 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Dest Port</label>
                    <input
                      type="text"
                      value={newRule.dstPort}
                      onChange={(e) => setNewRule({ ...newRule, dstPort: e.target.value })}
                      placeholder="* or 80,443"
                      className="w-full bg-cyber-black border border-gray-800 rounded px-2 py-1 text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="dpiToggle"
                      checked={newRule.dpiFilter}
                      onChange={(e) => setNewRule({ ...newRule, dpiFilter: e.target.checked })}
                      className="rounded bg-cyber-black border-gray-800 text-neon-green"
                    />
                    <label htmlFor="dpiToggle" className="text-gray-300">DPI Malicious Filter</label>
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={() => handleAddRule(true)}
                      className="w-full py-1.5 bg-neon-green text-cyber-black font-semibold rounded hover:bg-neon-green/90 transition-colors"
                    >
                      Add Rule
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <AnimatedButton onClick={handleRunChallenge} variant="primary">
                  <Play size={16} className="inline mr-2" /> Run Firewall Test
                </AnimatedButton>
              </div>
            </CyberCard>

            {challengeResult && (
              <CyberCard title="Packet Execution Log" glowColor="neon-cyan">
                <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-xs">
                  {challengeResult.results.map((r, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded border flex justify-between items-center ${
                        r.correct
                          ? "bg-green-950/20 border-green-800/40 text-green-300"
                          : "bg-red-950/20 border-red-800/40 text-red-300"
                      }`}
                    >
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          <span>{r.packet.protocol} {r.packet.srcIp}:{r.packet.srcPort} → {r.packet.dstIp}:{r.packet.dstPort}</span>
                          {r.packet.isMalicious && <span className="text-[10px] bg-red-900/60 px-1.5 py-0.5 rounded text-red-300 font-bold">ATTACK</span>}
                        </div>
                        <div className="text-gray-400 text-[11px] mt-0.5">{r.outcome.reason}</div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.outcome.action === "ALLOW" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                          {r.outcome.action}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-1">{r.correct ? "✓ Correct" : "✗ Flawed"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CyberCard>
            )}
          </div>
        </div>
      ) : (
        /* Sandbox Mode */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <CyberCard title="Packet Injection Console" glowColor="neon-green">
              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-gray-400 mb-1">Source IP</label>
                  <input
                    type="text"
                    value={customPacket.srcIp}
                    onChange={(e) => setCustomPacket({ ...customPacket, srcIp: e.target.value })}
                    className="w-full bg-cyber-black border border-gray-800 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Destination IP</label>
                  <input
                    type="text"
                    value={customPacket.dstIp}
                    onChange={(e) => setCustomPacket({ ...customPacket, dstIp: e.target.value })}
                    className="w-full bg-cyber-black border border-gray-800 rounded p-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-1">Protocol</label>
                    <select
                      value={customPacket.protocol}
                      onChange={(e) => setCustomPacket({ ...customPacket, protocol: e.target.value })}
                      className="w-full bg-cyber-black border border-gray-800 rounded p-2 text-white"
                    >
                      <option value="TCP">TCP</option>
                      <option value="UDP">UDP</option>
                      <option value="ICMP">ICMP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Dest Port</label>
                    <input
                      type="number"
                      value={customPacket.dstPort}
                      onChange={(e) => setCustomPacket({ ...customPacket, dstPort: e.target.value })}
                      className="w-full bg-cyber-black border border-gray-800 rounded p-2 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Packet Payload (Inspectable via DPI)</label>
                  <textarea
                    rows={3}
                    value={customPacket.payload}
                    onChange={(e) => setCustomPacket({ ...customPacket, payload: e.target.value })}
                    className="w-full bg-cyber-black border border-gray-800 rounded p-2 text-white"
                  />
                </div>
                <AnimatedButton onClick={handleInjectSandboxPacket} variant="primary">
                  <Play size={16} className="inline mr-2" /> Transmit Packet
                </AnimatedButton>
              </div>
            </CyberCard>
          </div>

          <div className="space-y-6">
            <CyberCard title="Firewall Decision Stream" glowColor="neon-cyan">
              {sandboxLog.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-mono text-sm">
                  No packets transmitted yet. Configure a packet and click Transmit Packet.
                </div>
              ) : (
                <div className="space-y-3 font-mono text-xs max-h-[500px] overflow-y-auto">
                  {sandboxLog.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-cyber-dark/60 rounded border border-gray-800 space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-200">
                          {log.packet.protocol} {log.packet.srcIp} → {log.packet.dstIp}:{log.packet.dstPort}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.outcome.action === "ALLOW"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {log.outcome.action}
                        </span>
                      </div>
                      <div className="text-gray-400 text-[11px]">{log.outcome.reason}</div>
                      {log.outcome.dpi?.isMalicious && (
                        <div className="text-red-400 text-[10px] flex items-center gap-1 mt-1">
                          <AlertTriangle size={12} /> DPI Detected: {log.outcome.dpi.matches.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CyberCard>
          </div>
        </div>
      )}
    </div>
  );
};
