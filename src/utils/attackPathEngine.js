const NODE_TYPES = new Set(["entry", "vulnerability", "technique", "asset"]);

const VALID_TRANSITIONS = {
  entry: new Set(["vulnerability", "technique"]),
  vulnerability: new Set(["technique", "asset"]),
  technique: new Set(["vulnerability", "technique", "asset"]),
  asset: new Set(["vulnerability", "technique"]),
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

const getNodes = (graph) => Array.isArray(graph?.nodes) ? graph.nodes : [];
const getEdges = (graph) => Array.isArray(graph?.edges) ? graph.edges : [];

export const calculateNodeRisk = (node) => {
  if (!node) return 0;
  const severity = clamp(node.severity, 0, 10);
  const exploitability = clamp(node.exploitability, 0, 10);
  const assetImpact = clamp(node.assetImpact, 0, 10);
  return Math.round((severity * 0.4 + exploitability * 0.3 + assetImpact * 0.3) * 10);
};

export const validateAttackGraph = (graph) => {
  const nodes = getNodes(graph);
  const edges = getEdges(graph);
  const issues = [];
  const ids = new Set();

  nodes.forEach((node, index) => {
    if (!node?.id || typeof node.id !== "string") {
      issues.push({ code: "invalid-node-id", message: `Node at index ${index} has no valid ID.` });
      return;
    }
    if (ids.has(node.id)) {
      issues.push({ code: "duplicate-node-id", message: `Duplicate node ID: ${node.id}.` });
    }
    ids.add(node.id);
    if (!NODE_TYPES.has(node.type)) {
      issues.push({ code: "invalid-node-type", message: `Node "${node.id}" has an unsupported type.` });
    }
  });

  const seenEdges = new Set();
  edges.forEach((edge, index) => {
    if (!edge?.from || !edge?.to || !ids.has(edge.from) || !ids.has(edge.to)) {
      issues.push({ code: "unknown-edge-node", message: `Edge at index ${index} references an unknown node.` });
      return;
    }
    const key = `${edge.from}->${edge.to}`;
    if (seenEdges.has(key)) {
      issues.push({ code: "duplicate-edge", message: `Duplicate edge: ${key}.` });
    }
    seenEdges.add(key);
    const from = nodes.find((node) => node.id === edge.from);
    const to = nodes.find((node) => node.id === edge.to);
    if (!VALID_TRANSITIONS[from.type]?.has(to.type)) {
      issues.push({
        code: "invalid-transition",
        message: `Transition from ${from.type} to ${to.type} is not allowed (${key}).`,
      });
    }
  });

  return issues;
};

export const buildAdjacencyList = (graph) => {
  const nodes = getNodes(graph);
  const nodeById = new Map(nodes.filter((node) => node?.id).map((node) => [node.id, node]));
  const adjacency = new Map(nodes.filter((node) => node?.id).map((node) => [node.id, []]));
  const seen = new Set();

  getEdges(graph).forEach((edge) => {
    const from = nodeById.get(edge?.from);
    const to = nodeById.get(edge?.to);
    if (!from || !to || !VALID_TRANSITIONS[from.type]?.has(to.type)) return;
    const key = `${edge.from}->${edge.to}`;
    if (seen.has(key)) return;
    seen.add(key);
    adjacency.get(edge.from).push(edge.to);
  });

  return adjacency;
};

export const findCycles = (graph) => {
  const adjacency = buildAdjacencyList(graph);
  const state = new Map();
  const stack = [];
  const cycles = [];
  const signatures = new Set();

  const visit = (nodeId) => {
    state.set(nodeId, 1);
    stack.push(nodeId);

    (adjacency.get(nodeId) || []).forEach((nextId) => {
      if (state.get(nextId) === 1) {
        const start = stack.indexOf(nextId);
        const cycle = [...stack.slice(start), nextId];
        const body = cycle.slice(0, -1);
        const rotations = body.map((_, index) => [...body.slice(index), ...body.slice(0, index)].join("|"));
        const signature = rotations.sort()[0];
        if (!signatures.has(signature)) {
          signatures.add(signature);
          cycles.push(cycle);
        }
      } else if (!state.has(nextId)) {
        visit(nextId);
      }
    });

    stack.pop();
    state.set(nodeId, 2);
  };

  adjacency.forEach((_, nodeId) => {
    if (!state.has(nodeId)) visit(nodeId);
  });

  return cycles;
};

export const findDisconnectedNodes = (graph) => {
  const nodes = getNodes(graph);
  const nodeIds = new Set(nodes.filter((node) => node?.id).map((node) => node.id));
  const adjacency = new Map([...nodeIds].map((id) => [id, []]));
  const seenEdges = new Set();

  getEdges(graph).forEach((edge) => {
    if (!nodeIds.has(edge?.from) || !nodeIds.has(edge?.to)) return;
    const key = `${edge.from}->${edge.to}`;
    if (seenEdges.has(key)) return;
    seenEdges.add(key);
    adjacency.get(edge.from).push(edge.to);
  });

  const entries = nodes.filter((node) => node.type === "entry");
  if (!entries.length) return nodes.map((node) => node.id);

  const visited = new Set();
  const queue = entries.map((node) => node.id);
  queue.forEach((id) => visited.add(id));

  for (let index = 0; index < queue.length; index += 1) {
    (adjacency.get(queue[index]) || []).forEach((nextId) => {
      if (!visited.has(nextId)) {
        visited.add(nextId);
        queue.push(nextId);
      }
    });
  }

  return nodes.filter((node) => !visited.has(node.id)).map((node) => node.id);
};

export const findAttackPaths = (graph, options = {}) => {
  const nodes = getNodes(graph);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const adjacency = buildAdjacencyList(graph);
  const maxPaths = Math.max(1, Number(options.maxPaths) || 50);
  const maxDepth = Math.max(1, Number(options.maxDepth) || nodes.length || 1);
  const entries = nodes.filter((node) => node.type === "entry");
  const paths = [];

  const walk = (nodeId, path) => {
    if (paths.length >= maxPaths || path.length > maxDepth) return;
    const node = nodeById.get(nodeId);
    if (!node) return;

    if (node.type === "asset" && path.length > 1) {
      paths.push(path);
      if (paths.length >= maxPaths) return;
    }

    (adjacency.get(nodeId) || []).forEach((nextId) => {
      if (path.includes(nextId)) return;
      walk(nextId, [...path, nextId]);
    });
  };

  entries.forEach((entry) => walk(entry.id, [entry.id]));
  return paths;
};

const reachableFrom = (startId, adjacency) => {
  const visited = new Set([startId]);
  const queue = [startId];
  for (let index = 0; index < queue.length; index += 1) {
    (adjacency.get(queue[index]) || []).forEach((nextId) => {
      if (!visited.has(nextId)) {
        visited.add(nextId);
        queue.push(nextId);
      }
    });
  }
  return visited;
};

export const rankCriticalNodes = (graph) => {
  const nodes = getNodes(graph);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const adjacency = buildAdjacencyList(graph);

  return nodes.map((node) => {
    const reachable = reachableFrom(node.id, adjacency);
    const downstreamImpact = [...reachable]
      .map((id) => nodeById.get(id))
      .filter((item) => item?.type === "asset")
      .reduce((highest, asset) => Math.max(highest, clamp(asset.assetImpact, 0, 10) * 10), 0);
    const baseRisk = calculateNodeRisk(node);
    const criticality = node.type === "asset"
      ? Math.max(baseRisk, Math.round(clamp(node.assetImpact, 0, 10) * 10))
      : Math.round(baseRisk * 0.65 + downstreamImpact * 0.35);
    return { ...node, risk: baseRisk, criticality, reachableAssets: [...reachable].filter((id) => nodeById.get(id)?.type === "asset") };
  }).sort((a, b) => b.criticality - a.criticality);
};

export const calculatePathRisk = (path, graph) => {
  if (!Array.isArray(path) || path.length === 0) return 0;
  const nodeById = new Map(getNodes(graph).map((node) => [node.id, node]));
  const pathNodes = path.map((id) => nodeById.get(id)).filter(Boolean);
  if (!pathNodes.length) return 0;
  const averageRisk = pathNodes.reduce((total, node) => total + calculateNodeRisk(node), 0) / pathNodes.length;
  const target = pathNodes[pathNodes.length - 1];
  const targetImpact = target.type === "asset" ? clamp(target.assetImpact, 0, 10) * 10 : 0;
  return Math.round(clamp(averageRisk * 0.65 + targetImpact * 0.35, 0, 100));
};

export const explainAttackPath = (path, graph) => {
  const nodeById = new Map(getNodes(graph).map((node) => [node.id, node]));
  const pathNodes = (path || []).map((id) => nodeById.get(id)).filter(Boolean);
  if (!pathNodes.length) return "No attack path details are available.";
  const source = pathNodes[0].name;
  const target = pathNodes[pathNodes.length - 1].name;
  const highRisk = pathNodes.filter((node) => calculateNodeRisk(node) >= 70);
  const riskReason = highRisk.length
    ? `High-risk stages include ${highRisk.map((node) => node.name).join(", ")}.`
    : "The path combines multiple reachable stages that could be chained together.";
  return `An attacker could move from ${source} to ${target} through ${pathNodes.length - 2} intermediate stage(s). ${riskReason} The final asset impact is rated ${pathNodes[pathNodes.length - 1].assetImpact ?? 0}/10.`;
};
