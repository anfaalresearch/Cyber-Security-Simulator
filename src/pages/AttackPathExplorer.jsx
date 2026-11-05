import { useMemo, useState } from "react";
import { Activity, AlertTriangle, ArrowRight, CircleDot, Crosshair, GitBranch, ShieldAlert } from "lucide-react";
import { SectionTitle } from "../components/SectionTitle";
import { CyberCard } from "../components/CyberCard";
import { attackPathGraph } from "../data/attackPathGraph";
import {
  calculateNodeRisk,
  calculatePathRisk,
  explainAttackPath,
  findAttackPaths,
  findCycles,
  findDisconnectedNodes,
  rankCriticalNodes,
  validateAttackGraph,
} from "../utils/attackPathEngine";
import { cn } from "../utils/helpers";

const TYPE_STYLES = {
  entry: { label: "Entry point", fill: "#123b31", stroke: "#00ff88" },
  vulnerability: { label: "Vulnerability", fill: "#422b17", stroke: "#ffaa00" },
  technique: { label: "Technique", fill: "#172d49", stroke: "#00d4ff" },
  asset: { label: "Asset", fill: "#352047", stroke: "#c084fc" },
};

const riskLabel = (score) => score >= 75 ? "Critical" : score >= 50 ? "High" : score >= 25 ? "Moderate" : "Low";

export const AttackPathExplorer = () => {
  const [selectedNodeId, setSelectedNodeId] = useState("internet");
  const [selectedPathIndex, setSelectedPathIndex] = useState(0);

  const paths = useMemo(() => findAttackPaths(attackPathGraph), []);
  const cycles = useMemo(() => findCycles(attackPathGraph), []);
  const disconnectedIds = useMemo(() => findDisconnectedNodes(attackPathGraph), []);
  const criticalNodes = useMemo(() => rankCriticalNodes(attackPathGraph), []);
  const diagnostics = useMemo(() => validateAttackGraph(attackPathGraph), []);
  const nodeById = useMemo(() => new Map(attackPathGraph.nodes.map((node) => [node.id, node])), []);
  const selectedNode = nodeById.get(selectedNodeId) || attackPathGraph.nodes[0];
  const selectedPath = paths[selectedPathIndex] || [];
  const selectedRisk = calculatePathRisk(selectedPath, attackPathGraph);
  const selectedPathNodeIds = new Set(selectedPath);
  const selectedNodeRisk = calculateNodeRisk(selectedNode);
  const edgeKey = (edge) => `${edge.from}->${edge.to}`;

  const selectNode = (nodeId) => {
    setSelectedNodeId(nodeId);
    const matchingPath = paths.findIndex((path) => path.includes(nodeId));
    if (matchingPath >= 0) setSelectedPathIndex(matchingPath);
  };

  const handleNodeKeyDown = (event, nodeId) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectNode(nodeId);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionTitle
        title="Intelligent Attack Path Explorer"
        subtitle="Explore how an attacker could chain weaknesses, techniques, and compromised assets across a directed graph."
        align="left"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Attack paths", value: paths.length, icon: GitBranch },
          { label: "Critical nodes", value: criticalNodes.filter((node) => node.criticality >= 60).length, icon: Crosshair },
          { label: "Cycles detected", value: cycles.length, icon: Activity },
          { label: "Disconnected", value: disconnectedIds.length, icon: AlertTriangle },
        ].map(({ label, value, icon: Icon }) => (
          <CyberCard key={label} hover={false} padding="p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-2xl font-display font-bold text-white mt-1">{value}</p>
              </div>
              <Icon className="text-neon-green" size={21} aria-hidden="true" />
            </div>
          </CyberCard>
        ))}
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)] gap-6 items-start">
        <CyberCard hover={false} padding="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Attack graph</h3>
              <p className="text-xs text-slate-400 mt-1">Select a node to inspect its role and risk score.</p>
            </div>
            <span className="text-xs font-mono text-neon-green">{attackPathGraph.nodes.length} NODES · {attackPathGraph.edges.length} EDGES</span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4" aria-label="Graph node legend">
            {Object.entries(TYPE_STYLES).map(([type, style]) => (
              <span key={type} className="inline-flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: style.stroke }} />
                {style.label}
              </span>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-700/70 bg-slate-950/50" role="region" aria-label="Scrollable attack graph diagram" tabIndex={0}>
            <svg
              viewBox="0 0 960 600"
              className="block w-full min-w-[640px] h-auto"
              role="group"
              aria-label="Directed attack graph. Use Tab to focus nodes and Enter or Space to inspect a node."
            >
              <defs>
                <marker id="attack-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L7,3 z" fill="#64748b" />
                </marker>
                <marker id="attack-arrow-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L7,3 z" fill="#00ff88" />
                </marker>
              </defs>
              <g aria-hidden="true">
                {attackPathGraph.edges.map((edge) => {
                  const from = nodeById.get(edge.from);
                  const to = nodeById.get(edge.to);
                  if (!from || !to) return null;
                  const active = selectedPathNodeIds.has(edge.from) && selectedPathNodeIds.has(edge.to) &&
                    selectedPath.indexOf(edge.to) === selectedPath.indexOf(edge.from) + 1;
                  return (
                    <line
                      key={edgeKey(edge)}
                      x1={from.x + (to.x >= from.x ? 76 : -76)}
                      y1={from.y}
                      x2={to.x + (to.x >= from.x ? -78 : 78)}
                      y2={to.y}
                      stroke={active ? "#00ff88" : "#64748b"}
                      strokeWidth={active ? 3 : 1.7}
                      strokeDasharray={active ? "0" : "5 5"}
                      opacity={active ? 1 : 0.65}
                      markerEnd={active ? "url(#attack-arrow-active)" : "url(#attack-arrow)"}
                    />
                  );
                })}
              </g>
              {attackPathGraph.nodes.map((node) => {
                const style = TYPE_STYLES[node.type];
                const risk = calculateNodeRisk(node);
                const selected = selectedNodeId === node.id;
                const inPath = selectedPathNodeIds.has(node.id);
                const disconnected = disconnectedIds.includes(node.id);
                return (
                  <g
                    key={node.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${node.name}, ${style.label}, risk ${risk} out of 100${disconnected ? ", disconnected" : ""}`}
                    aria-pressed={selected}
                    onClick={() => selectNode(node.id)}
                    onKeyDown={(event) => handleNodeKeyDown(event, node.id)}
                    className="group cursor-pointer outline-none"
                  >
                    <rect
                      x={node.x - 74}
                      y={node.y - 38}
                      width="148"
                      height="76"
                      rx="12"
                      fill={selected ? "#0f2e25" : style.fill}
                      stroke={selected ? "#ffffff" : style.stroke}
                      strokeWidth={selected ? 3 : inPath ? 2.5 : 1.5}
                      strokeDasharray={disconnected ? "5 4" : "0"}
                    />
                    <text x={node.x} y={node.y - 7} fill="#f8fafc" fontSize="12" fontWeight="600" textAnchor="middle">
                      {node.name.length > 20 ? `${node.name.slice(0, 18)}…` : node.name}
                    </text>
                    <text x={node.x} y={node.y + 13} fill={style.stroke} fontSize="10" textAnchor="middle">
                      {style.label} · {risk}/100
                    </text>
                    {disconnected && <text x={node.x} y={node.y + 27} fill="#fbbf24" fontSize="8" textAnchor="middle">UNREACHABLE</text>}
                    <rect x={node.x - 74} y={node.y - 38} width="148" height="76" rx="12" fill="transparent" stroke="transparent" className="group-focus-visible:stroke-white" />
                  </g>
                );
              })}
            </svg>
          </div>
          <p className="text-xs text-slate-500 mt-3">On smaller screens, scroll the graph horizontally. The same nodes are keyboard accessible.</p>
        </CyberCard>

        <div className="space-y-6">
          <CyberCard hover={false}>
            <div className="flex items-center gap-2 mb-3">
              <CircleDot className="text-neon-cyan" size={18} />
              <h3 className="text-white font-semibold">Selected node</h3>
            </div>
            <p className="text-white font-medium">{selectedNode.name}</p>
            <p className="text-xs text-neon-cyan mt-1">{TYPE_STYLES[selectedNode.type]?.label}</p>
            <p className="text-sm text-slate-400 mt-3">{selectedNode.description}</p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-xs text-slate-500">Risk score</p>
                <p className="text-xl font-mono text-white">{selectedNodeRisk}/100</p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-xs text-slate-500">Criticality</p>
                <p className="text-xl font-mono text-white">{criticalNodes.find((node) => node.id === selectedNode.id)?.criticality ?? 0}/100</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">Severity {selectedNode.severity}/10 · Exploitability {selectedNode.exploitability}/10 · Asset impact {selectedNode.assetImpact}/10</p>
          </CyberCard>

          <CyberCard hover={false}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-white font-semibold">Detected attack paths</h3>
              <span className="text-xs text-slate-400">{paths.length} found</span>
            </div>
            {paths.length ? (
              <div className="space-y-2">
                {paths.map((path, index) => {
                  const risk = calculatePathRisk(path, attackPathGraph);
                  return (
                    <button
                      key={path.join("->")}
                      type="button"
                      onClick={() => {
                        setSelectedPathIndex(index);
                        setSelectedNodeId(path[0]);
                      }}
                      aria-pressed={selectedPathIndex === index}
                      className={cn(
                        "w-full text-left rounded-lg border p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green",
                        selectedPathIndex === index ? "border-neon-green/70 bg-neon-green/10" : "border-slate-700 hover:border-slate-500"
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm text-white">Path {index + 1}</span>
                        <span className={cn("text-xs font-mono", risk >= 75 ? "text-danger" : risk >= 50 ? "text-warning" : "text-neon-green")}>{riskLabel(risk)} · {risk}/100</span>
                      </span>
                      <span className="block text-xs text-slate-400 mt-1">{path.map((id) => nodeById.get(id)?.name).join(" → ")}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No entry-to-asset paths were found in this graph.</p>
            )}
            {selectedPath.length > 0 && (
              <div className="mt-4 border-t border-slate-700 pt-4">
                <p className="text-xs font-mono text-neon-green mb-2">WHY THIS PATH IS DANGEROUS</p>
                <p className="text-sm text-slate-300">{explainAttackPath(selectedPath, attackPathGraph)}</p>
              </div>
            )}
          </CyberCard>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <CyberCard hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="text-warning" size={19} />
            <h3 className="text-white font-semibold">Critical nodes</h3>
          </div>
          <div className="space-y-3">
            {criticalNodes.slice(0, 4).map((node) => (
              <button key={node.id} type="button" onClick={() => selectNode(node.id)} className="w-full flex items-center justify-between gap-3 text-left rounded-lg p-2 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green">
                <span>
                  <span className="block text-sm text-white">{node.name}</span>
                  <span className="block text-xs text-slate-500">{node.reachableAssets.length} reachable asset(s)</span>
                </span>
                <span className="font-mono text-sm text-warning">{node.criticality}/100</span>
              </button>
            ))}
          </div>
        </CyberCard>

        <CyberCard hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-warning" size={19} />
            <h3 className="text-white font-semibold">Graph diagnostics</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-slate-300">Cycle detection</p>
              {cycles.length ? cycles.map((cycle, index) => (
                <p key={index} className="text-xs text-warning mt-1">{cycle.map((id) => nodeById.get(id)?.name || id).join(" → ")}</p>
              )) : <p className="text-xs text-neon-green mt-1">No cycles detected.</p>}
            </div>
            <div>
              <p className="text-slate-300">Disconnected nodes</p>
              {disconnectedIds.length ? (
                <p className="text-xs text-warning mt-1">{disconnectedIds.map((id) => nodeById.get(id)?.name || id).join(", ")}</p>
              ) : <p className="text-xs text-neon-green mt-1">Every node is reachable from an entry point.</p>}
            </div>
            <div>
              <p className="text-slate-300">Graph validation</p>
              <p className={cn("text-xs mt-1", diagnostics.length ? "text-warning" : "text-neon-green")}>
                {diagnostics.length ? diagnostics.map((issue) => issue.message).join(" ") : "No duplicate edges, unknown endpoints, or invalid transitions."}
              </p>
            </div>
          </div>
        </CyberCard>
      </div>

      <p className="text-xs text-slate-500 mt-6 flex items-start gap-2">
        <ArrowRight size={14} className="mt-0.5 shrink-0" />
        This is an educational, deterministic attack-path model. Risk scores are heuristic prioritization signals, not proof of exploitability or a live security assessment.
      </p>
    </main>
  );
};
